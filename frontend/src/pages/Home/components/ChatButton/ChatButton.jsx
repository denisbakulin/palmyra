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
                <p className="chat-name title">{chatName}</p>
                <div style={{width: "100%", display: "flex"}}>
                    <div className="last-message">{lastMessage}</div>
                    <div className="last-message-time">{lastMessageTime}</div>
                </div>

            </div>

        </div>
    )
}
