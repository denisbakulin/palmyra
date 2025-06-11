import React, {useEffect, useRef, useState} from "react"
import "./MessageConsole.css"

import smile from "./images/smiley.png"
import sent from "./images/sent.png"
import remove from "./images/delete.png"
import api from "api/api"
import {motion} from "framer-motion"
import EmojiPicker from "../EmojiPicker/EmojiPicker"
import down from "./images/down.png"


export default function MessageConsole ({
    chatID,
    socket,
    messagesEnd
}) {
    
    const [files, setFiles] = useState([])
    const input = useRef(null)
    const [value, setValue] = useState("")

    useEffect(()=>{
        input.current.focus()
        input.current.value = ""
        setValue("")
    },[chatID])

    const sendMessage = () => {
        const send = async () => {
            try {
                const response = await api.post("msg/", {
                    chat_id: chatID,
                    content: value
                })
                console.log(response.data)
                socket.current.emit("send_message", chatID)
            } catch {}
        }
        if (value.trim()){
            send()
            input.current.setSelectionRange(0, 0)
            input.current.focus()
            input.current.style.height = "auto"
            setValue("")
            

            
        }
        
        
    }  
    const [showPicker, setShowPicker] = useState(false);

    function validateFiles (e) {
        let arr = []
        for (let file of Array.from(e.target.files)) {
            if (file.size < 5 * 1024 * 1024) arr.push(file)
        }

        setFiles(prev => [...arr, ...prev].slice(0, 6))
    }

    return (
        <div id="message-console">
            <img src={down} className="btn" alt="down" style={{
                position: "absolute",
                top: "-1em", 
                translate: "0% -100%", 
                height:"3em",
                right: "2em"
            }} onClick={()=>messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "start" }) }/>
            {showPicker && <EmojiPicker onClose={()=>setShowPicker(false)} onSelect={a=>setValue(prev => prev + a)}/>}
            
            <img src={remove}  className={`btn ${!value && "hidee"}`} id="cross" alt="reset text" onClick={() => {
                setValue("")
                input.current.style.height = "100%"
    
            }}/>
            {value &&
            <div className="limit">
                {value.length}/1000
            </div>}
            
            <textarea  value={value} placeholder="Сообщение..." id="writer" autoFocus="" autoComplete="off" maxLength="1000"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={e => {
                e.target.style.height = e.target.scrollHeight + "px"
                
                if (e.key === "Enter" && !e.shiftKey) { 
                    e.preventDefault();
                    sendMessage() 
    
                }
            }} ref={input}>
                
            </textarea>
            
            
    
            <div id="send-options">
                <img src={sent} className={`writer-option btn ${!value && "hidee"}`} alt="sent message" onClick={() => sendMessage()} />
                <img src={smile} className="writer-option btn" alt="smile button" onClick={()=>setShowPicker(!showPicker)}/>
            </div>
            
        </div>
    )
}