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
                    <p className="last-message">{lastMessage}</p>
                    <p className="last-message-time">{lastMessageTime}</p>
                </div>

            </div>

        </div>
    )
}
