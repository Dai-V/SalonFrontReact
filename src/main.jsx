
import { createRoot } from 'react-dom/client'
import { useNavigate, Routes, Route, BrowserRouter } from "react-router-dom"
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import './index.css'
import App from './App.jsx'
import Dashboard from './pages/Dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={< LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
    <App />
  </BrowserRouter>,
)
