import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveAs } from 'file-saver';
import api from '../services/api';
import {
  Save,
  Upload,
  Download,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Shield,
  Database,
  User,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Archive
} from 'lucide-react';

/**
 * BACKUP COMPLETO POR USUÁRIO
 * -----------------------------------------------------------------
 * Sistema de backup completo e seguro que garante:
 * ✓ Isolamento total por usuário
 * ✓ Integridade dos dados
 * ✓ Formato JSON estruturado
 * ✓ Metadados completos
 * ✓ Verificação de integridade
 * ✓ Histórico de backups
 * -----------------------------------------------------------------
 */

const BackupCompleto = () => {
  const { user } = useAuth();
  const [historicoBackups, setHistoricoBackups] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [ultimoBackup, setUltimoBackup] = useState(null);

  // Configurações de backup
  const INTERVALO_BACKUP_AUTO = 10 * 60 * 1000; // 10 minutos
  const MAX_BACKUPS_HISTORICO = 50;

  /**
   * Estrutura do backup completo por usuário
   */
  const estruturaBackup = {
    metadata: {
      versao: '2.0',
      dataCriacao: new Date().toISOString(),
      usuario: {
        id: user?.id,
        nome: user?.nome,
        email: user?.email
      },
      tipo: 'backup_completo',
      checksum: null // será calculado
    },
    dados: {
      receitas: [],
      despesas: [],
      orcamentos: {},
      configuracoes: {},
      categorias: {},
      metas: {},
      investimentos: []
    },
    estatisticas: {
      totalReceitas: 0,
      totalDespesas: 0,
      totalOrcamentos: 0,
      periodoDados: {
        dataInicio: null,
        dataFim: null
      }
    }
  };

  /**
   * Coleta todos os dados do usuário do backend API
   */
  const coletarDadosUsuario = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    const dados = JSON.parse(JSON.stringify(estruturaBackup));

    try {
      // Buscar dados do backend
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};

      // Coletar receitas do backend
      dados.dados.receitas = Array.isArray(userData.receitas) ? userData.receitas : [];

      // Coletar despesas do backend
      dados.dados.despesas = Array.isArray(userData.despesas) ? userData.despesas : [];

      // Coletar orçamentos do backend
      const orcamentos = Array.isArray(userData.orcamentos) ? userData.orcamentos : [];
      dados.dados.orcamentos = {};
      orcamentos.forEach((orcamento, index) => {
        const key = `ORCAMENTO_${user.id}_${orcamento.mes || index}`;
        dados.dados.orcamentos[key] = orcamento;
      });

      // Coletar categorias do backend
      dados.dados.categorias = Array.isArray(userData.categorias) ? userData.categorias : [];

      // Coletar metas do backend
      dados.dados.metas = Array.isArray(userData.metas) ? userData.metas : {};

      // Coletar investimentos do backend
      dados.dados.investimentos = Array.isArray(userData.investimentos) ? userData.investimentos : [];

      // Coletar configurações do backend
      dados.dados.configuracoes = userData.configuracoes || {};

      // Atualizar metadata
      dados.metadata.usuario = {
        id: user.id,
        nome: user.nome,
        email: user.email
      };

      // Calcular estatísticas
      calcularEstatisticas(dados);

      // Calcular checksum para integridade
      dados.metadata.checksum = calcularChecksum(dados);

      return dados;
    } catch (error) {
      console.error('Erro ao coletar dados do backend:', error);
      throw new Error('Falha ao coletar dados do usuário do backend');
    }
  }, [user]);

  /**
   * Calcula estatísticas dos dados
   */
  const calcularEstatisticas = (dados) => {
    const stats = dados.estatisticas;
    
    // Total de receitas
    stats.totalReceitas = Array.isArray(dados.dados.receitas) ? dados.dados.receitas.length : 0;
    
    // Total de despesas
    stats.totalDespesas = Array.isArray(dados.dados.despesas) ? dados.dados.despesas.length : 0;
    
    // Total de orçamentos
    stats.totalOrcamentos = Object.keys(dados.dados.orcamentos).length;

    // Calcular período dos dados
    const todasDatas = [
      ...(Array.isArray(dados.dados.receitas) ? dados.dados.receitas.map(r => r.data) : []),
      ...(Array.isArray(dados.dados.despesas) ? dados.dados.despesas.map(d => d.data) : [])
    ].filter(Boolean);

    if (todasDatas.length > 0) {
      todasDatas.sort();
      stats.periodoDados.dataInicio = todasDatas[0];
      stats.periodoDados.dataFim = todasDatas[todasDatas.length - 1];
    }
  };

  /**
   * Calcula checksum para verificação de integridade
   */
  const calcularChecksum = (dados) => {
    const dadosString = JSON.stringify(dados.dados);
    let hash = 0;
    for (let i = 0; i < dadosString.length; i++) {
      const char = dadosString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  /**
   * Verifica integridade dos dados
   */
  const verificarIntegridade = (dados) => {
    if (!dados.metadata || !dados.metadata.checksum) {
      return { valido: false, erro: 'Checksum não encontrado' };
    }

    const checksumCalculado = calcularChecksum(dados);
    const checksumOriginal = dados.metadata.checksum;

    if (checksumCalculado !== checksumOriginal) {
      return { 
        valido: false, 
        erro: 'Checksum inválido - dados podem estar corrompidos',
        checksumOriginal,
        checksumCalculado
      };
    }

    return { valido: true };
  };

  /**
   * Realiza backup completo
   */
  const realizarBackup = async () => {
    if (!user?.id) {
      setStatusMessage('❌ Usuário não autenticado!');
      setStatusType('error');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Preparando backup...');
    setStatusType('info');

    try {
      const dadosBackup = await coletarDadosUsuario();
      
      // Gerar nome do arquivo com identificação do usuário
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const nomeArquivo = `backup-completo-${user.id}-${timestamp}.json`;

      // Criar blob para download
      const blob = new Blob([JSON.stringify(dadosBackup, null, 2)], {
        type: 'application/json;charset=utf-8'
      });

      // Fazer download
      saveAs(blob, nomeArquivo);

      // Adicionar ao histórico
      adicionarHistoricoBackup({
        id: Date.now(),
        data: new Date().toISOString(),
        nomeArquivo,
        tamanho: blob.size,
        estatisticas: dadosBackup.estatisticas,
        checksum: dadosBackup.metadata.checksum
      });

      setUltimoBackup(new Date());
      setStatusMessage('✅ Backup completo realizado com sucesso!');
      setStatusType('success');

    } catch (error) {
      console.error('Erro ao realizar backup:', error);
      setStatusMessage(`❌ Erro ao realizar backup: ${error.message}`);
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Processa arquivo de backup para importação
   */
  const processarArquivoBackup = (conteudoArquivo, nomeArquivo) => {
    try {
      const dadosBackup = JSON.parse(conteudoArquivo);

      // Validação básica
      if (!dadosBackup.metadata || !dadosBackup.dados) {
        throw new Error('Arquivo de backup inválido - estrutura incorreta');
      }

      // Verificar se é um backup do usuário atual
      if (dadosBackup.metadata.usuario?.id !== user?.id) {
        throw new Error('Este backup pertence a outro usuário');
      }

      // Verificar versão
      if (!dadosBackup.metadata.versao || dadosBackup.metadata.versao !== '2.0') {
        console.warn('Versão do backup diferente da atual');
      }

      // Verificar integridade
      const integridade = verificarIntegridade(dadosBackup);
      if (!integridade.valido) {
        throw new Error(`Integridade comprometida: ${integridade.erro}`);
      }

      return dadosBackup;
    } catch (error) {
      throw new Error(`Falha ao processar arquivo: ${error.message}`);
    }
  };

  /**
   * Importa backup
   */
  const importarBackup = async (event) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    if (!user?.id) {
      setStatusMessage('❌ Usuário não autenticado!');
      setStatusType('error');
      return;
    }

    if (!window.confirm('⚠️ Tem certeza que deseja importar este backup?\n\n' +
                        'ESTA AÇÃO IRÁ:\n' +
                        '• Substituir todos os seus dados atuais\n' +
                        '• Remover dados não presentes no backup\n' +
                        '• Não poderá ser desfeita\n\n' +
                        'Recomendamos fazer um backup antes de continuar.')) {
      return;
    }

    setIsLoading(true);
    setStatusMessage('Processando arquivo de backup...');
    setStatusType('info');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const conteudo = e.target.result;
        const dadosBackup = processarArquivoBackup(conteudo, arquivo.name);
        
        // Restaurar dados
        await restaurarDadosCompletos(dadosBackup);
        
        setStatusMessage('✅ Backup importado com sucesso! A página será recarregada.');
        setStatusType('success');
        
        setTimeout(() => window.location.reload(), 2000);
        
      } catch (error) {
        console.error('Erro ao importar backup:', error);
        setStatusMessage(`❌ Erro ao importar backup: ${error.message}`);
        setStatusType('error');
      } finally {
        setIsLoading(false);
        // Limpar input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setStatusMessage('❌ Erro ao ler arquivo');
      setStatusType('error');
      setIsLoading(false);
    };

    reader.readAsText(arquivo);
  };

  /**
   * Restaura todos os dados do backup para o backend
   */
  const restaurarDadosCompletos = async (dadosBackup) => {
    if (!user?.id) return;

    try {
      // Preparar dados para enviar ao backend
      const dadosRestauracao = {
        receitas: Array.isArray(dadosBackup.dados.receitas) ? dadosBackup.dados.receitas : [],
        despesas: Array.isArray(dadosBackup.dados.despesas) ? dadosBackup.dados.despesas : [],
        orcamentos: Array.isArray(dadosBackup.dados.orcamentos) ? Object.values(dadosBackup.dados.orcamentos) : [],
        categorias: Array.isArray(dadosBackup.dados.categorias) ? dadosBackup.dados.categorias : [],
        metas: dadosBackup.dados.metas || {},
        investimentos: Array.isArray(dadosBackup.dados.investimentos) ? dadosBackup.dados.investimentos : [],
        configuracoes: dadosBackup.dados.configuracoes || {}
      };

      // Enviar dados para o backend
      await api.post('/user/dados', { dados: dadosRestauracao });

      console.log('✅ Dados restaurados com sucesso no backend');
    } catch (error) {
      throw new Error(`Falha ao restaurar dados no backend: ${error.message}`);
    }
  };

  /**
   * Adiciona backup ao histórico
   */
  const adicionarHistoricoBackup = (backupInfo) => {
    const historico = obterHistoricoBackups();
    historico.unshift(backupInfo);
    
    // Limitar tamanho do histórico
    if (historico.length > MAX_BACKUPS_HISTORICO) {
      historico.splice(MAX_BACKUPS_HISTORICO);
    }

    localStorage.setItem(`HISTORICO_BACKUPS_${user.id}`, JSON.stringify(historico));
    setHistoricoBackups(historico);
  };

  /**
   * Obtém histórico de backups
   */
  const obterHistoricoBackups = () => {
    if (!user?.id) return [];
    
    try {
      const historico = localStorage.getItem(`HISTORICO_BACKUPS_${user.id}`);
      return historico ? JSON.parse(historico) : [];
    } catch {
      return [];
    }
  };

  /**
   * Formata tamanho do arquivo
   */
  const formatarTamanho = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Formata data
   */
  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Inicialização
  useEffect(() => {
    if (user?.id) {
      setHistoricoBackups(obterHistoricoBackups());
      
      // Verificar último backup
      const historico = obterHistoricoBackups();
      if (historico.length > 0) {
        setUltimoBackup(new Date(historico[0].data));
      }
    }
  }, [user]);

  if (!user?.id) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          <p className="text-yellow-800">Por favor, faça login para acessar o backup.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-600" />
              Backup Completo
            </h2>
            <p className="text-gray-600 mt-1">
              Backup seguro e completo dos seus dados financeiros
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-500">
              <User className="w-4 h-4 mr-1" />
              {user.nome}
            </div>
            {ultimoBackup && (
              <div className="text-xs text-gray-400 mt-1">
                Último backup: {formatarData(ultimoBackup.toISOString())}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      {statusMessage && (
        <div className={`rounded-lg p-4 flex items-center ${
          statusType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          statusType === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {statusType === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> :
           statusType === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> :
           <Clock className="w-5 h-5 mr-2" />}
          {statusMessage}
        </div>
      )}

      {/* Ações de Backup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Manual */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Backup Manual</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Crie um backup completo de todos os seus dados financeiros.
          </p>
          <button
            onClick={realizarBackup}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Criando Backup...' : 'Fazer Backup Completo'}
          </button>
        </div>

        {/* Importar Backup */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Importar Backup</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Restaure seus dados a partir de um backup anterior.
          </p>
          <label className="w-full">
            <input
              type="file"
              accept=".json"
              onChange={importarBackup}
              disabled={isLoading}
              className="hidden"
            />
            <div className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Processando...' : 'Selecionar Arquivo'}
            </div>
          </label>
        </div>
      </div>

      {/* Histórico de Backups */}
      {historicoBackups.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Archive className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Histórico de Backups</h3>
            <span className="ml-2 text-sm text-gray-500">({historicoBackups.length})</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {historicoBackups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Save className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{backup.nomeArquivo}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatarData(backup.data)}</span>
                      <span>{formatarTamanho(backup.tamanho)}</span>
                      <span className="flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {backup.estatisticas.totalReceitas} receitas
                      </span>
                      <span className="flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {backup.estatisticas.totalDespesas} despesas
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 font-medium">OK</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações de Segurança */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Segurança do Backup</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cada backup é exclusivo e isolado por usuário</li>
              <li>• Os dados são verificados quanto à integridade</li>
              <li>• O backup inclui todos os seus dados financeiros</li>
              <li>• Recomendamos fazer backup regularmente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupCompleto;