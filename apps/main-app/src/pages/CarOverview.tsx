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
  Gauge
} from 'lucide-react'

export default function CarOverview() {
  const { id } = useParams()
  const [isUpdateMileageOpen, setIsUpdateMileageOpen] = useState(false)
  const [newMileage, setNewMileage] = useState('')
  const [mileageDate, setMileageDate] = useState('')
  const [mileageNotes, setMileageNotes] = useState('')
  const [refreshStatus, setRefreshStatus] = useState(0)

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

  // Mock car data - in real app would fetch by ID
  const car = {
    id: 1,
    name: 'Транспорт #1',
    brand: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: 'JT2BF28KXX0123456',
    plateNumber: 'А123БВ199',
    mileage: 85000,
    status: 'active',
    lastService: '2024-07-15',
    nextService: '2024-09-15',
    image: 'https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/689049900cd2d7c5a2675d8b/resource/605396a2-d548-466e-a026-ab96d605a221.jpg',
    purchasePrice: 1500000,
    purchaseDate: '2020-03-15'
  }

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

  const handleUpdateMileage = () => {
    // In real app, would update mileage via API
    console.log('Updating mileage:', { newMileage, mileageDate, mileageNotes })
    setIsUpdateMileageOpen(false)
    setNewMileage('')
    setMileageDate('')
    setMileageNotes('')
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
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
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
                src={car.image} 
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
                    <p className="font-medium">{car.vin}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Гос. номер:</p>
                    <p className="font-medium">{car.plateNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Год выпуска:</p>
                    <p className="font-medium">{car.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Цена покупки:</p>
                    <p className="font-medium">{car.purchasePrice.toLocaleString()} ₽</p>
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
                      <Input
                        id="mileageDate"
                        type="date"
                        value={mileageDate}
                        onChange={(e) => setMileageDate(e.target.value)}
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
    </div>
  )
}