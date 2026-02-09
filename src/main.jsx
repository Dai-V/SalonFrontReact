
import { createRoot } from 'react-dom/client'
import { useNavigate, Routes, Route, BrowserRouter } from "react-router-dom"
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import './index.css'
import App from './App.jsx'
import Main from './pages/Main.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={< LoginPage />} />
      <Route path="/login" element={< LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/main" element={<Main />} />
    </Routes>
    <App />
  </BrowserRouter>,
)
