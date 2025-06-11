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
          <img className="chat-avatar" src={avatar} alt="avatar" />
          <div className="chat-filling">
              <div className="chat-preview-row">
               <p className="chat-name title">{chatName}</p>
               <div className="last-message-time">{lastMessageTime}</div>
              </div>
                <div className="last-message">{lastMessage}</div>

  </div>
</div>

    )
}
