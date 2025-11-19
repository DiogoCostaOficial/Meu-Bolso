import AdminDashboard from '../../components/admin/AdminDashboard'
import { AdminCard } from '../../components/admin/AdminCard'
import { AdminButton } from '../../components/admin/AdminButton'
import { UsersIcon, DocumentDuplicateIcon, ChartPieIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default function AdminDashboardPage() {
  const stats = [
    { name: 'Total de Usuários', value: '1,247', icon: UsersIcon, change: '+12%', changeType: 'positive' },
    { name: 'Transações Este Mês', value: 'R$ 45,231', icon: CurrencyDollarIcon, change: '+8.2%', changeType: 'positive' },
    { name: 'Documentos Processados', value: '892', icon: DocumentDuplicateIcon, change: '+19%', changeType: 'positive' },
    { name: 'Taxa de Conversão', value: '3.2%', icon: ChartPieIcon, change: '-0.4%', changeType: 'negative' },
  ]

  const recentUsers = [
    { id: 1, name: 'João Silva', email: 'joao@example.com', status: 'Ativo', date: '2024-01-15' },
    { id: 2, name: 'Maria Santos', email: 'maria@example.com', status: 'Ativo', date: '2024-01-14' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@example.com', status: 'Pendente', date: '2024-01-13' },
    { id: 4, name: 'Ana Costa', email: 'ana@example.com', status: 'Ativo', date: '2024-01-12' },
  ]

  return (
    <AdminDashboard currentPage="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard Administrativo
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Visão geral do sistema e métricas principais
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <AdminButton>Novo Relatório</AdminButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <AdminCard key={stat.name} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">em relação ao mês anterior</span>
              </div>
            </AdminCard>
          ))}
        </div>

        {/* Recent Users and Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Users */}
          <AdminCard title="Usuários Recentes">
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <li key={user.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-800">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="truncate text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'Ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <AdminButton variant="secondary" className="w-full">
                Ver todos os usuários
              </AdminButton>
            </div>
          </AdminCard>

          {/* Quick Actions */}
          <AdminCard title="Ações Rápidas">
            <div className="space-y-4">
              <AdminButton className="w-full justify-center">
                Adicionar Novo Usuário
              </AdminButton>
              <AdminButton variant="secondary" className="w-full justify-center">
                Gerar Relatório Financeiro
              </AdminButton>
              <AdminButton variant="secondary" className="w-full justify-center">
                Exportar Dados
              </AdminButton>
              <AdminButton variant="secondary" className="w-full justify-center">
                Configurar Sistema
              </AdminButton>
            </div>
          </AdminCard>
        </div>

        {/* System Status */}
        <AdminCard title="Status do Sistema">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Banco de Dados</span>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">API</span>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Backup</span>
              <span className="text-sm font-medium text-yellow-600">Pendente</span>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminDashboard>
  )
}