import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "@api/api";
import { parseISO, isValid } from "date-fns";

export default function useChatSocket({
  chatIDRef,
  setChats,
  setMessages,
  setChatID,
  setChatInfo,
  addNotification,
}) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (socketRef.current) return

    const socket = io("http://localhost:5000", {
      path: "/api/socket.io",
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      const connectToGroups = async () => {
        try {
          const response = await api.get("user");
          response.data.chats.forEach(chat => socket.emit("join_chat_room", chat.id));
          socket.emit("join_user_room", response.data.id);
        } catch {
          addNotification("error", "Ошибка соединения...");
        }
      };
      connectToGroups();
    });

    socket.on("chat", async (chatId) => {
      try {
        const response = await api.get("chat", { params: { chat_id: chatId } });
        if (chatIDRef.current === chatId) {
          setChatInfo({
            ...response.data.chat,
            users: response.data.users,
          });
        }
        setChats(prev =>
          prev.map(chat => chat.id === chatId ? { ...response.data.chat } : chat)
        );
      } catch (e) {
        console.error("Ошибка при обновлении чата:", e);
      }
    });

    socket.on("remove_from_chat_room", (chatId) => {
      socket.emit("leave", chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (chatIDRef.current === chatId) setChatID(0);
      addNotification("info", "Вы были удалены из группы", 7000);
    });

    socket.on("message", async (chatId) => {
      try {
        const response = await api.get("msg", { params: { chat_id: chatId } });
        const messages = response.data.messages;
        if (messages.length === 0) return;

        const message = messages[0];

        if (chatId === chatIDRef.current) {
          setMessages(prev => [...prev, message]);
        }

        setChats(prev =>
          prev.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  last_message: message?.message.content,
                  last_message_time: isValid(parseISO(message.message?.sent_time))
                    ? message.message.sent_time
                    : "",
                }
              : chat
          )
        );
      } catch (error) {
        console.error("Ошибка получения нового сообщения:", error);
      }
    });

    const handleNewChat = async ({ chat_id }) => {
      try {
        socket.emit("join_chat_room", chat_id);
        const response = await api.get("chat", { params: { chat_id } });
        setChats(prev => [...prev, response.data.chat]);
        addNotification("success", `Вы добавлены в чат ${response.data.chat.name}`);
      } catch (e) {
        console.error("Ошибка при добавлении в новый чат:", e);
      }
    };

    socket.on("new_chat_room", handleNewChat);
    socket.on("add_room", handleNewChat);

   
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null; 
      }
    };
  }, []); 

  return socketRef.current;
}
