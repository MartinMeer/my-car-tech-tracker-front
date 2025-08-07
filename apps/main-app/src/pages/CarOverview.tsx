/**
 * Car detail overview page showing individual vehicle information, status, and maintenance data
 */
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { DateInput } from '../components/ui/date-input'
import { DataService, Car } from '../services/DataService'
import { PMGService, MaintenanceOperation } from '../services/PMGService'
import { 
  ArrowLeft, 
  Edit3, 
  Calendar, 
  AlertTriangle, 
  Wrench, 
  FileText,
  Plus,
  Settings,
  Fuel,
  Gauge,
  Edit
} from 'lucide-react'
import { dateUtils } from '../lib/utils'

export default function CarOverview() {
  const { id } = useParams()
  const [car, setCar] = useState<Car | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdateMileageOpen, setIsUpdateMileageOpen] = useState(false)
  const [newMileage, setNewMileage] = useState('')
  const [mileageDate, setMileageDate] = useState(dateUtils.getCurrentRussianDate())
  const [mileageNotes, setMileageNotes] = useState('')
  const [refreshStatus, setRefreshStatus] = useState(0)
  const [pmgOperations, setPmgOperations] = useState<any[]>([])
  const [isPmgOpen, setIsPmgOpen] = useState(false)

  // Function to get dynamic car status based on maintenance and alerts
  const getCarStatus = (carId: string | number) => {
    const maintenanceList = JSON.parse(localStorage.getItem('in-maintenance') || '[]')
    const isInMaintenance = maintenanceList.some((entry: any) => entry.carId === carId.toString())
    
    if (isInMaintenance) {
      return 'maintenance'
    }

    const savedAlerts = JSON.parse(localStorage.getItem('fleet-alerts') || '[]')
    const carAlerts = savedAlerts.filter((alert: any) => 
      alert.carId === carId.toString() && alert.status === 'active'
    )
    
    const hasCriticalAlerts = carAlerts.some((alert: any) => alert.priority === 'critical')
    if (hasCriticalAlerts) {
      return 'problem'
    }

    return 'active'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-orange-100 text-orange-800'
      case 'problem': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Готов к работе'
      case 'maintenance': return 'На обслуживании'
      case 'problem': return 'Требует внимания'
      case 'scheduled': return 'Запланировано ТО'
      case 'inactive': return 'Неактивен'
      default: return 'Неизвестно'
    }
  }

  // Load car data
  const loadCarData = async () => {
    if (!id) {
      setError('Car ID not provided')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const carData = await DataService.getCarById(id)
      
      if (!carData) {
        setError('Car not found')
        setCar(null)
      } else {
        setCar(carData)
      }
    } catch (error) {
      console.error('Error loading car data:', error)
      setError('Error loading car data')
      setCar(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCarData()
  }, [id])

  useEffect(() => {
    // Listen for maintenance status changes
    const handleMaintenanceChange = () => {
      setRefreshStatus(prev => prev + 1)
    }

    window.addEventListener('maintenanceStatusChanged', handleMaintenanceChange)
    
    return () => {
      window.removeEventListener('maintenanceStatusChanged', handleMaintenanceChange)
    }
  }, [])

  // Load PMG operations for this car
  useEffect(() => {
    if (car) {
      const loadPmgOperations = async () => {
        try {
          const operations = await PMGService.calculateMaintenanceDue(car.id)
          setPmgOperations(operations)
        } catch (error) {
          console.error('Error loading PMG operations:', error)
        }
      }
      loadPmgOperations()
    }
  }, [car])

  // Car data is now loaded via DataService

  const notifications = [
    {
      id: 1,
      type: 'maintenance',
      message: 'Плановое ТО через 2000 км',
      priority: 'medium',
      date: '2024-08-01'
    },
    {
      id: 2,
      type: 'problem',
      message: 'Требуется замена тормозных колодок',
      priority: 'high',
      date: '2024-07-28'
    },
    {
      id: 3,
      type: 'service',
      message: 'Замена масла выполнена',
      priority: 'low',
      date: '2024-07-15'
    }
  ]

  const maintenanceSchedule = [
    {
      id: 1,
      type: 'Замена масла',
      interval: '10000 км',
      lastDone: '75000 км',
      nextDue: '85000 км',
      status: 'due'
    },
    {
      id: 2,
      type: 'Замена тормозных колодок',
      interval: '30000 км',
      lastDone: '60000 км',
      nextDue: '90000 км',
      status: 'upcoming'
    },
    {
      id: 3,
      type: 'Замена ремня ГРМ',
      interval: '100000 км',
      lastDone: '0 км',
      nextDue: '100000 км',
      status: 'future'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'due': return 'bg-red-100 text-red-800'
      case 'upcoming': return 'bg-yellow-100 text-yellow-800'
      case 'future': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUpdateMileage = async () => {
    if (!car || !newMileage) return

    try {
      await DataService.updateCar(car.id, {
        mileage: parseInt(newMileage)
      })
      
      // Reload car data to get updated mileage
      await loadCarData()
      
      setIsUpdateMileageOpen(false)
      setNewMileage('')
      setMileageDate('')
      setMileageNotes('')
    } catch (error) {
      console.error('Error updating mileage:', error)
      alert('Ошибка при обновлении пробега')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка автомобиля...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка</h2>
          <p className="text-gray-600 mb-4">{error || 'Автомобиль не найден'}</p>
          <Link to="/">
            <Button>
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{car.name}</h1>
                <p className="text-sm text-gray-600">{car.brand} {car.model} ({car.year})</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link to={`/edit-car/${car.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
              </Link>
              <Link to={`/periodical-maintenance-guide/${car.id}`}>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Руководство по ТО
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setIsPmgOpen(true)}>
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Car Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <img 
                src={car.image || '/img/car-by-deault.png'} 
                alt={`${car.brand} ${car.model}`}
                className="w-full sm:w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold">{car.brand} {car.model}</h2>
                  <Badge className={getStatusColor(getCarStatus(car.id))}>
                    {getStatusText(getCarStatus(car.id))}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">VIN:</p>
                    <p className="font-medium">{car.vin || 'Не указан'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Гос. номер:</p>
                    <p className="font-medium">{car.plateNumber || 'Не указан'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Год выпуска:</p>
                    <p className="font-medium">{car.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Пробег:</p>
                    <p className="font-medium">{car.mileage.toLocaleString()} км</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Gauge className="h-5 w-5 mr-2" />
              Техническое состояние
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Пробег:</p>
                <p className="text-2xl font-bold">{car.mileage.toLocaleString()} км</p>
              </div>
              <Dialog open={isUpdateMileageOpen} onOpenChange={setIsUpdateMileageOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Обновить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Обновить пробег</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newMileage">Новый пробег (км)</Label>
                      <Input
                        id="newMileage"
                        type="number"
                        placeholder="85000"
                        value={newMileage}
                        onChange={(e) => setNewMileage(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mileageDate">Дата обновления</Label>
                      <DateInput
                        id="mileageDate"
                        value={mileageDate}
                        onChange={(value) => setMileageDate(value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mileageNotes">Примечания (необязательно)</Label>
                      <Textarea
                        id="mileageNotes"
                        placeholder="Дополнительная информация..."
                        value={mileageNotes}
                        onChange={(e) => setMileageNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsUpdateMileageOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleUpdateMileage}>
                        Сохранить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Уведомления
              </CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {notification.type === 'maintenance' && <Calendar className="h-4 w-4 text-blue-600" />}
                    {notification.type === 'problem' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {notification.type === 'service' && <Wrench className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{notification.date}</p>
                                              <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority === 'high' ? 'Высокий' :
                         notification.priority === 'medium' ? 'Средний' : 'Низкий'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Периодическое обслуживание
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceSchedule.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{item.type}</h4>
                                            <Badge className={getMaintenanceStatusColor(item.status)}>
                      {item.status === 'due' ? 'Срочно' :
                       item.status === 'upcoming' ? 'Скоро' : 'Будущее'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>Интервал: {item.interval}</p>
                    <p>Последний раз: {item.lastDone}</p>
                    <p>Следующий раз: {item.nextDue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add PMG button to header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{car?.name}</h1>
            <p className="text-gray-600">{car?.brand} {car?.model} {car?.year}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsPmgOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Руководство по ТО
          </Button>
          <Link to={`/maintenance-planning?carId=${car?.id}`}>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Планирование ТО
            </Button>
          </Link>
        </div>
      </div>

      {/* PMG Dialog */}
      <Dialog open={isPmgOpen} onOpenChange={setIsPmgOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Руководство по ТО - {car?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Текущий пробег: {car?.mileage.toLocaleString()} км
              </p>
              <Link to={`/periodical-maintenance-guide/${car?.id}`}>
                <Button size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Настроить регламент
                </Button>
              </Link>
            </div>
            
            {pmgOperations.map((operation, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{operation.operation}</h4>
                  <Badge className={getPriorityColor(operation.priority)}>
                    {operation.priority === 'high' ? 'Срочно' :
                     operation.priority === 'medium' ? 'Скоро' : 'Плановое'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{operation.notes}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Интервал:</p>
                    <p>{operation.mileage.toLocaleString()} км / {operation.period} мес</p>
                  </div>
                  <div>
                    <p className="font-medium">До следующего ТО:</p>
                    <p>{operation.mileageUntilNext.toLocaleString()} км / {operation.monthsUntilNext} мес</p>
                  </div>
                </div>
                {operation.isDue && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700 font-medium">⚠️ Требует срочного обслуживания!</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}