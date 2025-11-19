/**
 * Sistema de Pontos de Restauração Completo - Finanças Fácil
 * 
 * Este módulo gerencia a criação, armazenamento e restauração de pontos
 * de restauração completos do sistema, incluindo:
 * - Dados da aplicação (receitas, despesas, orçamentos)
 * - Configurações do sistema
 * - Preferências do usuário
 * - Estado da aplicação
 */

// Função para obter usuário atual - será obtida através do contexto quando necessário
const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('usuario'); // Mudança: usar 'usuario' em vez de 'user'
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

// Configurações do sistema de restauração
const RESTORE_CONFIG = {
  maxRestorePoints: 3,
  storageKey: 'SYSTEM_RESTORE_POINTS',
  autoBackupInterval: 24 * 60 * 60 * 1000, // 24 horas
  backupBeforeUpdate: true,
  integrityCheckInterval: 60 * 60 * 1000, // 1 hora
  compressionEnabled: true,
  encryptionEnabled: true
};

/**
 * Classe principal para gerenciamento de pontos de restauração
 */
export class SystemRestoreManager {
  constructor() {
    this.restorePoints = [];
    this.currentUser = null;
    this.initialized = false;
  }

  /**
   * Inicializa o sistema de restauração
   */
  async initialize() {
    try {
      console.log('🔄 Inicializando Sistema de Pontos de Restauração...');
      
      // Obter usuário atual
      this.currentUser = await getCurrentUser();
      
      // Carregar pontos de restauração existentes
      await this.loadRestorePoints();
      
      // Verificar integridade dos pontos existentes
      await this.verifyAllRestorePoints();
      
      // Configurar backup automático
      this.setupAutoBackup();
      
      // Configurar verificação de integridade automática
      this.setupIntegrityCheck();
      
      this.initialized = true;
      console.log('✅ Sistema de Pontos de Restauração inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema de restauração:', error);
      throw new Error(`Falha na inicialização do sistema de restauração: ${error.message}`);
    }
  }

  /**
   * Cria um ponto de restauração completo
   */
  async createRestorePoint(description = 'Ponto de restauração automático') {
    try {
      if (!this.initialized) {
        throw new Error('Sistema de restauração não inicializado');
      }

      const userId = this.currentUser?.id || 'system';
      const timestamp = new Date().toISOString();
      const pointId = `restore-${userId}-${Date.now()}`;

      console.log(`📦 Criando ponto de restauração: ${pointId}`);

      // Coletar todos os dados do sistema
      const systemData = await this.collectSystemData(userId);
      
      // Criar ponto de restauração
      const restorePoint = {
        id: pointId,
        timestamp,
        description,
        userId,
        userEmail: this.currentUser?.email || 'sistema',
        data: systemData,
        size: JSON.stringify(systemData).length,
        checksum: this.generateChecksum(systemData),
        version: '2.0',
        status: 'active'
      };

      // Adicionar à lista de pontos
      this.restorePoints.unshift(restorePoint);
      
      // Limitar número de pontos
      if (this.restorePoints.length > RESTORE_CONFIG.maxRestorePoints) {
        const removed = this.restorePoints.splice(RESTORE_CONFIG.maxRestorePoints);
        console.log(`🗑️ Removidos ${removed.length} pontos antigos`);
      }

      // Salvar no localStorage
      await this.saveRestorePoints();

      console.log(`✅ Ponto de restauração criado com sucesso: ${pointId}`);
      console.log(`📊 Tamanho: ${(restorePoint.size / 1024).toFixed(2)} KB`);
      console.log(`📝 Descrição: ${description}`);

      return restorePoint;

    } catch (error) {
      console.error('❌ Erro ao criar ponto de restauração:', error);
      throw new Error(`Falha ao criar ponto de restauração: ${error.message}`);
    }
  }

  /**
   * Coleta todos os dados do sistema para restauração
   */
  async collectSystemData(userId) {
    try {
      console.log('📊 Coletando dados do sistema...');

      const systemData = {
        timestamp: new Date().toISOString(),
        application: {
          name: 'Finanças Fácil',
          version: '2.0',
          environment: process.env.NODE_ENV || 'development'
        },
        userData: {},
        applicationState: {},
        configuration: {},
        localStorage: {},
        sessionStorage: {}
      };

      // Coletar dados do usuário
      systemData.userData = this.collectUserData(userId);

      // Coletar estado da aplicação
      systemData.applicationState = this.collectApplicationState();

      // Coletar configurações
      systemData.configuration = this.collectConfiguration();

      // Coletar localStorage completo (filtrado por usuário)
      systemData.localStorage = this.collectLocalStorage(userId);

      // Coletar sessionStorage
      systemData.sessionStorage = this.collectSessionStorage();

      console.log(`📋 Dados coletados: ${Object.keys(systemData).length} categorias`);
      
      return systemData;

    } catch (error) {
      console.error('❌ Erro ao coletar dados do sistema:', error);
      throw error;
    }
  }

