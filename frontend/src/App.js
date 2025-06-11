import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "pages/Home/Home"
import Auth from "pages/Auth/Auth"
import {AuthProvider} from './context/AuthContext'


import "assets/css/base.css"
import "assets/css/vars.css"

export default function App() {
  return (
    
    <BrowserRouter>
        <AuthProvider>
                <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<Home />} />
                </Routes>
        </AuthProvider>
    </BrowserRouter>
  

  )
}
