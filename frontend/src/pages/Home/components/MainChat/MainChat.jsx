import React, { useRef, useEffect, useState} from "react"
import "./MainChat.css"
import MessageConsole from "../MessageConsole/MessageConsole"
import Message from "../Message/Message"
import api from "api/api"
import back from "./back.png"

export default function MainChat ({
    setWMode, 
    messageColor, 
    messageSize,
    messages,
    setMessages,
    chatID,
    socket,
    messagesEnd,
    userInfo,
    chatInfo,
    setUserID,
    setChatID,
    isMobile,
}) {
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const chatRef = useRef(null)
    const [m,setM ] = useState([])
   

    const fetchMessages = async (count = 15) => {
        if (loading || !hasMore) return;
        setLoading(true);
      
        const chatContainer = chatRef.current;
        const scrollHeightBefore = chatContainer.scrollHeight;
        const offset = messages.length;
      
        const response = await api.get("msg/", {
          params: {
            chat_id: chatID,
            offset,
            count,
          },
        });
      
        const newMessages = response.data.messages
        setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id))
          
            const uniqueNewMessages = newMessages
              .reverse()
              .filter(m => !existingIds.has(m.message.id))
          
            return [...uniqueNewMessages, ...prev]
        })
      
       
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
            const newScrollHeight = chatContainer.scrollHeight;
            chatContainer.scrollTop = newScrollHeight - scrollHeightBefore
            })
        })
      
        setLoading(false);
    };
    const handleScroll = () => {
        if (chatRef.current.scrollTop <= 100 && !loading && hasMore) {
            fetchMessages();
        }
    }

    useEffect(()=>{
        setHasMore(true)
        setTimeout(() => {
            messagesEnd.current?.scrollIntoView({ behavior: "instant", block: "start" });
        }, 50)
        
        
    },[chatID])

    

    

    useEffect(()=>{
        if (!chatRef.current || !chatID) return
        requestAnimationFrame(() => {
            const chatContainer = chatRef.current
            const threshold = 200; 
            const position = chatContainer?.scrollHeight - chatContainer?.scrollTop - chatContainer?.clientHeight;
           
            if (position < threshold) {
                requestAnimationFrame(() => {
                    messagesEnd.current?.scrollIntoView({ behavior: "instant", block: "start" }) 
                  });
            }
        })
        setM([...new Map(messages.map((msg) => [msg.message.id, msg])).values()])
        
    },[messages])
    
    const sendMessage = () => {
        const send = async () => {
            try {
                api.post("msg/", {
                    chat_id: chatID,
                    content: "привет!"
                })
                
            } catch {}
        }
        send()
        socket.current.emit("send_message", chatID)
    }  
    const onClickHeader =() => {
        setWMode(chatInfo.type)
        console.log(chatInfo)
        if (chatInfo.type === "group") {
            setChatID(chatID)
            
        } else if (chatInfo.type === "user") {
            setUserID(chatInfo.uid)
        }
    }


    return (
        <div className="main-chat">
            {chatID ? <>
            <div className="chat-header">
                {isMobile && <img src={back} className="back" onClick={()=>setChatID(0)} />}
                <p className="chat-namee btn" onClick={onClickHeader}>{chatInfo.name}</p>
                
            </div>
            
            
            <div className="chat-content" ref={chatRef} onScroll={handleScroll}>
                
                {m?.map((msg, idx)=> {
                    const nextMessage = messages[idx+1]
                    const flag = nextMessage && nextMessage.user.id !== msg.user.id || idx === m.length-1
                    return (
                    <Message
                        message={msg.message} 
                        user={msg.user}
                        key={`msg-${msg.message.id}`}
                        messageColor={messageColor}
                        messageSize={messageSize} 
                        isMyMessage={userInfo.id == msg.user.id}
                        setWMode={setWMode}
                        setUserID={setUserID}
                        isMobile={isMobile}  
                        flag={flag} 
                    />)})}

                <div ref={messagesEnd} key={-1}></div>
                {!messages.length && !loading &&
                     <Message user={{id:1}} type="start"message={{content:"Начните общение: 'Привет!'"}} socket={socket} chatID={chatID} onClick={sendMessage}/>}
                   
            </div>   
            <MessageConsole socket={socket} setMessages={setMessages} chatID={chatID} messagesEnd={messagesEnd} /></>
            :  <div style={{
                backgroundColor: "var(--color1)",
                paddingInline: "1em",
                paddingBlock: "0.5em",
                zIndex: 4,
                borderRadius: "1.5em"
            }}>Начните общение!</div> }
            
        </div>
    )
}