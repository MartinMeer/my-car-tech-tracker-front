/**
 * Commercial landing page for car maintenance tracking application
 * Implements tiered business model with Starter, Pro, and Enterprise plans
 * Supports Russian and English languages
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { AppNavigation } from '../components/AppNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Car, 
  Users, 
  Building2, 
  CheckCircle, 
  Zap, 
  Crown, 
  ArrowRight,
  BarChart3,
  Shield,
  Settings,
  Smartphone,
  Calendar,
  TrendingUp,
  FileText,
  AlertTriangle,
  DollarSign,
  Languages
} from 'lucide-react';

export default function Home() {
  /**
   * Language state management for Russian/English toggle
   */
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');

  /**
   * Translation object containing all text content
   */
  const translations = {
    ru: {
      // Header
      languageToggle: 'EN',
      heroTitle: 'От личных авто до корпоративных автопарков',
      heroSubtitle: 'Система учёта обслуживания автомобилей, которая растёт вместе с вашим бизнесом',
      heroTag: '🚗 Комплексное решение для управления автопарком',
      
      // Value proposition cards
      starterTitle: 'СТАРТЕР БЕСПЛАТНО',
      starterDesc: 'Идеально для личного управления автомобилями',
      proTitle: 'ПРО БИЗНЕС',
      proDesc: 'Создан для растущего бизнеса',
      enterpriseTitle: 'КОРПОРАТИВНЫЙ АВТОПАРК',
      enterpriseDesc: 'Полное управление автопарком',
      mostPopular: 'Самый популярный',

      // Starter section
      starterBadge: 'СТАРТЕР ПЛАН - БЕСПЛАТНО',
      starterHeadline: 'Начните свой путь - Идеально для личного и малого бизнеса',
      starterSubheadline: 'Организуйтесь, экономьте деньги, защищайте свои инвестиции',
      
      // Starter features
      multiVehicle: 'Управление несколькими автомобилями',
      multiVehicleDesc: 'Управляйте своим личным автопарком без усилий',
      maintenanceHistory: 'Отслеживание истории обслуживания',
      maintenanceHistoryDesc: 'Никогда не теряйте записи о сервисе',
      costTracking: 'Учёт расходов',
      costTrackingDesc: 'Точно знайте, сколько вы тратите',
      mileageMonitoring: 'Мониторинг пробега',
      mileageMonitoringDesc: 'Отслеживайте каждый километр автоматически',
      smartAlerts: 'Умные уведомления',
      smartAlertsDesc: 'Никогда не пропускайте важное обслуживание',
      digitalRecords: 'Цифровые записи сервиса',
      digitalRecordsDesc: 'Безбумажное управление обслуживанием',

      // Pro section
      proBadge: 'ПРО БИЗНЕС ПЛАН',
      proHeadline: 'Масштабируйте операции - Создан для роста бизнеса',
      proSubheadline: 'Профессиональное управление автопарком без сложности корпоративных решений',
      
      // Pro features
      driverManagement: 'Управление водителями и разрешениями',
      driverManagementDesc: 'Контролируйте, кто имеет доступ к чему',
      complianceTracking: 'Отслеживание соответствия требованиям',
      complianceTrackingDesc: 'Всегда готовы к проверкам',
      fleetDashboard: 'Панель управления автопарком',
      fleetDashboardDesc: 'Обзор автопарка в реальном времени',
      advancedAnalytics: 'Расширенная аналитика',
      advancedAnalyticsDesc: 'Решения на основе данных',
      predictiveMaintenance: 'ИИ предиктивного обслуживания',
      predictiveMaintenanceDesc: 'Предотвращайте поломки до их возникновения',
      fuelEfficiency: 'Отслеживание топливной эффективности',
      fuelEfficiencyDesc: 'Оптимизируйте операционные расходы',
      warrantyManagement: 'Управление гарантиями',
      warrantyManagementDesc: 'Никогда не пропускайте гарантийные случаи',
      driverNotifications: 'Автоматические уведомления водителей',
      driverNotificationsDesc: 'Держите всех в курсе',

      // Enterprise section
      enterpriseBadge: 'КОРПОРАТИВНЫЙ ПЛАН',
      enterpriseHeadline: 'Полные операции автопарка - Корпоративные решения',
      enterpriseSubheadline: 'Полный контроль автопарка с корпоративными функциями для крупных операций',
      
      // Enterprise features
      roiAnalysis: 'ROI и анализ затрат по автомобилям',
      roiAnalysisDesc: 'Максимизируйте прибыльность автопарка',
      downtimeTracking: 'Отслеживание простоев',
      downtimeTrackingDesc: 'Минимизируйте потерю продуктивности',
      complianceStorage: 'Хранение документов соответствия',
      complianceStorageDesc: 'Документация готовая для аудита',
      aiScheduling: 'ИИ-планирование обслуживания',
      aiSchedulingDesc: 'Оптимальное использование автопарка',
      mobileApp: 'Мобильное приложение для водителей',
      mobileAppDesc: 'Расширьте возможности ваших водителей',
      businessIntelligence: 'Отчётность бизнес-аналитики',
      businessIntelligenceDesc: 'Стратегические инсайты автопарка',

      // Pricing
      proPrice: '2900₽/месяц за 10 автомобилей',
      preorderPrice: 'Предзаказ: 1900₽/месяц',
      customPricing: 'Индивидуальное ценообразование',
      customPricingDesc: 'Индивидуальные решения для размера и требований вашего автопарка',
      
      // Value propositions
      starterValue: 'Сэкономьте сотни на забытом обслуживании',
      proValue: 'ROI окупается за счёт сокращения поломок',
      enterpriseValue: 'Оптимизируйте миллионы в операциях автопарка',

      // CTAs
      startFree: 'Начать бесплатно',
      joinPro: 'Присоединиться к Pro',
      joinProWaitlist: 'Встать в очередь Pro',
      scheduleDemo: 'Запланировать демо',
      watchDemo: 'Посмотреть демо',
      
      // CTA descriptions
      noCardRequired: 'Кредитная карта не требуется • Настройка за 2 минуты',
      roiPayback: 'ROI окупается за счёт сокращения поломок',
      optimizeMillions: 'Оптимизируйте миллионы в операциях автопарка',

      // Social proof
      socialProofTitle: 'Нам доверяют автовладельцы по всему миру',
      vehiclesTracked: 'Автомобилей уже отслеживается',
      avgSavings: 'Средняя экономия пользователя в год',
      uptime: 'Надёжность работы',

      // Final CTA
      finalCtaTitle: 'Готовы трансформировать управление вашими автомобилями?',
      finalCtaSubtitle: 'Присоединяйтесь к тысячам довольных пользователей, которые больше не пропускают обслуживание'
    },
    en: {
      // Header
      languageToggle: 'RU',
      heroTitle: 'From Personal Cars to Professional Fleets',
      heroSubtitle: 'The car maintenance tracker that grows with your business',
      heroTag: '🚗 The Complete Vehicle Management Solution',
      
      // Value proposition cards
      starterTitle: 'FREE STARTER',
      starterDesc: 'Perfect for personal vehicle management',
      proTitle: 'PRO BUSINESS',
      proDesc: 'Built for growing businesses',
      enterpriseTitle: 'ENTERPRISE FLEET',
      enterpriseDesc: 'Complete fleet operations',
      mostPopular: 'Most Popular',

      // Starter section
      starterBadge: 'STARTER PLAN - FREE',
      starterHeadline: 'Start Your Journey - Perfect for Personal & Small Operations',
      starterSubheadline: 'Get organized, save money, protect your investment with our core features',
      
      // Starter features
      multiVehicle: 'Multi-Vehicle Management',
      multiVehicleDesc: 'Manage your personal fleet effortlessly',
      maintenanceHistory: 'Maintenance History Tracking',
      maintenanceHistoryDesc: 'Never lose a service record again',
      costTracking: 'Cost Tracking',
      costTrackingDesc: 'Know exactly what you\'re spending',
      mileageMonitoring: 'Mileage Monitoring',
      mileageMonitoringDesc: 'Track every mile automatically',
      smartAlerts: 'Smart Alerts',
      smartAlertsDesc: 'Never miss important maintenance',
      digitalRecords: 'Digital Service Records',
      digitalRecordsDesc: 'Paperless maintenance management',

      // Pro section
      proBadge: 'PRO BUSINESS PLAN',
      proHeadline: 'Scale Your Operations - Built for Business Growth',
      proSubheadline: 'Professional fleet management without the enterprise complexity',
      
      // Pro features
      driverManagement: 'Driver Management & Permissions',
      driverManagementDesc: 'Control who accesses what',
      complianceTracking: 'Compliance Tracking',
      complianceTrackingDesc: 'Stay regulation-ready',
      fleetDashboard: 'Business Fleet Dashboard',
      fleetDashboardDesc: 'Real-time fleet overview',
      advancedAnalytics: 'Advanced Analytics',
      advancedAnalyticsDesc: 'Data-driven fleet decisions',
      predictiveMaintenance: 'Predictive Maintenance AI',
      predictiveMaintenanceDesc: 'Prevent breakdowns before they happen',
      fuelEfficiency: 'Fuel Efficiency Tracking',
      fuelEfficiencyDesc: 'Optimize operational costs',
      warrantyManagement: 'Warranty Management',
      warrantyManagementDesc: 'Never miss a warranty claim',
      driverNotifications: 'Automated Driver Notifications',
      driverNotificationsDesc: 'Keep everyone informed',

      // Enterprise section
      enterpriseBadge: 'ENTERPRISE PLAN',
      enterpriseHeadline: 'Complete Fleet Operations - Enterprise-Grade Solutions',
      enterpriseSubheadline: 'Complete fleet control with enterprise-grade features for large operations',
      
      // Enterprise features
      roiAnalysis: 'ROI & Cost Analysis Per Vehicle',
      roiAnalysisDesc: 'Maximize fleet profitability',
      downtimeTracking: 'Operational Downtime Tracking',
      downtimeTrackingDesc: 'Minimize lost productivity',
      complianceStorage: 'Compliance Documentation Storage',
      complianceStorageDesc: 'Audit-ready documentation',
      aiScheduling: 'AI-Powered Maintenance Scheduling',
      aiSchedulingDesc: 'Optimal fleet utilization',
      mobileApp: 'Driver Mobile App',
      mobileAppDesc: 'Empower your drivers',
      businessIntelligence: 'Business Intelligence Reporting',
      businessIntelligenceDesc: 'Strategic fleet insights',

      // Pricing
      proPrice: '$29/month per 10 vehicles',
      preorderPrice: 'Pre-order: $19/month',
      customPricing: 'Custom Pricing',
      customPricingDesc: 'Tailored solutions for your fleet size and requirements',
      
      // Value propositions
      starterValue: 'Save hundreds in forgotten maintenance',
      proValue: 'ROI pays for itself in reduced breakdowns',
      enterpriseValue: 'Optimize millions in fleet operations',

      // CTAs
      startFree: 'Start Free Today',
      joinPro: 'Join Pro',
      joinProWaitlist: 'Join Pro Waitlist',
      scheduleDemo: 'Schedule Demo',
      watchDemo: 'Watch Demo',
      
      // CTA descriptions
      noCardRequired: 'No credit card required • Setup in 2 minutes',
      roiPayback: 'ROI pays for itself in reduced breakdowns',
      optimizeMillions: 'Optimize millions in fleet operations',

      // Social proof
      socialProofTitle: 'Trusted by Vehicle Owners Everywhere',
      vehiclesTracked: 'Vehicles Already Tracked',
      avgSavings: 'Average User Saves Per Year',
      uptime: 'Uptime Reliability',

      // Final CTA
      finalCtaTitle: 'Ready to Transform Your Vehicle Management?',
      finalCtaSubtitle: 'Join thousands of satisfied users who never miss maintenance again'
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top Navigation */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        {/* App Navigation (Login/Register or User Menu) */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg p-2">
          <AppNavigation />
        </div>
        
        {/* Language Toggle Button */}
        <Button
          onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white/95"
        >
          <Languages className="w-4 h-4 mr-2" />
          {t.languageToggle}
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          {/* Hero Image */}
          <div className="mb-12">
            <img 
              src="https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/688f32372b2b5e92a4f370db/resource/57cd4290-9da9-4085-8dbd-42a0f50a0fa0.jpg" 
              alt="Professional fleet management"
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl object-cover h-80"
            />
          </div>

          <div className="mb-8">
            <Badge variant="secondary" className="mb-4 text-sm font-medium">
              {t.heroTag}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {language === 'ru' ? (
                <>
                  От личных авто до 
                  <span className="text-blue-600"> корпоративных автопарков</span>
                </>
              ) : (
                <>
                  From Personal Cars to 
                  <span className="text-blue-600"> Professional Fleets</span>
                </>
              )}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Value Proposition Ladder */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="relative border-2 border-green-200 hover:border-green-300 transition-colors">
              <CardHeader className="text-center">
                <div className="mb-4">
                  <img 
                    src="https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/688f32372b2b5e92a4f370db/resource/0c9d5a13-fcba-4d15-99bd-0e5ed345eb15.jpg" 
                    alt="Personal car maintenance"
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <Car className="mx-auto h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-green-700">{t.starterTitle}</CardTitle>
                <CardDescription>{t.starterDesc}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 border-orange-200 hover:border-orange-300 transition-colors transform scale-105">
              <CardHeader className="text-center">
                <div className="mb-4">
                  <img 
                    src="https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/688f32372b2b5e92a4f370db/resource/8f538948-55df-40ae-8747-768a554c495f.jpg" 
                    alt="Business fleet management"
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <Users className="mx-auto h-12 w-12 text-orange-600" />
                </div>
                <CardTitle className="text-orange-700">{t.proTitle}</CardTitle>
                <CardDescription>{t.proDesc}</CardDescription>
              </CardHeader>
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500">
                {t.mostPopular}
              </Badge>
            </Card>

            <Card className="relative border-2 border-purple-200 hover:border-purple-300 transition-colors">
              <CardHeader className="text-center">
                <div className="mb-4">
                  <img 
                    src="https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/688f32372b2b5e92a4f370db/resource/e97eaae0-29a6-46eb-8941-f62df5e2b616.jpg" 
                    alt="Enterprise fleet operations"
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <Building2 className="mx-auto h-12 w-12 text-purple-600" />
                </div>
                <CardTitle className="text-purple-700">{t.enterpriseTitle}</CardTitle>
                <CardDescription>{t.enterpriseDesc}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Starter Plan Features */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-800 mb-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t.starterBadge}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.starterHeadline}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.starterSubheadline}
            </p>
            
            {/* Feature demonstration image */}
            <div className="mt-8 mb-8">
              <img 
                src="https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/688f32372b2b5e92a4f370db/resource/8e472add-c4bc-4968-b1bc-eab0851a67e0.jpg" 
                alt="Car maintenance tracking dashboard"
                className="w-full max-w-3xl mx-auto rounded-xl shadow-lg object-cover h-64"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Car, title: t.multiVehicle, desc: t.multiVehicleDesc },
              { icon: FileText, title: t.maintenanceHistory, desc: t.maintenanceHistoryDesc },
              { icon: DollarSign, title: t.costTracking, desc: t.costTrackingDesc },
              { icon: BarChart3, title: t.mileageMonitoring, desc: t.mileageMonitoringDesc },
              { icon: AlertTriangle, title: t.smartAlerts, desc: t.smartAlertsDesc },
              { icon: Smartphone, title: t.digitalRecords, desc: t.digitalRecordsDesc }
            ].map((feature, index) => (
              <Card key={index} className="bg-white border-green-200">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-green-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              {t.startFree}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-500 mt-2">{t.noCardRequired}</p>
          </div>
        </div>
      </section>

      {/* Pro Business Plan */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-orange-100 text-orange-800 mb-4">
              <Zap className="w-4 h-4 mr-2" />
              {t.proBadge}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.proHeadline}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.proSubheadline}
            </p>

            {/* Business dashboard mockup */}
            <div className="mt-8 mb-8">
              <img 
                src="https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/688f32372b2b5e92a4f370db/resource/8a6de63e-3464-4140-9cf6-abe4a67b3fc7.jpg" 
                alt="Business fleet dashboard analytics"
                className="w-full max-w-4xl mx-auto rounded-xl shadow-lg object-cover h-64"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Users, title: t.driverManagement, desc: t.driverManagementDesc },
              { icon: Shield, title: t.complianceTracking, desc: t.complianceTrackingDesc },
              { icon: BarChart3, title: t.fleetDashboard, desc: t.fleetDashboardDesc },
              { icon: TrendingUp, title: t.advancedAnalytics, desc: t.advancedAnalyticsDesc },
              { icon: Settings, title: t.predictiveMaintenance, desc: t.predictiveMaintenanceDesc },
              { icon: DollarSign, title: t.fuelEfficiency, desc: t.fuelEfficiencyDesc },
              { icon: FileText, title: t.warrantyManagement, desc: t.warrantyManagementDesc },
              { icon: AlertTriangle, title: t.driverNotifications, desc: t.driverNotificationsDesc }
            ].map((feature, index) => (
              <Card key={index} className="border-orange-200 hover:border-orange-300 transition-colors">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-orange-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center bg-orange-50 rounded-2xl p-8">
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">{language === 'ru' ? '2900₽' : '$29'}</span>
              <span className="text-gray-600">{language === 'ru' ? '/месяц за 10 автомобилей' : '/month per 10 vehicles'}</span>
              <Badge className="ml-3 bg-orange-500">{t.preorderPrice}</Badge>
            </div>
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white mb-4">
              {t.joinProWaitlist}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-600">{t.roiPayback}</p>
          </div>
        </div>
      </section>

      {/* Enterprise Plan */}
      <section className="py-16 px-4 bg-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-800 mb-4">
              <Crown className="w-4 h-4 mr-2" />
              {t.enterpriseBadge}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.enterpriseHeadline}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.enterpriseSubheadline}
            </p>

            {/* Enterprise visualization */}
            <div className="mt-8 mb-8">
              <img 
                src="https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/688f32372b2b5e92a4f370db/resource/fd0853cb-9c16-4c89-a625-8986e7fff01c.jpg" 
                alt="Enterprise fleet analytics and reporting"
                className="w-full max-w-4xl mx-auto rounded-xl shadow-lg object-cover h-64"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: TrendingUp, title: t.roiAnalysis, desc: t.roiAnalysisDesc },
              { icon: AlertTriangle, title: t.downtimeTracking, desc: t.downtimeTrackingDesc },
              { icon: FileText, title: t.complianceStorage, desc: t.complianceStorageDesc },
              { icon: Settings, title: t.aiScheduling, desc: t.aiSchedulingDesc },
              { icon: Smartphone, title: t.mobileApp, desc: t.mobileAppDesc },
              { icon: BarChart3, title: t.businessIntelligence, desc: t.businessIntelligenceDesc }
            ].map((feature, index) => (
              <Card key={index} className="bg-white border-purple-200">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-purple-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center bg-white rounded-2xl p-8 border-2 border-purple-200">
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">{t.customPricing}</span>
              <p className="text-gray-600 mt-2">{t.customPricingDesc}</p>
            </div>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white mb-4">
              {t.scheduleDemo}
              <Calendar className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-600">{t.optimizeMillions}</p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          {/* Background image for social proof */}
          <div className="relative mb-12">
            <img 
              src="https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/688f32372b2b5e92a4f370db/resource/ec6b070a-49eb-4e9c-9ffb-f1785aa81f4d.jpg" 
              alt="Satisfied customers with their vehicles"
              className="w-full h-48 object-cover rounded-xl opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-3xl font-bold text-white z-10">{t.socialProofTitle}</h2>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">1,000+</div>
              <p className="text-gray-300">{t.vehiclesTracked}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">{language === 'ru' ? '50 000₽' : '$500'}</div>
              <p className="text-gray-300">{t.avgSavings}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">99%</div>
              <p className="text-gray-300">{t.uptime}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t.finalCtaTitle}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t.finalCtaSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              {t.startFree}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-gray-300">
              {t.watchDemo}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}