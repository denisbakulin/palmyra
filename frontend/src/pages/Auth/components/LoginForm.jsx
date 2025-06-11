import { useEffect, useState } from 'react'


import show from "./images/show.png"
import hide from "./images/hide.png"
import user from "./images/user.png"
import { login } from '../../../api/auth'
import { useNavigate } from 'react-router-dom'



export default function LoginForm({setError}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>setError(""),[])
  
  
  
  return (<>
    
    <div style={{ marginBottom: '15px', position: "relative"  }}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="custom-input"
          placeholder="Имя"
        />
        <img src={user} style={{position: "absolute", zIndex: 10,right: "5px", height: "80%", top: "50%", transform: 'translateY(-50%)' }} />
    </div>

    <div style={{ marginBottom: '15px', position: "relative" }}>
        <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="custom-input"
            placeholder="Пароль"
        />
        <img src={showPassword ? hide : show} style={{position: "absolute", zIndex: 10,right: "5px", height: "80%", top: "50%", transform: 'translateY(-50%)',cursor: "pointer"}} onClick={()=>setShowPassword(prev => !prev)} />
    </div>

    <div className="simple-btn btn" style={{backgroundColor: "blue"}} onClick={async ()=>{
        if (!username || !password) {
            setError('Заполните все поля');
            return
        }
        const error = await login(username, password)

        !error ? navigate("/") : setError(error)
        
        }}>Войти</div>
    </>
    
  );
}
