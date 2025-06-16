
import { useState, useEffect } from "react";
import api from "@api/api";

export default function useUserData() {
  const [userInfo, setUserInfo] = useState(null);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("user");
        setUserInfo({
          id: response.data.id,
          username: response.data.username,
          info: response.data.info,
          avatar: response.data.avatar,
        });
        setChats(response.data.chats);
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователя:", error);
      }
    };

    fetchUserData();
  }, []);

  return { userInfo, setUserInfo, chats, setChats };
}
