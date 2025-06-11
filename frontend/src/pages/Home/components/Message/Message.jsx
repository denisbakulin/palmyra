import React, {useState} from "react"
import "./Message.css"
import logo from "./images/icon2.jpg"
import { parseISO, isValid, format } from 'date-fns';
import {motion} from "framer-motion"
import copy from "./images/copy.png"
import Toast from "components/ui/Toast"


const messageVariants = {
    hidden: {
        opacity: 0.3,
        y: 60,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
    transition:{
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 25,
    }
    },
};


export default function Message ({
    isMyMessage,
    user,
    message,
    setWMode,
    messageColor, 
    messageSize, 
    type,
    setUserID,
    onClick,
    flag
}) {
    const [isCopied, setIsCopied] = useState(false)
   
    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            setIsCopied(true)
        } catch (err) {
            console.error("Ошибка при копировании:", err)
        }
    };
    
    function getTextColor(backgroundColor) {
        let hex = backgroundColor.replace('#', '');
        
        
        if (hex.length === 3) {
          hex = hex.split('').map(c => c + c).join('');
        }
        
     
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
        return brightness > 128 ? '#000000' : '#ffffff';
      }

    return (<>
    
    
    { (user.id === 1) ? 
        <div style={{display: "flex", width:"100%", justifyContent: "center"}} onClick={type==="start"? onClick: ()=>{}}>
            <div className="system"> 
                <p>{message.content}</p>  
            </div> 
        </div>
    :
    <motion.div 
        
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        className={`message-body ${
        isMyMessage
        ? "my-message-body"
        : ""
    } `}
        style={flag ? {marginBottom: "0.5em"} : {}} >
        
        
        
        
        <div className={`message ${isMyMessage ? "my-message" : ""} ${!flag ? "prev" : ""}`} style={{
            backgroundColor: messageColor,
            fontSize: Number(messageSize),

        }} >
           
            {isCopied && <Toast message="Скопировано!" onClose={()=>setIsCopied(false)}></Toast>}
            {!isMyMessage && flag &&
            <img src={user.avatar} className="user-icon btn" alt="avatar" 
            onClick={() => {
                setWMode("user")
                setUserID(user.id)    
            }}/>}
            
            <div className="message-title">
                <span className="sent-time">{
                isValid(parseISO(message.sent_time)) ? 
                format(parseISO(message.sent_time), 'HH:mm') : ""}</span>
                <span className="username">{user.username}</span>
                <img src={copy} className="btn" style={{height: "100%", marginLeft: "auto"}} onClick={()=>handleCopy(message.text)}/>
                
            </div>
            
            <div className="message-text" style={{
                
            }}>
                {message.content?.split("\n").map((str, id) =>
                    <p style={{whiteSpace: 'pre-wrap', color: getTextColor(messageColor),}} key={`${message.id}-${id}`}>{str}</p>
                )}
            </div>
            <div className="additions">
                {message?.additions?.map(add => (
                    <div className="image-item">
                        <img src={logo} className="image btn" />
                    </div>
                ))}
                
            </div>
            
        </div>
    </motion.div>
    }
    </>
    )
}