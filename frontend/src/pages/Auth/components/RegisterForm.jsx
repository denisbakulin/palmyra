import { useState, useEffect } from 'react'

import show from "./images/show.png"
import hide from "./images/hide.png"
import user from "./images/user.png"
import { registration } from '../../../api/auth'
import { useNavigate } from 'react-router-dom'


function RegisterForm({setError}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
 
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()


  useEffect(()=>setError(""),[])

  const handleSubmit = async () => {
    
    
   
    if (!username || !password || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    const error = await registration(username, password)
    !error ? navigate("/") : setError(error);
    

  };

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
        <img src={showPassword ? hide : show} style={{position: "absolute", zIndex: 10,right: "5px", height: "80%", top: "50%", transform: 'translateY(-50%)',cursor: "pointer" }} onClick={()=>setShowPassword(prev => !prev)} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="custom-input"
          placeholder="Повторите пароль"
        />
      </div>
      
      <div className="simple-btn btn"
        onClick={handleSubmit}
      >
        Зарегистрироваться
      </div>
  
  </>
    
    
  );
}

export default RegisterForm