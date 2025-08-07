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

export default function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [editForm, setEditForm] = useState({
    description: '',
    location: '',
    mileage: ''
  })

  // Load alerts using DataService on component mount
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const alertsData = await AlertService.getAlerts()
        setAlerts(alertsData)
      } catch (error) {
        console.error('Error loading alerts:', error)
      }
    }

    loadAlerts()
  }, [])

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

  const handleArchive = async (alertId: string) => {
    try {
      await AlertService.archiveAlert(alertId)
      // Reload alerts to get updated data
      const updatedAlerts = await AlertService.getAlerts()
      setAlerts(updatedAlerts)
    } catch (error) {
      console.error('Error archiving alert:', error)
    }
  }

  const handleRestore = async (alertId: string) => {
    try {
      await AlertService.restoreAlert(alertId)
      // Reload alerts to get updated data
      const updatedAlerts = await AlertService.getAlerts()
      setAlerts(updatedAlerts)
    } catch (error) {
      console.error('Error restoring alert:', error)
    }
  }

  const handleEditClick = (alert: Alert) => {
    setEditingAlert(alert)
    setEditForm({
      description: alert.description,
      location: alert.location,
      mileage: alert.mileage.toString()
    })
  }

  const handleSaveEdit = async () => {
    if (!editingAlert) return

    try {
      await AlertService.updateAlert(editingAlert.id, {
        description: editForm.description,
        location: editForm.location,
        mileage: parseInt(editForm.mileage) || 0
      })
      
      // Reload alerts to get updated data
      const updatedAlerts = await AlertService.getAlerts()
      setAlerts(updatedAlerts)
      setEditingAlert(null)
    } catch (error) {
      console.error('Error updating alert:', error)
    }
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
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Список проблем
                </h1>
                <p className="text-sm text-gray-600">
                  {showArchived ? 'Архивные проблемы' : 'Активные проблемы'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={showArchived ? "outline" : "default"}
                size="sm"
                onClick={() => setShowArchived(false)}
              >
                Активные ({activeAlerts.length})
              </Button>
              <Button
                variant={showArchived ? "default" : "outline"}
                size="sm"
                onClick={() => setShowArchived(true)}
              >
                Архив ({archivedAlerts.length})
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {displayAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showArchived ? 'Архив пуст' : 'Проблем не найдено'}
              </h3>
              <p className="text-gray-600">
                {showArchived 
                  ? 'В архиве пока нет проблем'
                  : 'Создайте первую проблему, чтобы начать отслеживание'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getPriorityIcon(alert.priority)}</span>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {getPriorityText(alert.priority)}
                        </Badge>
                        {alert.type === 'recommendation' && (
                          <Badge variant="secondary">Рекомендация</Badge>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-2">
                        {alert.carName}
                      </h3>
                      
                      <p className="text-gray-700 mb-3">{alert.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(alert.reportedAt).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Car className="h-4 w-4" />
                          <span>{alert.mileage.toLocaleString()} км</span>
                        </div>
                        {alert.location && (
                          <span className="text-gray-500">{alert.location}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!showArchived ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(alert)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchive(alert.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(alert.id)}
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingAlert} onOpenChange={() => setEditingAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать проблему</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Описание</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Место</label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Пробег (км)</label>
              <Input
                type="number"
                value={editForm.mileage}
                onChange={(e) => setEditForm(prev => ({ ...prev, mileage: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingAlert(null)}>
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
    </div>
  )
}