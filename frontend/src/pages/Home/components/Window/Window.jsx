import React, {useEffect, useState,  useRef} from "react"


import "./Window.css"
import back from "./images/back.png"
import setting from "./images/setting.png"


import sun from "./images/sun.png"
import moon from "./images/moon.png"
import chat from "./images/chat.png"

import approve from "./images/approve.png"
import ColorPicker from "./ColorPicker/ColorPicker"
import SizeSlider from "./SizeSlider/SizeSlider"

import api from "api/api"
import ChoseFile from "../ChoseFile/ChoseFile"
import Toast from "components/ui/Toast"

import { logout } from "api/auth"
import pen from "./images/pen.png"
import { parseISO, isValid, format } from 'date-fns'
import { useNavigate } from "react-router-dom"






const HomeElement = ({
     
     setTheme, 
     theme,
     messageColor, 
     setMessageColor,
     messageSize,
     setMessageSize,
     userInfo,
     setUserInfo,
     setChats,
     socket,
     setWMode,
     addNotification,
     setChatID
  
}) => {
    const navigate = useNavigate()
    const [homeMode, setHomeMode] = useState("default")
    const [ustatus, setUStatus] = useState(false)
    const [istatus, setIStatus] = useState(false)
    
    const color = useRef()

    const toggleTheme = () => {
        let t = theme === "light" ? "dark" : "light"
        setTheme(t)
        localStorage.setItem("theme", t)
    }

    const Settings =  () => {
        
        const [username, setUsername] = useState(userInfo.username)
        const [info, setInfo] = useState(userInfo.info)
        const [showSymbs, setShowSymbs] = useState(true)

        return (<>
            <div className="window-title">
                <div id="close-window-button" onClick={() => {
                    setHomeMode("default")
                }}>
                    <img src={back} alt="back btn" className="window-back-button"/>
                </div>
                <div className="avatar-username">
                    <p>Настройки</p>
                </div>
            </div>
            <div className="content">
                <ChoseFile type="user" addNotification={addNotification} setInfo={setUserInfo} info={userInfo} setChats={setChats}/>
                <div className="setting-option">
                    <SizeSlider messageSize={messageSize} setMessageSize={setMessageSize} />
                </div>
               
                <div className="setting-option">
                <ColorPicker initialColor={messageColor} onChange={c=>{color.current=c}}/>
                <img src={approve} alt="approve"  className="s-img btn" onClick={()=>{
                    setMessageColor(color.current)
                    
                    localStorage.setItem("messageColor", color.current)
                }}/>
                </div>
                <div className="setting-option">
                    <div style={{
                            display: 'flex',
                            flexDirection: "column",
                            alignItems: 'center',
                            overflow: "hidden",
                            backgroundColor: 'var(--color1)',
                            borderRadius: '12px',
                            width: "100%",}}>

                        <p style={{
                            backgroundColor: "var(--color2)", 
                            width: "100%",
                            textAlign: "center",
                            fonTsize: "1em",
                            fonTweight: "600",
                            
                        }}>{ustatus ?  <Toast message="Имя обновлено!"  onClose={()=>setUStatus(false)}/>:"Имя"} </p>
                        <input className="setting-input"  type="text" maxLength={20} onInput={e => {
                            setUsername(e.target.value)
                        }} value={username}/>
                       
                    </div>
                    <img src={approve} alt="approve"  className="s-img btn" onClick={()=>{
                        const editUsername = async () => {
                            try {
                                const response = await api.post("user/edit/username", {username: username})
                                if (response.data.ok) {
                                    setUserInfo({...userInfo, username:username})
                                    setUStatus(true)
                                }
                            } catch (e) {
                                if (e?.response?.data?.error) {addNotification("error", e.response.data.error)}
                            }
                        }
                        editUsername()
                        
                       
                    }}/>
                </div>
                

                <div className="setting-option">
                    <div style={{
                            display: 'flex',
                            flexDirection: "column",
                            alignItems: 'center',
                            overflow: "hidden",
                            backgroundColor: 'var(--color1)',
                            borderRadius: '12px',
                            width: "100%",}}>
                        <p style={{
                            backgroundColor: "var(--color2)", 
                            width: "100%",
                            textAlign: "center",
                            fonTsize: "1em",
                            fonTweight: "600",
                         
                        }}>{istatus ?  <Toast message="Информация обновленa!" onClose={()=>setIStatus(false)}/>:"О себе"}</p>
                        <textarea className="info-input"  type="text" maxLength={1000} onInput={e => {
                            setInfo(e.target.value)
                        }} defaultValue={userInfo.info} value={info}></textarea>
                    </div>
                    <img src={approve} alt="approve"  className="s-img btn" onClick={()=>{
                        const editInfo = async () => {
                            const response = await api.post("user/edit/info", {info: info})
                            if (response.data.ok) {
                                setUserInfo({...userInfo, info:info})
                                setIStatus(true)
                            }
                        }
                        editInfo()
                       
                    }}/>
                    
                </div>
                <div className="setting-option">
                <label className="checkbox-container" onClick={e => {
                        setShowSymbs(e.target.checked)
                        if (showSymbs) {}
                    }}>
                    <input type="checkbox" checked={showSymbs} />
                    <span className="checkmark"></span>
                    Показывать количество символов
                </label>
                </div>
                

                <div className="a">
                <div className="btn red" onClick={()=>{
                        localStorage.clear()
                        setTheme("dark")
                        setMessageColor("--var(1)")
                        setMessageSize(15)
                        addNotification("success", "Настройки сброшены!")
                    }}>

                    <span>Сбросить настройки</span>
                </div>
                
                <div className="btn red" onClick={() => {
                    logout()
                    navigate("/auth")
                }}> 
                    <span>Выйти из аккаунта</span>
                </div>

                </div>
            </div>
        </>)
    }
   
    const Default = () => {
        
        return (<>
        <div className="window-title">
            <div id="close-window-button" onClick={() => setWMode("none")}>
                <img src={back} alt="back btn" className="window-back-button"/>
            </div>
            <div className="avatar-username">
                <img src={userInfo.avatar} alt="avatar" className="avatar" id="user-dialog-avatar" />
                <p className="username-title" id="user-dialog-name">{userInfo?.username}</p>
            </div>
        </div>
        <div className="content">
            <div className="options">
                <div className="window-option btn" onClick={()=>setHomeMode("settings")}>
                    <img src={setting} alt="settings" className="opt-img" />
                    <span>Настройки</span> 
                </div>
                <div className="window-option btn" onClick={()=>setHomeMode("createChat")}>
                    <img src={chat} alt="create chat" className="opt-img"/>
                    <span>Создать чат</span>
                </div>
                <div className="window-option btn" onClick={toggleTheme}>
                    <img src={theme === "dark" ? sun : moon} alt="theme" className="opt-img" />
                    <span>Сменить тему</span>
                </div>
    
                <p className="gradient-text" style={{fontSize: "1.4em"}}>userID:  {userInfo?.id}</p>
            </div>
        </div>
        </>)
    }

    const CreateChat = () => {
        const chatName = useRef()
        const [isPrivate, setIsPrivate] = useState(false)
        return (<>
            <div className="window-title">
                <div id="close-window-button" onClick={() => {
                    setHomeMode("default")
                }}>
                    <img src={back} alt="back btn" className="window-back-button"/>
                </div>
                <div className="avatar-username">
                    <p>Создать чат</p>
                </div>
            </div>
            <div className="content">
                <div className="setting-option">
                    <input className="custom-input"  placeholder="Название чата" maxLength={20} ref={chatName}/>
                </div>
                <label className="checkbox-container" style={{marginRight: "auto"}} onClick={e => setIsPrivate(e.target.checked)}>
                    <input type="checkbox" checked={isPrivate}/>
                    <span className="checkmark"></span>
                    Приватный чат
                </label>
                
                <div className="setting-option">

                    <div className="btn simple-btn" onClick={()=> {
                        
                        const fetchUser = async () => {    
                            try {
                                const data = await api.post("chat/", {name: chatName.current.value, private: isPrivate, type:"group"})
                                const response = await api.get("user/")
                                response.data.chats.map(chat => socket.emit("join_to_room", chat.id))
                                setChats(response.data.chats)
                                setWMode("none")
                                setChatID(data.data.cid)
                                addNotification("success", "Чат успешно создан!", 7000)
                            } catch (error) { }
                        }
                        fetchUser()
                    }} >
                        Создать чат
                    </div>
                </div>    
            </div>
        </>)
    }
    
   

    if (homeMode === "default") return <Default />
    if (homeMode === "settings") return <Settings />
    if (homeMode === "createChat") return <CreateChat />
}

