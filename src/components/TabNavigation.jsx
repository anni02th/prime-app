import { Link, useLocation } from "react-router-dom"

const TabNavigation = ({ tabs }) => {
  const location = useLocation()

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="flex max-md:overflow-x-scroll ">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center px-6 py-4 text-sm font-medium ${
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              }`}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default TabNavigation
