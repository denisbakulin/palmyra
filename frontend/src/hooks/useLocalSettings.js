import { useState, useEffect } from "react";

export default function useLocalSettings(prevModeRef) {
  const [theme, setThemeState] = useState("dark");
  const [messageColor, setMessageColorState] = useState("var(--color1)");
  const [messageSize, setMessageSizeState] = useState(15);

  useEffect(() => {
    const t = getFromStorage("theme", "dark");
    const c = getFromStorage("messageColor", "var(--color1)");
    const s = parseInt(getFromStorage("messageSize", 15), 10);

    setThemeState(t);
    setMessageColorState(c);
    setMessageSizeState(s);

    if (prevModeRef) prevModeRef.current = "main";
  }, []);

  
  const setTheme = (value) => {
    setThemeState(value);
    localStorage.setItem("theme", value);
  };

  const setMessageColor = (value) => {
    setMessageColorState(value);
    localStorage.setItem("messageColor", value);
  };

  const setMessageSize = (value) => {
    setMessageSizeState(value);
    localStorage.setItem("messageSize", value.toString());
  };

  return {
    theme,
    messageColor,
    messageSize,
    setTheme,
    setMessageColor,
    setMessageSize,
  };
}

function getFromStorage(key, defaultValue) {
  const value = localStorage.getItem(key);
  if (value === null) {
    localStorage.setItem(key, defaultValue);
    return defaultValue;
  }
  return value;
}
