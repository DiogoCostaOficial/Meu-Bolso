// src/pages/Backup.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Save,
  Upload,
  Download,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

/**
 * UTILIDADES DE BACKUP
 * -----------------------------------------------------------------
 * - Os dados da aplicação são armazenados em localStorage nas chaves:
 *   • RECEITAS
 *   • DESPESAS
 *   • ORCAMENTO_<YYYY-MM> (um arquivo por mês)
 *
 * - O backup manual consiste em exportar TODOS esses itens em um único
 *   arquivo JSON que o usuário pode baixar.
 *
 * - O restore manual permite que o usuário selecione um arquivo JSON
 *   previamente exportado e sobrescreva o conteúdo atual.
 *
 * - O backup automático (opcional) grava um snapshot a cada X minutos
 *   (valor configurável) em localStorage sob a chave "BACKUP_AUTO".
 *   Esse snapshot pode ser usado para restaurar caso o usuário perca
 *   os dados originais.
 * -----------------------------------------------------------------
 */

const BACKUP_AUTO_KEY = 'BACKUP_AUTO';
const AUTO_BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos (pode ser alterado)

const getAllData = () => {
  const receitas = localStorage.getItem('RECEITAS');
  const despesas = localStorage.getItem('DESPESAS');

  // Captura todos os orçamentos mensais (chave começa com ORCAMENTO_)
  const orcamentos = Object.keys(localStorage)
    .filter((k) => k.startsWith('ORCAMENTO_'))
    .reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {});

  return {
    RECEITAS: receitas ? JSON.parse(receitas) : [],
    DESPESAS: despesas ? JSON.parse(despesas) : [],
    ORCAMENTOS: orcamentos,
    timestamp: new Date().toISOString(),
  };
};

const restoreAllData = (data) => {
  // Limpa tudo antes de restaurar
  localStorage.removeItem('RECEITAS');
  localStorage.removeItem('DESPESAS');
  Object.keys(localStorage)
    .filter((k) => k.startsWith('ORCAMENTO_'))
    .forEach((k) => localStorage.removeItem(k));

  // Salva novamente
  localStorage.setItem('RECEITAS', JSON.stringify(data.RECEITAS || []));
  localStorage.setItem('DESPESAS', JSON.stringify(data.DESPESAS || []));
  if (data.ORCAMENTOS && typeof data.ORCAMENTOS === 'object') {
    Object.entries(data.ORCAMENTOS).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }
};

const Backup = () => {
  const { user } = useAuth();
  const [lastAutoBackup, setLastAutoBackup] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'

  /*** BACKUP AUTOMÁTICO – INICIALIZAÇÃO ****************************************/
  const performAutoBackup = useCallback(() => {
    const snapshot = getAllData();
    localStorage.setItem(BACKUP_AUTO_KEY, JSON.stringify(snapshot));
    setLastAutoBackup(new Date());
    console.info('✅ Backup automático realizado em', new Date().toLocaleString());
  }, []);

  useEffect(() => {
    // Restaura o último snapshot automático (se existir) ao montar a página
    const saved = localStorage.getItem(BACKUP_AUTO_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLastAutoBackup(new Date(parsed.timestamp));
      } catch (_) {
        // ignore
      }
    }

    // Inicia o intervalo de backup automático
    const intervalId = setInterval(performAutoBackup, AUTO_BACKUP_INTERVAL_MS);
    // Executa imediatamente na primeira carga
    performAutoBackup();

    return () => clearInterval(intervalId);
  }, [performAutoBackup]);
  /*** FIM DO BACKUP AUTOMÁTICO ***********************************************/

  /*** BACKUP MANUAL – EXPORTAÇÃO **********************************************/
  const handleExport = () => {
    try {
      const data = getAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financas-backup-${new Date()
        .toISOString()
        .replace(/[:.]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMessage('Backup exportado com sucesso!');
      setStatusType('success');
    } catch (err) {
      console.error(err);
      setStatusMessage('Falha ao exportar backup.');
      setStatusType('error');
    }
  };
  /*** FIM DO BACKUP MANUAL – EXPORTAÇÃO ***************************************/

  /*** BACKUP MANUAL – IMPORTAÇÃO **********************************************/
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        // Validação mínima
        if (
          typeof json !== 'object' ||
          !json.RECEITAS ||
          !json.DESPESAS ||
          !json.ORCAMENTOS
        ) {
          throw new Error('Formato de backup inválido.');
        }

        restoreAllData(json);
        setStatusMessage('Backup importado com sucesso! A página será recarregada.');
        setStatusType('success');
        // Pequeno delay para o usuário ver a mensagem antes de recarregar
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error(err);
        setStatusMessage(`Erro ao importar backup: ${err.message}`);
        setStatusType('error');
      }
    };
    reader.readAsText(file);
  };
  /*** FIM DO BACKUP MANUAL – IMPORTAÇÃO ***************************************/

  /*** UI DE STATUS ************************************************************/
  const StatusBar = () => {
    if (!statusMessage) return null;
    const bg =
      statusType === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : statusType === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-blue-50 border-blue-200 text-blue-800';
    const Icon = statusType === 'success' ? CheckCircle : statusType === 'error' ? XCircle : Clock;

    return (
      <div className={`border ${bg} rounded-md p-3 flex items-center gap-2 mb-4`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{statusMessage}</span>
      </div>
    );
  };
  /*** FIM UI DE STATUS ********************************************************/

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <Save className="w-7 h-7 text-indigo-600" />
        Backup de Dados
      </h2>

      {/* STATUS GERAL */}
      <StatusBar />

      {/* INFORMAÇÕES DO BACKUP AUTOMÁTICO */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          Backup Automático
        </h3>
        <p className="text-gray-600 mb-4">
          Um snapshot dos seus dados (receitas, despesas e orçamentos) é salvo a cada{' '}
          <strong>{AUTO_BACKUP_INTERVAL_MS / 60000} minutos</strong>. O último backup
          automático foi realizado em:
        </p>
        <p className="text-lg font-medium text-indigo-600">
          {lastAutoBackup ? lastAutoBackup.toLocaleString() : 'Ainda não realizado'}
        </p>
        <button
          onClick={performAutoBackup}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Forçar Backup Agora
        </button>
      </section>

      {/* BACKUP MANUAL - EXPORTAR */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Download className="w-5 h-5 text-green-600" />
          Exportar Backup
        </h3>
        <p className="text-gray-600 mb-4">
          Baixe um arquivo <code>.json</code> contendo todos os seus dados. Guarde-o em
          local seguro para restaurar futuramente.
        </p>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4" />
          Exportar Dados
        </button>
      </section>

      {/* BACKUP MANUAL - IMPORTAR */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Upload className="w-5 h-5 text-yellow-600" />
          Importar Backup
        </h3>
        <p className="text-gray-600 mb-4">
          Selecione um arquivo <code>.json</code> previamente exportado para restaurar
          seus dados. Esta operação sobrescreve o conteúdo atual.
        </p>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded cursor-pointer hover:bg-yellow-700 transition">
          <Upload className="w-4 h-4" />
          Selecionar Arquivo
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
      </section>

      {/* ALERTA IMPORTANTE */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-800">
            Atenção: ao importar um backup, todos os dados atuais serão substituídos.
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Certifique‑se de que o arquivo selecionado corresponde ao formato gerado por
            esta página.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Backup;
