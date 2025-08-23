import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, RefreshCw, Eye, EyeOff, Copy } from 'lucide-react'
import { 
  fetchDoctors, 
  addDoctor, 
  updateDoctor, 
  deleteDoctor, 
  resetPassword,
  clearNewPassword 
} from '../store/slices/doctorsSlice'
import Button from '../components/UI/Button'
import Modal from '../components/UI/Modal'
import Table from '../components/UI/Table'
import SearchInput from '../components/UI/SearchInput'
import Badge from '../components/UI/Badge'
import { formatDateTime, copyToClipboard } from '../utils/helpers'
import toast from 'react-hot-toast'

const Doctors = () => {
  const dispatch = useDispatch()
  const { doctors, isLoading, newPassword } = useSelector((state) => state.doctors)
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    phone: ''
  })

  useEffect(() => {
    dispatch(fetchDoctors())
  }, [dispatch])

  useEffect(() => {
    setFilteredDoctors(doctors)
  }, [doctors])

  useEffect(() => {
    if (newPassword) {
      setShowPassword(true)
    }
  }, [newPassword])

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredDoctors(doctors)
    } else {
      const filtered = doctors.filter(doctor =>
        doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredDoctors(filtered)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingDoctor) {
        await dispatch(updateDoctor({ 
          id: editingDoctor._id, 
          data: formData 
        })).unwrap()
        toast.success('Shifokor ma\'lumotlari yangilandi')
      } else {
        await dispatch(addDoctor(formData)).unwrap()
        toast.success('Yangi shifokor qo\'shildi')
      }
      
      handleCloseModal()
    } catch (error) {
      toast.error(error)
    }
  }

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization || '',
      phone: doctor.phone || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Shifokorni o\'chirishni xohlaysizmi?')) {
      try {
        await dispatch(deleteDoctor(id)).unwrap()
        toast.success('Shifokor o\'chirildi')
      } catch (error) {
        toast.error(error)
      }
    }
  }

  const handleResetPassword = async (id) => {
    try {
      await dispatch(resetPassword(id)).unwrap()
      toast.success('Parol tiklandi')
    } catch (error) {
      toast.error(error)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingDoctor(null)
    setFormData({
      firstName: '',
      lastName: '',
      specialization: '',
      phone: ''
    })
    dispatch(clearNewPassword())
    setShowPassword(false)
  }

  const handleCopyPassword = async () => {
    if (newPassword) {
      const success = await copyToClipboard(newPassword)
      if (success) {
        toast.success('Parol nusxalandi')
      } else {
        toast.error('Nusxalashda xatolik')
      }
    }
  }

  const columns = [
    {
      header: 'Shifokor',
      render: (doctor) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {doctor.firstName} {doctor.lastName}
            </p>
            <p className="text-sm text-gray-500">{doctor.username}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Mutaxassislik',
      accessor: 'specialization',
      render: (doctor) => doctor.specialization || 'Ko\'rsatilmagan'
    },
    {
      header: 'Telefon',
      accessor: 'phone',
      render: (doctor) => doctor.phone || 'Ko\'rsatilmagan'
    },
    {
      header: 'Holat',
      render: (doctor) => (
        <Badge variant={doctor.isActive ? 'success' : 'danger'}>
          {doctor.isActive ? 'Faol' : 'Nofaol'}
        </Badge>
      )
    },
    {
      header: 'Oxirgi kirish',
      render: (doctor) => doctor.lastLogin 
        ? formatDateTime(doctor.lastLogin)
        : 'Hech qachon'
    },
    {
      header: 'Amallar',
      render: (doctor) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(doctor)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Tahrirlash"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleResetPassword(doctor._id)}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
            title="Parolni tiklash"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(doctor._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="O'chirish"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shifokorlar</h1>
          <p className="text-gray-600">Shifokorlarni boshqarish va monitoring</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Yangi shifokor
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <SearchInput
          placeholder="Shifokorlarni qidirish..."
          onSearch={handleSearch}
          className="flex-1 max-w-md"
        />
        <div className="text-sm text-gray-500">
          Jami: {filteredDoctors.length} ta shifokor
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredDoctors}
        loading={isLoading}
        emptyMessage="Shifokorlar topilmadi"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDoctor ? 'Shifokorni tahrirlash' : 'Yangi shifokor qo\'shish'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ism *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Familiya *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mutaxassislik
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              className="input-field"
              placeholder="Masalan: Kardiolog"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="input-field"
              placeholder="+998 90 123 45 67"
            />
          </div>

          {/* Generated Password Display */}
          {newPassword && showPassword && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-yellow-800">
                  {editingDoctor ? 'Yangi parol:' : 'Generatsiya qilingan parol:'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  title="Nusxalash"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                ⚠️ Bu parolni xavfsiz joyda saqlang. Qayta ko'rsatilmaydi!
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Bekor qilish
            </Button>
            <Button type="submit" loading={isLoading}>
              {editingDoctor ? 'Yangilash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Doctors