import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Package, Filter, Download } from 'lucide-react'
import { fetchMedicines, fetchCategories, setFilters } from '../store/slices/medicinesSlice'
import Table from '../components/UI/Table'
import SearchInput from '../components/UI/SearchInput'
import Badge from '../components/UI/Badge'
import Pagination from '../components/UI/Pagination'
import { formatCurrency, formatDate } from '../utils/helpers'

const Medicines = () => {
  const dispatch = useDispatch()
  const { 
    medicines, 
    categories, 
    pagination, 
    filters, 
    isLoading 
  } = useSelector((state) => state.medicines)
  
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    dispatch(fetchMedicines(filters))
    dispatch(fetchCategories())
  }, [dispatch, filters])

  const handleSearch = (searchTerm) => {
    dispatch(setFilters({ search: searchTerm, page: 1 }))
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    dispatch(setFilters({ category, page: 1 }))
  }

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }))
  }

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { variant: 'danger', text: 'Tugagan' }
    if (quantity < 10) return { variant: 'warning', text: 'Kam' }
    if (quantity < 50) return { variant: 'info', text: 'O\'rtacha' }
    return { variant: 'success', text: 'Yetarli' }
  }

  const columns = [
    {
      header: 'Dori nomi',
      render: (medicine) => (
        <div>
          <p className="font-medium text-gray-900">{medicine.name}</p>
          <p className="text-sm text-gray-500">{medicine.manufacturer}</p>
        </div>
      )
    },
    {
      header: 'Kategoriya',
      accessor: 'category',
      render: (medicine) => medicine.category || 'Noma\'lum'
    },
    {
      header: 'Narx',
      render: (medicine) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(medicine.price)}
        </span>
      )
    },
    {
      header: 'Qoldiq',
      render: (medicine) => {
        const status = getStockStatus(medicine.quantity)
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">
              {medicine.quantity} {medicine.unit}
            </span>
            <Badge variant={status.variant} size="sm">
              {status.text}
            </Badge>
          </div>
        )
      }
    },
    {
      header: 'Amal qilish muddati',
      render: (medicine) => medicine.expiryDate 
        ? formatDate(medicine.expiryDate)
        : 'Ko\'rsatilmagan'
    },
    {
      header: 'Barcode',
      accessor: 'barcode',
      render: (medicine) => medicine.barcode || 'Yo\'q'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dorilar</h1>
          <p className="text-gray-600">ERP tizimidan sinxronlashtirilgan dorilar ro'yxati</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jami dorilar</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
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
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mavjud</p>
              <p className="text-2xl font-bold text-gray-900">
                {medicines.filter(m => m.quantity > 0).length}
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
            <div className="p-3 rounded-lg bg-yellow-50">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kam qolgan</p>
              <p className="text-2xl font-bold text-gray-900">
                {medicines.filter(m => m.quantity > 0 && m.quantity < 10).length}
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
            <div className="p-3 rounded-lg bg-red-50">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tugagan</p>
              <p className="text-2xl font-bold text-gray-900">
                {medicines.filter(m => m.quantity === 0).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput
          placeholder="Dorilarni qidirish..."
          onSearch={handleSearch}
          className="flex-1"
        />
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input-field min-w-[200px]"
          >
            <option value="">Barcha kategoriyalar</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={medicines}
        loading={isLoading}
        emptyMessage="Dorilar topilmadi"
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        className="mt-6"
      />
    </div>
  )
}

export default Medicines