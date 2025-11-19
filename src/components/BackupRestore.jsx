import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Download, Upload, Save, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { storage } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';

const BackupRestore = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [ultimoBackup, setUltimoBackup] = useState(null);

  useEffect(() => {
    verificarUltimoBackup();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const verificarUltimoBackup = () => {
    try {
      const uid = user?.id;
      const backupStr = localStorage.getItem(uid ? `AUTO_BACKUP_${uid}` : 'AUTO_BACKUP');
      if (backupStr) {
        const backup = JSON.parse(backupStr);
        setUltimoBackup(new Date(backup.date).toLocaleString('pt-BR'));
      }
    } catch (error) {
      console.error('Erro ao verificar backup:', error);
    }
  };

  // Exportar backup
  const exportarBackup = () => {
    try {
      setIsLoading(true);
      
      const backup = {
        version: '1.0',
        date: new Date().toISOString(),
        data: {
          receitas: storage.get(user?.id ? `RECEITAS_${user.id}` : 'RECEITAS'),
          despesasEssenciais: storage.get(user?.id ? `DESPESAS_ESSENCIAIS_${user.id}` : 'DESPESAS_ESSENCIAIS'),
          lazer: storage.get(user?.id ? `LAZER_${user.id}` : 'LAZER'),
          investimentos: storage.get(user?.id ? `INVESTIMENTOS_${user.id}` : 'INVESTIMENTOS')
        }
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-financeiro-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMessage('success', '✅ Backup exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      showMessage('error', '❌ Erro ao exportar backup!');
    } finally {
      setIsLoading(false);
    }
  };

  // Importar backup
  const importarBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);

        // Validar estrutura do backup
        if (!backup.data || !backup.version) {
          throw new Error('Arquivo de backup inválido');
        }

        // Restaurar dados
        if (backup.data.receitas) {
          storage.set(user?.id ? `RECEITAS_${user.id}` : 'RECEITAS', backup.data.receitas);
        }
        if (backup.data.despesasEssenciais) {
          storage.set(user?.id ? `DESPESAS_ESSENCIAIS_${user.id}` : 'DESPESAS_ESSENCIAIS', backup.data.despesasEssenciais);
        }
        if (backup.data.lazer) {
          storage.set(user?.id ? `LAZER_${user.id}` : 'LAZER', backup.data.lazer);
        }
        if (backup.data.investimentos) {
          storage.set(user?.id ? `INVESTIMENTOS_${user.id}` : 'INVESTIMENTOS', backup.data.investimentos);
        }

        showMessage('success', '✅ Backup restaurado com sucesso! Recarregue a página.');
        
        // Recarregar página após 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('Erro ao importar backup:', error);
        showMessage('error', '❌ Erro ao importar backup! Verifique o arquivo.');
      } finally {
        setIsLoading(false);
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  // Backup automático
  const criarBackupAutomatico = () => {
    try {
      const backup = {
        version: '1.0',
        date: new Date().toISOString(),
        data: {
          receitas: storage.get('RECEITAS'),
          despesasEssenciais: storage.get('DESPESAS_ESSENCIAIS'),
          lazer: storage.get('LAZER'),
          investimentos: storage.get('INVESTIMENTOS')
        }
      };

      const uid2 = user?.id;
      if (uid2) {
        localStorage.setItem(`AUTO_BACKUP_${uid2}`, JSON.stringify(backup));
      }
      verificarUltimoBackup();
      showMessage('success', '✅ Backup automático criado!');
    } catch (error) {
      console.error('Erro ao criar backup automático:', error);
      showMessage('error', '❌ Erro ao criar backup automático!');
    }
  };

  // Restaurar backup automático
  const restaurarBackupAutomatico = () => {
    try {
      const uid3 = user?.id;
      const backupStr = localStorage.getItem(uid3 ? `AUTO_BACKUP_${uid3}` : 'AUTO_BACKUP');
      if (!backupStr) {
        showMessage('error', '❌ Nenhum backup automático encontrado!');
        return;
      }

      const backup = JSON.parse(backupStr);
      
      if (backup.data.receitas) {
        storage.set(uid3 ? `RECEITAS_${uid3}` : 'RECEITAS', backup.data.receitas);
      }
      if (backup.data.despesasEssenciais) {
        storage.set(uid3 ? `DESPESAS_ESSENCIAIS_${uid3}` : 'DESPESAS_ESSENCIAIS', backup.data.despesasEssenciais);
      }
      if (backup.data.lazer) {
        storage.set(uid3 ? `LAZER_${uid3}` : 'LAZER', backup.data.lazer);
      }
      if (backup.data.investimentos) {
        storage.set(uid3 ? `INVESTIMENTOS_${uid3}` : 'INVESTIMENTOS', backup.data.investimentos);
      }

      showMessage('success', '✅ Backup automático restaurado! Recarregue a página.');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao restaurar backup automático:', error);
      showMessage('error', '❌ Erro ao restaurar backup automático!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de feedback */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Manual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Backup Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Exporte todos os seus dados financeiros em um arquivo JSON. Guarde este arquivo em um local seguro.
            </p>
            <Button 
              onClick={exportarBackup} 
              disabled={isLoading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Exportando...' : 'Exportar Backup'}
            </Button>
          </CardContent>
        </Card>

        {/* Restaurar Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restaurar Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Importe um arquivo de backup previamente exportado. Esta ação irá substituir todos os dados atuais.
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importarBackup}
                disabled={isLoading}
                className="hidden"
                id="backup-upload"
              />
              <label htmlFor="backup-upload">
                <Button 
                  as="span"
                  variant="outline" 
                  disabled={isLoading}
                  className="w-full cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? 'Importando...' : 'Importar Backup'}
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Backup Automático */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Backup Automático
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Crie um backup rápido dos seus dados no navegador. Útil para recuperação rápida.
            </p>
            {ultimoBackup && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800">
                  <strong>Último backup:</strong> {ultimoBackup}
                </p>
              </div>
            )}
            <Button 
              onClick={criarBackupAutomatico}
              variant="outline"
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Criar Backup Automático
            </Button>
            {ultimoBackup && (
              <Button 
                onClick={restaurarBackupAutomatico}
                variant="outline"
                className="w-full"
              >
                <Database className="h-4 w-4 mr-2" />
                Restaurar Último Backup
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Backup Manual:</strong> Baixa um arquivo JSON com todos os dados. Guarde em nuvem ou HD externo.</p>
              <p>• <strong>Backup Automático:</strong> Salva no navegador. Mais rápido, mas pode ser perdido ao limpar cache.</p>
              <p>• <strong>Frequência recomendada:</strong> Faça backup manual semanalmente ou após grandes mudanças.</p>
              <p>• <strong>Segurança:</strong> Seus dados ficam apenas no seu dispositivo e nos arquivos de backup que você criar.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackupRestore;
