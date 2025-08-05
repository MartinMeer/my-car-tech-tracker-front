/**
 * Maintenance planning and scheduling page combining periodical and repair work
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Checkbox } from '../components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { DataService, Car, MaintenancePlan } from '../services/DataService'
import html2pdf from 'html2pdf.js'
import { 
  ArrowLeft, 
  Calendar, 
  AlertTriangle, 
  Wrench, 
  Clock,
  Plus,
  Save,
  FileText,
  Car as CarIcon,
  Settings,
  CheckCircle,
  Store,
  Trash2,
  Edit,
  Star,
  X,
  Download
} from 'lucide-react'

// Maintenance regulations from reglament.json
const maintenanceRegulations = [
  {
    "operation": "Замена моторного масла и фильтра",
    "mileage": "10000",
    "period": "6",
    "notes": "Обязательно масло 0W-20/5W-30. При тяжёлых условиях - сократить до 8000 км"
  },
  {
    "operation": "Диагностика цепи ГРМ и натяжителя",
    "mileage": "60000",
    "period": "48",
    "notes": "Проверка натяжения цепи, износ направляющих и натяжителя. Обязательно при появлении шумов"
  },
  {
    "operation": "Замена воздушного фильтра двигателя",
    "mileage": "30000",
    "period": "24",
    "notes": "Критично для K24A1 из-за прямого забора воздуха"
  },
  {
    "operation": "Промывка системы VTEC",
    "mileage": "50000",
    "period": "36",
    "notes": "Чистка соленоида VTEC и сетки фильтра (характерная проблема K24)"
  },
  {
    "operation": "Замена свечей зажигания",
    "mileage": "100000",
    "period": "60",
    "notes": "NGK IZFR6K11. Обязательная замена по регламенту"
  },
  {
    "operation": "Замена тормозной жидкости",
    "mileage": "30000",
    "period": "24",
    "notes": "DOT 3/4. Гигроскопичность влияет на ABS"
  },
  {
    "operation": "Замена жидкости АКПП",
    "mileage": "60000",
    "period": "48",
    "notes": "Только Honda ATF DW-1."
  },
  {
    "operation": "Замена охлаждающей жидкости",
    "mileage": "100000",
    "period": "60",
    "notes": "Honda Type 2 (синяя). Не смешивать с другими типами!"
  },
  {
    "operation": "Регулировка клапанов",
    "mileage": "40000",
    "period": "36",
    "notes": "Требует специнструмента"
  },
  {
    "operation": "Замена ремня генератора",
    "mileage": "80000",
    "period": "60",
    "notes": "Контроль натяжителя и обводных роликов"
  },
  {
    "operation": "Чистка дроссельной заслонки",
    "mileage": "50000",
    "period": "36",
    "notes": "Характерная проблема K24 - нестабильные холостые обороты"
  },
  {
    "operation": "Диагностика подвески",
    "mileage": "20000",
    "period": "12",
    "notes": "Особое внимание задним рычагам (отзывная кампания HMC-2004-32)"
  }
]

interface ServiceShop {
  id: string
  name: string
  contacts: string
  rating: number
  createdAt: string
}



export default function MaintenancePlanning() {
  const [selectedCarId, setSelectedCarId] = useState('')
  const [plannedDate, setPlannedDate] = useState('')
  const [plannedCompletionDate, setPlannedCompletionDate] = useState('')
  const [plannedMileage, setPlannedMileage] = useState('')
  const [serviceProvider, setServiceProvider] = useState('')
  const [planNotes, setPlanNotes] = useState('')
  const [cars, setCars] = useState<Car[]>([])
  const [userAlerts, setUserAlerts] = useState<any[]>([])
  const [periodicItems, setPeriodicItems] = useState<any[]>([])
  const [repairItems, setRepairItems] = useState<any[]>([])
  const [savedPlans, setSavedPlans] = useState<MaintenancePlan[]>([])
  const [isViewPlansOpen, setIsViewPlansOpen] = useState(false)
  const [isConfirmMaintenanceOpen, setIsConfirmMaintenanceOpen] = useState(false)
  const [isSendingToMaintenance, setIsSendingToMaintenance] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Service shops state
  const [serviceShops, setServiceShops] = useState<ServiceShop[]>([])
  const [isServiceShopsOpen, setIsServiceShopsOpen] = useState(false)
  const [isAddEditShopOpen, setIsAddEditShopOpen] = useState(false)
  const [editingShopId, setEditingShopId] = useState<string | null>(null)
  const [shopName, setShopName] = useState('')
  const [shopContacts, setShopContacts] = useState('')
  const [shopRating, setShopRating] = useState(5)
  const [isDeleteShopOpen, setIsDeleteShopOpen] = useState(false)
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false)
  const [shopToDelete, setShopToDelete] = useState<ServiceShop | null>(null)

  // Cars are now loaded from DataService

  // Load initial data
  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load cars and plans from DataService
      const [carsData, plansData] = await Promise.all([
        DataService.getCars(),
        DataService.getMaintenancePlans()
      ])
      
      setCars(carsData)
      setSavedPlans(plansData)

      // Load user alerts for repair planning
      const savedAlerts = JSON.parse(localStorage.getItem('fleet-alerts') || '[]')
      const activeAlerts = savedAlerts.filter((alert: any) => alert.status === 'active')
      setUserAlerts(activeAlerts)

      // Load service shops
      const savedShops = JSON.parse(localStorage.getItem('service-shops') || '[]')
      setServiceShops(savedShops)

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Set up autosave interval
    const interval = setInterval(autoSaveDraft, 30000) // 30 seconds
    setAutoSaveInterval(interval)

    // Cleanup
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [])

  useEffect(() => {
    // Reset autosave interval when form data changes
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
    }
    const interval = setInterval(autoSaveDraft, 30000)
    setAutoSaveInterval(interval)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [selectedCarId, plannedDate, plannedCompletionDate, plannedMileage, serviceProvider, planNotes, periodicItems, repairItems])

  useEffect(() => {
    if (selectedCarId) {
      const selectedCar = cars.find(c => c.id === selectedCarId)
      if (selectedCar) {
        // Calculate needed periodic maintenance based on current mileage
        const neededMaintenance = maintenanceRegulations.map(regulation => {
          const intervalMileage = parseInt(regulation.mileage)
          const intervalMonths = parseInt(regulation.period)
          
          // Calculate if maintenance is due based on mileage
          const mileageSinceLastService = selectedCar.mileage % intervalMileage
          const mileageUntilNext = intervalMileage - mileageSinceLastService
          
          // Calculate if maintenance is due based on time
          const lastServiceDate = selectedCar.lastService ? new Date(selectedCar.lastService) : new Date(selectedCar.createdAt)
          const monthsSinceService = Math.floor((Date.now() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
          const monthsUntilNext = intervalMonths - (monthsSinceService % intervalMonths)
          
          // Determine priority based on how close to due date
          let priority: 'high' | 'medium' | 'low' = 'low'
          if (mileageUntilNext <= 2000 || monthsUntilNext <= 1) {
            priority = 'high'
          } else if (mileageUntilNext <= 5000 || monthsUntilNext <= 3) {
            priority = 'medium'
          }

          return {
            operation: regulation.operation,
            notes: regulation.notes,
            mileageInterval: intervalMileage,
            timeInterval: intervalMonths,
            mileageUntilNext,
            monthsUntilNext,
            priority,
            selected: priority === 'high',
            estimatedCost: 0,
            planNotes: ''
          }
        })

        setPeriodicItems(neededMaintenance)

        // Filter repair items for selected car
        const carAlerts = userAlerts.filter((alert: any) => alert.carId === selectedCarId)
        const repairOperations = carAlerts.map((alert: any) => ({
          alertId: alert.id,
          description: `${alert.system}: ${alert.description}`,
          priority: alert.priority,
          estimatedCost: 0,
          notes: alert.location || '',
          selected: true,
          planNotes: ''
        }))
        setRepairItems(repairOperations)

        // Auto-fill planned mileage
        setPlannedMileage(selectedCar.mileage.toString())
      }
    }
  }, [selectedCarId, userAlerts, cars])

  const updatePeriodicItem = (index: number, field: string, value: any) => {
    setPeriodicItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const updateRepairItem = (index: number, field: string, value: any) => {
    setRepairItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const loadPlanForEditing = (plan: MaintenancePlan) => {
    setEditingPlanId(plan.id)
    setSelectedCarId(plan.carId)
    setPlannedDate(plan.plannedDate)
    setPlannedCompletionDate(plan.plannedCompletionDate)
    setPlannedMileage(plan.plannedMileage || '')
    setServiceProvider(plan.serviceProvider || '')
    setPlanNotes(plan.notes || '')
    
    // Load periodic operations
    const selectedCar = cars.find(c => c.id === plan.carId)
    if (selectedCar) {
              const neededMaintenance = maintenanceRegulations.map(regulation => {
          const planOperation = plan.periodicOperations.find(op => op.operation === regulation.operation)
          const intervalMileage = parseInt(regulation.mileage)
          const intervalMonths = parseInt(regulation.period)
          
          const mileageSinceLastService = selectedCar.mileage % intervalMileage
          const mileageUntilNext = intervalMileage - mileageSinceLastService
          
          const lastServiceDate = selectedCar.lastService ? new Date(selectedCar.lastService) : new Date(selectedCar.createdAt)
          const monthsSinceService = Math.floor((Date.now() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
          const monthsUntilNext = intervalMonths - (monthsSinceService % intervalMonths)
        
        let priority: 'high' | 'medium' | 'low' = 'low'
        if (mileageUntilNext <= 2000 || monthsUntilNext <= 1) {
          priority = 'high'
        } else if (mileageUntilNext <= 5000 || monthsUntilNext <= 3) {
          priority = 'medium'
        }

        return {
          operation: regulation.operation,
          notes: regulation.notes,
          mileageInterval: intervalMileage,
          timeInterval: intervalMonths,
          mileageUntilNext,
          monthsUntilNext,
          priority: planOperation?.priority || priority,
          selected: !!planOperation,
          estimatedCost: planOperation?.estimatedCost || 0,
          planNotes: planOperation?.notes || ''
        }
      })
      setPeriodicItems(neededMaintenance)
    }

    // Load repair operations
    const repairOperations = plan.repairOperations.map(repairOp => ({
      alertId: repairOp.alertId,
      description: repairOp.description,
      priority: repairOp.priority,
      estimatedCost: repairOp.estimatedCost,
      notes: repairOp.notes,
      selected: true,
      planNotes: repairOp.notes
    }))
    setRepairItems(repairOperations)
    
    setIsViewPlansOpen(false)
  }

  const clearForm = () => {
    setEditingPlanId(null)
    setSelectedCarId('')
    setPlannedDate('')
    setPlannedCompletionDate('')
    setPlannedMileage('')
    setServiceProvider('')
    setPlanNotes('')
    setPeriodicItems([])
    setRepairItems([])
  }

  const calculateTotalCost = () => {
    const periodicCost = periodicItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
    
    const repairCost = repairItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
    
    return periodicCost + repairCost
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': case 'critical': return 'bg-red-100 text-red-800'
      case 'medium': case 'unclear': return 'bg-yellow-100 text-yellow-800'
      case 'low': case 'can-wait': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const savePlan = () => {
    if (!selectedCarId || !plannedDate || !plannedCompletionDate) {
      alert('Выберите автомобиль и укажите даты начала и завершения обслуживания')
      return
    }

    // Check if any operations are selected
    const selectedPeriodicOps = periodicItems.filter(item => item.selected)
    const selectedRepairOps = repairItems.filter(item => item.selected)
    
    if (selectedPeriodicOps.length === 0 && selectedRepairOps.length === 0) {
      alert('Выберите хотя бы одну операцию для планирования')
      return
    }

    const selectedCar = cars.find(c => c.id === selectedCarId)
    
    try {
      const planData: MaintenancePlan = {
        id: editingPlanId || Date.now().toString(),
        carId: selectedCarId,
        carName: selectedCar?.name || 'Неизвестный автомобиль',
        plannedDate,
        plannedCompletionDate,
        plannedMileage,
        periodicOperations: selectedPeriodicOps.map(item => ({
          operation: item.operation,
          selected: true,
          priority: item.priority,
          estimatedCost: item.estimatedCost || 0,
          notes: item.planNotes || item.notes || ''
        })),
        repairOperations: selectedRepairOps.map(item => ({
          alertId: item.alertId,
          description: item.description,
          priority: item.priority,
          estimatedCost: item.estimatedCost || 0,
          notes: item.planNotes || item.notes || ''
        })),
        totalEstimatedCost: calculateTotalCost(),
        serviceProvider,
        notes: planNotes,
        status: 'draft',
        createdAt: editingPlanId 
          ? savedPlans.find(p => p.id === editingPlanId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      let updatedPlans
      if (editingPlanId) {
        // Update existing plan
        updatedPlans = savedPlans.map(plan => 
          plan.id === editingPlanId ? planData : plan
        )
      } else {
        // Create new plan
        updatedPlans = [...savedPlans, planData]
      }
      
      setSavedPlans(updatedPlans)
      localStorage.setItem('maintenance-plans', JSON.stringify(updatedPlans))

      // Clear autosave interval
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval)
        setAutoSaveInterval(null)
      }

      alert(`План обслуживания ${editingPlanId ? 'обновлен' : 'сохранен'}!`)
    } catch (error) {
      console.error('Error saving maintenance plan:', error)
      alert('Ошибка при сохранении плана. Попробуйте еще раз.')
    }
  }

  const handleClose = () => {
    // Check if there are unsaved changes
    const hasUnsavedChanges = selectedCarId || plannedDate || plannedCompletionDate || 
      plannedMileage || serviceProvider || planNotes || 
      periodicItems.some(item => item.selected) || repairItems.some(item => item.selected)
    
    if (hasUnsavedChanges) {
      setIsCloseConfirmOpen(true)
    } else {
      handleCloseWithoutSaving()
    }
  }

  const handleSaveAndClose = () => {
    if (!selectedCarId || !plannedDate || !plannedCompletionDate) {
      alert('Выберите автомобиль и укажите даты начала и завершения обслуживания')
      return
    }

    const selectedPeriodicOps = periodicItems.filter(item => item.selected)
    const selectedRepairOps = repairItems.filter(item => item.selected)
    
    if (selectedPeriodicOps.length === 0 && selectedRepairOps.length === 0) {
      alert('Выберите хотя бы одну операцию для планирования')
      return
    }

    // Save the plan first
    const selectedCar = cars.find(c => c.id === selectedCarId)
    
    try {
      const planData: MaintenancePlan = {
        id: editingPlanId || Date.now().toString(),
        carId: selectedCarId,
        carName: selectedCar?.name || 'Неизвестный автомобиль',
        plannedDate,
        plannedCompletionDate,
        plannedMileage,
        periodicOperations: selectedPeriodicOps.map(item => ({
          operation: item.operation,
          selected: true,
          priority: item.priority,
          estimatedCost: item.estimatedCost || 0,
          notes: item.planNotes || item.notes || ''
        })),
        repairOperations: selectedRepairOps.map(item => ({
          alertId: item.alertId,
          description: item.description,
          priority: item.priority,
          estimatedCost: item.estimatedCost || 0,
          notes: item.planNotes || item.notes || ''
        })),
        totalEstimatedCost: calculateTotalCost(),
        serviceProvider,
        notes: planNotes,
        status: 'draft',
        createdAt: editingPlanId 
          ? savedPlans.find(p => p.id === editingPlanId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      let updatedPlans
      if (editingPlanId) {
        updatedPlans = savedPlans.map(plan => 
          plan.id === editingPlanId ? planData : plan
        )
      } else {
        updatedPlans = [...savedPlans, planData]
      }
      
      setSavedPlans(updatedPlans)
      localStorage.setItem('maintenance-plans', JSON.stringify(updatedPlans))

      if (autoSaveInterval) {
        clearInterval(autoSaveInterval)
        setAutoSaveInterval(null)
      }

      alert(`План обслуживания ${editingPlanId ? 'обновлен' : 'сохранен'}!`)
      
      // Close after saving
      handleCloseWithoutSaving()
    } catch (error) {
      console.error('Error saving maintenance plan:', error)
      alert('Ошибка при сохранении плана. Попробуйте еще раз.')
    }
  }

  const handleCloseWithoutSaving = () => {
    clearForm()
    setIsCloseConfirmOpen(false)
    window.location.href = '/'
  }

  const autoSaveDraft = () => {
    if (!selectedCarId || !plannedDate) return

    const selectedPeriodicOps = periodicItems.filter(item => item.selected)
    const selectedRepairOps = repairItems.filter(item => item.selected)
    
    if (selectedPeriodicOps.length === 0 && selectedRepairOps.length === 0) return

    const selectedCar = cars.find(c => c.id === selectedCarId)
    
    try {
      const planData: MaintenancePlan = {
        id: editingPlanId || `draft_${Date.now()}`,
        carId: selectedCarId,
        carName: selectedCar?.name || 'Неизвестный автомобиль',
        plannedDate,
        plannedCompletionDate,
        plannedMileage,
        periodicOperations: selectedPeriodicOps.map(item => ({
          operation: item.operation,
          selected: true,
          priority: item.priority,
          estimatedCost: item.estimatedCost || 0,
          notes: item.planNotes || item.notes || ''
        })),
        repairOperations: selectedRepairOps.map(item => ({
          alertId: item.alertId,
          description: item.description,
          priority: item.priority,
          estimatedCost: item.estimatedCost || 0,
          notes: item.planNotes || item.notes || ''
        })),
        totalEstimatedCost: calculateTotalCost(),
        serviceProvider,
        notes: planNotes,
        status: 'draft',
        createdAt: editingPlanId 
          ? savedPlans.find(p => p.id === editingPlanId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      let updatedPlans
      if (editingPlanId || savedPlans.find(p => p.id === planData.id)) {
        // Update existing plan (including drafts)
        updatedPlans = savedPlans.map(plan => 
          plan.id === planData.id ? planData : plan
        )
      } else {
        // Create new draft
        updatedPlans = [...savedPlans, planData]
        setEditingPlanId(planData.id)
      }
      
      setSavedPlans(updatedPlans)
      localStorage.setItem('maintenance-plans', JSON.stringify(updatedPlans))
      
      console.log('Draft auto-saved')
    } catch (error) {
      console.error('Error auto-saving draft:', error)
    }
  }

  const sendToMaintenance = () => {
    if (!selectedCarId || !plannedDate || !plannedCompletionDate) {
      alert('Выберите автомобиль и укажите даты начала и завершения обслуживания')
      return
    }

    // Check if any operations are selected
    const selectedPeriodicOps = periodicItems.filter(item => item.selected)
    const selectedRepairOps = repairItems.filter(item => item.selected)
    
    if (selectedPeriodicOps.length === 0 && selectedRepairOps.length === 0) {
      alert('Выберите хотя бы одну операцию для планирования')
      return
    }

    setIsConfirmMaintenanceOpen(true)
  }

  const confirmSendToMaintenance = () => {
    setIsSendingToMaintenance(true)
    
    try {
      const selectedCar = cars.find(c => c.id === selectedCarId)
      
      // Create maintenance plan
      const maintenancePlan = {
        id: Date.now().toString(),
        periodicOperations: periodicItems.filter(item => item.selected).map(item => ({
          operation: item.operation,
          selected: true,
          priority: item.priority,
          estimatedCost: item.estimatedCost || 0,
          notes: item.notes || ''
        })),
        repairOperations: repairItems.filter(item => item.selected).map(item => ({
          alertId: item.alertId,
          description: item.description,
          priority: item.priority,
          estimatedCost: item.estimatedCost || 0,
          notes: item.notes || ''
        })),
        totalEstimatedCost: calculateTotalCost(),
        notes: planNotes
      }

      // Create maintenance entry
      const maintenanceEntry = {
        id: Date.now().toString(),
        carId: selectedCarId,
        carName: selectedCar?.name || 'Неизвестный автомобиль',
        carBrand: selectedCar?.brand || '',
        carModel: selectedCar?.model || '',
        plannedDate,
        plannedCompletionDate,
        plannedMileage,
        serviceProvider,
        maintenancePlan,
        addedAt: new Date().toISOString()
      }

      // Add to maintenance list
      const existingMaintenance = JSON.parse(localStorage.getItem('in-maintenance') || '[]')
      const updatedMaintenance = [...existingMaintenance, maintenanceEntry]
      localStorage.setItem('in-maintenance', JSON.stringify(updatedMaintenance))

      // Save the plan as well
      const newPlan: MaintenancePlan = {
        id: maintenancePlan.id,
        carId: selectedCarId,
        carName: selectedCar?.name || 'Неизвестный автомобиль',
        plannedDate,
        plannedCompletionDate,
        plannedMileage,
        periodicOperations: maintenancePlan.periodicOperations,
        repairOperations: maintenancePlan.repairOperations,
        totalEstimatedCost: maintenancePlan.totalEstimatedCost,
        serviceProvider,
        notes: planNotes,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const updatedPlans = [...savedPlans, newPlan]
      setSavedPlans(updatedPlans)
      localStorage.setItem('maintenance-plans', JSON.stringify(updatedPlans))

      // Clear autosave interval
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval)
        setAutoSaveInterval(null)
      }

      // Close dialogs
      setIsConfirmMaintenanceOpen(false)
      setIsSendingToMaintenance(false)

      // Trigger event to update counters
      window.dispatchEvent(new CustomEvent('maintenanceStatusChanged'))

      alert('Автомобиль отправлен на обслуживание!')

      // Clear form and navigate back to home
      clearForm()
      window.location.href = '/'
    } catch (error) {
      console.error('Error sending to maintenance:', error)
      alert('Ошибка при отправке на обслуживание. Попробуйте еще раз.')
      setIsSendingToMaintenance(false)
    }
  }

  // Service shops CRUD operations
  const openAddShopDialog = () => {
    setEditingShopId(null)
    setShopName('')
    setShopContacts('')
    setShopRating(5)
    setIsAddEditShopOpen(true)
  }

  const openEditShopDialog = (shop: ServiceShop) => {
    setEditingShopId(shop.id)
    setShopName(shop.name)
    setShopContacts(shop.contacts)
    setShopRating(shop.rating)
    setIsAddEditShopOpen(true)
  }

  const saveServiceShop = () => {
    if (!shopName.trim() || !shopContacts.trim()) {
      alert('Заполните название и контакты сервиса')
      return
    }

    const shopData: ServiceShop = {
      id: editingShopId || Date.now().toString(),
      name: shopName.trim(),
      contacts: shopContacts.trim(),
      rating: shopRating,
      createdAt: editingShopId 
        ? serviceShops.find(s => s.id === editingShopId)?.createdAt || new Date().toISOString()
        : new Date().toISOString()
    }

    let updatedShops
    if (editingShopId) {
      updatedShops = serviceShops.map(shop => 
        shop.id === editingShopId ? shopData : shop
      )
    } else {
      updatedShops = [...serviceShops, shopData]
    }

    setServiceShops(updatedShops)
    localStorage.setItem('service-shops', JSON.stringify(updatedShops))
    setIsAddEditShopOpen(false)
    
    // Reset form
    setEditingShopId(null)
    setShopName('')
    setShopContacts('')
    setShopRating(5)
  }

  const openDeleteShopDialog = (shop: ServiceShop) => {
    setShopToDelete(shop)
    setIsDeleteShopOpen(true)
  }

  const confirmDeleteShop = () => {
    if (!shopToDelete) return

    const updatedShops = serviceShops.filter(shop => shop.id !== shopToDelete.id)
    setServiceShops(updatedShops)
    localStorage.setItem('service-shops', JSON.stringify(updatedShops))
    
    // If this shop was selected as service provider, clear it
    if (serviceProvider === shopToDelete.name) {
      setServiceProvider('')
    }
    
    setIsDeleteShopOpen(false)
    setShopToDelete(null)
  }

  const exportToPDF = async () => {
    console.log('=== PDF EXPORT DEBUG START ===')
    console.log('selectedCarId:', selectedCarId)
    console.log('cars array:', cars)
    console.log('periodicItems:', periodicItems)
    console.log('repairItems:', repairItems)
    
    // First, let's try to create a very simple test element
    try {
      const testElement = document.createElement('div')
      testElement.innerHTML = 'TEST CONTENT - This should be visible'
      testElement.style.cssText = `
        position: fixed;
        top: 100px;
        left: 100px;
        width: 300px;
        height: 200px;
        background: red;
        color: white;
        font-size: 20px;
        font-weight: bold;
        padding: 20px;
        z-index: 99999;
        border: 5px solid yellow;
      `
      
      document.body.appendChild(testElement)
      console.log('Test element added to DOM')
      
      const testConfirm = confirm('Do you see a red box with yellow border and "TEST CONTENT"? This tests basic DOM manipulation.')
      
      document.body.removeChild(testElement)
      
      if (!testConfirm) {
        alert('Basic DOM test failed. There might be a browser or styling issue.')
        return
      }
      
    } catch (error) {
      console.error('Basic DOM test failed:', error)
      alert('Basic DOM test failed: ' + error.message)
      return
    }

    // Now let's check the data
    if (!selectedCarId) {
      alert('Выберите автомобиль для экспорта плана')
      return
    }

    const selectedCar = cars.find(c => c.id === selectedCarId)
    if (!selectedCar) {
      alert('Автомобиль не найден')
      return
    }

    const selectedPeriodicOps = periodicItems.filter(item => item.selected)
    const selectedRepairOps = repairItems.filter(item => item.selected)
    
    console.log('selectedCar:', selectedCar)
    console.log('selectedPeriodicOps:', selectedPeriodicOps)
    console.log('selectedRepairOps:', selectedRepairOps)
    
    if (selectedPeriodicOps.length === 0 && selectedRepairOps.length === 0) {
      alert('Выберите хотя бы одну операцию для экспорта')
      return
    }

    // Create content step by step
    try {
      console.log('Creating PDF content element...')
      
      const pdfElement = document.createElement('div')
      pdfElement.id = 'pdf-export-content'
      
      // Very simple, highly visible styling
      pdfElement.style.cssText = `
        position: fixed !important;
        top: 50px !important;
        left: 50px !important;
        width: 600px !important;
        height: auto !important;
        background: white !important;
        color: black !important;
        font-family: Arial, sans-serif !important;
        font-size: 14px !important;
        padding: 20px !important;
        border: 5px solid red !important;
        z-index: 999999 !important;
        overflow: visible !important;
      `
      
      // Build content string step by step
      let contentHTML = '<div style="background: white; color: black; padding: 10px;">'
      contentHTML += '<h1 style="color: black;">План технического обслуживания</h1>'
      contentHTML += `<h2 style="color: black;">${selectedCar.name} - ${selectedCar.brand} ${selectedCar.model}</h2>`
      
      contentHTML += '<div style="border: 1px solid black; padding: 10px; margin: 10px 0; background: white;">'
      contentHTML += '<h3 style="color: black;">Основная информация</h3>'
      contentHTML += `<p style="color: black;">Дата начала: ${plannedDate || 'Не указана'}</p>`
      contentHTML += `<p style="color: black;">Дата завершения: ${plannedCompletionDate || 'Не указана'}</p>`
      contentHTML += '</div>'
      
      if (selectedPeriodicOps.length > 0) {
        contentHTML += `<h3 style="color: black;">Периодическое обслуживание (${selectedPeriodicOps.length})</h3>`
        selectedPeriodicOps.forEach((item, index) => {
          contentHTML += `<div style="border: 1px solid gray; padding: 8px; margin: 5px 0; background: #f9f9f9;">`
          contentHTML += `<strong style="color: black;">${index + 1}. ${item.operation || 'Неизвестная операция'}</strong><br/>`
          contentHTML += `<span style="color: black;">Приоритет: ${item.priority || 'Не указан'}</span>`
          contentHTML += '</div>'
        })
      }
      
      if (selectedRepairOps.length > 0) {
        contentHTML += `<h3 style="color: black;">Ремонтные работы (${selectedRepairOps.length})</h3>`
        selectedRepairOps.forEach((item, index) => {
          contentHTML += `<div style="border: 1px solid gray; padding: 8px; margin: 5px 0; background: #f9f9f9;">`
          contentHTML += `<strong style="color: black;">${index + 1}. ${item.description || 'Неизвестная работа'}</strong><br/>`
          contentHTML += `<span style="color: black;">Приоритет: ${item.priority || 'Не указан'}</span>`
          contentHTML += '</div>'
        })
      }
      
      contentHTML += '</div>'
      
      console.log('Content HTML length:', contentHTML.length)
      console.log('Content preview:', contentHTML.substring(0, 200))
      
      pdfElement.innerHTML = contentHTML
      
      console.log('Adding element to DOM...')
      document.body.appendChild(pdfElement)
      
      console.log('Element added. Checking if visible...')
      console.log('Element offsetWidth:', pdfElement.offsetWidth)
      console.log('Element offsetHeight:', pdfElement.offsetHeight)
      console.log('Element style:', pdfElement.style.cssText)
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userConfirm = confirm('Now do you see the red-bordered content box with maintenance plan data?')
      
      if (!userConfirm) {
        console.log('User still cannot see content. Cleaning up...')
        document.body.removeChild(pdfElement)
        alert('Content generation failed. Check browser console for details.')
        return
      }
      
      // If user can see it, proceed with PDF generation
      alert('Great! Content is visible. Now trying PDF generation...')
      
      // Move element to a better position for PDF capture
      pdfElement.style.cssText = `
        position: static !important;
        width: 800px !important;
        height: auto !important;
        background: white !important;
        color: black !important;
        font-family: Arial, sans-serif !important;
        font-size: 14px !important;
        padding: 20px !important;
        margin: 0 !important;
        border: none !important;
        z-index: 1 !important;
        visibility: visible !important;
        display: block !important;
      `
      
      // Wait for reflow
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('Element repositioned for PDF capture')
      console.log('New element dimensions:', pdfElement.offsetWidth, 'x', pdfElement.offsetHeight)
      
      // Try multiple PDF generation approaches
      try {
        console.log('Attempting PDF generation method 1...')
        
      const options = {
          margin: [10, 10, 10, 10],
        filename: `План_ТО_${selectedCar.name.replace(/[^a-zA-Z0-9а-яА-Я\s]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
          image: { 
            type: 'jpeg', 
            quality: 1.0 
          },
        html2canvas: { 
            scale: 2,
          backgroundColor: '#ffffff',
          logging: true,
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            width: pdfElement.offsetWidth,
            height: pdfElement.offsetHeight
        },
        jsPDF: { 
            unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      }

        // Generate PDF with detailed logging
        const worker = html2pdf().set(options).from(pdfElement)
        
        const pdf = await worker.toPdf().get('pdf')
        console.log('PDF generated successfully')
        console.log('PDF page count:', pdf.internal.pages.length - 1)
        console.log('PDF page dimensions:', pdf.internal.pageSize.getWidth(), 'x', pdf.internal.pageSize.getHeight())
        
        // Check if PDF has content
        const pdfData = pdf.output('datauristring')
        console.log('PDF data length:', pdfData.length)
        
        if (pdfData.length < 10000) {
          throw new Error('PDF appears to be empty (too small data size)')
        }
        
        // Save the PDF
        await worker.save()
        console.log('PDF saved successfully')
        
      } catch (pdfError) {
        console.error('PDF generation method 1 failed:', pdfError)
        
        // Try alternative method - create a new clean element
        console.log('Trying PDF generation method 2...')
        
        const cleanElement = document.createElement('div')
        cleanElement.innerHTML = pdfElement.innerHTML
        cleanElement.style.cssText = `
          width: 210mm;
          min-height: 297mm;
          background: white;
          color: black;
          font-family: Arial, sans-serif;
          font-size: 12px;
          padding: 10mm;
          margin: 0;
          box-sizing: border-box;
        `
        
        // Replace current element
        document.body.removeChild(pdfElement)
        document.body.appendChild(cleanElement)
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const simpleOptions = {
          margin: 10,
          filename: `План_ТО_${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'png', quality: 0.98 },
          html2canvas: { 
            scale: 1,
            backgroundColor: '#ffffff',
            logging: false
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
          }
        }
        
        await html2pdf().set(simpleOptions).from(cleanElement).save()
        document.body.removeChild(cleanElement)
        console.log('PDF method 2 completed')
        return // Exit successfully
      }
      
      // Cleanup
      document.body.removeChild(pdfElement)
      console.log('PDF export completed')
      
    } catch (error) {
      console.error('Error in PDF export:', error)
      alert(`Error: ${error.message}`)
      
      // Cleanup
      const tempElement = document.getElementById('pdf-export-content')
      if (tempElement && tempElement.parentNode) {
        tempElement.parentNode.removeChild(tempElement)
      }
    }
    
    console.log('=== PDF EXPORT DEBUG END ===')
  }

  const selectedCar = cars.find(c => c.id === selectedCarId)
  const selectedPeriodicCount = periodicItems.filter(item => item.selected).length
  const selectedRepairCount = repairItems.filter(item => item.selected).length

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  {editingPlanId ? 'Редактирование плана ТО' : 'Планирование ТО'}
                </h1>
                <p className="text-sm text-gray-600">
                  {editingPlanId ? 'Редактирование существующего плана обслуживания' : 'Составление плана периодического и ремонтного обслуживания'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsServiceShopsOpen(true)}
              className="flex items-center space-x-2"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Сервисы</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Planning Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Автомобиль:</p>
                <p className="font-medium">{selectedCar ? selectedCar.name : 'Не выбран'}</p>
              </div>
              <div>
                <p className="text-gray-600">Дата начала:</p>
                <p className="font-medium">{plannedDate || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600">Дата завершения:</p>
                <p className="font-medium">{plannedCompletionDate || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600">Операций:</p>
                <p className="font-medium">{selectedPeriodicCount + selectedRepairCount}</p>
              </div>
              <div>
                <p className="text-gray-600">Оценка стоимости:</p>
                <p className="font-medium text-green-600">{calculateTotalCost().toLocaleString()} ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Planning Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CarIcon className="h-5 w-5 mr-2" />
              Основная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="car">Автомобиль для планирования *</Label>
              <Select value={selectedCarId} onValueChange={setSelectedCarId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите автомобиль..." />
                </SelectTrigger>
                <SelectContent>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.name} - {car.brand} {car.model} ({car.mileage.toLocaleString()} км)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="plannedDate">Плановая дата начала обслуживания *</Label>
                <Input
                  id="plannedDate"
                  type="date"
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="plannedCompletionDate">Планируемая дата завершения обслуживания *</Label>
                <Input
                  id="plannedCompletionDate"
                  type="date"
                  value={plannedCompletionDate}
                  onChange={(e) => setPlannedCompletionDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="plannedMileage">Плановый пробег (км)</Label>
                <Input
                  id="plannedMileage"
                  type="number"
                  value={plannedMileage}
                  onChange={(e) => setPlannedMileage(e.target.value)}
                  placeholder="85000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="serviceProvider">Планируемый исполнитель</Label>
              {serviceShops.length === 0 ? (
                <div className="border rounded-md p-3 bg-gray-50 text-center">
                  <p className="text-sm text-gray-600 mb-2">Нет сохраненных сервисов</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsServiceShopsOpen(true)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Добавить сервис
                  </Button>
                </div>
              ) : (
                <>
                  <Select 
                    value={serviceProvider} 
                    onValueChange={(shopName) => {
                      setServiceProvider(shopName)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сервис из списка..." />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceShops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{shop.name}</span>
                            <div className="flex items-center ml-2">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < shop.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(() => {
                    const selectedShop = serviceProvider ? serviceShops.find(shop => shop.name === serviceProvider) : null
                    return selectedShop ? (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-blue-900">{selectedShop.name}</h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < selectedShop.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                                <span className="ml-1 text-sm text-gray-600">({selectedShop.rating}/5)</span>
                              </div>
                            </div>
                            <p className="text-sm text-blue-800 mb-1">
                              <strong>Контакты:</strong> {selectedShop.contacts}
                            </p>
                            <p className="text-xs text-blue-600">
                              Добавлен: {new Date(selectedShop.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                            onClick={() => setServiceProvider('')}
                            title="Очистить выбор"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : null
                  })()}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Periodic Maintenance Planning */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Периодическое обслуживание ({selectedPeriodicCount} выбрано)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCarId ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Выберите автомобиль для расчета планового ТО</p>
              </div>
            ) : periodicItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <p>Все плановые работы выполнены</p>
                <p className="text-sm">Автомобиль не требует срочного ТО</p>
              </div>
            ) : (
              <div className="space-y-3">
                {periodicItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={(checked) => updatePeriodicItem(index, 'selected', !!checked)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{item.operation}</h4>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority === 'high' ? 'Срочно' :
                             item.priority === 'medium' ? 'Скоро' : 'Плановое'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.notes}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <p>Интервал: {item.mileageInterval?.toLocaleString()} км / {item.timeInterval} мес</p>
                          <p>До ТО: {item.mileageUntilNext?.toLocaleString()} км / {item.monthsUntilNext} мес</p>
                        </div>
                        {item.selected && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="Стоимость (₽)"
                              value={item.estimatedCost || ''}
                              onChange={(e) => updatePeriodicItem(index, 'estimatedCost', parseInt(e.target.value) || 0)}
                            />
                            <Input
                              placeholder="Примечания к плану"
                              value={item.planNotes || ''}
                              onChange={(e) => updatePeriodicItem(index, 'planNotes', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Repair Operations Planning */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Ремонтные работы ({selectedRepairCount} выбрано)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCarId ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Выберите автомобиль для отображения проблем</p>
              </div>
            ) : repairItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <p>Нет активных проблем</p>
                <p className="text-sm">Ремонтные работы не требуются</p>
              </div>
            ) : (
              <div className="space-y-3">
                {repairItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={(checked) => updateRepairItem(index, 'selected', !!checked)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority === 'critical' ? 'Критично' :
                             item.priority === 'unclear' ? 'Непонятно' : 'Можно подождать'}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{item.description}</p>
                        {item.notes && (
                          <p className="text-xs text-gray-600 mb-2">Место: {item.notes}</p>
                        )}
                        {item.selected && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="Стоимость (₽)"
                              value={item.estimatedCost || ''}
                              onChange={(e) => updateRepairItem(index, 'estimatedCost', parseInt(e.target.value) || 0)}
                            />
                            <Input
                              placeholder="Примечания к ремонту"
                              value={item.planNotes || ''}
                              onChange={(e) => updateRepairItem(index, 'planNotes', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Дополнительные заметки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
              placeholder="Особые указания для сервиса, дополнительные работы..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Cost Summary */}
        {(selectedPeriodicCount > 0 || selectedRepairCount > 0) && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Периодическое ТО:</span>
                  <span className="text-blue-600">{periodicItems.filter(item => item.selected).reduce((sum, item) => sum + (item.estimatedCost || 0), 0).toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Ремонтные работы:</span>
                  <span className="text-red-600">{repairItems.filter(item => item.selected).reduce((sum, item) => sum + (item.estimatedCost || 0), 0).toLocaleString()} ₽</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Общая стоимость:</span>
                  <span className="text-xl font-bold text-green-600">{calculateTotalCost().toLocaleString()} ₽</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleClose}
            variant="outline" 
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Закрыть
          </Button>
          <Dialog open={isViewPlansOpen} onOpenChange={setIsViewPlansOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Сохраненные планы ({savedPlans.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Сохраненные планы обслуживания</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {savedPlans.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Нет сохраненных планов</p>
                ) : (
                  savedPlans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{plan.carName}</h4>
                          <p className="text-sm text-gray-600">Начало: {plan.plannedDate}</p>
                          <p className="text-sm text-gray-600">Завершение: {plan.plannedCompletionDate}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge>{plan.status === 'draft' ? 'Черновик' : 'Запланировано'}</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => loadPlanForEditing(plan)}
                            className="text-xs"
                          >
                            Редактировать
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p>Операций: {plan.periodicOperations.length + plan.repairOperations.length}</p>
                        <p>Стоимость: {plan.totalEstimatedCost.toLocaleString()} ₽</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={savePlan} 
            variant="outline"
            className="flex-1" 
            disabled={!selectedCarId || !plannedDate || !plannedCompletionDate || (selectedPeriodicCount === 0 && selectedRepairCount === 0)}
          >
            <Save className="h-4 w-4 mr-2" />
            {editingPlanId ? 'Обновить план' : 'Сохранить план'}
          </Button>
          <Button 
            onClick={exportToPDF} 
            variant="outline"
            className="flex-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800" 
            disabled={!selectedCarId || (selectedPeriodicCount === 0 && selectedRepairCount === 0)}
            title="Экспорт плана в PDF"
          >
            <Download className="h-4 w-4 mr-2" />
            Экспорт в PDF
          </Button>
          <Button 
            onClick={sendToMaintenance} 
            className="flex-1 bg-orange-600 hover:bg-orange-700" 
            disabled={!selectedCarId || !plannedDate || (selectedPeriodicCount === 0 && selectedRepairCount === 0) || isSendingToMaintenance}
          >
            <Wrench className="h-4 w-4 mr-2" />
            {isSendingToMaintenance ? 'Отправка...' : 'Отправить на обслуживание'}
          </Button>
        </div>

        {/* Confirmation Dialog for Sending to Maintenance */}
        <Dialog open={isConfirmMaintenanceOpen} onOpenChange={setIsConfirmMaintenanceOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Подтверждение отправки на обслуживание</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="font-medium">Отправить автомобиль на обслуживание?</p>
                  <p className="text-sm text-gray-600">
                    {selectedCar?.name} будет помечен как находящийся на сервисе
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium mb-1">План обслуживания:</p>
                <p className="text-xs text-gray-600">Операций: {selectedPeriodicCount + selectedRepairCount}</p>
                <p className="text-xs text-gray-600">Дата начала: {plannedDate}</p>
                <p className="text-xs text-gray-600">Дата завершения: {plannedCompletionDate}</p>
                <p className="text-xs text-gray-600">Стоимость: {calculateTotalCost().toLocaleString()} ₽</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsConfirmMaintenanceOpen(false)} disabled={isSendingToMaintenance}>
                  Отмена
                </Button>
                <Button onClick={confirmSendToMaintenance} disabled={isSendingToMaintenance} className="bg-orange-600 hover:bg-orange-700">
                  {isSendingToMaintenance ? 'Отправка...' : 'Да, отправить на обслуживание'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Service Shops List Dialog */}
        <Dialog open={isServiceShopsOpen} onOpenChange={setIsServiceShopsOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Управление сервисами ({serviceShops.length})
                </DialogTitle>
                <Button onClick={openAddShopDialog} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить сервис
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              {serviceShops.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Нет сохраненных сервисов</p>
                  <p className="text-sm">Добавьте автосервисы для быстрого выбора при планировании ТО</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {serviceShops.map((shop) => (
                    <div key={shop.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-lg">{shop.name}</h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < shop.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="ml-1 text-sm text-gray-600">({shop.rating}/5)</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{shop.contacts}</p>
                          <p className="text-xs text-gray-500">
                            Добавлен: {new Date(shop.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditShopDialog(shop)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openDeleteShopDialog(shop)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Service Shop Dialog */}
        <Dialog open={isAddEditShopOpen} onOpenChange={setIsAddEditShopOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingShopId ? 'Редактирование сервиса' : 'Добавление нового сервиса'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shopName">Название сервиса *</Label>
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Название автосервиса..."
                />
              </div>
              <div>
                <Label htmlFor="shopContacts">Контактная информация *</Label>
                <Textarea
                  id="shopContacts"
                  value={shopContacts}
                  onChange={(e) => setShopContacts(e.target.value)}
                  placeholder="Телефон, адрес, email..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="shopRating">Рейтинг</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setShopRating(rating)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          rating <= shopRating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-200'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({shopRating}/5)</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddEditShopOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={saveServiceShop}>
                  {editingShopId ? 'Обновить' : 'Добавить'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Service Shop Confirmation Dialog */}
        <Dialog open={isDeleteShopOpen} onOpenChange={setIsDeleteShopOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Подтверждение удаления</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium">Удалить сервис?</p>
                  <p className="text-sm text-gray-600">
                    Сервис "{shopToDelete?.name}" будет удален навсегда
                  </p>
                </div>
              </div>
              {shopToDelete && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium mb-1">{shopToDelete.name}</p>
                  <p className="text-xs text-gray-600">{shopToDelete.contacts}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < shopToDelete.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDeleteShopOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={confirmDeleteShop} className="bg-red-600 hover:bg-red-700">
                  Да, удалить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Close Confirmation Dialog */}
        <Dialog open={isCloseConfirmOpen} onOpenChange={setIsCloseConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Закрыть план обслуживания</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="font-medium">У вас есть несохраненные изменения</p>
                  <p className="text-sm text-gray-600">Что вы хотите сделать?</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCloseConfirmOpen(false)}>
                  Отмена
                </Button>
                <Button variant="outline" onClick={handleCloseWithoutSaving}>
                  Закрыть без сохранения
                </Button>
                <Button onClick={handleSaveAndClose} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить и закрыть
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
