import React from "react"
import "./ChatButton.css"


export default function ChatButton ({
        onClick,
        isActive,
        chatName, 
        lastMessage, 
        lastMessageTime,
        avatar
}) {
    return (
        <div className={`chat-button noselect ${isActive ? "active" : ''}`} onClick={onClick}>
            <img className="chat-avatar" src={avatar} alt="avatar"/>
            <div className="chat-filling">
                <div style={{width: "100%"}}>
                    
                    <div className="title">
                        <span className="chat-name">{chatName}</span>
                    </div>
                    <p className="last-message">{lastMessage}</p>
                </div>
                <p className="last-message-time">{lastMessageTime}</p>
            </div>

        </div>
    )
}
