export const AdminCard = ({ title, children, className = '' }) => (
  <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
    {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
    {children}
  </div>
)