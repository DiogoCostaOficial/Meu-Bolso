import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AlterarSenhaObrigatorio = () => {
  const navigate = useNavigate();
  const { alterarSenha, usuario } = useAuth();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });
  const [formulario, setFormulario] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
    setErro('');
  };

  const toggleMostrarSenha = (campo) => {
    setMostrarSenhas({
      ...mostrarSenhas,
      [campo]: !mostrarSenhas[campo]
    });
  };

  const validarSenha = (senha) => {
    const erros = [];

    if (senha.length < 8) {
      erros.push('Mínimo de 8 caracteres');
    }
    if (!/[A-Z]/.test(senha)) {
      erros.push('Uma letra maiúscula');
    }
    if (!/[a-z]/.test(senha)) {
      erros.push('Uma letra minúscula');
    }
    if (!/[0-9]/.test(senha)) {
      erros.push('Um número');
    }
    if (!/[!@#$%&*]/.test(senha)) {
      erros.push('Um caractere especial (!@#$%&*)');
    }

    return erros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!formulario.senhaAtual || !formulario.novaSenha || !formulario.confirmarSenha) {
      setErro('Preencha todos os campos');
      return;
    }

    if (formulario.novaSenha !== formulario.confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    const errosValidacao = validarSenha(formulario.novaSenha);
    if (errosValidacao.length > 0) {
      setErro('Senha fraca: ' + errosValidacao.join(', '));
      return;
    }

    setCarregando(true);

    try {
      const resultado = await alterarSenha(
        formulario.senhaAtual,
        formulario.novaSenha
      );

      if (resultado.sucesso) {
        setSucesso(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErro(resultado.mensagem || 'Erro ao alterar senha');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setCarregando(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Senha Alterada!
          </h2>

          <p className="text-gray-600 mb-6">
            Sua senha foi atualizada com sucesso. Redirecionando para o sistema...
          </p>

          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Alterar Senha</h2>
          <p className="text-gray-600">Olá, <strong>{usuario?.nome}</strong>!</p>
        </div>

        {/* Aviso */}
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Ação Obrigatória:</strong> Por segurança, você deve alterar sua senha temporária antes de continuar.
          </p>
        </div>

        {/* Erro */}
        {erro && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{erro}</p>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Senha Atual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Temporária (Atual)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mostrarSenhas.atual ? 'text' : 'password'}
                name="senhaAtual"
                value={formulario.senhaAtual}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Digite a senha recebida por e-mail"
                disabled={carregando}
              />
              <button
                type="button"
                onClick={() => toggleMostrarSenha('atual')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenhas.atual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mostrarSenhas.nova ? 'text' : 'password'}
                name="novaSenha"
                value={formulario.novaSenha}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Digite sua nova senha"
                disabled={carregando}
              />
              <button
                type="button"
                onClick={() => toggleMostrarSenha('nova')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenhas.nova ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mostrarSenhas.confirmar ? 'text' : 'password'}
                name="confirmarSenha"
                value={formulario.confirmarSenha}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Digite a senha novamente"
                disabled={carregando}
              />
              <button
                type="button"
                onClick={() => toggleMostrarSenha('confirmar')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenhas.confirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Requisitos da Senha */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-xs">
            <p className="font-semibold text-blue-900 mb-2">A senha deve conter:</p>
            <ul className="space-y-1 text-blue-800">
              <li>✓ Mínimo de 8 caracteres</li>
              <li>✓ Pelo menos uma letra maiúscula</li>
              <li>✓ Pelo menos uma letra minúscula</li>
              <li>✓ Pelo menos um número</li>
              <li>✓ Pelo menos um caractere especial (!@#$%&*)</li>
            </ul>
          </div>

          {/* Botão Alterar */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {carregando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Alterando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Alterar Senha
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AlterarSenhaObrigatorio;
