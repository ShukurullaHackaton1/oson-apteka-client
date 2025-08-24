// src/components/Layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Settings,
  X,
  Activity,
  TrendingUp,
  Database,
  UserCheck,
  BarChart3,
  FileText,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = [
    { name: "Панель управления", href: "/", icon: Home },
    { name: "Статистика", href: "/statistics", icon: BarChart3 },
    { name: "Доктора", href: "/doctors", icon: UserCheck },
    { name: "Поставщики", href: "/suppliers", icon: Package },
    { name: "Товары", href: "/products", icon: Database },
    { name: "Продажи", href: "/sales", icon: ShoppingCart },
    { name: "Отчеты", href: "/reports", icon: FileText },
    { name: "Аналитика", href: "/analytics", icon: TrendingUp },
    { name: "Настройки", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl lg:static lg:translate-x-0 lg:shadow-none"
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">ФармаСистема</h1>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 p-3 bg-gray-700 bg-opacity-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-xs text-gray-400">Статус системы</p>
              <p className="text-sm text-white font-medium">Активна</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
