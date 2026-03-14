
import { createRoot } from 'react-dom/client'
import { useNavigate, Routes, Route, BrowserRouter } from "react-router-dom"
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import './index.css'
import App from './App.jsx'
import Main from './pages/Main.jsx'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={< Main />} />
      <Route path="/login" element={< LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/main" element={<Main />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
    </Routes>
    <App />
  </BrowserRouter>,
)