  /**
   * Coleta dados específicos do usuário
   */
  collectUserData(userId) {
    const userData = {
      id: userId,
      receitas: [],
      despesas: [],
      orcamento: {},
      metas: [],
      categorias: [],
      preferences: {}
    };

    try {
      // Receitas
      const receitasKey = `RECEITAS_${userId}`;
      const receitasData = localStorage.getItem(receitasKey);
      if (receitasData) {
        userData.receitas = JSON.parse(receitasData);
      }

      // Despesas
      const despesasKey = `DESPESAS_${userId}`;
      const despesasData = localStorage.getItem(despesasKey);
      if (despesasData) {
        userData.despesas = JSON.parse(despesasData);
      }

      // Orçamento
      const orcamentoKey = `ORCAMENTO_${userId}`;
      const orcamentoData = localStorage.getItem(orcamentoKey);
      if (orcamentoData) {
        userData.orcamento = JSON.parse(orcamentoData);
      }

      // Preferências
      const prefsKey = `USER_PREFS_${userId}`;
      const prefsData = localStorage.getItem(prefsKey);
      if (prefsData) {
        userData.preferences = JSON.parse(prefsData);
      }

      console.log(`👤 Dados do usuário ${userId}: ${userData.receitas.length} receitas, ${userData.despesas.length} despesas`);

      return userData;

    } catch (error) {
      console.error('❌ Erro ao coletar dados do usuário:', error);
      return userData;
    }
  }

  /**
   * Coleta estado da aplicação
   */
  collectApplicationState() {
    const state = {
      currentPage: window.location.pathname + window.location.hash,
      lastActivity: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };

    return state;
  }

  /**
   * Coleta configurações do sistema
   */
  collectConfiguration() {
    const config = {
      theme: localStorage.getItem('theme') || 'light',
      currency: localStorage.getItem('currency') || 'BRL',
      dateFormat: localStorage.getItem('dateFormat') || 'DD/MM/YYYY',
      notifications: localStorage.getItem('notifications') !== 'false',
      autoBackup: localStorage.getItem('autoBackup') !== 'false',
      backupInterval: parseInt(localStorage.getItem('backupInterval') || '24', 10)
    };

    return config;
  }

