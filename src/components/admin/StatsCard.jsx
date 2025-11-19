export const StatsCard = ({ title, value, change, changeType, icon: Icon }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {Icon && <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
        {change && (
          <div className="ml-4 flex-shrink-0">
            <span
              className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {changeType === 'increase' ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
)