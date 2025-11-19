import { Fragment } from 'react'

export const Breadcrumb = ({ items }) => (
  <nav className="flex" aria-label="Breadcrumb">
    <ol className="flex items-center space-x-4">
      {items.map((item, index) => (
        <li key={item.name}>
          <div className="flex items-center">
            {index > 0 && (
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <a
              href={item.href}
              className={`text-sm font-medium ${
                index === items.length - 1
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.name}
            </a>
          </div>
        </li>
      ))}
    </ol>
  </nav>
)