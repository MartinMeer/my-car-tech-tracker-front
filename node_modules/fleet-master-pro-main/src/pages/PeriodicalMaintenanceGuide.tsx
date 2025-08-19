/**
 * Periodical Maintenance Guide management page
 */
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'
import { 
  ArrowLeft, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  RotateCcw,
  Car
} from 'lucide-react'
import { PMGService, MaintenanceRegulation } from '../services/PMGService'
import { DataService, Car as CarType } from '../services/DataService'

export default function PeriodicalMaintenanceGuide() {
  const { carId } = useParams()
  const [car, setCar] = useState<CarType | null>(null)
  const [regulations, setRegulations] = useState<MaintenanceRegulation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRegulation, setEditingRegulation] = useState<Partial<MaintenanceRegulation>>({})
  const [editingIndex, setEditingIndex] = useState<number>(-1)
  const [isCustomized, setIsCustomized] = useState(false)

  useEffect(() => {
    const loadCarAndRegulations = async () => {
      if (!carId) return;

      try {
        setIsLoading(true)
        
        // Load car data
        const carData = await DataService.getCarById(carId)
        if (!carData) {
          alert('Автомобиль не найден')
          return
        }
        setCar(carData)

        // Load regulations for this car
        const carRegulations = await PMGService.getCarMaintenanceRegulations(carId)
        setRegulations(carRegulations)

        // Check if regulations are customized
        const stored = localStorage.getItem(`car-maintenance-guide-${carId}`)
        setIsCustomized(!!stored)

      } catch (error) {
        console.error('Error loading car and regulations:', error)
        alert('Ошибка загрузки данных')
      } finally {
        setIsLoading(false)
      }
    }

    loadCarAndRegulations()
  }, [carId])

  const handleEditRegulation = (regulation: MaintenanceRegulation, index: number) => {
    setEditingRegulation(regulation)
    setEditingIndex(index)
    setIsEditDialogOpen(true)
  }

  const handleAddRegulation = () => {
    setEditingRegulation({
      operation: '',
      mileage: '',
      period: '',
      notes: ''
    })
    setEditingIndex(-1)
    setIsEditDialogOpen(true)
  }

  const handleSaveRegulation = async () => {
    if (!carId || !editingRegulation.operation || !editingRegulation.mileage || !editingRegulation.period) {
      alert('Заполните обязательные поля')
      return
    }

    const newRegulation: MaintenanceRegulation = {
      operation: editingRegulation.operation,
      mileage: editingRegulation.mileage,
      period: editingRegulation.period,
      notes: editingRegulation.notes || ''
    }

    let updatedRegulations: MaintenanceRegulation[]
    
    if (editingIndex >= 0) {
      // Update existing regulation
      updatedRegulations = [...regulations]
      updatedRegulations[editingIndex] = newRegulation
    } else {
      // Add new regulation
      updatedRegulations = [...regulations, newRegulation]
    }

    try {
      await PMGService.saveCarMaintenanceGuide(carId, updatedRegulations)
      setRegulations(updatedRegulations)
      setIsCustomized(true)
      setIsEditDialogOpen(false)
      setEditingRegulation({})
      setEditingIndex(-1)
    } catch (error) {
      console.error('Error saving regulation:', error)
      alert('Ошибка при сохранении')
    }
  }

  const handleDeleteRegulation = async (index: number) => {
    if (!carId) return

    if (confirm('Удалить эту операцию?')) {
      const updatedRegulations = regulations.filter((_, i) => i !== index)
      
      try {
        await PMGService.saveCarMaintenanceGuide(carId, updatedRegulations)
        setRegulations(updatedRegulations)
      } catch (error) {
        console.error('Error deleting regulation:', error)
        alert('Ошибка при удалении')
      }
    }
  }

  const handleResetToManufacturerDefault = async () => {
    if (!carId) return

    if (confirm('Сбросить к стандартным операциям производителя? Все изменения будут потеряны.')) {
      try {
        await PMGService.resetToManufacturerDefault(carId)
        const defaultRegulations = await PMGService.getCarMaintenanceRegulations(carId)
        setRegulations(defaultRegulations)
        setIsCustomized(false)
      } catch (error) {
        console.error('Error resetting to default:', error)
        alert('Ошибка при сбросе к стандартным настройкам')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Автомобиль не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Руководство по ТО</h1>
            <p className="text-gray-600">{car.name} ({car.brand} {car.model} {car.year})</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isCustomized && (
            <Button onClick={handleResetToManufacturerDefault} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Сбросить к стандартным
            </Button>
          )}
          <Button onClick={handleAddRegulation}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить операцию
          </Button>
        </div>
      </div>

      {/* Car Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5" />
            <span>Информация об автомобиле</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Производитель</p>
              <p className="font-medium">{car.brand}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Модель</p>
              <p className="font-medium">{car.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Год выпуска</p>
              <p className="font-medium">{car.year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Статус регламента</p>
              <Badge variant={isCustomized ? "default" : "secondary"}>
                {isCustomized ? "Настроен" : "Стандартный"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Операции обслуживания</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {regulations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Операции не найдены</p>
              <p className="text-sm">Добавьте операции обслуживания</p>
            </div>
          ) : (
            <div className="space-y-3">
              {regulations.map((regulation, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{regulation.operation}</h4>
                      <p className="text-sm text-gray-600 mb-2">{regulation.notes}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <p>Пробег: {regulation.mileage} км</p>
                        <p>Период: {regulation.period} мес</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditRegulation(regulation, index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteRegulation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIndex >= 0 ? 'Редактировать операцию' : 'Добавить операцию'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название операции</Label>
              <Input
                value={editingRegulation.operation || ''}
                onChange={(e) => setEditingRegulation(prev => ({ ...prev, operation: e.target.value }))}
                placeholder="Введите название операции..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Пробег (км)</Label>
                <Input
                  type="number"
                  value={editingRegulation.mileage || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, mileage: e.target.value }))}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label>Период (мес)</Label>
                <Input
                  type="number"
                  value={editingRegulation.period || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, period: e.target.value }))}
                  placeholder="6"
                />
              </div>
            </div>

            <div>
              <Label>Примечания</Label>
              <Textarea
                value={editingRegulation.notes || ''}
                onChange={(e) => setEditingRegulation(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Дополнительные примечания..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Отмена
              </Button>
              <Button onClick={handleSaveRegulation}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 