import { storage } from './storage';

export const autoBackup = {
  create: () => {
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('usuario');
      const uid = userStr ? JSON.parse(userStr).id : null;
      const backup = {
        version: '1.0',
        date: new Date().toISOString(),
        data: {
          receitas: localStorage.getItem(uid ? `RECEITAS_${uid}` : 'RECEITAS') ? JSON.parse(localStorage.getItem(uid ? `RECEITAS_${uid}` : 'RECEITAS')) : [],
          despesasEssenciais: localStorage.getItem(uid ? `DESPESAS_ESSENCIAIS_${uid}` : 'DESPESAS_ESSENCIAIS') ? JSON.parse(localStorage.getItem(uid ? `DESPESAS_ESSENCIAIS_${uid}` : 'DESPESAS_ESSENCIAIS')) : [],
          lazer: localStorage.getItem(uid ? `LAZER_${uid}` : 'LAZER') ? JSON.parse(localStorage.getItem(uid ? `LAZER_${uid}` : 'LAZER')) : [],
          investimentos: localStorage.getItem(uid ? `INVESTIMENTOS_${uid}` : 'INVESTIMENTOS') ? JSON.parse(localStorage.getItem(uid ? `INVESTIMENTOS_${uid}` : 'INVESTIMENTOS')) : []
        }
      };

      localStorage.setItem(uid ? `AUTO_BACKUP_${uid}` : 'AUTO_BACKUP', JSON.stringify(backup));
      console.log('✅ Auto-backup criado:', new Date().toLocaleString('pt-BR'));
    } catch (error) {
      console.error('❌ Erro ao criar auto-backup:', error);
    }
  }
};
