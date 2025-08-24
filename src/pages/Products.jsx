// src/pages/Products.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Package,
  Filter,
  Download,
  Search,
  Building,
  Users,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  fetchProducts,
  fetchBranches,
  fetchProductSuppliers,
  setFilters,
} from "../store/slices/productsSlice";
import { triggerManualSync } from "../store/slices/statisticsSlice";
import Table from "../components/UI/Table";
import SearchInput from "../components/UI/SearchInput";
import Badge from "../components/UI/Badge";
import Pagination from "../components/UI/Pagination";
import Button from "../components/UI/Button";
import { formatCurrency, formatDate } from "../utils/helpers";
import toast from "react-hot-toast";

const Products = () => {
  const dispatch = useDispatch();
  const { products, branches, suppliers, pagination, filters, isLoading } =
    useSelector((state) => state.products);

  const { isSyncing } = useSelector((state) => state.statistics);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts(filters));
    dispatch(fetchBranches());
    dispatch(fetchProductSuppliers());
  }, [dispatch, filters]);

  const handleSearch = (searchTerm) => {
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
    dispatch(setFilters({ branch, page: 1 }));
  };

  const handleSupplierChange = (supplier) => {
    setSelectedSupplier(supplier);
    dispatch(setFilters({ supplier, page: 1 }));
  };

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  const handleSync = async () => {
    try {
      await dispatch(triggerManualSync()).unwrap();
      toast.success("Синхронизация запущена");

      // Обновляем данные через 3 секунды
      setTimeout(() => {
        dispatch(fetchProducts(filters));
      }, 3000);
    } catch (error) {
      toast.error("Ошибка синхронизации");
    }
  };

  const handleExport = () => {
    // Implement export functionality
    toast.info("Экспорт будет доступен в ближайшее время");
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { variant: "danger", text: "Нет в наличии" };
    if (quantity < 10) return { variant: "warning", text: "Мало" };
    if (quantity < 50) return { variant: "info", text: "Средний запас" };
    return { variant: "success", text: "Достаточно" };
  };

  const columns = [
    {
      header: "Товар",
      render: (product) => (
        <div>
          <p className="font-medium text-gray-900">{product.product}</p>
          <p className="text-sm text-gray-500">
            Код: {product.code} |{" "}
            {product.manufacturer || "Производитель не указан"}
          </p>
        </div>
      ),
    },
    {
      header: "Филиал",
      render: (product) => (
        <div className="flex items-center">
          <Building className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm">{product.branch}</span>
        </div>
      ),
    },
    {
      header: "Поставщик",
      render: (product) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm">{product.supplier || "Не указан"}</span>
        </div>
      ),
    },
    {
      header: "Остаток",
      render: (product) => {
        const status = getStockStatus(product.quantity);
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {product.quantity} {product.unit}
              </span>
              <Badge variant={status.variant} size="sm">
                {status.text}
              </Badge>
            </div>
            {product.bookedQuantity > 0 && (
              <p className="text-xs text-gray-500">
                Забронировано: {product.bookedQuantity}
              </p>
            )}
          </div>
        );
      },
    },
    {
      header: "Цены",
      render: (product) => (
        <div className="space-y-1">
          <p className="text-sm">
            <span className="text-gray-500">Закуп:</span>{" "}
            <span className="font-medium">
              {formatCurrency(product.buyPrice)}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-gray-500">Продажа:</span>{" "}
            <span className="font-medium text-green-600">
              {formatCurrency(product.salePrice)}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Наценка: {((product.markup || 0) * 100).toFixed(1)}%
          </p>
        </div>
      ),
    },
    {
      header: "Серия / Срок",
      render: (product) => (
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Серия: {product.series || "Не указана"}
          </p>
          <p className="text-sm">
            {product.shelfLife ? (
              <span
                className={
                  new Date(product.shelfLife) <
                  new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    ? "text-orange-600 font-medium"
                    : "text-gray-600"
                }
              >
                {formatDate(product.shelfLife)}
              </span>
            ) : (
              <span className="text-gray-400">Не указан</span>
            )}
          </p>
        </div>
      ),
    },
    {
      header: "Штрих-код",
      render: (product) => (
        <p className="text-sm font-mono text-gray-600">
          {product.barcode || "Не указан"}
        </p>
      ),
    },
  ];

  // Статистические карточки
  const statsCards = [
    {
      title: "Всего товаров",
      value: pagination.total,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "В наличии",
      value: products.filter((p) => p.quantity > 0).length,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Заканчивается",
      value: products.filter((p) => p.quantity > 0 && p.quantity < 10).length,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Нет в наличии",
      value: products.filter((p) => p.quantity === 0).length,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
          <p className="text-gray-600">Данные из системы Oson Kassa</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon={
              <RefreshCw
                className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
              />
            }
            onClick={handleSync}
            loading={isSyncing}
          >
            Синхронизировать
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

      {/* Statistics Cards */}
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
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showFilters ? "Скрыть" : "Показать"} фильтры
          </button>
        </div>

        <div className={`space-y-4 ${showFilters ? "block" : "hidden"}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchInput
              placeholder="Поиск товаров..."
              onSearch={handleSearch}
              className="md:col-span-1"
            />

            <select
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="input-field"
            >
              <option value="">Все филиалы</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>

            <select
              value={selectedSupplier}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="input-field"
            >
              <option value="">Все поставщики</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={products}
        loading={isLoading}
        emptyMessage="Товары не найдены"
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        className="mt-6"
      />
    </div>
  );
};

export default Products;
