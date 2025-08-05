import { HashRouter, Route, Routes } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import UserAccountPage from './pages/UserAccount'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<UserAccountPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
