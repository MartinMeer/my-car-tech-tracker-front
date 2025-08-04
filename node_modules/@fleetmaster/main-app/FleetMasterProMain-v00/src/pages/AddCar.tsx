/**
 * Add new car form page with comprehensive vehicle information input
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { ArrowLeft, Upload, Car } from 'lucide-react'

export default function AddCar() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    vin: '',
    plateNumber: '',
    mileage: '',
    purchasePrice: '',
    nickname: '',
    notes: ''
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  const popularBrands = [
    'Toyota', 'Mercedes-Benz', 'BMW', 'Volkswagen', 'Ford', 'Hyundai',
    'Nissan', 'Renault', 'Peugeot', 'Skoda', 'Audi', 'Mazda', 'Honda',
    'Volvo', 'KIA', 'Mitsubishi', 'Lada', 'УАЗ', 'ГАЗ', 'КАМАЗ'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const required = ['brand', 'model', 'year', 'vin']
    return required.every(field => formData[field as keyof typeof formData].trim() !== '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alert('Пожалуйста, заполните все обязательные поля')
      return
    }

    // In real app, would submit to API
    console.log('Submitting car data:', formData)
    console.log('Image file:', imageFile)
    
    // Navigate back to home
    navigate('/')
  }

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
              <h1 className="text-lg font-bold text-gray-900">Добавить новый автомобиль</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="brand">Марка *</Label>
                <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите марку" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="model">Модель *</Label>
                <Input
                  id="model"
                  placeholder="Например: Camry, Sprinter"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="year">Год выпуска *</Label>
                <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите год" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vin">VIN *</Label>
                <Input
                  id="vin"
                  placeholder="17-символьный VIN код"
                  maxLength={17}
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Техническое состояние</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mileage">Пробег на момент приобретения (км)</Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="85000"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Пробег контролируется динамическим монитором и может быть обновлен позже
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Дополнительная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="plateNumber">Гос. номер</Label>
                <Input
                  id="plateNumber"
                  placeholder="А123БВ199"
                  value={formData.plateNumber}
                  onChange={(e) => handleInputChange('plateNumber', e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <Label htmlFor="purchasePrice">Цена приобретения (₽)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="1500000"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="nickname">Придумай имя!</Label>
                <Input
                  id="nickname"
                  placeholder="Мой надежный помощник"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="image">Загрузи свою картинку</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Нажмите для загрузки фото</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Примечания</Label>
                <Textarea
                  id="notes"
                  placeholder="Дополнительная информация об автомобиле..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Отмена
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={!validateForm()}>
              Добавить автомобиль
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}