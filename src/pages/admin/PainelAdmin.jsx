// src/pages/admin/PainelAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/api';
import {
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
  Edit,
  Trash2,
  AlertCircle,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Loader2,
} from 'lucide-react';

const PainelAdmin = () => {
  const { user } = useAuth();
  const [estatisticas, setEstatisticas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroEmail, setFiltroEmail] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [usuariosPorPagina] = useState(10);

  // Estados para modais
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'usuario',
  });
  const [errosForm, setErrosForm] = useState({});

  const buscarDadosAdmin = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const statsResponse = await adminService.obterEstatisticas();
      if (statsResponse.sucesso) {
        setEstatisticas(statsResponse.dados);
        setUsuarios(statsResponse.dados.usuarios || []);
      } else {
        setErro(statsResponse.mensagem);
      }
    } catch (err) {
      setErro(err.message || 'Erro ao carregar dados do painel admin.');
      console.error('Erro ao buscar dados do admin:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (user?.tipo === 'admin') {
      buscarDadosAdmin();
    } else {
      setErro('Acesso negado. Você não tem permissão de administrador.');
      setCarregando(false);
    }
  }, [user, buscarDadosAdmin]);

  // Função para abrir modal de criação
  const abrirModalCriar = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      tipo: 'usuario',
    });
    setErrosForm({});
    setModalCriarAberto(true);
  };

  // Função para abrir modal de edição
  const abrirModalEdicao = (user) => {
    setUsuarioEditando(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      senha: '', // Senha não é editada por padrão
    });
    setErrosForm({});
    setModalEditarAberto(true);
  };

  // Função para fechar modais
  const fecharModais = () => {
    setModalCriarAberto(false);
    setModalEditarAberto(false);
    setUsuarioEditando(null);
    setFormData({ nome: '', email: '', senha: '', tipo: 'usuario' });
    setErrosForm({});
  };

  // Validação do formulário
  const validarFormulario = (isCriacao = false) => {
    const erros = {};

    if (!formData.nome.trim()) {
      erros.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      erros.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erros.email = 'E-mail inválido';
    }

    // Senha obrigatória apenas na criação
    if (isCriacao && !formData.senha.trim()) {
      erros.senha = 'Senha é obrigatória';
    } else if (formData.senha && formData.senha.length < 6) {
      erros.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!formData.tipo) {
      erros.tipo = 'Tipo de usuário é obrigatório';
    }

    setErrosForm(erros);
    return Object.keys(erros).length === 0;
  };

  // Função para criar usuário
  const criarUsuario = async (e) => {
    e.preventDefault();

    if (!validarFormulario(true)) {
      return;
    }

    setSalvando(true);
    try {
      const response = await adminService.criarUsuario(formData);

      if (response.sucesso) {
        alert('Usuário criado com sucesso!');
        fecharModais();
        buscarDadosAdmin();
      } else {
        alert(`Erro ao criar usuário: ${response.mensagem}`);
      }
    } catch (err) {
      alert(`Erro ao criar usuário: ${err.message}`);
      console.error('Erro ao criar usuário:', err);
    } finally {
      setSalvando(false);
    }
  };

  // Função para salvar edição
  const salvarEdicao = async (e) => {
    e.preventDefault();

    if (!validarFormulario(false)) {
      return;
    }

    if (usuarioEditando.id === user.id && formData.tipo !== 'admin') {
      alert('Você não pode remover seus próprios privilégios de administrador!');
      return;
    }

    setSalvando(true);
    try {
      const dadosAtualizacao = {
        nome: formData.nome,
        email: formData.email,
        tipo: formData.tipo,
      };

      // Só inclui senha se foi preenchida
      if (formData.senha.trim()) {
        dadosAtualizacao.senha = formData.senha;
      }

      const response = await adminService.atualizarUsuario(usuarioEditando.id, dadosAtualizacao);

      if (response.sucesso) {
        alert('Usuário atualizado com sucesso!');
        fecharModais();
        buscarDadosAdmin();
      } else {
        alert(`Erro ao atualizar usuário: ${response.mensagem}`);
      }
    } catch (err) {
      alert(`Erro ao atualizar usuário: ${err.message}`);
      console.error('Erro ao atualizar usuário:', err);
    } finally {
      setSalvando(false);
    }
  };

  // Função para excluir usuário
  const excluirUsuario = async (userId, userName) => {
    if (userId === user.id) {
      alert('Você não pode excluir sua própria conta de administrador!');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    setExcluindo(userId);
    try {
      const response = await adminService.excluirUsuario(userId);

      if (response.sucesso) {
        alert(`Usuário "${userName}" excluído com sucesso!`);
        buscarDadosAdmin();
      } else {
        alert(`Erro ao excluir usuário: ${response.mensagem}`);
      }
    } catch (err) {
      alert(`Erro ao excluir usuário: ${err.message}`);
      console.error('Erro ao excluir usuário:', err);
    } finally {
      setExcluindo(null);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltroEmail(e.target.value);
    setPaginaAtual(1);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errosForm[name]) {
      setErrosForm(prev => ({ ...prev, [name]: '' }));
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.email.toLowerCase().includes(filtroEmail.toLowerCase())
  );

  const indiceUltimoUsuario = paginaAtual * usuariosPorPagina;
  const indicePrimeiroUsuario = indiceUltimoUsuario - usuariosPorPagina;
  const usuariosAtuais = usuariosFiltrados.slice(
    indicePrimeiroUsuario,
    indiceUltimoUsuario
  );
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const mudarPagina = (numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      setPaginaAtual(numeroPagina);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mr-3" />
        <p className="text-lg text-gray-700">Carregando Painel Admin...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 text-red-800 p-6 rounded-lg shadow-md">
        <AlertCircle className="w-6 h-6 mr-2" />
        <p className="text-lg font-medium">{erro}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        <Shield className="w-10 h-10 text-indigo-600" />
        Painel de Administração
      </h1>

      {/* Seção de Estatísticas */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
            <p className="text-3xl font-bold text-gray-900">
              {estatisticas?.totalUsuarios ?? 'N/A'}
            </p>
          </div>
          <Users className="w-10 h-10 text-indigo-400 opacity-70" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Usuários com Acesso</p>
            <p className="text-3xl font-bold text-green-600">
              {estatisticas?.usuariosComAcesso ?? 'N/A'}
            </p>
          </div>
          <CheckCircle className="w-10 h-10 text-green-400 opacity-70" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Usuários Sem Acesso</p>
            <p className="text-3xl font-bold text-red-600">
              {estatisticas?.usuariosSemAcesso ?? 'N/A'}
            </p>
          </div>
          <XCircle className="w-10 h-10 text-red-400 opacity-70" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Novos Hoje</p>
            <p className="text-3xl font-bold text-blue-600">
              {estatisticas?.novosUsuariosHoje ?? '0'}
            </p>
          </div>
          <UserPlus className="w-10 h-10 text-blue-400 opacity-70" />
        </div>
      </section>

      {/* Seção de Gerenciamento de Usuários */}
      <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Gerenciamento de Usuários
        </h2>

        <div className="flex justify-between items-center mb-4">
          <div className="relative flex items-center w-full max-w-xs">
            <Search className="absolute left-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Filtrar por e-mail..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
              value={filtroEmail}
              onChange={handleFiltroChange}
            />
          </div>
          <button
            onClick={abrirModalCriar}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Adicionar Novo Usuário
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosAtuais.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.tipo === 'admin'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {user.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.ultimoAcesso
                      ? new Date(user.ultimoAcesso).toLocaleString('pt-BR')
                      : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => abrirModalEdicao(user)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors"
                        title="Editar Usuário"
                        disabled={excluindo === user.id}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => excluirUsuario(user.id, user.nome)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Excluir Usuário"
                        disabled={excluindo === user.id}
                      >
                        {excluindo === user.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => mudarPagina(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {paginaAtual} de {totalPaginas || 1}
          </span>
          <button
            onClick={() => mudarPagina(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas || totalPaginas === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>

      {/* Modal de Criação */}
      {modalCriarAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-indigo-600" />
                Criar Novo Usuário
              </h3>
              <button
                onClick={fecharModais}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={salvando}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={criarUsuario} className="p-6 space-y-4">
              {/* Campo Nome */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errosForm.nome ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={salvando}
                />
                {errosForm.nome && (
                  <p className="mt-1 text-sm text-red-600">{errosForm.nome}</p>
                )}
              </div>

              {/* Campo E-mail */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errosForm.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={salvando}
                />
                {errosForm.email && (
                  <p className="mt-1 text-sm text-red-600">{errosForm.email}</p>
                )}
              </div>

              {/* Campo Senha */}
              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errosForm.senha ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={salvando}
                />
                {errosForm.senha && (
                  <p className="mt-1 text-sm text-red-600">{errosForm.senha}</p>
                )}
              </div>

              {/* Campo Tipo */}
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuário *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errosForm.tipo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={salvando}
                >
                  <option value="usuario">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
                {errosForm.tipo && (
                  <p className="mt-1 text-sm text-red-600">{errosForm.tipo}</p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={fecharModais}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={salvando}
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Criar Usuário
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {modalEditarAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit className="w-6 h-6 text-indigo-600" />
                Editar Usuário
              </h3>
              <button
                onClick={fecharModais}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={salvando}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={salvarEdicao} className="p-6 space-y-4">
              {/* Campo Nome */}
              <div>
                <label htmlFor="nome-edit" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="nome-edit"
                  name="nome"
                  value={formData.nome}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errosForm.nome ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={salvando}
                />
                {errosForm.nome && (
                  <p className="mt-1 text-sm text-red-600">{errosForm.nome}</p>
                )}
              </div>

              {/* Campo E-mail */}
              <div>
                <label htmlFor="email-edit" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email-edit"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errosForm.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={salvando}
                />
                {errosForm.email && (
                  <p className="mt-1 text-sm text-red-600">{errosForm.email}</p>
                )}
              </div>

              {/* Campo Senha (opcional na edição) */}
              <div>
                <label htmlFor="senha-edit" className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha (deixe em branco para não alterar)
                </label>
                <input
                  type="password"
                  id="senha-edit"
                  name="senha"
                  value={formData.senha}
                  onChange={handleFormChange}
                  placeholder="••••••"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errosForm.senha ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={salvando}
                />
                {errosForm.senha && (
                  <p className="mt-1 text-sm text-red-600">{errosForm.senha}</p>
                )}
              </div>

              {/* Campo Tipo */}
              <div>
                <label htmlFor="tipo-edit" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuário
                </label>
                <select
                  id="tipo-edit"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errosForm.tipo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={salvando || usuarioEditando?.id === user.id}
                >
                  <option value="usuario">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
                {usuarioEditando?.id === usuario.id && (
                  <p className="mt-1 text-xs text-gray-500">
                    Você não pode alterar seu próprio tipo de usuário
                  </p>
                )}
                {errosForm.tipo && (
                  <p className="mt-1 text-sm text-red-600">{errosForm.tipo}</p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={fecharModais}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={salvando}
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PainelAdmin;
