import { useMemo, useState } from 'react';




export default function NotificationsProvider()  {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message, duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message, duration }])
    
    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }



  return { notifications, addNotification, removeNotification };
}