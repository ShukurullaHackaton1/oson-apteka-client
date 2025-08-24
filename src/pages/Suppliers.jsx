// src/pages/Suppliers.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Eye,
  EyeOff,
  Copy,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import {
  fetchSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  resetSupplierPassword,
} from "../store/slices/suppliersSlice";
import Button from "../components/UI/Button";
import Modal from "../components/UI/Modal";
import Table from "../components/UI/Table";
import SearchInput from "../components/UI/SearchInput";
import Badge from "../components/UI/Badge";
import {
  formatDateTime,
  copyToClipboard,
  formatCurrency,
} from "../utils/helpers";
import toast from "react-hot-toast";

const Suppliers = () => {
  const dispatch = useDispatch();
  const { suppliers, isLoading, newPassword } = useSelector(
    (state) => state.suppliers
  );
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  useEffect(() => {
    setFilteredSuppliers(suppliers);
  }, [suppliers]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSupplier) {
        await dispatch(
          updateSupplier({
            id: editingSupplier._id,
            data: formData,
          })
        ).unwrap();
        toast.success("Поставщик обновлен");
      } else {
        await dispatch(addSupplier(formData)).unwrap();
        toast.success("Поставщик добавлен");
      }

      handleCloseModal();
    } catch (error) {
      toast.error(error);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      username: supplier.username,
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Удалить поставщика?")) {
      try {
        await dispatch(deleteSupplier(id)).unwrap();
        toast.success("Поставщик удален");
      } catch (error) {
        toast.error(error);
      }
    }
  };

  const handleResetPassword = async (id) => {
    try {
      await dispatch(resetSupplierPassword(id)).unwrap();
      setShowPassword(true);
      toast.success("Пароль сброшен");
    } catch (error) {
      toast.error(error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setFormData({
      name: "",
      username: "",
      password: "",
    });
    setShowPassword(false);
  };

  const handleCopyPassword = async () => {
    if (newPassword) {
      const success = await copyToClipboard(newPassword);
      if (success) {
        toast.success("Пароль скопирован");
      }
    }
  };

  const columns = [
    {
      header: "Поставщик",
      render: (supplier) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{supplier.name}</p>
            <p className="text-sm text-gray-500">@{supplier.username}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Статистика",
      render: (supplier) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Package className="w-4 h-4 mr-1 text-gray-400" />
            <span>{supplier.statistics?.totalProducts || 0} товаров</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-1 text-gray-400" />
            <span>{supplier.statistics?.totalBranches || 0} филиалов</span>
          </div>
        </div>
      ),
    },
    {
      header: "Статус",
      render: (supplier) => (
        <Badge variant={supplier.isActive ? "success" : "danger"}>
          {supplier.isActive ? "Активен" : "Неактивен"}
        </Badge>
      ),
    },
    {
      header: "Последний вход",
      render: (supplier) =>
        supplier.lastLogin ? formatDateTime(supplier.lastLogin) : "Никогда",
    },
    {
      header: "Последняя синхронизация",
      render: (supplier) =>
        supplier.statistics?.lastSync
          ? formatDateTime(supplier.statistics.lastSync)
          : "Не синхронизирован",
    },
    {
      header: "Действия",
      render: (supplier) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(supplier)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Редактировать"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleResetPassword(supplier._id)}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
            title="Сбросить пароль"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(supplier._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Удалить"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Статистические карточки
  const statsCards = [
    {
      title: "Всего поставщиков",
      value: suppliers.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Активные",
      value: suppliers.filter((s) => s.isActive).length,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Всего товаров",
      value: suppliers.reduce(
        (acc, s) => acc + (s.statistics?.totalProducts || 0),
        0
      ),
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Филиалов",
      value: Math.max(
        ...suppliers.map((s) => s.statistics?.totalBranches || 0)
      ),
      icon: DollarSign,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Поставщики</h1>
          <p className="text-gray-600">Управление поставщиками и их товарами</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Добавить поставщика
        </Button>
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

      {/* Search */}
      <div className="flex items-center space-x-4">
        <SearchInput
          placeholder="Поиск поставщиков..."
          onSearch={handleSearch}
          className="flex-1 max-w-md"
        />
        <div className="text-sm text-gray-500">
          Найдено: {filteredSuppliers.length}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredSuppliers}
        loading={isLoading}
        emptyMessage="Поставщики не найдены"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingSupplier ? "Редактировать поставщика" : "Добавить поставщика"
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название компании *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Логин *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="input-field"
              required
              disabled={editingSupplier}
            />
          </div>

          {!editingSupplier && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-field"
                required
              />
            </div>
          )}

          {/* Generated Password Display */}
          {newPassword && showPassword && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-yellow-800">Новый пароль:</h4>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                  {newPassword}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded"
                  title="Копировать"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                ⚠️ Сохраните этот пароль в безопасном месте!
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Отмена
            </Button>
            <Button type="submit" loading={isLoading}>
              {editingSupplier ? "Обновить" : "Добавить"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
