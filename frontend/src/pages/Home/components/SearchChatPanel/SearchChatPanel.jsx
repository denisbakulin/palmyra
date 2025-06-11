import React, {useState,  useEffect, use} from "react"
import "./SearchChatPanel.css";
import settings from "./images/settings.png"
import sms from "./images/sms.png"
import api from "api/api"
import loup from "./images/loup.png"

function highlightMatch(name, query) {
    if (!query || !name) return name;
    const regex = new RegExp(`(${query})`, 'i')
    const parts = name.split(regex);
  
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} style={{ backgroundColor: 'green'}}>{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
}

export default function SearchChatPanel ({
    setMode,
    mode,
    setWMode, 
    setUserID,
    setSearchInfo,
}) {
    const [searchOption, setSearchOption] = useState("user")
    let user = "filter-option" + (searchOption === "user" ? " fo-active" : "")
    let group = "filter-option" + (searchOption === "chat" ? " fo-active" : "")

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const [showMyChats, setShowMyChats] = useState(true)
    const [showNewChats, setShowNewChats] = useState(true)
    const [isLoad, setIsLoad] = useState(false)

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return;
        }
        setIsLoad(true)
        const delay = setTimeout(async () => {
        try {
            
            const response = await api.get(`${searchOption}/search`, {
                params: {query : query }
            });
            setResults(response.data)
        } catch (error) {
            console.error("Ошибка поиска", error)
        } finally {
            setIsLoad(false)
        }
        }, 500)

        return () => clearTimeout(delay)
    }, [query, searchOption])

    useEffect(()=>setResults([]), [searchOption])


    return (<>
    <div id="search-chat">
        <div className="wrapper-search">
        <div className="search-input">
            <input onChange={(e) => setQuery(e.target.value)} type="text" id="search-chat-input" placeholder="Поиск" autoComplete="off" className="data-input btn" onClick={()=>setMode("search")} value={query}></input>
            <img src={loup} alt="search" className="loup"/>
        </div>
        {mode === "search" ? 
        <img src={sms} alt="chat"  className="navigate-button btn" onClick={()=>setMode("main")}></img>
        :
        <img src={settings}  alt="settings" className="navigate-button btn" onClick={()=>setWMode("home")}></img>
        } 

        </div>
    </div>
    {mode === "search" && <>
        <div id="filter">
            <div className={user} onClick={()=>setSearchOption("user")}>Пользователи</div>
            <div className={group} onClick={()=>setSearchOption("chat")}>Группы</div>
        </div>

        {results.length > 0 ? <>
            {searchOption === "user" ? results.map(e => (
                <div className="search-button btn" onClick={()=>{
                    setUserID(e.id)
                    setWMode("user")
                       
                }}>
                    <img src={e.avatar} alt="ava" className="chat-avatar" />
                    {highlightMatch(e.username, query)}
                </div>
            )): <>
            { results.filter(a => a.member).length > 0 &&  (  
            <>
            <div className="separator btn" onClick={()=>setShowMyChats(prev=>!prev)}>Мои Чаты</div>       
            {showMyChats &&results.filter(a=> a.member).map(chat => (
                <div className="search-button member btn" 
                    key={`ch-${chat.id}`} 
                    onClick={async ()=>{
                    const response = await api.get("chat/", {params: {id: chat.id}})
                    setSearchInfo(response.data)
                    setWMode("searchGroup") 
                }}>
                    <img src={chat.avatar} alt="ava" className="chat-avatar" />
                    {highlightMatch(chat.name, query)}
                </div>)
            )}</>)}
            
            {results.filter(a => !a.member).length > 0 && (<>

            <div className="separator btn" onClick={()=>setShowNewChats(prev=>!prev)}>Новые Чаты</div>
            
            {showNewChats && results.filter(a=> !a.member).map(chat => (
                <div className={`search-button btn`} 
                    key={`ch-${chat.id}`} 
                    onClick={async ()=>{
                    const response = await api.get("chat/", {params: {id: chat.id}})
                    setSearchInfo(response.data)
                    setWMode("searchGroup") 
                }}>
                    <img src={chat.avatar} alt="ava" className="chat-avatar" />
                    {highlightMatch(chat.name, query)}
                </div>
            ))}
            </>
            )}
            </>
        }</>
            : 
            <div className="not-found">{isLoad ? "Загрузка...": "Нет совпадений"}</div>
            
        
        }
    </>}
    </>)
}