import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { fetchSales, setFilters } from "../store/slices/salesSlice";
import { fetchDoctors } from "../store/slices/doctorsSlice";
import Table from "../components/UI/Table";
import SearchInput from "../components/UI/SearchInput";
import Pagination from "../components/UI/Pagination";
import Button from "../components/UI/Button";
import Badge from "../components/UI/Badge";
import { formatCurrency, formatDateTime, formatDate } from "../utils/helpers";

const Sales = () => {
  const dispatch = useDispatch();
  const { sales, pagination, filters, isLoading } = useSelector(
    (state) => state.sales
  );
  const { doctors } = useSelector((state) => state.doctors);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    dispatch(fetchSales(filters));
    dispatch(fetchDoctors());
  }, [dispatch, filters]);

  const handleSearch = (searchTerm) => {
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  const handleDoctorFilter = (doctorId) => {
    setSelectedDoctor(doctorId);
    dispatch(setFilters({ doctorId, page: 1 }));
  };

  const handleDateFilter = () => {
    dispatch(
      setFilters({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: 1,
      })
    );
  };

  const clearFilters = () => {
    setSelectedDoctor("");
    setDateRange({ startDate: "", endDate: "" });
    dispatch(
      setFilters({
        search: "",
        doctorId: "",
        startDate: "",
        endDate: "",
        page: 1,
      })
    );
  };

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Экспорт продаж...");
  };

  const columns = [
    {
      header: "Дата",
      render: (sale) => (
        <div>
          <p className="font-medium text-gray-900">
            {formatDate(sale.saleDate)}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(sale.saleDate).toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ),
    },
    {
      header: "Врач",
      render: (sale) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              Др. {sale.doctor?.firstName} {sale.doctor?.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {sale.doctor?.specialization || "Не указано"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Лекарства",
      render: (sale) => (
        <div>
          <p className="font-medium text-gray-900">
            {sale.medicines?.length} позиций
          </p>
          <div className="text-sm text-gray-500 space-y-1 max-h-20 overflow-y-auto">
            {sale.medicines?.slice(0, 3).map((item, index) => (
              <p key={index}>
                {item.medicine?.name} × {item.quantity}
              </p>
            ))}
            {sale.medicines?.length > 3 && (
              <p className="text-xs text-blue-600">
                +{sale.medicines.length - 3} еще...
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Сумма",
      render: (sale) => (
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(sale.totalAmount)}
          </p>
          <p className="text-sm text-gray-500">
            Средний чек:{" "}
            {formatCurrency(sale.totalAmount / (sale.medicines?.length || 1))}
          </p>
        </div>
      ),
    },
    {
      header: "Статус",
      render: (sale) => (
        <Badge variant="success" size="sm">
          Завершено
        </Badge>
      ),
    },
    {
      header: "Действия",
      render: (sale) => (
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          title="Подробнее"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  // Статистика
  const totalAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const avgAmount = sales.length > 0 ? totalAmount / sales.length : 0;
  const todaySales = sales.filter(
    (sale) =>
      new Date(sale.saleDate).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Продажи</h1>
          <p className="text-gray-600">Управление и мониторинг продаж</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Экспорт
          </Button>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => console.log("Добавить продажу")}
          >
            Новая продажа
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего продаж</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagination.total}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Общая сумма</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Сегодня</p>
              <p className="text-2xl font-bold text-gray-900">
                {todaySales.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-50">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Средний чек</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(avgAmount)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Filter className="w-4 h-4 mr-1" />
            {showFilters ? "Скрыть" : "Показать"} фильтры
          </button>
        </div>

        {showFilters && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SearchInput
                placeholder="Поиск продаж..."
                onSearch={handleSearch}
              />

              <select
                value={selectedDoctor}
                onChange={(e) => handleDoctorFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Все врачи</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="input-field"
                placeholder="Дата от"
              />

              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="input-field"
                placeholder="Дата до"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={handleDateFilter} size="sm">
                Применить
              </Button>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Сбросить
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={sales}
        loading={isLoading}
        emptyMessage="Продажи не найдены"
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Sales;
