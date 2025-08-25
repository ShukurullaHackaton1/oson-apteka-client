import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Users,
  Pill,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Activity,
} from "lucide-react";
import {
  fetchDashboardStats,
  fetchTopDoctors,
  fetchRecentSales,
} from "../store/slices/dashboardSlice";
import { formatCurrency, formatDateTime } from "../utils/helpers";
import { useSocket } from "../hooks/useSocket";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, topDoctors, recentSales, isLoading } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchTopDoctors("month"));
    dispatch(fetchRecentSales(5));
  }, [dispatch]);

  // Real-time updates
  useSocket("new_sale", () => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentSales(5));
  });

  const statsCards = [
    {
      title: "Продажи за сегодня",
      value: stats.today.totalSales,
      amount: formatCurrency(stats.today.totalAmount),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Активные врачи",
      value: stats.totals.doctors,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Количество лекарств",
      value: stats.totals.medicines,
      icon: Pill,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Товары заканчиваются",
      value: stats.totals.lowStock,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  // Sample chart data (здесь должны быть реальные данные)
  const chartData = [
    { name: "Пн", продажи: 4000 },
    { name: "Вт", продажи: 3000 },
    { name: "Ср", продажи: 2000 },
    { name: "Чт", продажи: 2780 },
    { name: "Пт", продажи: 1890 },
    { name: "Сб", продажи: 2390 },
    { name: "Вс", продажи: 3490 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Панель управления
          </h1>
          <p className="text-gray-600">Общие показатели и статистика</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString("ru-RU")}</span>
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
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                {card.amount && (
                  <p className="text-sm text-gray-500">{card.amount}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Недельные продажи
            </h3>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5%</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Продажи"]}
              />
              <Line
                type="monotone"
                dataKey="продажи"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Doctors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Топ врачи (за месяц)
          </h3>

          <div className="space-y-4">
            {topDoctors.slice(0, 5).map((doctor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {doctor.doctorName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doctor.doctorName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doctor.specialization}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {doctor.totalSales}
                  </p>
                  <p className="text-xs text-gray-500">продаж</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Sales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Последние продажи
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-600">
                  Врач
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">
                  Количество лекарств
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">
                  Сумма
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">
                  Время
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentSales.map((sale, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {sale.doctor?.firstName?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        Др. {sale.doctor?.firstName} {sale.doctor?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {sale.medicines?.length} шт
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td className="py-4 text-sm text-gray-500">
                    {formatDateTime(sale.saleDate)}
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

export default Dashboard;