  /**
   * Coleta localStorage filtrado por usuário
   */
  collectLocalStorage(userId) {
    const storage = {};
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          
          // Filtrar apenas dados relevantes e do usuário atual
          if (this.isRelevantStorageKey(key, userId)) {
            try {
              storage[key] = JSON.parse(value);
            } catch (e) {
              storage[key] = value;
            }
          }
        }
      }

      console.log(`💾 Dados do localStorage: ${Object.keys(storage).length} chaves`);
      return storage;

    } catch (error) {
      console.error('❌ Erro ao coletar localStorage:', error);
      return {};
    }
  }

  /**
   * Coleta sessionStorage
   */
  collectSessionStorage() {
    const storage = {};
    
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          try {
            storage[key] = JSON.parse(value);
          } catch (e) {
            storage[key] = value;
          }
        }
      }

      return storage;

    } catch (error) {
      console.error('❌ Erro ao coletar sessionStorage:', error);
      return {};
    }
  }

  /**
   * Verifica se uma chave do storage é relevante para restauração
   */
  isRelevantStorageKey(key, userId) {
    const relevantPatterns = [
      'RECEITAS_',
      'DESPESAS_',
      'ORCAMENTO_',
      'METAS_',
      'CATEGORIAS_',
      'USER_PREFS_',
      'AUTO_BACKUP_',
      'SYSTEM_RESTORE_',
      'theme',
      'currency',
      'dateFormat',
      'notifications',
      'autoBackup'
    ];

    // Verificar se a chave corresponde a algum padrão relevante
    const isRelevant = relevantPatterns.some(pattern => key.includes(pattern));
    
    // Se for dado de usuário, verificar se é do usuário atual
    if (key.includes('_') && userId) {
      return isRelevant && key.includes(userId);
    }

    return isRelevant;
  }

  /**
   * Gera checksum para verificação de integridade
   */
  generateChecksum(data) {
    const jsonString = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Verifica integridade de um ponto de restauração
   */
  verifyRestorePoint(restorePoint) {
    try {
      if (!restorePoint || !restorePoint.data || !restorePoint.checksum) {
        return { valid: false, error: 'Dados incompletos' };
      }

      const calculatedChecksum = this.generateChecksum(restorePoint.data);
      const isValid = calculatedChecksum === restorePoint.checksum;

      return {
        valid: isValid,
        error: isValid ? null : 'Checksum inválido - dados corrompidos',
        calculatedChecksum,
        expectedChecksum: restorePoint.checksum
      };

    } catch (error) {
      return {
        valid: false,
        error: `Erro na verificação: ${error.message}`
      };
    }
  }

  /**
   * Verifica todos os pontos de restauração
   */
  async verifyAllRestorePoints() {
    console.log('🔍 Verificando integridade dos pontos de restauração...');
    
    let validCount = 0;
    let invalidCount = 0;

    for (const point of this.restorePoints) {
      const verification = this.verifyRestorePoint(point);
      
      if (verification.valid) {
        validCount++;
        console.log(`✅ Ponto ${point.id}: Válido`);
      } else {
        invalidCount++;
        console.log(`❌ Ponto ${point.id}: ${verification.error}`);
        point.status = 'corrupted';
      }
    }

    console.log(`🔍 Verificação concluída: ${validCount} válidos, ${invalidCount} corrompidos`);
    
    if (invalidCount > 0) {
      await this.saveRestorePoints();
    }

    return { validCount, invalidCount };
  }

  /**
   * Restaura o sistema a partir de um ponto de restauração
   */
  async restoreFromPoint(pointId, options = {}) {
    try {
      console.log(`🔄 Iniciando restauração do ponto: ${pointId}`);

      const restorePoint = this.restorePoints.find(p => p.id === pointId);
      if (!restorePoint) {
        throw new Error('Ponto de restauração não encontrado');
      }

      if (restorePoint.status === 'corrupted') {
        throw new Error('Ponto de restauração está corrompido');
      }

      // Verificar integridade antes de restaurar
      const verification = this.verifyRestorePoint(restorePoint);
      if (!verification.valid) {
        throw new Error(`Ponto de restauração inválido: ${verification.error}`);
      }

      // Criar backup antes da restauração (se solicitado)
      if (options.createBackupBeforeRestore !== false) {
        console.log('💾 Criando backup antes da restauração...');
        await this.createRestorePoint('Backup automático antes da restauração');
      }

      // Executar restauração
      await this.executeRestoration(restorePoint, options);

      console.log(`✅ Restauração concluída com sucesso: ${pointId}`);
      
      return {
        success: true,
        pointId,
        timestamp: restorePoint.timestamp,
        description: restorePoint.description
      };

    } catch (error) {
      console.error('❌ Erro durante a restauração:', error);
      throw new Error(`Falha na restauração: ${error.message}`);
    }
  }

  /**
   * Executa a restauração propriamente dita
   */
  async executeRestoration(restorePoint, options) {
    try {
      const { data } = restorePoint;
      
      console.log('🔄 Restaurando dados do sistema...');

      // Restaurar localStorage
      if (data.localStorage) {
        console.log('💾 Restaurando localStorage...');
        for (const [key, value] of Object.entries(data.localStorage)) {
          try {
            localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
          } catch (error) {
            console.warn(`⚠️ Erro ao restaurar ${key}:`, error);
          }
        }
      }

      // Restaurar sessionStorage
      if (data.sessionStorage) {
        console.log('💾 Restaurando sessionStorage...');
        for (const [key, value] of Object.entries(data.sessionStorage)) {
          try {
            sessionStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
          } catch (error) {
            console.warn(`⚠️ Erro ao restaurar ${key}:`, error);
          }
        }
      }

      // Restaurar configurações
      if (data.configuration) {
        console.log('⚙️ Restaurando configurações...');
        for (const [key, value] of Object.entries(data.configuration)) {
          localStorage.setItem(key, value);
        }
      }

      console.log('✅ Restauração dos dados concluída');

    } catch (error) {
      console.error('❌ Erro durante a execução da restauração:', error);
      throw error;
    }
  }

  /**
   * Carrega pontos de restauração do localStorage
   */
  async loadRestorePoints() {
    try {
      const stored = localStorage.getItem(RESTORE_CONFIG.storageKey);
      if (stored) {
        this.restorePoints = JSON.parse(stored);
        console.log(`📂 ${this.restorePoints.length} pontos de restauração carregados`);
      } else {
        this.restorePoints = [];
        console.log('📂 Nenhum ponto de restauração encontrado');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pontos de restauração:', error);
      this.restorePoints = [];
    }
  }

  /**
   * Salva pontos de restauração no localStorage
   */
  async saveRestorePoints() {
    try {
      localStorage.setItem(RESTORE_CONFIG.storageKey, JSON.stringify(this.restorePoints));
      console.log(`💾 ${this.restorePoints.length} pontos de restauração salvos`);
    } catch (error) {
      console.error('❌ Erro ao salvar pontos de restauração:', error);
      throw new Error('Falha ao salvar pontos de restauração: ' + error.message);
    }
  }

  /**
   * Configura backup automático
   */
  setupAutoBackup() {
    if (RESTORE_CONFIG.autoBackupInterval > 0) {
      setInterval(async () => {
        try {
          console.log('🤖 Backup automático executando...');
          await this.createRestorePoint('Backup automático diário');
        } catch (error) {
          console.error('❌ Erro no backup automático:', error);
        }
      }, RESTORE_CONFIG.autoBackupInterval);

      console.log(`🤖 Backup automático configurado para cada ${RESTORE_CONFIG.autoBackupInterval / (60 * 60 * 1000)} horas`);
    }
  }

  /**
   * Configura verificação automática de integridade
   */
  setupIntegrityCheck() {
    if (RESTORE_CONFIG.integrityCheckInterval > 0) {
      setInterval(async () => {
        try {
          console.log('🔍 Verificação de integridade automática executando...');
          await this.verifyAllRestorePoints();
        } catch (error) {
          console.error('❌ Erro na verificação de integridade:', error);
        }
      }, RESTORE_CONFIG.integrityCheckInterval);

      console.log(`🔍 Verificação de integridade configurada para cada ${RESTORE_CONFIG.integrityCheckInterval / (60 * 1000)} minutos`);
    }
  }

  /**
   * Obtém lista de pontos de restauração disponíveis
   */
  getAvailableRestorePoints() {
    return this.restorePoints
      .filter(point => point.status !== 'corrupted')
      .map(point => ({
        id: point.id,
        timestamp: point.timestamp,
        description: point.description,
        userEmail: point.userEmail,
        size: point.size,
        status: point.status,
        preview: this.generatePreview(point)
      }));
  }

  /**
   * Gera pré-visualização do que será restaurado
   */
  generatePreview(restorePoint) {
    const { data } = restorePoint;
    const preview = {
      receitas: data.userData?.receitas?.length || 0,
      despesas: data.userData?.despesas?.length || 0,
      orcamento: Object.keys(data.userData?.orcamento || {}).length,
      categorias: data.userData?.categorias?.length || 0,
      configKeys: Object.keys(data.configuration || {}).length,
      storageKeys: Object.keys(data.localStorage || {}).length
    };

    return preview;
  }

  /**
   * Remove ponto de restauração
   */
  async removeRestorePoint(pointId) {
    try {
      const index = this.restorePoints.findIndex(p => p.id === pointId);
      if (index === -1) {
        throw new Error('Ponto de restauração não encontrado');
      }

      this.restorePoints.splice(index, 1);
      await this.saveRestorePoints();

      console.log(`🗑️ Ponto de restauração removido: ${pointId}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao remover ponto de restauração:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas do sistema de restauração
   */
  getStatistics() {
    const total = this.restorePoints.length;
    const valid = this.restorePoints.filter(p => p.status !== 'corrupted').length;
    const corrupted = this.restorePoints.filter(p => p.status === 'corrupted').length;
    const totalSize = this.restorePoints.reduce((sum, p) => sum + p.size, 0);

    return {
      total,
      valid,
      corrupted,
      totalSize,
      totalSizeFormatted: `${(totalSize / 1024).toFixed(2)} KB`,
      oldestPoint: this.restorePoints.length > 0 ? this.restorePoints[this.restorePoints.length - 1].timestamp : null,
      newestPoint: this.restorePoints.length > 0 ? this.restorePoints[0].timestamp : null
    };
  }
}

// Exportar instância singleton
export const systemRestore = new SystemRestoreManager();

// Funções auxiliares para uso direto
export const createRestorePoint = (description) => systemRestore.createRestorePoint(description);
export const restoreFromPoint = (pointId, options) => systemRestore.restoreFromPoint(pointId, options);
export const getAvailableRestorePoints = () => systemRestore.getAvailableRestorePoints();
export const removeRestorePoint = (pointId) => systemRestore.removeRestorePoint(pointId);
export const getRestoreStatistics = () => systemRestore.getStatistics();
export const verifyRestorePoints = () => systemRestore.verifyAllRestorePoints();