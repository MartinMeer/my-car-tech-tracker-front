/**
 * Main application component with routing configuration for FleetMasterPro
 */
import { HashRouter, Route, Routes } from 'react-router'
import { AuthHandler } from './components/AuthHandler'
import { DevTools } from './components/DevTools'
import { DemoModeNotice } from './components/DemoModeNotice'
import HomePage from './pages/Home'
import CarOverview from './pages/CarOverview'
import AddCar from './pages/AddCar'
import UserAlert from './pages/UserAlert'
import AlertList from './pages/AlertList'
import AddServiceRecord from './pages/AddServiceRecord'
import ServiceHistory from './pages/ServiceHistory'
import MaintenancePlanning from './pages/MaintenancePlanning'
import InMaintenance from './pages/InMaintenance'

export default function App() {
  return (
    <AuthHandler>
      <DemoModeNotice />
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/car/:id" element={<CarOverview />} />
          <Route path="/add-car" element={<AddCar />} />
          <Route path="/edit-car/:id" element={<AddCar />} />
          <Route path="/user-alert" element={<UserAlert />} />
          <Route path="/alerts" element={<AlertList />} />
          <Route path="/add-service-record" element={<AddServiceRecord />} />
          <Route path="/service-history" element={<ServiceHistory />} />
          <Route path="/maintenance-planning" element={<MaintenancePlanning />} />
          <Route path="/maintenance-planning/:planId" element={<MaintenancePlanning />} />
          <Route path="/in-maintenance" element={<InMaintenance />} />
        </Routes>
      </HashRouter>
      
      {/* Development tools - only visible in development */}
      <DevTools />
    </AuthHandler>    
  )
}