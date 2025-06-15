import React, {useEffect, useRef, useState} from "react"
import "./MessageConsole.css"

import smile from "./images/smiley.png"
import sent from "./images/sent.png"
import remove from "./images/delete.png"
import api from "@api/api"

import EmojiPicker from "../EmojiPicker/EmojiPicker"
import down from "./images/down.png"


export default function MessageConsole ({
    chatID,
    messagesEnd
}) {

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
                await api.post("msg", {
                    chat_id: chatID,
                    content: value
                })
            } catch {}
        }
        if (value.trim()){
            send()
            input.current.setSelectionRange(0, 0)
            input.current.focus()
            input.current.style.height = "auto"
            setValue("")}
    }  
    const [showPicker, setShowPicker] = useState(false);

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