import { useState, useEffect } from "react";
import api from "@api/api";

export default function useChatMessages(chatID, setChatID, setUserID) {
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState({});
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  useEffect(() => {
    if (!chatID) return;

    const fetchMessages = async () => {
      setIsMessagesLoading(true);
      try {
        const response = await api.get("msg", {
          params: { chat_id: chatID, offset: 0, count: 15 },
        });
        setMessages(response.data.messages.reverse());
      } catch (error) {
        console.error("Ошибка при загрузке сообщений:", error);
      } finally {
        setIsMessagesLoading(false);
      }
    };

    const fetchChatInfo = async () => {
      try {
        const response = await api.get("chat", { params: { chat_id: chatID } });
        if (!response.data.member) setChatID(0);
        setChatInfo({ ...response.data.chat, users: response.data.users });
        document.title = response.data.chat.name;
        if (response.data.chat.type === "user") setUserID(response.data.chat.uid);
      } catch (error) {
        console.error("Ошибка при загрузке информации о чате:", error);
      }
    };

    setMessages([]);
    fetchMessages();
    fetchChatInfo();
  }, [chatID, setChatID, setUserID]);

  return { messages, setMessages, isMessagesLoading, chatInfo, setChatInfo, isMessagesLoading };
}
