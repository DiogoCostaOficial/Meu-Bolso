import React, { useState, useEffect } from 'react';
import { Users, Activity, Clock, Calendar, TrendingUp, Shield, Trash2 } from 'lucide-react'; // Importado Trash2
import { adminService } from '../../services/api'; // Certifique-se de que adminService.excluirUsuario existe aqui
import { useAuth } from '../../contexts/AuthContext';

const PainelAdmin = () => {
  const { usuario } = useAuth();
  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await adminService.obterEstatisticas();
      if (response.sucesso) {
        setEstatisticas(response.dados);
      } else {
        setErro(response.mensagem || 'Erro ao carregar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      setErro('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setCarregando(false);
    }
  };

  // NOVA FUNÇÃO: Excluir Usuário
  const excluirUsuario = async (userId, userName) => {
    if (userId === usuario?.id) {
      alert('Você não pode excluir sua própria conta de administrador!');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário "${userName}" (ID: ${userId})? Esta ação é irreversível.`)) {
      try {
        const response = await adminService.excluirUsuario(userId); // Chama a API para excluir
        if (response.sucesso) {
          alert(`Usuário "${userName}" excluído com sucesso!`);
          carregarEstatisticas(); // Recarrega as estatísticas e a lista de usuários
        } else {
          setErro(response.mensagem || 'Erro ao excluir usuário.');
        }
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        setErro('Erro ao conectar com o servidor para excluir usuário.');
      }
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return 'Nunca acessou';
    const data = new Date(dataISO);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  const calcularTempoDecorrido = (dataISO) => {
    if (!dataISO) return null;
    const agora = new Date();
    const data = new Date(dataISO);
    const diffMs = agora - data;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias < 30) return `${diffDias}d atrás`;
    return null;
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-700">{erro}</p>
        <button
          onClick={carregarEstatisticas}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-indigo-100">Bem-vindo, {usuario?.nome}!</p>
          </div>
        </div>
        <p className="text-indigo-100 text-sm">
          Dashboard com estatísticas e informações dos usuários do sistema
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total de Usuários */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total de Usuários</h3>
          <p className="text-3xl font-bold text-gray-900">{estatisticas?.totalUsuarios || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Contas cadastradas no sistema</p>
        </div>
        {/* Usuários Ativos */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {estatisticas?.usuariosComAcesso || 0} ativos
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Usuários Ativos</h3>
          <p className="text-3xl font-bold text-gray-900">{estatisticas?.usuariosComAcesso || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Já acessaram o sistema</p>
        </div>
        {/* Aguardando Primeiro Acesso */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              Pendentes
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Sem Acesso</h3>
          <p className="text-3xl font-bold text-gray-900">{estatisticas?.usuariosSemAcesso || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Aguardando primeiro login</p>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Usuários Cadastrados
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Histórico de acessos e informações gerais
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data de Cadastro
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                {/* NOVA COLUNA: Ações */}
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {estatisticas?.usuarios && estatisticas.usuarios.length > 0 ? (
                estatisticas.usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.nome}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatarData(user.dataCriacao)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.ultimoAcesso ? (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatarData(user.ultimoAcesso)}
                          </div>
                          {calcularTempoDecorrido(user.ultimoAcesso) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {calcularTempoDecorrido(user.ultimoAcesso)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Nunca acessou</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.ultimoAcesso ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Activity className="w-3 h-3" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <Clock className="w-3 h-3" />
                          Pendente
                        </span>
                      )}
                    </td>
                    {/* Célula de Ações com o botão de exclusão */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => excluirUsuario(user.id, user.nome)}
                        className={`p-2 rounded-full transition-colors ${
                          user.id === usuario?.id
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={user.id === usuario?.id ? "Você não pode excluir sua própria conta" : "Excluir usuário"}
                        disabled={user.id === usuario?.id}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500"> {/* Colspan ajustado para 6 */}
                    Nenhum usuário cadastrado ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informações de Segurança */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Privacidade e Segurança</h4>
            <p className="text-sm text-blue-800">
              Como administrador, você pode visualizar <strong>apenas informações gerais</strong> dos usuários (nome, e-mail, datas de acesso).
              Você <strong>não tem acesso</strong> aos dados financeiros pessoais de cada usuário (receitas, despesas, orçamentos).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelAdmin;
