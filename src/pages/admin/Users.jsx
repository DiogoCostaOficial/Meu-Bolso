import AdminDashboard from '../../components/admin/AdminDashboard'
import { AdminCard } from '../../components/admin/AdminCard'
import { AdminButton } from '../../components/admin/AdminButton'
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

export default function AdminUsersPage() {
  const users = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@example.com',
      role: 'Administrador',
      status: 'Ativo',
      lastAccess: '2024-01-15',
      avatar: 'JS'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@example.com',
      role: 'Usuário',
      status: 'Ativo',
      lastAccess: '2024-01-14',
      avatar: 'MS'
    },
    {
      id: 3,
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@example.com',
      role: 'Usuário',
      status: 'Pendente',
      lastAccess: '2024-01-13',
      avatar: 'PO'
    },
    {
      id: 4,
      name: 'Ana Costa',
      email: 'ana.costa@example.com',
      role: 'Usuário',
      status: 'Ativo',
      lastAccess: '2024-01-12',
      avatar: 'AC'
    },
    {
      id: 5,
      name: 'Carlos Mendes',
      email: 'carlos.mendes@example.com',
      role: 'Usuário',
      status: 'Inativo',
      lastAccess: '2024-01-10',
      avatar: 'CM'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800'
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Inativo':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AdminDashboard currentPage="users">
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Gestão de Usuários
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie os usuários do sistema
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <AdminButton>Adicionar Usuário</AdminButton>
          </div>
        </div>

        {/* Users Table */}
        <AdminCard title="Lista de Usuários">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acesso
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-800">
                            {user.avatar}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastAccess}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900 p-1">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <AdminButton variant="secondary">Anterior</AdminButton>
              <AdminButton variant="secondary">Próximo</AdminButton>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">1</span> até <span className="font-medium">5</span> de{' '}
                  <span className="font-medium">{users.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <AdminButton variant="secondary" className="rounded-l-md">
                    Anterior
                  </AdminButton>
                  <AdminButton variant="secondary" className="rounded-r-md">
                    Próximo
                  </AdminButton>
                </nav>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminDashboard>
  )
}