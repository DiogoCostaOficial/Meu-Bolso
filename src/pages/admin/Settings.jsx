import AdminDashboard from '../../components/admin/AdminDashboard'
import { AdminCard } from '../../components/admin/AdminCard'
import { AdminButton } from '../../components/admin/AdminButton'

export default function AdminSettingsPage() {
  return (
    <AdminDashboard currentPage="settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Configurações do Sistema
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie as configurações gerais do sistema
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* General Settings */}
          <AdminCard title="Configurações Gerais">
            <form className="space-y-4">
              <div>
                <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
                  Nome do Site
                </label>
                <input
                  type="text"
                  name="site-name"
                  id="site-name"
                  defaultValue="Meu Bolso"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="site-description" className="block text-sm font-medium text-gray-700">
                  Descrição do Site
                </label>
                <textarea
                  name="site-description"
                  id="site-description"
                  rows={3}
                  defaultValue="Sistema de controle financeiro pessoal"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                  Fuso Horário
                </label>
                <select
                  name="timezone"
                  id="timezone"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option>America/Sao_Paulo</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                </select>
              </div>
              <div className="flex justify-end">
                <AdminButton>Salvar Configurações</AdminButton>
              </div>
            </form>
          </AdminCard>

          {/* Email Settings */}
          <AdminCard title="Configurações de Email">
            <form className="space-y-4">
              <div>
                <label htmlFor="smtp-host" className="block text-sm font-medium text-gray-700">
                  Servidor SMTP
                </label>
                <input
                  type="text"
                  name="smtp-host"
                  id="smtp-host"
                  defaultValue="smtp.gmail.com"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="smtp-port" className="block text-sm font-medium text-gray-700">
                  Porta SMTP
                </label>
                <input
                  type="number"
                  name="smtp-port"
                  id="smtp-port"
                  defaultValue="587"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email-from" className="block text-sm font-medium text-gray-700">
                  Email Remetente
                </label>
                <input
                  type="email"
                  name="email-from"
                  id="email-from"
                  defaultValue="noreply@meubolso.com"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end">
                <AdminButton>Testar Configurações</AdminButton>
              </div>
            </form>
          </AdminCard>

          {/* Security Settings */}
          <AdminCard title="Configurações de Segurança">
            <form className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="2fa" className="text-sm font-medium text-gray-700">
                    Autenticação de Dois Fatores
                  </label>
                  <p className="text-sm text-gray-500">Exige 2FA para login de administradores</p>
                </div>
                <input
                  type="checkbox"
                  name="2fa"
                  id="2fa"
                  defaultChecked
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="session-timeout" className="text-sm font-medium text-gray-700">
                    Tempo Limite de Sessão
                  </label>
                  <p className="text-sm text-gray-500">Tempo em minutos antes de expirar a sessão</p>
                </div>
                <input
                  type="number"
                  name="session-timeout"
                  id="session-timeout"
                  defaultValue="30"
                  min="1"
                  max="1440"
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="ip-restriction" className="text-sm font-medium text-gray-700">
                    Restrição por IP
                  </label>
                  <p className="text-sm text-gray-500">Bloquear acessos de IPs suspeitos</p>
                </div>
                <input
                  type="checkbox"
                  name="ip-restriction"
                  id="ip-restriction"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end">
                <AdminButton>Salvar Segurança</AdminButton>
              </div>
            </form>
          </AdminCard>

          {/* Backup Settings */}
          <AdminCard title="Configurações de Backup">
            <form className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="auto-backup" className="text-sm font-medium text-gray-700">
                    Backup Automático
                  </label>
                  <p className="text-sm text-gray-500">Criar backup automático diariamente</p>
                </div>
                <input
                  type="checkbox"
                  name="auto-backup"
                  id="auto-backup"
                  defaultChecked
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div>
                <label htmlFor="backup-frequency" className="block text-sm font-medium text-gray-700">
                  Frequência do Backup
                </label>
                <select
                  name="backup-frequency"
                  id="backup-frequency"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option>Diariamente</option>
                  <option>Semanalmente</option>
                  <option>Mensalmente</option>
                </select>
              </div>
              <div>
                <label htmlFor="backup-retention" className="block text-sm font-medium text-gray-700">
                  Retenção de Backup (dias)
                </label>
                <input
                  type="number"
                  name="backup-retention"
                  id="backup-retention"
                  defaultValue="30"
                  min="1"
                  max="365"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <AdminButton variant="secondary">Restaurar Backup</AdminButton>
                <AdminButton>Criar Backup Agora</AdminButton>
              </div>
            </form>
          </AdminCard>
        </div>
      </div>
    </AdminDashboard>
  )
}