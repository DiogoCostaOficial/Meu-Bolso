// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Função auxiliar para lidar com respostas da API
const handleResponse = (response) => {
  const d = response && response.data ? response.data : {};
  const ok = typeof d.success !== 'undefined' ? d.success : d.sucesso;
  if (ok) {
    const msg = d.message ?? d.mensagem ?? '';
    const payload = d.data ?? d.dados ?? d;
    return { success: true, message: msg, data: payload, sucesso: true, mensagem: msg, dados: payload };
  }
  const errMsg = d.message ?? d.mensagem ?? 'Erro desconhecido na API';
  throw new Error(errMsg);
};

// Função auxiliar para lidar com erros da API
const handleError = (error) => {
  const data = error && error.response && error.response.data ? error.response.data : null;
  const msg = data ? (data.message ?? data.mensagem) : null;
  if (msg) throw new Error(msg);
  if (error && error.message) throw new Error(error.message);
  throw new Error('Erro de rede ou servidor indisponível.');
};

// Exportação padrão para compatibilidade com componentes antigos
export default api;

// -----------------------------------------------------------------------------
// SERVIÇOS DE AUTENTICAÇÃO
// -----------------------------------------------------------------------------
export const authService = {
  async login(credenciais) {
    try {
      const response = await api.post('/auth/login', credenciais);
      const data = handleResponse(response);
      localStorage.setItem('token', data.dados.token);
      localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  async register(dados) {
    try {
      const response = await api.post('/auth/register', dados);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  async loginGoogle(tokenGoogle) {
    try {
      const response = await api.post('/auth/google', { tokenGoogle });
      const data = handleResponse(response);
      localStorage.setItem('token', data.dados.token);
      localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  async alterarSenha(senhaAtual, novaSenha) {
    try {
      const response = await api.post('/auth/alterar-senha', { senhaAtual, novaSenha });
      const data = handleResponse(response);
      // Se a senha foi alterada com sucesso e era primeiro acesso, atualiza o localStorage
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (usuario && usuario.primeiroAcesso) {
        usuario.primeiroAcesso = false;
        localStorage.setItem('usuario', JSON.stringify(usuario));
      }
      return data;
    } catch (error) {
      return handleError(error);
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  async verificarToken() {
    try {
      const response = await api.get('/auth/verificar-token');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// -----------------------------------------------------------------------------
// SERVIÇOS DE ADMIN
// -----------------------------------------------------------------------------
export const adminService = {
  async listarUsuarios() {
    try {
      const response = await api.get('/admin/usuarios');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  async buscarUsuario(id) {
    try {
      const response = await api.get(`/admin/usuarios/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  async atualizarUsuario(id, dados) {
    try {
      const response = await api.put(`/admin/usuarios/${id}`, dados);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  async deletarUsuario(id) {
    try {
      const response = await api.delete(`/admin/usuarios/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Alias para compatibilidade com o Painel Admin antigo
  async excluirUsuario(id) {
    return adminService.deletarUsuario(id);
  },

  async contarUsuariosAtivos() {
    try {
      const response = await api.get('/admin/usuarios/ativos');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // NOVO MÉTODO: Obter estatísticas para o Painel Admin
  async obterEstatisticas() {
    try {
      const response = await api.get('/admin/estatisticas'); // Este endpoint deve existir no backend
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// -----------------------------------------------------------------------------
// SERVIÇOS DE DADOS (Exemplo: Receitas, Despesas, Orçamento)
// -----------------------------------------------------------------------------
export const dataService = {
  // Exemplo de como você pode adicionar serviços para suas receitas/despesas
  async getReceitas() {
    try {
      const response = await api.get('/receitas');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  async addReceita(receita) {
    try {
      const response = await api.post('/receitas', receita);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
  // ... outros métodos para despesas, orçamentos, etc.
};
