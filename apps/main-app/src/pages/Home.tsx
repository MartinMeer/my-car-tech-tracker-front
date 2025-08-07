/**
 * Main dashboard page displaying fleet overview, recent activities and quick actions
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { DataService, Car as CarType, MaintenancePlan } from '../services/DataService'
import { CarStatusService, CarStatusInfo } from '../services/CarStatusService'
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
import { NavigationService } from '../services/NavigationService'

export default function Home() {
  const [selectedTab, setSelectedTab] = useState('fleet')
  const [isPlansDialogOpen, setIsPlansDialogOpen] = useState(false)
  const [cars, setCars] = useState<CarType[]>([])
  const [carStatusMap, setCarStatusMap] = useState<Map<string, CarStatusInfo>>(new Map())
  const [savedPlans, setSavedPlans] = useState<MaintenancePlan[]>([])
  const [fleetStats, setFleetStats] = useState({
    totalCars: 0,
    activeCars: 0,
    carsInMaintenance: 0,
    carsWithProblems: 0,
    totalActiveAlerts: 0,
    totalCriticalAlerts: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load cars and plans
      const [carsData, plansData] = await Promise.all([
        DataService.getCars(),
        DataService.getMaintenancePlans()
      ])

      setCars(carsData)
      setSavedPlans(plansData)

      // Load car status information
      const carIds = carsData.map(car => car.id)
      const statusMap = await CarStatusService.getMultipleCarStatusInfo(carIds)
      setCarStatusMap(statusMap)

      // Load fleet statistics
      const stats = await CarStatusService.getFleetStats()
      setFleetStats(stats)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Ошибка загрузки данных. Попробуйте обновить страницу.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()

    // Listen for maintenance status changes
    const handleMaintenanceChange = () => {
      loadDashboardData()
    }

    // Listen for page focus to refresh data when user returns
    const handleFocus = () => {
      loadDashboardData()
    }

    window.addEventListener('maintenanceStatusChanged', handleMaintenanceChange)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        loadDashboardData()
      }
    })
    
    return () => {
      window.removeEventListener('maintenanceStatusChanged', handleMaintenanceChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    if (isPlansDialogOpen) {
      DataService.getMaintenancePlans().then(setSavedPlans)
    }
  }, [isPlansDialogOpen])

  // Helper function to get car status info
  const getCarStatusInfo = (carId: string): CarStatusInfo => {
    return carStatusMap.get(carId) || {
      status: 'inactive',
      statusText: 'Неизвестно',
      statusColor: 'bg-gray-100 text-gray-800',
      alertCount: 0,
      criticalAlertCount: 0,
      isInMaintenance: false
    }
  }

  const recentActivities = [
    { type: 'service', message: 'Замена масла - Toyota Camry', date: '2024-07-15', priority: 'low' },
    { type: 'problem', message: 'Проблема с тормозами - Mercedes Sprinter', date: '2024-07-12', priority: 'high' },
    { type: 'maintenance', message: 'Плановое ТО - Toyota Camry', date: '2024-07-10', priority: 'medium' }
  ]



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
    NavigationService.navigateToMarketing('/')
  }

  const handleLogoutClick = () => {
    console.log('Logout clicked - clearing auth data...')
    
    // Clear all authentication data (same keys as marketing site AuthService)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data') 
    localStorage.removeItem('refresh_token')
    
    console.log('Auth data cleared, navigating to marketing site...')
    
    // Navigate to marketing site
    NavigationService.navigateToMarketing('/')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData}>
            Попробовать снова
          </Button>
        </div>
      </div>
    )
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
                  <p className="text-2xl font-bold">{fleetStats.activeCars}</p>
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
                    <p className="text-2xl font-bold">{fleetStats.carsInMaintenance}</p>
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
                    <p className="text-2xl font-bold">{fleetStats.totalActiveAlerts}</p>
                    <p className="text-sm text-gray-600">Проблемы</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Dialog open={isPlansDialogOpen} onOpenChange={setIsPlansDialogOpen}>
            <DialogTrigger asChild>
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{savedPlans.length}</p>
                      <p className="text-sm text-gray-600">Планов ТО</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Планы обслуживания</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {savedPlans.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Нет сохраненных планов</p>
                    <div className="mt-4">
                      <Link to="/maintenance-planning">
                        <Button onClick={() => setIsPlansDialogOpen(false)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Создать план ТО
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Всего планов: {savedPlans.length}</p>
                      <Link to="/maintenance-planning">
                        <Button onClick={() => setIsPlansDialogOpen(false)} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Создать новый план
                        </Button>
                      </Link>
                    </div>
                    {savedPlans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{plan.carName}</h4>
                            <p className="text-sm text-gray-600">Начало: {plan.plannedDate}</p>
                            <p className="text-sm text-gray-600">Завершение: {plan.plannedCompletionDate}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge>{plan.status === 'draft' ? 'Черновик' : 'Запланировано'}</Badge>
                            <Link to={`/maintenance-planning/${plan.id}`}>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setIsPlansDialogOpen(false)}
                                className="text-xs"
                              >
                                Просмотреть
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p>Операций: {plan.periodicOperations.length + plan.repairOperations.length}</p>
                          <p>Стоимость: {plan.totalEstimatedCost.toLocaleString()} ₽</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

      

        {/* Fleet Overview */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Мой автопарк</CardTitle>
            <Link to="/add-car">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить авто
                </Button>
              </Link>
          </CardHeader>
          <CardContent>
            {cars.length === 0 ? (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">У вас пока нет добавленных автомобилей</p>
                <Link to="/add-car">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить первый автомобиль
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cars.map((car) => {
                  const statusInfo = getCarStatusInfo(car.id)
                  return (
                    <Link key={car.id} to={`/car/${car.id}`}>
                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={car.image || '/img/car-by-deault.png'} 
                            alt={`${car.brand} ${car.model}`}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold">{car.name}</h3>
                              <Badge className={statusInfo.statusColor}>
                                {statusInfo.statusText}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{car.brand} {car.model} ({car.year})</p>
                            <p className="text-xs text-gray-500">Пробег: {car.mileage.toLocaleString()} км</p>
                            {car.nextService && (
                              <p className="text-xs text-gray-500">Следующее ТО: {car.nextService}</p>
                            )}
                            {statusInfo.alertCount > 0 && (
                              <p className="text-xs text-orange-600">
                                Активных уведомлений: {statusInfo.alertCount}
                                {statusInfo.criticalAlertCount > 0 && ` (критичных: ${statusInfo.criticalAlertCount})`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/*<Link to="/add-car">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить авто
                </Button>
              </Link>*/}
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
            <CardTitle className="text-lg">Последние события (раздел в разработке)</CardTitle>
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