/**
 * Service history page displaying all maintenance and repair records
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { DataService, Car } from '../services/DataService'
import { 
  ArrowLeft, 
  Wrench, 
  Calendar, 
  Car as CarIcon,
  Search,
  Filter,
  Plus,
  Settings,
  FileText
} from 'lucide-react'

interface ServiceRecord {
  id: string
  carId: string
  carName: string
  date: string
  mileage: string
  serviceProvider: string
  totalCost: number
  operations: Array<{
    id: string
    type: 'periodical' | 'repair'
    name: string
    description: string
    parts: Array<{
      name: string
      quantity: number
      cost: number
    }>
    laborCost: number
  }>
  notes: string
  createdAt: string
}

export default function ServiceHistory() {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<ServiceRecord[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCar, setFilterCar] = useState('')
  const [filterType, setFilterType] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load cars and service records from DataService
      const [carsData, recordsData] = await Promise.all([
        DataService.getCars(),
        DataService.getServiceRecords()
      ])
      
      setCars(carsData)
      setServiceRecords(recordsData)
      setFilteredRecords(recordsData)
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Apply filters
    let filtered = serviceRecords

    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.serviceProvider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.operations.some(op => op.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (filterCar) {
      filtered = filtered.filter(record => record.carId === filterCar)
    }

    if (filterType) {
      filtered = filtered.filter(record =>
        record.operations.some(op => op.type === filterType)
      )
    }

    setFilteredRecords(filtered)
  }, [serviceRecords, searchQuery, filterCar, filterType])

  const totalSpent = filteredRecords.reduce((sum, record) => sum + record.totalCost, 0)
  const periodicCount = filteredRecords.filter(record => 
    record.operations.some(op => op.type === 'periodical')
  ).length
  const repairCount = filteredRecords.filter(record => 
    record.operations.some(op => op.type === 'repair')
  ).length

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка истории...</p>
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
                <h1 className="text-lg font-bold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  История обслуживания
                </h1>
                <p className="text-sm text-gray-600">Все записи о сервисе и ремонте</p>
              </div>
            </div>
            <Link to="/add-service-record">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Новая запись
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{filteredRecords.length}</p>
                  <p className="text-sm text-gray-600">Записей</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{periodicCount}</p>
                  <p className="text-sm text-gray-600">Плановых ТО</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Wrench className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{repairCount}</p>
                  <p className="text-sm text-gray-600">Ремонтов</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totalSpent / 1000)}к</p>
                  <p className="text-sm text-gray-600">Потрачено ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по автомобилю, сервису, операциям..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterCar} onValueChange={setFilterCar}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Все авто" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все автомобили</SelectItem>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Все типы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все типы</SelectItem>
                    <SelectItem value="periodical">Плановое ТО</SelectItem>
                    <SelectItem value="repair">Ремонт</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Records */}
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {serviceRecords.length === 0 ? 'История пуста' : 'Ничего не найдено'}
              </h3>
              <p className="text-gray-600 mb-4">
                {serviceRecords.length === 0 
                  ? 'У вас пока нет записей об обслуживании'
                  : 'Попробуйте изменить параметры поиска'
                }
              </p>
              {serviceRecords.length === 0 && (
                <Link to="/add-service-record">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить первую запись
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <CarIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{record.carName}</span>
                          <Badge variant="outline">{record.mileage} км</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{record.date}</span>
                          </div>
                          {record.serviceProvider && (
                            <span>🔧 {record.serviceProvider}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {record.totalCost.toLocaleString()} ₽
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Выполненные операции ({record.operations.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {record.operations.map((operation) => (
                          <Badge 
                            key={operation.id}
                            variant={operation.type === 'periodical' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {operation.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {record.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {record.notes}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs text-gray-500">
                      <span>
                        Создано: {new Date(record.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </main>
    </div>
  )
}
