
import { createRoot } from 'react-dom/client'
import { useNavigate, Routes, Route, BrowserRouter } from "react-router-dom"
import Login from './components/auth/Login.jsx'
import Signup from './components/auth/Signup.jsx'
import VerifyEmail from './components/auth/VerifyEmail.jsx'
import ForgotPassword from './components/auth/ForgotPassword.jsx'
import ResetPassword from './components/auth/ResetPassword.jsx'
import './index.css'
import App from './App.jsx'
import Main from './pages/Main.jsx'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={< Main />} />
      <Route path="/login" element={< Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/main" element={<Main />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/verify-email' element={<VerifyEmail />} />
      <Route path='/reset-password' element={<ResetPassword />} />
    </Routes>
    <App />
  </BrowserRouter>,
)
