/**
 * Componente de Interface de Restauração do Sistema
 * 
 * Interface completa para gerenciamento de pontos de restauração com:
 * - Visualização de pontos disponíveis
 * - Pré-visualização do que será restaurado
 * - Confirmação antes da restauração
 * - Monitoramento de integridade
 */

import React, { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';
import { systemRestore } from '../lib/systemRestore';

const SystemRestore = () => {
  const [restorePoints, setRestorePoints] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // success, error, warning, info

  // Inicializar sistema de restauração
  useEffect(() => {
    initializeSystemRestore();
  }, []);

  /**
   * Inicializa o sistema de restauração
   */
  const initializeSystemRestore = async () => {
    try {
      setLoading(true);
      setStatusMessage('Inicializando sistema de restauração...');
      setStatusType('info');

      // Inicializar o sistema
      await systemRestore.initialize();

      // Carregar dados iniciais
      await loadRestoreData();

      setStatusMessage('Sistema de restauração inicializado com sucesso');
      setStatusType('success');

    } catch (error) {
      console.error('Erro ao inicializar sistema de restauração:', error);
      setStatusMessage(`Erro ao inicializar: ${error.message}`);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega dados de pontos de restauração e estatísticas
   */
  const loadRestoreData = async () => {
    try {
      const points = systemRestore.getAvailableRestorePoints();
      const stats = systemRestore.getRestoreStatistics();
      
      setRestorePoints(points);
      setStatistics(stats);
      
      console.log(`📊 ${points.length} pontos de restauração carregados`);
      console.log(`📈 Estatísticas:`, stats);

    } catch (error) {
      console.error('Erro ao carregar dados de restauração:', error);
      setStatusMessage(`Erro ao carregar dados: ${error.message}`);
      setStatusType('error');
    }
  };

  /**
   * Cria um novo ponto de restauração
   */
  const handleCreateRestorePoint = async () => {
    try {
      setLoading(true);
      setStatusMessage('Criando ponto de restauração...');
      setStatusType('info');

      const description = prompt('Digite uma descrição para este ponto de restauração:', 
        `Backup manual - ${new Date().toLocaleString()}`);

      if (!description) {
        setStatusMessage('Criação cancelada');
        setStatusType('warning');
        return;
      }

      const point = await systemRestore.createRestorePoint(description);
      
      await loadRestoreData();
      
      setStatusMessage(`Ponto de restauração criado: ${point.id}`);
      setStatusType('success');

    } catch (error) {
      console.error('Erro ao criar ponto de restauração:', error);
      setStatusMessage(`Erro ao criar ponto: ${error.message}`);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mostra pré-visualização do ponto de restauração
   */
  const handlePreviewPoint = (point) => {
    setSelectedPoint(point);
    setShowPreview(true);
  };

  /**
   * Executa restauração do sistema
   */
  const handleRestorePoint = async (point) => {
    try {
      // Confirmação múltipla para segurança
      const confirm1 = window.confirm(
        `Tem certeza que deseja restaurar o sistema para o ponto de ${new Date(point.timestamp).toLocaleString()}?\n\n` +
        `Isso substituirá todos os dados atuais!`
      );

      if (!confirm1) {
        setStatusMessage('Restauração cancelada');
        setStatusType('warning');
        return;
      }

      const confirm2 = window.prompt(
        'Para confirmar a restauração, digite "RESTAURAR" (sem aspas):'
      );

      if (confirm2 !== 'RESTAURAR') {
        setStatusMessage('Restauração cancelada - confirmação incorreta');
        setStatusType('warning');
        return;
      }

      setRestoring(true);
      setStatusMessage('Restaurando sistema... Por favor, aguarde.');
      setStatusType('info');

      // Executar restauração
      const result = await systemRestore.restoreFromPoint(point.id, {
        createBackupBeforeRestore: true
      });

      setStatusMessage(`Sistema restaurado com sucesso!`);
      setStatusType('success');

      // Recarregar dados após restauração
      await loadRestoreData();

      // Opcional: recarregar página para aplicar mudanças
      setTimeout(() => {
        if (window.confirm('Restauração concluída. Deseja recarregar a página para aplicar todas as mudanças?')) {
          window.location.reload();
        }
      }, 2000);

    } catch (error) {
      console.error('Erro durante restauração:', error);
      setStatusMessage(`Erro na restauração: ${error.message}`);
      setStatusType('error');
    } finally {
      setRestoring(false);
      setShowPreview(false);
      setSelectedPoint(null);
    }
  };

  /**
   * Remove ponto de restauração
   */
  const handleDeletePoint = async (point) => {
    try {
      const confirm = window.confirm(
        `Tem certeza que deseja remover o ponto de ${new Date(point.timestamp).toLocaleString()}?\n\n` +
        `Esta ação não pode ser desfeita!`
      );

      if (!confirm) {
        return;
      }

      await systemRestore.removeRestorePoint(point.id);
      await loadRestoreData();
      
      setStatusMessage('Ponto de restauração removido');
      setStatusType('success');

    } catch (error) {
      console.error('Erro ao remover ponto:', error);
      setStatusMessage(`Erro ao remover ponto: ${error.message}`);
      setStatusType('error');
    }
  };

  /**
   * Verifica integridade dos pontos
   */
  const handleVerifyIntegrity = async () => {
    try {
      setStatusMessage('Verificando integridade dos pontos...');
      setStatusType('info');

      const result = await systemRestore.verifyAllRestorePoints();
      await loadRestoreData();

      setStatusMessage(`Verificação concluída: ${result.validCount} válidos, ${result.invalidCount} corrompidos`);
      setStatusType(result.invalidCount > 0 ? 'warning' : 'success');

    } catch (error) {
      console.error('Erro na verificação:', error);
      setStatusMessage(`Erro na verificação: ${error.message}`);
      setStatusType('error');
    }
  };

  /**
   * Componente de status
   */
  const StatusBar = () => {
    if (!statusMessage) return null;

    const bgColors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const Icons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertCircle,
      info: Settings
    };

    const Icon = Icons[statusType] || Settings;
    const bg = bgColors[statusType] || bgColors.info;

    return (
      <div className={`border ${bg} rounded-md p-3 flex items-center gap-2 mb-4`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{statusMessage}</span>
        {loading && <Activity className="w-4 h-4 animate-spin ml-auto" />}
      </div>
    );
  };

  /**
   * Componente de estatísticas
   */
  const StatisticsPanel = () => {
    if (!statistics) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Estatísticas do Sistema de Restauração
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
            <div className="text-sm text-gray-600">Total de Pontos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.valid}</div>
            <div className="text-sm text-gray-600">Válidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{statistics.corrupted}</div>
            <div className="text-sm text-gray-600">Corrompidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{statistics.totalSizeFormatted}</div>
            <div className="text-sm text-gray-600">Tamanho Total</div>
          </div>
        </div>

        {statistics.oldestPoint && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <div>Mais antigo: {new Date(statistics.oldestPoint).toLocaleString()}</div>
            <div>Mais recente: {new Date(statistics.newestPoint).toLocaleString()}</div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Componente de pré-visualização
   */
  const PreviewModal = () => {
    if (!showPreview || !selectedPoint) return null;

    const { preview } = selectedPoint;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Pré-visualização da Restauração
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Informações do Ponto</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Data/Hora:</span>
                    <div className="font-medium">{new Date(selectedPoint.timestamp).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Usuário:</span>
                    <div className="font-medium">{selectedPoint.userEmail}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Descrição:</span>
                    <div className="font-medium">{selectedPoint.description}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tamanho:</span>
                    <div className="font-medium">{((selectedPoint.size || 0) / 1024).toFixed(2)} KB</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Dados que serão Restaurados</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>{preview.receitas} receitas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>{preview.despesas} despesas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span>{preview.orcamento} configurações de orçamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span>{preview.configKeys} configurações do sistema</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>{preview.storageKeys} itens no armazenamento</span>
                  </div>
                  {preview.categorias > 0 && (
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span>{preview.categorias} categorias</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Aviso Importante</span>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  A restauração substituirá completamente os dados atuais. 
                  Certifique-se de que deseja prosseguir com esta operação.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleRestorePoint(selectedPoint)}
                disabled={restoring}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                onClick={() => setShowPreview(false)}
                disabled={restoring}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Componente de lista de pontos de restauração
   */
  const RestorePointsList = () => {
    if (restorePoints.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ponto de restauração</h3>
          <p className="text-gray-600 mb-4">
            Crie seu primeiro ponto de restauração para proteger seus dados.
          </p>
          <button
            onClick={handleCreateRestorePoint}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <Clock className="w-4 h-4" />
            Criar Ponto de Restauração
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {restorePoints.map((point) => (
          <div key={point.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">{point.description}</h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(point.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(point.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{point.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Database className="w-4 h-4" />
                    <span>{((point.size || 0) / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <div className="flex gap-4">
                    <span>📊 {point.preview.receitas} receitas</span>
                    <span>💰 {point.preview.despesas} despesas</span>
                    <span>⚙️ {point.preview.configKeys} configs</span>
                    <span>💾 {point.preview.storageKeys} itens</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handlePreviewPoint(point)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Visualizar detalhes"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRestorePoint(point)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                  title="Restaurar sistema"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePoint(point)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Remover ponto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Restauração do Sistema
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie pontos de restauração e proteja seus dados contra perdas.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleCreateRestorePoint}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Criar Ponto
          </button>
          <button
            onClick={handleVerifyIntegrity}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Verificar Integridade
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Estatísticas */}
      <StatisticsPanel />

      {/* Pontos de Restauração */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Pontos de Restauração Disponíveis
        </h2>
        
        <RestorePointsList />
      </div>

      {/* Modal de Pré-visualização */}
      <PreviewModal />

      {/* Informações de Segurança */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Informações de Segurança</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Os pontos de restauração incluem todos os seus dados financeiros e configurações</li>
              <li>• A restauração substituirá completamente os dados atuais</li>
              <li>• Sempre um backup é criado automaticamente antes da restauração</li>
              <li>• Os pontos são verificados automaticamente quanto à integridade</li>
              <li>• Mantemos até {systemRestore.maxRestorePoints || 3} pontos no histórico</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemRestore;