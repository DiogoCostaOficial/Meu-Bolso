/**
 * Componente de Interface de Restauração do Sistema & Versionamento GitHub
 * 
 * Exclusivo para o Ambiente de Homologação:
 * - Histórico de versões e commits do GitHub (DiogoCostaOficial/Meu-Bolso)
 * - Criação direta de novos pontos de restauração na tela (sem prompts nativos)
 * - Restauração segura de snapshots locais do sistema
 * - Monitoramento de integridade e estatísticas dos checkpoints
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  RotateCcw, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  Download,
  Upload,
  BarChart3,
  Shield,
  Calendar,
  User,
  Database,
  Activity,
  GitCommit,
  GitBranch,
  ExternalLink,
  RefreshCw,
  Search,
  PlusCircle,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { systemRestore } from '../lib/systemRestore';

const GITHUB_REPO = 'DiogoCostaOficial/Meu-Bolso';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=30`;

const SystemRestore = () => {
  // Estados dos Pontos de Restauração Locais
  const [restorePoints, setRestorePoints] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreTargetModal, setRestoreTargetModal] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  // Estados de Criação de Ponto na Tela
  const [newPointDescription, setNewPointDescription] = useState('');
  const [creatingPoint, setCreatingPoint] = useState(false);

  // Estados do GitHub
  const [gitCommits, setGitCommits] = useState([]);
  const [loadingGit, setLoadingGit] = useState(false);
  const [gitError, setGitError] = useState(null);
  const [gitSearch, setGitSearch] = useState('');

  // Controle de Abas
  const [activeTab, setActiveTab] = useState('github'); // 'github' | 'locais'

  // Inicialização
  useEffect(() => {
    inicializarSistema();
    carregarCommitsGitHub();
  }, []);

  /**
   * Inicializa o gerenciador local de pontos
   */
  const inicializarSistema = async () => {
    try {
      setLoading(true);
      await systemRestore.initialize();
      await carregarDadosLocais();
    } catch (error) {
      console.error('Erro ao inicializar restauração:', error);
      toast.error('Erro ao inicializar restauração: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega os dados locais salvos
   */
  const carregarDadosLocais = async () => {
    try {
      const points = systemRestore.getAvailableRestorePoints();
      const stats = systemRestore.getRestoreStatistics();
      setRestorePoints(points || []);
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  /**
   * Busca versões/commits recentes no GitHub
   */
  const carregarCommitsGitHub = async () => {
    try {
      setLoadingGit(true);
      setGitError(null);
      const res = await fetch(GITHUB_API_URL, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Limite de requisições anônimas da API do GitHub atingido. Tente novamente em alguns minutos.');
        }
        throw new Error(`Erro ao conectar com GitHub (${res.status})`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setGitCommits(data);
      } else {
        setGitCommits([]);
      }
    } catch (error) {
      console.warn('Aviso ao consultar GitHub:', error.message);
      setGitError(error.message);
    } finally {
      setLoadingGit(false);
    }
  };

  /**
   * Cria novo ponto de restauração direto na tela
   */
  const handleCriarPonto = async (e) => {
    e?.preventDefault();
    const desc = newPointDescription.trim();
    if (!desc) {
      toast.warning('Informe uma descrição ou nome para o ponto de restauração.');
      return;
    }

    try {
      setCreatingPoint(true);
      const point = await systemRestore.createRestorePoint(desc);
      await carregarDadosLocais();
      setNewPointDescription('');
      toast.success(`Ponto de restauração "${desc}" criado com sucesso!`);
    } catch (error) {
      console.error('Erro ao criar ponto:', error);
      toast.error('Falha ao criar ponto de restauração: ' + error.message);
    } finally {
      setCreatingPoint(false);
    }
  };

  /**
   * Cria um ponto de restauração vinculado a uma versão específica do GitHub
   */
  const handleVincularVersaoGitHub = async (commit) => {
    const hash = commit.sha.substring(0, 7);
    const mensagem = commit.commit.message.split('\n')[0];
    const desc = `[GitHub: ${hash}] ${mensagem}`;

    try {
      setLoading(true);
      await systemRestore.createRestorePoint(desc);
      await carregarDadosLocais();
      toast.success(`Ponto de restauração gerado a partir da versão ${hash}!`);
      setActiveTab('locais');
    } catch (error) {
      console.error('Erro ao criar ponto do GitHub:', error);
      toast.error('Erro ao registrar ponto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicia o fluxo de restauração abrindo modal seguro
   */
  const handleAbrirModalRestaurar = (point) => {
    setRestoreTargetModal(point);
    setConfirmText('');
  };

  /**
   * Executa a restauração definitiva
   */
  const handleConfirmarRestauracao = async () => {
    if (!restoreTargetModal) return;
    if (confirmText.trim().toUpperCase() !== 'RESTAURAR') {
      toast.error('Digite exatamente a palavra "RESTAURAR" para prosseguir.');
      return;
    }

    try {
      setRestoring(true);
      await systemRestore.restoreFromPoint(restoreTargetModal.id, {
        createBackupBeforeRestore: true
      });
      await carregarDadosLocais();
      toast.success('Sistema restaurado com sucesso para o estado selecionado!');
      setRestoreTargetModal(null);
      setConfirmText('');
      
      setTimeout(() => {
        if (window.confirm('Restauração concluída! Deseja recarregar a aplicação para aplicar todas as mudanças nos formulários?')) {
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      console.error('Erro ao restaurar:', error);
      toast.error('Falha na restauração: ' + error.message);
    } finally {
      setRestoring(false);
    }
  };

  /**
   * Exclui um ponto de restauração local
   */
  const handleExcluirPonto = async (point) => {
    if (!window.confirm(`Tem certeza que deseja remover o ponto "${point.description}"?`)) {
      return;
    }
    try {
      await systemRestore.removeRestorePoint(point.id);
      await carregarDadosLocais();
      toast.success('Ponto de restauração removido.');
    } catch (error) {
      console.error('Erro ao remover ponto:', error);
      toast.error('Erro ao remover: ' + error.message);
    }
  };

  /**
   * Verifica a integridade dos snapshots
   */
  const handleVerificarIntegridade = async () => {
    try {
      toast.info('Verificando integridade dos arquivos e snapshots...');
      const result = await systemRestore.verifyAllRestorePoints();
      await carregarDadosLocais();
      if (result.invalidCount > 0) {
        toast.warning(`Verificação concluída: ${result.validCount} válidos e ${result.invalidCount} inconsistentes.`);
      } else {
        toast.success(`Todos os ${result.validCount} pontos estão íntegros e operacionais!`);
      }
    } catch (error) {
      toast.error('Erro na verificação: ' + error.message);
    }
  };

  // Filtragem dos commits do GitHub
  const commitsFiltrados = useMemo(() => {
    if (!gitSearch.trim()) return gitCommits;
    const termo = gitSearch.toLowerCase();
    return gitCommits.filter(c => 
      c.commit.message.toLowerCase().includes(termo) ||
      c.sha.toLowerCase().includes(termo) ||
      c.commit.author.name.toLowerCase().includes(termo)
    );
  }, [gitCommits, gitSearch]);

  return (
    <div className="space-y-6">
      {/* Banner de Ambiente de Homologação */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                Ambiente de Homologação
              </span>
              <span className="text-xs text-amber-300/80">Exclusivo Local/Desenvolvimento</span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Esta tela de Restauração e Versionamento do GitHub fica oculta automaticamente em produção.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleVerificarIntegridade}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors flex items-center gap-1.5"
            title="Checar integridade dos snapshots"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            Checar Integridade
          </button>
        </div>
      </div>

      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-custom-main flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-amber-400" />
            Restauração & Versionamento
          </h1>
          <p className="text-custom-main opacity-70 text-sm mt-1">
            Escolha uma versão do GitHub ou um snapshot local para restaurar seu ambiente com segurança.
          </p>
        </div>

        {/* Resumo Rápido */}
        {statistics && (
          <div className="flex items-center gap-3 bg-custom-card border border-custom-color rounded-xl px-4 py-2 text-xs">
            <div>
              <span className="text-custom-main opacity-70">Pontos Locais:</span>{' '}
              <span className="font-semibold text-custom-main">{statistics.total}</span>
            </div>
            <span className="text-gray-700">•</span>
            <div>
              <span className="text-custom-main opacity-70">Válidos:</span>{' '}
              <span className="font-semibold text-green-400">{statistics.valid}</span>
            </div>
            <span className="text-gray-700">•</span>
            <div>
              <span className="text-custom-main opacity-70">Tamanho:</span>{' '}
              <span className="font-semibold text-amber-400">{statistics.totalSizeFormatted}</span>
            </div>
          </div>
        )}
      </div>

      {/* CARD: CRIAR NOVO PONTO DE RESTAURAÇÃO NA TELA */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-850 border border-amber-500/20 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold text-sm">
          <PlusCircle className="w-4 h-4" />
          <span>Criar Novo Ponto de Restauração</span>
        </div>
        
        <form onSubmit={handleCriarPonto} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={newPointDescription}
              onChange={(e) => setNewPointDescription(e.target.value)}
              placeholder="Digite um nome ou motivo do ponto (Ex: Antes da integração de viagens, Checkpoint v2.4, etc.)"
              className="w-full bg-custom-primary/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={creatingPoint || !newPointDescription.trim()}
            className="px-5 py-2.5 rounded-xl bg-custom-gold text-black font-semibold text-sm hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 flex-shrink-0 shadow-md shadow-amber-500/10"
          >
            {creatingPoint ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                Gravando Checkpoint...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Salvar Ponto de Restauração
              </>
            )}
          </button>
        </form>
      </div>

      {/* ABAS: GITHUB VS PONTOS LOCAIS */}
      <div className="flex border-b border-custom-color">
        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'github'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-custom-main opacity-70 hover:text-gray-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Versões no GitHub</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
            {gitCommits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('locais')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'locais'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-custom-main opacity-70 hover:text-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Snapshots Locais</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
            {restorePoints.length}
          </span>
        </button>
      </div>

      {/* ABA 1: VERSÕES NO GITHUB */}
      {activeTab === 'github' && (
        <div className="space-y-4">
          {/* Barra de Ações do GitHub */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-custom-main opacity-70 absolute left-3 top-3" />
              <input
                type="text"
                value={gitSearch}
                onChange={(e) => setGitSearch(e.target.value)}
                placeholder="Buscar por mensagem, autor ou hash..."
                className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-custom-color rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <a
                href={`https://github.com/${GITHUB_REPO}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-xs rounded-xl bg-gray-900 border border-custom-color hover:border-gray-700 text-gray-300 flex items-center gap-1.5 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-custom-main opacity-70" />
                <span>Abrir Repositório</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>

              <button
                onClick={carregarCommitsGitHub}
                disabled={loadingGit}
                className="px-3 py-2 text-xs rounded-xl bg-gray-900 border border-custom-color hover:border-gray-700 text-gray-300 flex items-center gap-1.5 transition-colors"
                title="Recarregar histórico"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loadingGit ? 'animate-spin' : ''}`} />
                <span>Recarregar</span>
              </button>
            </div>
          </div>

          {/* Erro da API do GitHub se houver */}
          {gitError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-300 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{gitError}</span>
            </div>
          )}

          {/* Lista de Commits */}
          {loadingGit && gitCommits.length === 0 ? (
            <div className="p-12 text-center text-custom-main opacity-70">
              <Activity className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
              <p className="text-sm">Buscando versões diretamente do GitHub...</p>
            </div>
          ) : commitsFiltrados.length === 0 ? (
            <div className="bg-gray-900/40 border border-custom-color rounded-2xl p-10 text-center text-custom-main opacity-70">
              <GitCommit className="w-10 h-10 mx-auto text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-300">Nenhum commit encontrado no repositório.</p>
              <p className="text-xs text-gray-500 mt-1">Verifique sua conexão ou se a busca filtrou todos os registros.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commitsFiltrados.map((item, index) => {
                const shortSha = item.sha.substring(0, 7);
                const [primeiraLinha, ...resto] = item.commit.message.split('\n');
                const dataCommit = new Date(item.commit.author.date);
                const isLatest = index === 0 && !gitSearch;

                return (
                  <div
                    key={item.sha}
                    className={`bg-custom-card border rounded-2xl p-4 transition-all hover:border-amber-500/40 ${
                      isLatest ? 'border-amber-500/50 bg-amber-500/5' : 'border-custom-color'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Detalhes do Commit */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-800 text-amber-400 border border-gray-700 font-bold">
                            #{shortSha}
                          </span>

                          {isLatest && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                              Versão Atual / Head
                            </span>
                          )}

                          <span className="text-xs text-custom-main opacity-70 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            {dataCommit.toLocaleDateString('pt-BR')} às {dataCommit.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold text-custom-main tracking-tight">
                          {primeiraLinha}
                        </h3>

                        {resto.filter(Boolean).length > 0 && (
                          <p className="text-xs text-custom-main opacity-70 line-clamp-2">
                            {resto.filter(Boolean).join(' ')}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-custom-main opacity-70 pt-1">
                          {item.author?.avatar_url ? (
                            <img
                              src={item.author.avatar_url}
                              alt={item.commit.author.name}
                              className="w-4 h-4 rounded-full"
                            />
                          ) : (
                            <User className="w-3.5 h-3.5 text-gray-500" />
                          )}
                          <span>{item.commit.author.name}</span>
                        </div>
                      </div>

                      {/* Ações da Versão */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
                        <a
                          href={item.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 text-xs rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 flex items-center gap-1.5 transition-colors"
                          title="Inspecionar alterações no GitHub"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-custom-main opacity-70" />
                          <span>Ver Diff</span>
                        </a>

                        <button
                          onClick={() => handleVincularVersaoGitHub(item)}
                          className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 transition-colors"
                          title="Gravar um ponto de restauração local referente a esta versão"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Criar Ponto desta Versão</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: PONTOS LOCAIS (SNAPSHOTS) */}
      {activeTab === 'locais' && (
        <div className="space-y-4">
          {restorePoints.length === 0 ? (
            <div className="bg-gray-900/40 border border-custom-color rounded-2xl p-12 text-center text-custom-main opacity-70">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-200 mb-1">Nenhum snapshot local registrado</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                Você pode criar um novo ponto de restauração no formulário acima ou selecionar qualquer versão do GitHub na aba ao lado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {restorePoints.map((point) => (
                <div
                  key={point.id}
                  className="bg-custom-card border border-custom-color rounded-2xl p-4 hover:border-gray-700 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Infos do Ponto */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-custom-main text-base">
                          {point.description}
                        </span>
                        {point.status === 'valid' || !point.status ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                            Íntegro
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                            Atenção
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-custom-main opacity-70">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span>{new Date(point.timestamp).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          <span>{new Date(point.timestamp).toLocaleTimeString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-500" />
                          <span className="truncate max-w-[140px]">{point.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-gray-500" />
                          <span>{((point.size || 0) / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>

                      {/* Métricas dos dados arquivados */}
                      {point.preview && (
                        <div className="flex flex-wrap gap-3 text-xs text-custom-main opacity-70 bg-custom-primary/40 px-3 py-1.5 rounded-lg border border-custom-color/80">
                          <span>💰 <strong>{point.preview.receitas || 0}</strong> receitas</span>
                          <span>📉 <strong>{point.preview.despesas || 0}</strong> despesas</span>
                          <span>🎯 <strong>{point.preview.orcamento || 0}</strong> orçamentos</span>
                          <span>⚙️ <strong>{point.preview.storageKeys || 0}</strong> registros</span>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2 self-start md:self-center">
                      <button
                        onClick={() => {
                          setSelectedPoint(point);
                          setShowPreview(true);
                        }}
                        className="px-3 py-2 text-xs rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors flex items-center gap-1.5"
                        title="Ver detalhes"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Detalhes</span>
                      </button>

                      <button
                        onClick={() => handleAbrirModalRestaurar(point)}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 transition-colors flex items-center gap-1.5"
                        title="Restaurar o sistema para este estado"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-green-400" />
                        <span>Restaurar</span>
                      </button>

                      <button
                        onClick={() => handleExcluirPonto(point)}
                        className="p-2 text-xs rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        title="Excluir ponto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE PRÉ-VISUALIZAÇÃO */}
      {showPreview && selectedPoint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-custom-color rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-custom-color">
              <h2 className="text-lg font-bold text-custom-main flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Pré-visualização do Ponto de Restauração
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-custom-main opacity-70 hover:text-custom-main"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-custom-primary/60 rounded-xl p-3 border border-custom-color space-y-2">
                <div>
                  <span className="text-custom-main opacity-70">Nome:</span>
                  <div className="font-semibold text-custom-main text-sm">{selectedPoint.description}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div>Data: {new Date(selectedPoint.timestamp).toLocaleString('pt-BR')}</div>
                  <div>Tamanho: {((selectedPoint.size || 0) / 1024).toFixed(2)} KB</div>
                </div>
              </div>

              {selectedPoint.preview && (
                <div className="bg-custom-primary/60 rounded-xl p-3 border border-custom-color">
                  <h4 className="font-semibold text-amber-400 mb-2">Dados a serem restaurados</h4>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div>• {selectedPoint.preview.receitas || 0} receitas</div>
                    <div>• {selectedPoint.preview.despesas || 0} despesas</div>
                    <div>• {selectedPoint.preview.orcamento || 0} orçamentos</div>
                    <div>• {selectedPoint.preview.configKeys || 0} chaves de configuração</div>
                    <div>• {selectedPoint.preview.storageKeys || 0} registros gerais</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3 border-t border-custom-color">
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleAbrirModalRestaurar(selectedPoint);
                }}
                className="flex-1 py-2.5 rounded-xl bg-custom-gold text-black font-semibold text-xs hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Prosseguir para Restauração
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE RESTAURAÇÃO */}
      {restoreTargetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-custom-main">Confirmação de Restauração</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Você está prestes a restaurar o sistema para o ponto:
            </p>
            <div className="p-3 bg-custom-primary rounded-xl border border-custom-color text-xs font-semibold text-custom-main">
              {restoreTargetModal.description}
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 space-y-1">
              <p className="font-semibold text-red-400">Atenção:</p>
              <p>Os dados atuais do sistema serão substituídos pelo estado salvo neste checkpoint.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-custom-main opacity-70 block">
                Para confirmar, digite <strong className="text-amber-400">RESTAURAR</strong> no campo abaixo:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESTAURAR"
                className="w-full bg-custom-primary border border-gray-700 rounded-xl px-4 py-2 text-sm text-center font-bold tracking-widest text-amber-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmarRestauracao}
                disabled={restoring || confirmText.trim().toUpperCase() !== 'RESTAURAR'}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-custom-main font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {restoring ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Restaurando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Confirmar Restauração
                  </>
                )}
              </button>
              <button
                onClick={() => setRestoreTargetModal(null)}
                disabled={restoring}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemRestore;
