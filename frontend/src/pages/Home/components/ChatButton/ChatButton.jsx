import React, {useRef} from "react"
import "./ChatButton.css"


export default function ChatButton ({
        onClick,
        isActive,
        chatName, 
        lastMessage, 
        lastMessageTime,
        avatar
}) {
    const fillingRef= useRef()
    const lastMessageRef= useRef()

    return (
       <div className={`chat-button noselect ${isActive ? "active" : ''}`} onClick={onClick}>
          <img className="chat-avatar" src={avatar} alt="avatar" />
          <div className="chat-filling" ref={fillingRef}>
              <div className="chat-preview-row">
               <p className="chat-name title">{chatName}</p>
               <div className="last-message-time" >{lastMessageTime}</div>
              </div>
              <div className="last-message-wrapper">
                 <div className={`last-message ${
                  lastMessageRef?.current?.scrollWidth > fillingRef?.current?.clientWidth 
                  ? "scroll-on-hover" : "" }`} ref={lastMessageRef}>{lastMessage}
              </div>
              </div>

          </div>
</div>

    )
}
