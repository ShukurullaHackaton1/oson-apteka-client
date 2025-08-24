// src/pages/Statistics.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Activity,
  ShoppingCart,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { fetchStatistics } from "../store/slices/statisticsSlice";
import { formatCurrency, formatDate } from "../utils/helpers";
import Button from "../components/UI/Button";
import Badge from "../components/UI/Badge";

const Statistics = () => {
  const dispatch = useDispatch();
  const { data, isLoading } = useSelector((state) => state.statistics);
  const [dateRange, setDateRange] = useState("month");
  const [selectedBranch, setSelectedBranch] = useState("all");

  useEffect(() => {
    dispatch(fetchStatistics({ dateRange, branch: selectedBranch }));
  }, [dispatch, dateRange, selectedBranch]);

  const handleRefresh = () => {
    dispatch(fetchStatistics({ dateRange, branch: selectedBranch }));
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting data...");
  };

  // Цвета для графиков
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];

  // Данные для графиков
  const salesData = data?.salesByDay || [];
  const categoryData = data?.salesByCategory || [];
  const branchData = data?.salesByBranch || [];
  const topProducts = data?.topProducts || [];
  const supplierStats = data?.supplierStats || [];

  // Статистические карточки
  const statsCards = [
    {
      title: "Общая выручка",
      value: formatCurrency(data?.totalRevenue || 0),
      change: data?.revenueChange || 0,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Всего продаж",
      value: data?.totalSales || 0,
      change: data?.salesChange || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Товаров в наличии",
      value: data?.totalProducts || 0,
      change: data?.productsChange || 0,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Активных докторов",
      value: data?.activeDoctors || 0,
      change: data?.doctorsChange || 0,
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Статистика</h1>
          <p className="text-gray-600">Аналитика и отчеты системы</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="today">Сегодня</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
          <Button
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Обновить
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Экспорт
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
                <div className="flex items-center mt-2">
                  {card.change > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      card.change > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Math.abs(card.change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    vs прошлый период
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Динамика продаж
            </h3>
            <Badge variant="info">
              <Activity className="w-3 h-3 mr-1" />
              Обновлено
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Распределение по категориям
            </h3>
            <Badge variant="success">
              <PieChart className="w-3 h-3 mr-1" />
              По категориям
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </RePieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Показатели филиалов
            </h3>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">Все филиалы</option>
              {data?.branches?.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" name="Выручка" />
              <Bar dataKey="sales" fill="#10B981" name="Продажи" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Топ товары
          </h3>
          <div className="space-y-4">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.supplier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {product.sales}
                  </p>
                  <p className="text-xs text-gray-500">продаж</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Supplier Statistics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Статистика поставщиков
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-600">
                  Поставщик
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">
                  Товаров
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">
                  Продано
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">
                  Выручка
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">
                  Тренд
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {supplierStats.map((supplier, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {supplier.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {supplier.products}
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {supplier.sold}
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(supplier.revenue)}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center">
                      {supplier.trend > 0 ? (
                        <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          supplier.trend > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Math.abs(supplier.trend)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Statistics;
