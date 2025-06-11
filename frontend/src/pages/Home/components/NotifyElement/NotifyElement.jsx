
import React, {useRef, useEffect, useState} from "react";
import "./NotifyElement.css"
import del from "./delete.png"


export default function NotifyElement({ id, type, message, removeNotification, duration = 5000 }) {
  const timerRef = useRef();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timerRef.current);
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    removeNotification(id)
  };

  if (!isVisible) return null
  
  return (
    <div className={`notification ${type}`} style={{ animationDuration: `${duration}ms` }}>
      <div className="notification-content">
        {message}
        <img src={del} className="close-notify btn" onClick={()=>removeNotification(id)}/>
      </div>
      <div 
        className="notification-progress" 
        style={{ animationDuration: `${duration}ms` }}/>
    </div>
    
  )

}

