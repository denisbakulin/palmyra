import React, { useState, useEffect, useRef } from "react";

import "./Home.css";

import { io } from "socket.io-client";
import api from "@api/api";
import { parseISO, isValid } from "date-fns";
import { useAuth } from "@context/AuthContext";
import { Navigate } from "react-router-dom";

import ResizablePanels from "./../Home/components/ResizablePanels/ResizablePanels";

import Window from "./../Home/components/Window/Window";
import MainChat from "./../Home/components/MainChat/MainChat";
import NotifyElement from "./components/NotifyElement/NotifyElement";
import useNotifications from "@hooks/useNotifications";
import { useMediaQuery } from "react-responsive";
import ChatConsole from "./components/ChatConsole/ChatConsole";

export default function Home() {
  const [chatID, setChatID] = useState(0);
  const [mode, setMode] = useState("main");
  const [wMode, setWMode] = useState("none");

  const [theme, setTheme] = useState("dark");
  const [messageColor, setMessageColor] = useState("var(--color1)");
  const [messageSize, setMessageSize] = useState(15);
  const [userInfo, setUserInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEnd = useRef();
  const { notifications, addNotification, removeNotification } =
    useNotifications();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [chats, setChats] = useState([]);

  const [chatInfo, setChatInfo] = useState({});
  const [userID, setUserID] = useState();
  const prevMode = useRef();
  const [chatOpenKey, setChatOpenKey] = useState(0);
  const chatIDRef = useRef(0);
  const socketRef = useRef(null);

  const { isAuth } = useAuth();
  const [searchInfo, setSearchInfo] = useState({});

  useEffect(() => {
    let savedTheme = localStorage.getItem("theme") || "dark";
    localStorage.setItem("theme", savedTheme);
    setTheme(savedTheme);

    let savedMessageColor =
      localStorage.getItem("messageColor") || "var(--color1)";
    localStorage.setItem("messageColor", savedMessageColor);
    setMessageColor(savedMessageColor);

    let savedMessageSize = localStorage.getItem("messageSize") || 15;
    localStorage.setItem("messageSize", savedMessageSize);
    setMessageSize(savedMessageSize);
    prevMode.current = "main";
  }, []);

  useEffect(() => {
    const initLoad = async () => {
      try {
        const response = await api.get("user");

        setUserInfo({
          id: response.data.id,
          username: response.data.username,
          info: response.data.info,
          avatar: response.data.avatar,
        });

        setChats(response.data.chats);

        return response.data;
      } catch (error) {
        console.error("Полная ошибка:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
      }
    };
    initLoad();
  }, []);

  useEffect(() => {
    chatIDRef.current = chatID;
  }, [chatID]);

  useEffect(() => {
    socketRef.current = io({
      path: "/api/socket.io/",
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      const connectToGroups = async () => {
        try {
          const response = await api.get("user");
          response.data.chats.map(chat =>
            socket.emit("join_chat_room", chat.id),
          );
          socket.emit("join_user_room", response.data.id);
        } catch {
          addNotification("error", "Ошибка соединения...");
        }
      };
      connectToGroups();
    });

    socket.on("chat", (chatId) => {
      const chatUpdate = async () => {
        const response = await api.get("chat", { params: { id: chatId } });
        if (chatIDRef.current === chatId) {
          setChatInfo((p) => ({
            ...response.data.chat,
            users: response.data.users,
          }));
        }
        setChats((prevChats) => {
          return prevChats.map((chat) =>
            chat.id === chatId
              ? {
                  ...response.data.chat,
                }
              : chat,
          );
        });
      };
      chatUpdate();
    });

    socket.on("remove_from_chat_room", (chatId) => {
      const leaveFromChat = async () => {
        socket.emit("leave", chatId);
        setChats((prevChats) => {
          return prevChats.filter((chat) => chat.id !== chatId);
        });
        if (chatIDRef.current === chatId) setChatID(0);
        addNotification("info", "Вы были удалены из группы", 7000);
      };
      leaveFromChat();
    });

    socket.on("message", (room) => {
      const getNewMessage = async () => {
        try {
          const response = await api.get("msg", { params: { chat_id: room } });
          const messages = response.data.messages;
          if (messages.length === 0) return null;

          const message = messages[0];

          if (room === chatIDRef.current) {
            setMessages((prev) => {
              return [...prev, message];
            });
          }
          setChats((prevChats) => {
            return prevChats.map((chat) =>
              chat.id === room
                ? {
                    ...chat,
                    last_message: message?.message.content,
                    last_message_time: isValid(
                      parseISO(message.message?.sent_time),
                    )
                      ? message?.message?.sent_time
                      : "",
                  }
                : chat,
            );
          });
        } catch (error) {
          console.log(error);
        }
      };

      getNewMessage();
    });

    socket.on("new_chat_room", (cid, uid) =>
      socket.emit("new_chat_room", cid, uid),
    );

    return () => socket.disconnect();
  }, []);

  const getMessages = (chatID, count, offset) => {
    if (!chatID) return;

    const fetchMessages = async () => {
      setIsMessagesLoading(true);
      const response = await api.get("msg", {
        params: {
          chat_id: chatID,
          offset: offset,
          count: count,
        },
      });
      if (!isMessagesLoading)
        setMessages((prev) => [...response.data.messages.reverse(), ...prev]);
      setIsMessagesLoading(false);
    };

    fetchMessages();
  };

  useEffect(() => {
    if (!chatID) return;
    setMessages([]);
    getMessages(chatID, 15, 0);

    const fetchChatInfo = async () => {
      const response = await api.get("chat", { params: { id: chatID } });
      if (!response.data.member) setChatID(0);
      setChatInfo({ ...response.data.chat, users: response.data.users });
      document.title = response.data.chat.name;
      if (response.data.chat.type === "user") setUserID(response.data.chat.uid);
    };
    fetchChatInfo();
  }, [chatID]);

  useEffect(() => {
    prevMode.current = wMode;
  }, [wMode]);

  if (!isAuth) return <Navigate to="/auth" />;

  return (
    <div className="App" data-theme={theme}>
      {!!notifications && (
        <div className="notifications">
          {notifications.map((notify) => (
            <NotifyElement
              key={notify.id}
              id={notify.id}
              message={notify.message}
              type={notify.type}
              removeNotification={removeNotification}
              duration={notify.duration}
            />
          ))}
        </div>
      )}

      {wMode !== "none" && (
        <>
          <Window
            setWMode={setWMode}
            wMode={wMode}
            theme={theme}
            setTheme={setTheme}
            messageColor={messageColor}
            setMessageColor={setMessageColor}
            messageSize={messageSize}
            setMessageSize={setMessageSize}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            chatInfo={chatInfo}
            userID={userID}
            setUserID={setUserID}
            setChatInfo={setChatInfo}
            prevMode={prevMode.current}
            socket={socketRef.current}
            setChats={setChats}
            setChatID={setChatID}
            setMessages={setMessages}
            addNotification={addNotification}
            searchInfo={searchInfo}
          />
          <div id="bg-window" onClick={() => setWMode("none")}></div>
        </>
      )}

      {isMobile ? (
        <>
          {!!chatID ? (
            <MainChat
              setWMode={setWMode}
              messageColor={messageColor}
              messageSize={messageSize}
              setMessages={setMessages}
              messages={messages}
              chatID={chatID}
              socket={socketRef}
              userInfo={userInfo}
              chatInfo={chatInfo}
              setUserID={setUserID}
              messagesEnd={messagesEnd}
              setChats={setChats}
              setChatID={setChatID}
              isMobile={isMobile}
              chatOpenKey={chatOpenKey}
            />
          ) : (
            <ChatConsole
              setMode={setMode}
              mode={mode}
              setChatID={setChatID}
              prevMode={prevMode}
              setWMode={setWMode}
              wMode={wMode}
              setUserID={setUserID}
              chats={chats}
              chatID={chatID}
              setChatInfo={setChatInfo}
              setChatOpenKey={setChatOpenKey}
            />
          )}
        </>
      ) : (
        <ResizablePanels
          left={
            <ChatConsole
              setMode={setMode}
              mode={mode}
              setChatID={setChatID}
              prevMode={prevMode}
              setWMode={setWMode}
              wMode={wMode}
              setUserID={setUserID}
              chats={chats}
              chatID={chatID}
              setSearchInfo={setSearchInfo}
              setChatOpenKey={setChatOpenKey}
            />
          }
          right={
            <MainChat
              setWMode={setWMode}
              messageColor={messageColor}
              messageSize={messageSize}
              setMessages={setMessages}
              messages={messages}
              chatID={chatID}
              socket={socketRef}
              userInfo={userInfo}
              chatInfo={chatInfo}
              setUserID={setUserID}
              messagesEnd={messagesEnd}
              setChats={setChats}
              setChatID={setChatID}
              isMobile={isMobile}
              chatOpenKey={chatOpenKey}
            />
          }
        />
      )}
    </div>
  );
}
