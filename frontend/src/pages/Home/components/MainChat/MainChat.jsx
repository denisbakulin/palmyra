import React, { useRef, useEffect, useState} from "react"
import "./MainChat.css"
import MessageConsole from "../MessageConsole/MessageConsole"
import Message from "../Message/Message"
import api from "@api/api"
import back from "./back.png"
import load from "@img/load.gif"

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
    chatOpenKey
}) {
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const chatRef = useRef(null)
    const [m,setM ] = useState([])
    const [initialLoaded, setInitialLoaded] = useState(false);

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

        const newMessages = response.data.messages;
        const existingIds = new Set(messages.map(m => m.message.id));
        const uniqueNewMessages = newMessages
            .reverse()
            .filter(m => !existingIds.has(m.message.id));

        setMessages(prev => [...uniqueNewMessages, ...prev]);
        setHasMore(response.data.has_more)


        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const newScrollHeight = chatContainer.scrollHeight;
                chatContainer.scrollTop = newScrollHeight - scrollHeightBefore;
            });
        });

        setLoading(false);
    };

    const handleScroll = () => {
        if (chatRef.current.scrollTop <= 50 && !loading && hasMore) {
            fetchMessages();
        }
    }


    useEffect(() => {
        setHasMore(true);
        setMessages([]);
        setLoading(true);
        setInitialLoaded(false);

        const loadInitialMessages = async () => {
            const response = await api.get("msg/", {
                params: {
                    chat_id: chatID,
                    offset: 0,
                    count: 20,
                },
            });

            const newMessages = response.data.messages.reverse();
            const formatted = newMessages.map(m => ({ message: m.message, user: m.user }));

            // сначала только сохраняем
            setMessages(formatted);
            setHasMore(response.data.has_more)
        };

        if (chatID) {
            loadInitialMessages();
        }
    }, [chatOpenKey]);






    useEffect(() => {
        if (!chatRef.current || !chatID) return;

        const chatContainer = chatRef.current;
        const position = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;

        const isNearBottom = position < 200;
        if (isNearBottom) {
            requestAnimationFrame(() => {
                messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }

        // Удаляем дубликаты
        setM([...new Map(messages.map((msg) => [msg.message.id, msg])).values()])
    }, [messages]);

    useEffect(() => {
        if (!chatRef.current || !chatID || messages.length === 0 || initialLoaded) return;

        // ждём полной отрисовки DOM
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const chatContainer = chatRef.current;
                chatContainer.scrollTop = chatContainer.scrollHeight;
                setInitialLoaded(true);  // теперь можно показывать
                setLoading(false);
            });
        });
    }, [messages]);

    
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


          <div className="chat-content" ref={chatRef} onScroll={handleScroll} style={{ visibility: initialLoaded ? "visible" : "hidden"}}>
               {loading && hasMore && <img src={load} alt="load" style={{height: "3em"}}/>}
            {m?.map((msg, idx) => {
                const nextMessage = messages[idx+1]
                const flag = nextMessage && nextMessage.user.id !== msg.user.id || idx === m.length-1
                return (
                    <Message
                        message={msg.message}
                        user={msg.user}
                        key={`msg-${msg.message.id}`}
                        messageColor={messageColor}
                        messageSize={messageSize}
                        isMyMessage={userInfo.id === msg.user.id}
                        setWMode={setWMode}
                        setUserID={setUserID}
                        isMobile={isMobile}
                        flag={flag}
                    />
                )
            })}
              {messages.length === 0 && !loading &&
                     <Message user={{id:1}}
                              message={{content:"Начните общение: 'Привет!'"}}
                              socket={socket}
                              chatID={chatID}
                              onClick={sendMessage}/>}
            <div ref={messagesEnd}></div>
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