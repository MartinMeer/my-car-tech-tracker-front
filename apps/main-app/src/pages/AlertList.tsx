/**
 * Alert list management page with archive/restore functionality and editing capabilities
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Alert } from '../services/DataService'
import { AlertService, AlertPriority, AlertStatus } from '../services/AlertService'
import { 
  ArrowLeft, 
  AlertTriangle, 
  Archive, 
  ArchiveRestore,
  Edit3,
  Save,
  X,
  Calendar,
  Car
} from 'lucide-react'

interface Alert {
  id: string
  carId: string
  carName: string
  date: string
  mileage: string
  system: string
  location: string
  priority: string
  description: string
  createdAt: string
  status: 'active' | 'archived'
}

export default function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [editForm, setEditForm] = useState({
    description: '',
    location: '',
    mileage: ''
  })

  // Load alerts from localStorage on component mount
  useEffect(() => {
    const savedAlerts = JSON.parse(localStorage.getItem('fleet-alerts') || '[]')
    setAlerts(savedAlerts)
  }, [])

  // Save alerts to localStorage whenever alerts change
  const saveAlerts = (updatedAlerts: Alert[]) => {
    setAlerts(updatedAlerts)
    localStorage.setItem('fleet-alerts', JSON.stringify(updatedAlerts))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'unclear': return 'bg-yellow-100 text-yellow-800' 
      case 'can-wait': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Критично'
      case 'unclear': return 'Непонятно'
      case 'can-wait': return 'Можно подождать'
      default: return priority
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴'
      case 'unclear': return '🟡'
      case 'can-wait': return '🔵'
      default: return '⚪'
    }
  }

  const handleArchive = (alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, status: 'archived' as const } : alert
    )
    saveAlerts(updatedAlerts)
  }

  const handleRestore = (alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, status: 'active' as const } : alert
    )
    saveAlerts(updatedAlerts)
  }

  const handleEditClick = (alert: Alert) => {
    setEditingAlert(alert)
    setEditForm({
      description: alert.description,
      location: alert.location,
      mileage: alert.mileage
    })
  }

  const handleSaveEdit = () => {
    if (!editingAlert) return

    const updatedAlerts = alerts.map(alert =>
      alert.id === editingAlert.id 
        ? { 
            ...alert, 
            description: editForm.description,
            location: editForm.location,
            mileage: editForm.mileage
          }
        : alert
    )
    saveAlerts(updatedAlerts)
    setEditingAlert(null)
  }

  const activeAlerts = alerts.filter(alert => alert.status === 'active')
  const archivedAlerts = alerts.filter(alert => alert.status === 'archived')
  const displayAlerts = showArchived ? archivedAlerts : activeAlerts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showArchived ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowArchived(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center">
                  {showArchived ? (
                    <>
                      <Archive className="h-5 w-5 mr-2 text-gray-600" />
                      Архив проблем
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                      У нас проблемы!
                    </>
                  )}
                </h1>
              </div>
            </div>
            
            {!showArchived && (
              <div className="flex items-center space-x-2">
                <Link to="/user-alert">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Сообщить о проблеме
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowArchived(true)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Архив
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {!showArchived && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Список всех обнаруженных проблем по автомобилям
            </p>
          </div>
        )}

        {displayAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              {showArchived ? (
                <>
                  <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Архив пуст</h3>
                  <p className="text-gray-600">Нет архивированных проблем</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Проблем нет!</h3>
                  <p className="text-gray-600 mb-4">Все ваши автомобили в отличном состоянии</p>
                  <Link to="/user-alert">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Сообщить о проблеме
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getPriorityIcon(alert.priority)}</span>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {getPriorityText(alert.priority)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog 
                        open={editingAlert?.id === alert.id} 
                        onOpenChange={(open) => !open && setEditingAlert(null)}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditClick(alert)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Редактировать проблему</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Место неисправности</label>
                              <Input
                                value={editForm.location}
                                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Укажите место..."
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Пробег (км)</label>
                              <Input
                                type="number"
                                value={editForm.mileage}
                                onChange={(e) => setEditForm(prev => ({ ...prev, mileage: e.target.value }))}
                                placeholder="85000"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Описание</label>
                              <Textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Описание проблемы..."
                                rows={3}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setEditingAlert(null)}>
                                <X className="h-4 w-4 mr-2" />
                                Отмена
                              </Button>
                              <Button onClick={handleSaveEdit}>
                                <Save className="h-4 w-4 mr-2" />
                                Сохранить
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {showArchived ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRestore(alert.id)}
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleArchive(alert.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{alert.carName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{alert.date}</span>
                      </div>
                      {alert.mileage && (
                        <div className="text-gray-600">
                          {parseInt(alert.mileage).toLocaleString()} км
                        </div>
                      )}
                    </div>

                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{alert.system}</p>
                      {alert.location && (
                        <p className="text-gray-600">{alert.location}</p>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {alert.description}
                    </p>

                    <p className="text-xs text-gray-500">
                      Создано: {new Date(alert.createdAt).toLocaleDateString('ru-RU')} в {new Date(alert.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
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