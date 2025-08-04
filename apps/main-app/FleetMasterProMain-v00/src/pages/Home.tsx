/**
 * Main dashboard page displaying fleet overview, recent activities and quick actions
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
// NavigationService and APP_CONFIG imports removed - using direct URLs for debugging
import { 
  Car, 
  Plus, 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Settings,
  User,
  LogOut,
  FileText
} from 'lucide-react'

export default function Home() {
  const [selectedTab, setSelectedTab] = useState('fleet')
  const [activeAlertsCount, setActiveAlertsCount] = useState(0)
  const [inMaintenanceCount, setInMaintenanceCount] = useState(0)

  // Load counts from localStorage and listen for changes
  const loadCounts = () => {
    const savedAlerts = JSON.parse(localStorage.getItem('fleet-alerts') || '[]')
    const activeAlerts = savedAlerts.filter((alert: any) => alert.status === 'active')
    setActiveAlertsCount(activeAlerts.length)

    const maintenanceList = JSON.parse(localStorage.getItem('in-maintenance') || '[]')
    setInMaintenanceCount(maintenanceList.length)
  }

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

  useEffect(() => {
    loadCounts()

    // Listen for maintenance status changes
    const handleMaintenanceChange = () => {
      loadCounts()
    }

    window.addEventListener('maintenanceStatusChanged', handleMaintenanceChange)
    
    return () => {
      window.removeEventListener('maintenanceStatusChanged', handleMaintenanceChange)
    }
  }, [])

  // Mock data for demonstration
  const cars = [
    {
      id: 1,
      name: 'Транспорт #1',
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      mileage: 85000,
      status: 'active',
      lastService: '2024-07-15',
      nextService: '2024-09-15',
      image: 'https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/689049900cd2d7c5a2675d8b/resource/2c6f2845-9f8d-4c49-b85a-014eadfa4238.jpg'
    },
    {
      id: 2,
      name: 'Грузовик #2',
      brand: 'Mercedes',
      model: 'Sprinter',
      year: 2019,
      mileage: 120000,
      status: 'maintenance',
      lastService: '2024-06-20',
      nextService: '2024-08-20',
      image: 'https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/689049900cd2d7c5a2675d8b/resource/fa1dad86-c2d8-43aa-aee5-1a3e010f4480.jpg'
    }
  ]

  const recentActivities = [
    { type: 'service', message: 'Замена масла - Toyota Camry', date: '2024-07-15', priority: 'low' },
    { type: 'problem', message: 'Проблема с тормозами - Mercedes Sprinter', date: '2024-07-12', priority: 'high' },
    { type: 'maintenance', message: 'Плановое ТО - Toyota Camry', date: '2024-07-10', priority: 'medium' }
  ]

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAccountClick = () => {
    // Navigate directly to account page  
    window.location.href = 'http://localhost:3000/#/account'
  }

  const handleLogoutClick = () => {
    console.log('Logout clicked - clearing auth data...')
    
    // Clear all authentication data (same keys as marketing site AuthService)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data') 
    localStorage.removeItem('refresh_token')
    
    console.log('Auth data cleared, navigating to marketing site...')
    
    // Simple direct navigation to test
    window.location.href = 'http://localhost:3000/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">FleetMasterPro</h1>
              <p className="text-sm text-gray-600">Управление автопарком</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleAccountClick}>
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogoutClick}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-20">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{cars.length - inMaintenanceCount}</p>
                  <p className="text-sm text-gray-600">Автомобили готовые к работе</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Link to="/in-maintenance">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{inMaintenanceCount}</p>
                    <p className="text-sm text-gray-600">Автомобили на сервисе</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/alerts">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-gray-600">Проблемы</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/maintenance-planning">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-gray-600">Планов ТО</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

      

        {/* Fleet Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Мой автопарк</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cars.map((car) => (
                <Link key={car.id} to={`/car/${car.id}`}>
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={car.image} 
                        alt={`${car.brand} ${car.model}`}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{car.name}</h3>
                          <Badge className={getStatusColor(getCarStatus(car.id))}>
                            {getStatusText(getCarStatus(car.id))}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{car.brand} {car.model} ({car.year})</p>
                        <p className="text-xs text-gray-500">Пробег: {car.mileage.toLocaleString()} км</p>
                        <p className="text-xs text-gray-500">Следующее ТО: {car.nextService}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Link to="/add-car">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить авто
                </Button>
              </Link>
              <Link to="/add-service-record">
                <Button className="w-full" variant="outline">
                  <Wrench className="h-4 w-4 mr-2" />
                  Отчет о сервисе
                </Button>
              </Link>
              <Link to="/user-alert">
                <Button className="w-full" variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Сообщить о проблеме
                </Button>
              </Link>
              <Link to="/maintenance-planning">
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Планирование ТО
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Последние события</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'service' && <Wrench className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'problem' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {activity.type === 'maintenance' && <Calendar className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">{activity.date}</p>
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority === 'high' ? 'Высокий' :
                         activity.priority === 'medium' ? 'Средний' : 'Низкий'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Button 
            variant={selectedTab === 'fleet' ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col h-12"
            onClick={() => setSelectedTab('fleet')}
          >
            <Car className="h-4 w-4" />
            <span className="text-xs mt-1">Автопарк</span>
          </Button>
          <Link to="/service-history">
            <Button 
              variant={selectedTab === 'service' ? 'default' : 'ghost'} 
              size="sm" 
              className="flex flex-col h-12"
              onClick={() => setSelectedTab('service')}
            >
              <Wrench className="h-4 w-4" />
              <span className="text-xs mt-1">Сервис</span>
            </Button>
          </Link>
          <Link to="/alerts">
            <Button 
              variant={selectedTab === 'problems' ? 'default' : 'ghost'} 
              size="sm" 
              className="flex flex-col h-12"
              onClick={() => setSelectedTab('problems')}
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs mt-1">Проблемы</span>
            </Button>
          </Link>
          <Link to="/service-history">
            <Button 
              variant={selectedTab === 'history' ? 'default' : 'ghost'} 
              size="sm" 
              className="flex flex-col h-12"
              onClick={() => setSelectedTab('history')}
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs mt-1">История</span>
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  )
}