const GroupElement = ({
    setWMode, 
    chatInfo,
    setUserID,
    setChatInfo,
    socket,
    setChatID,
    setChats,
    addNotification,
    userInfo
}) => {
    
    const [value, setValue] = useState("")
    const [isAll, setIsAll] = useState(false)
    const [res, setRes] = useState([])
    const [showSettings, setShowSettings] = useState(false)

    useEffect(() => {
        if (!value.trim() || isAll) {
            setRes([]);
        return;
        }

        const delay = setTimeout(async () => {
        try {
            const response = await api.get(`user/search`, {
                params: {query : value }
            });
            setRes(response.data)
        } catch (error) {
            console.error("Ошибка поиска", error)
        }
        }, 500)

        return () => clearTimeout(delay)
    }, [value])

    const update = () =>{
        const fetchUser = async () => {
          try {
            const response = await api.get("chat/", {params:{id: chatInfo.id}})
            
            setChatInfo({...response.data.chat, users: response.data.users})
    
          } catch (error) {}
        }
        fetchUser()
    }

    const removeUser = async id => {
        const response = await api.post("chat/remove", {uid: id, cid: chatInfo.id})
        socket.emit("rem", id, chatInfo.id)
        setChatInfo({...chatInfo, users: response.data})
        addNotification("success", "Пользователь был удален!")
    }

    return (<>
        <div className="window-title">
            <div id="close-window-button" onClick={() => {
                setWMode("none")
            }}>
                <img src={back} alt="back btn" className="window-back-button"/>
            </div>
            <div className="avatar-username">
                <img src={chatInfo.avatar} alt="avatar" className="avatar" id="user-dialog-avatar" />
                <div className="username-title gradient-text">{chatInfo.name}</div>
            </div>
        </div>
        <div className="content">
           
            {chatInfo.private && <div className="info-area" style={{backgroundColor: "rgba(255, 0, 38, 0.32)"}}>
                Приватный чат
            </div>}

            <div className="info-area btn" onClick={e=>{
                
                setShowSettings(prev => !prev)
                
            }} style={{display: "flex", flexDirection: "column"}}>
                
                <p>Настройки</p>
                {showSettings && <>
                    <ChoseFile type="chat" addNotification={addNotification} info={chatInfo} setInfo={setChatInfo} setChats={setChats}/>
                    <div style={{marginTop: "0.5em"}} className="red" onClick={()=>{
                    const leaveFromGroup = async () => {
                        socket.emit("leave", chatInfo.id)
                        const response = await api.post("chat/leave", {cid: chatInfo.id})
                        setWMode("none")
                        setChats(response.data.chats)
                        setChatID(0)
                        addNotification("success", "Вы вышли из чата!")
                    }
                    leaveFromGroup()
                }}>Выйти из чата</div>
                
                </>}
                
                
            </div>
            
            <div  className="search-res">Участники чата</div> 
            <div className="users">
            
                {chatInfo.users.sort((a, b) => {
                    if (a.id === chatInfo.admin) return -1
                    if (b.id === chatInfo.admin) return 1
                    return 0
                    }).map(user => 
                    <div className={`user-btn btn ${chatInfo.admin === user.id ? "admin" : ""}`}  key={`user-${user.id}`} onClick={() =>{
                        setWMode("user")
                        console.log(user.avatar)
                        setUserID(user.id)
                    }   
                    }> <img src={user.avatar} alt="user ava" className="chat-avatar"/>
                        {user.username}
                    {chatInfo.admin === user.id && <span style={{marginLeft: "auto"}}>админ</span>}
                    {chatInfo.admin === userInfo.id && chatInfo.admin !== user.id && <span style={{marginLeft: "auto"}} 
                    onClick={e => {
                        e.stopPropagation()
                        removeUser(user.id)}}>удалить</span>
                    }
                    </div>
                )}
                
            </div>
            
            
            <div className="input-wrapper">
                <input className="custom-input"  placeholder="Добавить по имени" value={value}  onChange={e => {
                    setValue(e.target.value)
                    setIsAll(false)
                }}/>
                <img className="s-img btn" src={approve} onClick={() => {
                const req = async () => {
                    const res = await api.post("chat/add", {
                        username: value, 
                        cid: chatInfo.id
                    })

                    socket.emit("chat", res.data.uid)
                }
                req()
                update()
                setValue("")
            }} />
            </div>
            
            {res.filter(e => {
                return !chatInfo.users.find(w => e.id === w.id)
            }).length === 0 && !!(value.length) && !isAll ? <p className="no-res">Ничего не найдено  </p> : <>
            {!!res?.length && <>
                <p className="search-res">Результаты поиска</p>
                <div className="users">
                {res?.map(e => {
                    if (!chatInfo.users.find(w => e.id === w.id))
                        return (
                            <div className="user-btn btn" onClick={()=>{
                                setRes([])
                                setIsAll(true)
                                setValue(e.username)
                            }}>
                                <img src={e.avatar} alt="user ava" className="chat-avatar"/>
                                {e.username}
                            </div>
                        )}
                )} 
                </div >
                </>
                }
            
            </> 
            
            }

            
            {chatInfo.id && <div className="info-area" style={{marginTop: "auto"}}><p className="gradient-text">chatID ~ {chatInfo.id}</p></div>}
        </div>
        
       

    </>)

}


