import React from "react";
import SearchChatPanel from "../SearchChatPanel/SearchChatPanel"
import ChatButton from "../ChatButton/ChatButton"
import { isValid, parseISO, format } from "date-fns";

export default function ChatConsole({
    setMode,
    mode,
    prevMode,
    setWMode,
    wMode, 
    chatID,
    setChatID,
    setUserID,
    chats,
    setSearchInfo
}) {
    return (
        <div className="chat-console">   
            <SearchChatPanel 
                setMode={setMode} 
                mode={mode} 
                
                prevMode={prevMode} 
                setWMode={setWMode} 
                wMode={wMode} 
                setUserID={setUserID}
                setSearchInfo={setSearchInfo}
            />
            {mode !== "search" && 
            chats?.sort((a, b) => {
            const timeA = Date.parse(a.last_message_time);
            const timeB = Date.parse(b.last_message_time);
            
            if (isNaN(timeA)) return 1;
            if (isNaN(timeB)) return -1;
            
            return  timeB - timeA;
            }).map( _chat => 
            <ChatButton 
                avatar={_chat.avatar}
                chatName={_chat.name} 
                lastMessage={_chat.last_message} 
                lastMessageTime={isValid(parseISO(_chat.last_message_time)) ? format(parseISO(_chat.last_message_time), 'HH:mm') : ""} 
                onClick={() => {setChatID(_chat.id); console.log(chatID)}}
                isActive={chatID === _chat.id}
                key={_chat.id}
                
                />
            )}
    </div>
    )
}
