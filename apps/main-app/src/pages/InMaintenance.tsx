/**
 * In-maintenance cars page showing cars currently in service
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { 
  ArrowLeft, 
  Wrench, 
  Calendar, 
  Car,
  CheckCircle,
  AlertTriangle,
  Settings,
  RotateCcw
} from 'lucide-react'

interface MaintenanceEntry {
  id: string
  carId: string
  carName: string
  carBrand: string
  carModel: string
  plannedDate: string
  plannedCompletionDate: string
  plannedMileage: string
  serviceProvider: string
  maintenancePlan?: {
    id: string
    periodicOperations: Array<{
      operation: string
      selected: boolean
      priority: 'high' | 'medium' | 'low'
      estimatedCost: number
      notes: string
    }>
    repairOperations: Array<{
      alertId: string
      description: string
      priority: string
      estimatedCost: number
      notes: string
    }>
    totalEstimatedCost: number
    notes: string
  }
  addedAt: string
}

export default function InMaintenance() {
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceEntry[]>([])
  const [selectedPlan, setSelectedPlan] = useState<MaintenanceEntry | null>(null)
  const [isConfirmReturnOpen, setIsConfirmReturnOpen] = useState(false)
  const [entryToReturn, setEntryToReturn] = useState<MaintenanceEntry | null>(null)

  // Mock car data for reference
  const cars = [
    { id: '1', name: 'Транспорт #1', brand: 'Toyota', model: 'Camry', currentMileage: 85000 },
    { id: '2', name: 'Грузовик #2', brand: 'Mercedes', model: 'Sprinter', currentMileage: 120000 }
  ]

  useEffect(() => {
    // Load maintenance list from localStorage
    const savedMaintenanceList = JSON.parse(localStorage.getItem('in-maintenance') || '[]')
    setMaintenanceList(savedMaintenanceList)
  }, [])

  const handleReturnToService = (entry: MaintenanceEntry) => {
    setEntryToReturn(entry)
    setIsConfirmReturnOpen(true)
  }

  const confirmReturnToService = () => {
    if (!entryToReturn) return

    // Remove from maintenance list
    const updatedList = maintenanceList.filter(item => item.id !== entryToReturn.id)
    setMaintenanceList(updatedList)
    localStorage.setItem('in-maintenance', JSON.stringify(updatedList))

    // Close dialogs
    setIsConfirmReturnOpen(false)
    setEntryToReturn(null)

    // Trigger a custom event to update counters on Home page
    window.dispatchEvent(new CustomEvent('maintenanceStatusChanged'))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': case 'critical': return 'bg-red-100 text-red-800'
      case 'medium': case 'unclear': return 'bg-yellow-100 text-yellow-800'
      case 'low': case 'can-wait': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                Автомобили на сервисе
              </h1>
              <p className="text-sm text-gray-600">Автомобили, находящиеся в обслуживании</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Status Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{maintenanceList.length}</p>
                  <p className="text-sm text-gray-600">автомобилей на сервисе</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Готовы к работе</p>
                <p className="text-xl font-bold text-green-600">{cars.length - maintenanceList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance List Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Список автомобилей на обслуживании
            </CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
                <h3 className="text-lg font-medium mb-2">Все автомобили готовы к работе</h3>
                <p className="text-sm">В данный момент нет автомобилей на обслуживании</p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceList.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Car Information */}
                      <div className="lg:col-span-1">
                        <h4 className="font-medium text-lg mb-1">{entry.carName}</h4>
                        <p className="text-sm text-gray-600">{entry.carBrand} {entry.carModel}</p>
                        <div className="mt-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            На сервисе
                          </Badge>
                        </div>
                      </div>

                      {/* Plan Information */}
                      <div className="lg:col-span-1">
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">План обслуживания:</p>
                          {entry.maintenancePlan ? (
                            <div>
                              <p className="text-sm text-gray-600">
                                Операций: {entry.maintenancePlan.periodicOperations.length + entry.maintenancePlan.repairOperations.length}
                              </p>
                              <p className="text-sm text-green-600 font-medium">
                                {entry.maintenancePlan.totalEstimatedCost.toLocaleString()} ₽
                              </p>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="mt-1">
                                    Подробности
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>План обслуживания - {entry.carName}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {entry.maintenancePlan.periodicOperations.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-2">Плановое ТО:</h4>
                                        <div className="space-y-2">
                                          {entry.maintenancePlan.periodicOperations.map((op, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                              <div>
                                                <p className="text-sm font-medium">{op.operation}</p>
                                                <Badge className={getPriorityColor(op.priority)}>
                                                  {op.priority === 'high' ? 'Срочно' :
                                                   op.priority === 'medium' ? 'Скоро' : 'Плановое'}
                                                </Badge>
                                              </div>
                                              <p className="text-sm font-medium">{op.estimatedCost.toLocaleString()} ₽</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {entry.maintenancePlan.repairOperations.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-2">Ремонтные работы:</h4>
                                        <div className="space-y-2">
                                          {entry.maintenancePlan.repairOperations.map((op, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                              <div>
                                                <p className="text-sm font-medium">{op.description}</p>
                                                <Badge className={getPriorityColor(op.priority)}>
                                                  {op.priority === 'critical' ? 'Критично' :
                                                   op.priority === 'unclear' ? 'Непонятно' : 'Можно подождать'}
                                                </Badge>
                                              </div>
                                              <p className="text-sm font-medium">{op.estimatedCost.toLocaleString()} ₽</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    <div className="border-t pt-2">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium">Общая стоимость:</span>
                                        <span className="text-lg font-bold text-green-600">
                                          {entry.maintenancePlan.totalEstimatedCost.toLocaleString()} ₽
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">План не указан</p>
                          )}
                        </div>
                      </div>

                      {/* Date and Service Provider */}
                      <div className="lg:col-span-1">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Дата начала:</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(entry.plannedDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Дата завершения:</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(entry.plannedCompletionDate)}
                            </p>
                          </div>
                          {entry.serviceProvider && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Исполнитель:</p>
                              <p className="text-sm text-gray-600">{entry.serviceProvider}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-700">На сервисе с:</p>
                            <p className="text-sm text-gray-600">{formatDate(entry.addedAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex flex-col justify-center">
                        <Button 
                          onClick={() => handleReturnToService(entry)}
                          variant="outline"
                          className="w-full text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Вернуть в эксплуатацию
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmReturnOpen} onOpenChange={setIsConfirmReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение возврата в эксплуатацию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-medium">Вернуть автомобиль в эксплуатацию?</p>
                <p className="text-sm text-gray-600">
                  {entryToReturn?.carName} будет помечен как готовый к работе
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsConfirmReturnOpen(false)}>
                Отмена
              </Button>
              <Button onClick={confirmReturnToService} className="bg-green-600 hover:bg-green-700">
                Да, вернуть в эксплуатацию
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}