const UserElement = ({
    setWMode, 
    userID,
    prevMode,
    setChatID,
    socket,
    addNotification
    
}) => {
    const [info, setInfo] = useState({})
    
    useEffect(()=>{
        const fetchUser = async () => {
            const response = await api.get(`user/${userID}`)
            console.log(response.data)
            setInfo(response.data.user)
            
        }
        fetchUser()
    },[])

    const openChat = () => {
       const open = async () => {
           setWMode("none")
           try {
                const response = await api.post("chat/", {
                    uid: info.id,
                    type: "user"
                })
                const data = response.data
                if (data.ok) {
                    data.users.map(id => socket.emit("chat", id))
                    console.log(data)
                    setChatID(data.cid)
            }
           } catch (error) {
                addNotification("info", error.response.data.error, 10000)
           }
            
            
          }
       open()
      
    } 

    return (<>
        <div className="window-title">
            <div id="close-window-button" onClick={() => {
                setWMode(prevMode)
            }}>
                <img src={back} alt="back btn" className="window-back-button"/>
            </div>
            <div className="avatar-username">
                <img src={info.avatar} alt="avatar" className="avatar" id="user-dialog-avatar" />
                <p className="username-title" id="user-dialog-name">{info.username}</p>
            </div>
            
            <img src={pen} className="open-chat btn" onClick={openChat}/>
        
        </div>
        <div className="content">
            {info.info && 
            <div className="info-area">
                {info.info}
            </div>}
            <div className="info-area" style={{width: "100%"}}>
                {info.date && isValid(parseISO(info.date)) && <>
                    {new Date(info.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </>}
                

            </div>
            <div className="info-area" style={{width: "100%"}}> 
                <p className="gradient-text">userID ~ {info.id}</p>
            </div>

        </div>    
    </>)
}
const SearchGroupElement = ({
    setWMode,
    searchInfo,
    setUserID,
    setChatID,
    socket,
    userInfo

}) => {
    
    const openChat = () => {
        setChatID(searchInfo.chat.id)
        setWMode("none")
    }
    
    const joinToGroup = async () => {
        await api.post("chat/join", {cid: searchInfo.chat.id})
        socket.emit("chat", userInfo.id)
        setWMode("none")
        setChatID(searchInfo.chat.id)

    }

    return (<>
    <div className="window-title">
        <div id="close-window-button" onClick={() => {
            setWMode("none")
        }}>
            <img src={back} alt="back btn" className="window-back-button"/>
        </div>
        <div className="avatar-username">
            <img src={back} alt="avatar" className="avatar" id="user-dialog-avatar" />
            <p className="username-title" id="user-dialog-name">{searchInfo.chat.name}</p>
        </div>
        {searchInfo.member && <img src={pen} className="open-chat btn" onClick={openChat}/>}
    </div>
    <div className="content">
         {searchInfo.member ? <>
            <div className="search-res">Участники чата</div> 
            <div className="users">
                {searchInfo.users.map(user => 
                    <div className="user-btn btn" key={`user-${user.id}`} onClick={() =>{
                        setWMode("user")
                        setUserID(user.id)
                    }   
                    }>{user.username}

                    </div>
                )}
            </div>
            <div className="simple-btn btn" style={{width: "100%"}} onClick={openChat}>Открыть чат</div>
         </> : <>
            <div className="info-area">Участники: {searchInfo.users.length}</div>
            <div className="simple-btn btn" style={{width: "100%"}} onClick={joinToGroup}>Вступить</div>
         </>}
        <div className="info-area" style={{marginTop: "auto"}}><p className="gradient-text">chatID ~ {searchInfo.chat.id}</p></div>
    </div>
    
    </>
    )
}

export default function Window ({
    
    theme, 
    setTheme, 
    messageColor, 
    setMessageColor,
    setMessageSize,
    messageSize,
    userInfo,
    setUserInfo,
    chatInfo,
    userID,
    setUserID,
    setChatInfo,
    prevMode,
    socket,
    setChats,
    setChatID,
    wMode, 
    setWMode,
    setMessages,
    addNotification,
    searchInfo
 
}) {
    return (

        <div id="window">
            
            {wMode === "home" && 
                <HomeElement
                    setTheme={setTheme} 
                    theme={theme} 
                    wMode={wMode}
                    setWMode={setWMode}
                    messageColor={messageColor}
                    setMessageColor={setMessageColor}
                    messageSize={messageSize}
                    setMessageSize={setMessageSize}
                    userInfo={userInfo}
                    setUserInfo={setUserInfo}
                    setChats={setChats}
                    socket={socket}
                    addNotification={addNotification}
                    setChatID={setChatID}
                    />
            }
            {wMode === "group" && 
                <GroupElement 
                    setWMode={setWMode} 
                    chatInfo={chatInfo} 
                    setUserID={setUserID}
                    setChatInfo={setChatInfo}
                    socket={socket}
                    setChatID={setChatID}
                    setChats={setChats}
                    addNotification={addNotification}
                    userInfo={userInfo}
                    />
            }
             {wMode === "searchGroup" && 
                <SearchGroupElement
                    setWMode={setWMode} 
                    searchInfo={searchInfo}
                    setUserID={setUserID}
                    setChatID={setChatID}
                    socket={socket}
                    userInfo={userInfo}
                    />
            }


            {wMode === "user" && 
                <UserElement 
                    userID={userID} 
                    setWMode={setWMode} 
                    prevMode={prevMode} 
                    setChatID={setChatID} 
                    setMessages={setMessages}
                    socket={socket}
                    chatInfo={chatInfo}
                    addNotification={addNotification}
                    

                />
            }

        </div>
    )
}