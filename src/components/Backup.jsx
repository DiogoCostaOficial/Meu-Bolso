import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Download, Upload, RefreshCw, Clock, Save, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const Backup = () => {
  const { user } = useAuth();
  const [backups, setBackups] = useState([]);
  const [autoBackup, setAutoBackup] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const autoBackupSalvo = localStorage.getItem('AUTO_BACKUP');
    if (autoBackupSalvo !== null) {
      setAutoBackup(JSON.parse(autoBackupSalvo));
    }
    carregarHistoricoBackups();
  }, []);

  const carregarHistoricoBackups = () => {
    const uid = user?.id;
    const historicoSalvo = localStorage.getItem(uid ? `HISTORICO_BACKUPS_${uid}` : 'HISTORICO_BACKUPS');
    if (historicoSalvo) {
      setBackups(JSON.parse(historicoSalvo));
    }
  };

  const salvarHistoricoBackups = (novosBackups) => {
    const uid = user?.id;
    localStorage.setItem(uid ? `HISTORICO_BACKUPS_${uid}` : 'HISTORICO_BACKUPS', JSON.stringify(novosBackups));
    setBackups(novosBackups);
  };

  const obterTodosDados = () => {
    const uid = user?.id;
    const dados = {
      versao: '1.0',
      dataBackup: new Date().toISOString(),
      receitas: JSON.parse(localStorage.getItem(uid ? `RECEITAS_${uid}` : 'RECEITAS') || '[]'),
      despesas: JSON.parse(localStorage.getItem(uid ? `DESPESAS_${uid}` : 'DESPESAS') || '[]'),
      despesasEssenciais: JSON.parse(localStorage.getItem(uid ? `DESPESAS_ESSENCIAIS_${uid}` : 'DESPESAS_ESSENCIAIS') || '[]'),
      investimentos: JSON.parse(localStorage.getItem(uid ? `INVESTIMENTOS_${uid}` : 'INVESTIMENTOS') || '[]'),
      configuracoes: {
        autoBackup: JSON.parse(localStorage.getItem(uid ? `AUTO_BACKUP_${uid}` : 'AUTO_BACKUP') || 'true')
      }
    };
    return dados;
  };

  const criarBackupManual = () => {
    setCarregando(true);
    try {
      const dados = obterTodosDados();
      const dataFormatada = new Date().toLocaleString('pt-BR').replace(/[/:]/g, '-').replace(', ', '_');
      const nomeArquivo = `backup_${dataFormatada}.json`;

      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const novoBackup = {
        id: Date.now(),
        data: new Date().toISOString(),
        nome: nomeArquivo,
        tamanho: new Blob([JSON.stringify(dados)]).size,
        tipo: 'manual',
        registros: {
          receitas: dados.receitas.length,
          despesas: dados.despesas.length,
          despesasEssenciais: dados.despesasEssenciais.length,
          investimentos: dados.investimentos.length
        }
      };

      const novosBackups = [novoBackup, ...backups].slice(0, 10);
      salvarHistoricoBackups(novosBackups);

      mostrarMensagem('sucesso', 'Backup criado e baixado com sucesso!');
    } catch (error) {
      mostrarMensagem('erro', 'Erro ao criar backup: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const criarBackupAutomatico = () => {
    try {
      const dados = obterTodosDados();
      const dataFormatada = new Date().toLocaleString('pt-BR').replace(/[/:]/g, '-').replace(', ', '_');

      const novoBackup = {
        id: Date.now(),
        data: new Date().toISOString(),
        nome: `backup_auto_${dataFormatada}.json`,
        tamanho: new Blob([JSON.stringify(dados)]).size,
        tipo: 'automatico',
        registros: {
          receitas: dados.receitas.length,
          despesas: dados.despesas.length,
          despesasEssenciais: dados.despesasEssenciais.length,
          investimentos: dados.investimentos.length
        }
      };

      const novosBackups = [novoBackup, ...backups].slice(0, 10);
      salvarHistoricoBackups(novosBackups);

      const uid = user?.id;
      localStorage.setItem(uid ? `BACKUP_${uid}_${novoBackup.id}` : `BACKUP_${novoBackup.id}`, JSON.stringify(dados));
    } catch (error) {
      console.error('Erro ao criar backup automático:', error);
    }
  };

  const restaurarBackup = (backupId) => {
    if (!window.confirm('Tem certeza que deseja restaurar este backup? Os dados atuais serão substituídos.')) {
      return;
    }

    setCarregando(true);
    try {
      const uid = user?.id;
      const backupData = localStorage.getItem(uid ? `BACKUP_${uid}_${backupId}` : `BACKUP_${backupId}`);
      if (!backupData) {
        mostrarMensagem('erro', 'Backup não encontrado!');
        return;
      }

      const dados = JSON.parse(backupData);

      const uid2 = user?.id;
      if (uid2) {
        localStorage.setItem(`RECEITAS_${uid2}`, JSON.stringify(dados.receitas));
        localStorage.setItem(`DESPESAS_${uid2}`, JSON.stringify(dados.despesas));
        localStorage.setItem(`DESPESAS_ESSENCIAIS_${uid2}`, JSON.stringify(dados.despesasEssenciais));
        localStorage.setItem(`INVESTIMENTOS_${uid2}`, JSON.stringify(dados.investimentos));
      }
      if (dados.configuracoes) {
        localStorage.setItem('AUTO_BACKUP', JSON.stringify(dados.configuracoes.autoBackup));
      }

      mostrarMensagem('sucesso', 'Backup restaurado com sucesso! Recarregue a página para ver as mudanças.');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      mostrarMensagem('erro', 'Erro ao restaurar backup: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const importarBackup = (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    setCarregando(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result);

        if (!dados.versao || !dados.receitas || !dados.despesas) {
          throw new Error('Arquivo de backup inválido!');
        }

        if (!window.confirm('Tem certeza que deseja importar este backup? Os dados atuais serão substituídos.')) {
          setCarregando(false);
          return;
        }

        const uid3 = user?.id;
        localStorage.setItem(uid3 ? `RECEITAS_${uid3}` : 'RECEITAS', JSON.stringify(dados.receitas));
        localStorage.setItem(uid3 ? `DESPESAS_${uid3}` : 'DESPESAS', JSON.stringify(dados.despesas));
        localStorage.setItem(uid3 ? `DESPESAS_ESSENCIAIS_${uid3}` : 'DESPESAS_ESSENCIAIS', JSON.stringify(dados.despesasEssenciais || []));
        localStorage.setItem(uid3 ? `INVESTIMENTOS_${uid3}` : 'INVESTIMENTOS', JSON.stringify(dados.investimentos || []));
        if (dados.configuracoes) {
          localStorage.setItem('AUTO_BACKUP', JSON.stringify(dados.configuracoes.autoBackup));
        }

        mostrarMensagem('sucesso', 'Backup importado com sucesso! Recarregue a página para ver as mudanças.');
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        mostrarMensagem('erro', 'Erro ao importar backup: ' + error.message);
      } finally {
        setCarregando(false);
      }
    };

    reader.readAsText(arquivo);
    event.target.value = '';
  };

  const excluirBackup = (backupId) => {
    if (!window.confirm('Tem certeza que deseja excluir este backup?')) {
      return;
    }

    const novosBackups = backups.filter(b => b.id !== backupId);
    salvarHistoricoBackups(novosBackups);
    localStorage.removeItem(`BACKUP_${backupId}`);
    mostrarMensagem('sucesso', 'Backup excluído com sucesso!');
  };

  const alternarAutoBackup = () => {
    const novoValor = !autoBackup;
    setAutoBackup(novoValor);
    localStorage.setItem('AUTO_BACKUP', JSON.stringify(novoValor));
    mostrarMensagem('sucesso', `Backup automático ${novoValor ? 'ativado' : 'desativado'}!`);
  };

  const mostrarMensagem = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 5000);
  };

  const formatarTamanho = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatarData = (isoString) => {
    return new Date(isoString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sistema de Backup</h1>
      </div>

      {mensagem.texto && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          mensagem.tipo === 'sucesso' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {mensagem.tipo === 'sucesso' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{mensagem.texto}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Criar Backup</h3>
              <p className="text-sm text-gray-600">Download manual</p>
            </div>
          </div>
          <button
            onClick={criarBackupManual}
            disabled={carregando}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {carregando ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Baixar Backup
              </>
            )}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Importar Backup</h3>
              <p className="text-sm text-gray-600">Restaurar de arquivo</p>
            </div>
          </div>
          <label className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            Selecionar Arquivo
            <input
              type="file"
              accept=".json"
              onChange={importarBackup}
              className="hidden"
              disabled={carregando}
            />
          </label>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              autoBackup ? 'bg-purple-100' : 'bg-gray-100'
            }`}>
              <RefreshCw className={`w-6 h-6 ${autoBackup ? 'text-purple-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Backup Automático</h3>
              <p className="text-sm text-gray-600">
                {autoBackup ? 'Ativado' : 'Desativado'}
              </p>
            </div>
          </div>
          <button
            onClick={alternarAutoBackup}
            className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
              autoBackup 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {autoBackup ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados Atuais</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {JSON.parse(localStorage.getItem('RECEITAS') || '[]').length}
            </div>
            <div className="text-sm text-gray-600">Receitas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {JSON.parse(localStorage.getItem('DESPESAS') || '[]').length}
            </div>
            <div className="text-sm text-gray-600">Despesas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {JSON.parse(localStorage.getItem('DESPESAS_ESSENCIAIS') || '[]').length}
            </div>
            <div className="text-sm text-gray-600">Despesas Essenciais</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {JSON.parse(localStorage.getItem('INVESTIMENTOS') || '[]').length}
            </div>
            <div className="text-sm text-gray-600">Investimentos</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Backups</h2>
          <button
            onClick={carregarHistoricoBackups}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {backups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Nenhum backup encontrado</p>
            <p className="text-sm">Crie seu primeiro backup clicando no botão acima</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registros</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatarData(backup.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        backup.tipo === 'manual' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {backup.tipo === 'manual' ? 'Manual' : 'Automático'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {backup.registros.receitas + backup.registros.despesas + backup.registros.despesasEssenciais + backup.registros.investimentos} registros
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatarTamanho(backup.tamanho)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => restaurarBackup(backup.id)}
                        disabled={carregando}
                        className="text-blue-600 hover:text-blue-800 mr-3 disabled:opacity-50"
                        title="Restaurar"
                      >
                        <RefreshCw className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => excluirBackup(backup.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backup;
