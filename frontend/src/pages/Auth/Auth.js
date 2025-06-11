import React, { useState } from "react"
import RegisterForm from "./components/RegisterForm"
import LoginForm from "./components/LoginForm"
import Toast from "components/ui/Toast"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./Auth.css"


export default function Auth () {
    const [activeTab, setActiveTab] = useState('login')
    const [error, setError] = useState('')
    const { isAuth, isLoading } = useAuth()

    
        
    if (isAuth) {
        return <Navigate to="/"/>;
    }
    
    return (
        <div className="auth">
            
            <div className="auth-window">
                <p className="auth-title">Авторизация</p>
                <div className="tabs-container">
                
                    <div
                        className={`tab-button ${activeTab === 'login' ? 'activee' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                    Вход
                    </div>
                    <div className={`tab-button ${activeTab === 'register' ? 'activee' : ''}`}
                        onClick={() => setActiveTab('register')}> Регистрация
                    </div>
                </div>
                {activeTab === 'login' ? <LoginForm setError={setError}/> : <RegisterForm setError={setError}/>} 
                <div style={{position: "absolute", top:"-2em", right: "50%", translate: "50%", width: "100%"}}>
                    {error && <Toast message={error} onClose={()=>setError("")} color="#ff3333" bg=""/>}
                </div>
            </div>
            

        </div>)    

}