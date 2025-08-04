/**
 * User alert creation form for reporting vehicle problems and issues
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { ArrowLeft, AlertTriangle, Save, X } from 'lucide-react'

export default function UserAlert() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    carId: '',
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    system: '',
    location: '',
    priority: '',
    description: ''
  })

  // Mock car data - in real app would fetch from API
  const cars = [
    { id: '1', name: 'Транспорт #1', brand: 'Toyota', model: 'Camry' },
    { id: '2', name: 'Грузовик #2', brand: 'Mercedes', model: 'Sprinter' }
  ]

  const systemOptions = [
    'Двигатель',
    'Трансмиссия', 
    'Подвеска',
    'Тормозная система',
    'Рулевое управление',
    'Электрика',
    'Система охлаждения',
    'Топливная система',
    'Выхлопная система',
    'Салон',
    'Кузов',
    'Другое (указать)'
  ]

  const priorityOptions = [
    {
      value: 'critical',
      icon: '🔴',
      emoji: '🙏',
      title: 'Совсем плохо/совсем страшно',
      description: 'Критическая проблема, требующая немедленного внимания'
    },
    {
      value: 'unclear', 
      icon: '🟡',
      emoji: '🤷‍♀️',
      title: 'Непонятно',
      description: 'Проблема неясного характера, требует диагностики'
    },
    {
      value: 'can-wait',
      icon: '🔵', 
      emoji: '✍️',
      title: 'Потерпим',
      description: 'Незначительная проблема, можно отложить'
    }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    const required = ['carId', 'date', 'system', 'priority', 'description']
    return required.every(field => formData[field as keyof typeof formData].trim() !== '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alert('Пожалуйста, заполните все обязательные поля')
      return
    }

    // Get existing alerts from localStorage
    const existingAlerts = JSON.parse(localStorage.getItem('fleet-alerts') || '[]')
    
    // Create new alert
    const newAlert = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      status: 'active',
      carName: cars.find(c => c.id === formData.carId)?.name || 'Неизвестный автомобиль'
    }
    
    // Save to localStorage
    localStorage.setItem('fleet-alerts', JSON.stringify([...existingAlerts, newAlert]))
    
    // Navigate to alert list
    navigate('/alerts')
  }

  const selectedCar = cars.find(c => c.id === formData.carId)

  return (
    <div className="min-h-screen bg-gray-50">
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
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Сообщи о проблеме
              </h1>
              <p className="text-sm text-gray-600">Запишите замеченную неисправность для последующего анализа</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Автомобиль:</p>
                  <p className="font-medium">{selectedCar ? selectedCar.name : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Дата:</p>
                  <p className="font-medium">{formData.date || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Пробег:</p>
                  <p className="font-medium">{formData.mileage || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Car Selection */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="car">Выберите автомобиль *</Label>
                <Select value={formData.carId} onValueChange={(value) => handleInputChange('carId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите автомобиль..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.name} - {car.brand} {car.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Дата обнаружения *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="mileage">Пробег на момент обнаружения (км)</Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="85000"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Problem Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Где замечена неисправность</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="system">Выберите систему *</Label>
                <Select value={formData.system} onValueChange={(value) => handleInputChange('system', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите систему..." />
                  </SelectTrigger>
                  <SelectContent>
                    {systemOptions.map((system) => (
                      <SelectItem key={system} value={system}>
                        {system}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Укажите место неисправности</Label>
                <Input
                  id="location"
                  placeholder="Опишите конкретное место..."
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Priority Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Приоритет проблемы</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
                className="space-y-3"
              >
                {priorityOptions.map((option) => (
                  <div key={option.value} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-lg">{option.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <label htmlFor={option.value} className="cursor-pointer">
                          <p className="font-medium">{option.title}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Problem Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Описание проблемы</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="description">Подробное описание *</Label>
                <Textarea
                  id="description"
                  placeholder="Опишите проблему максимально подробно..."
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 символов
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <X className="h-4 w-4 mr-2" />
                Не сохранять
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={!validateForm()}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}