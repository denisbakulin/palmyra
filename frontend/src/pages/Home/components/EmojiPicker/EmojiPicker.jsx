import React from "react";
import "./EmojiPicker.css";

const emojiList = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😃",
  "😄",
  "😅",
  "😆",
  "😉",
  "😊",
  "😎",
  "😍",
  "😘",
  "🥰",
  "😗",
  "😙",
  "😚",
  "🙂",
  "🤗",
  "🤩",
  "🤔",
  "🤨",
  "😐",
  "😑",
  "😶",
  "🙄",
  "😏",
  "😣",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤭",
  "🤫",
  "🤥",
  "😷",
  "🤒",
  "🤕",
  "🤑",
  "🤠",
  "😈",
  "👿",
  "👹",
  "👺",
  "💀",
  "☠️",
  "👻",
  "👽",
  "👾",
  "🤖",
  "🎃",
  "😺",
  "😸",
  "😹",
  "😻",
  "😼",
  "😽",
  "🙀",
  "😿",
  "😾",
];

export default function EmojiPicker({ onSelect }) {
  return (
    <div style={styles.modal}>
      <div style={styles.header}>
        <span style={styles.title}>Выберите смайлик</span>
      </div>
      <div style={styles.grid}>
        {emojiList.map((emoji, idx) => (
          <div
            key={idx}
            style={styles.emojiBtn}
            onClick={() => onSelect(emoji)}
            className="btn"
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  modal: {
    background: "var(--color2)",
    opacity: "0.9",
    borderRadius: "1em",
    padding: "16px",
    width: "max-content",
    maxHeight: "400px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    right: "0px",
    bottom: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text)",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "24px",
    lineHeight: "1",
    cursor: "pointer",
    color: "var(--text)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "var(--color2) var(--color1)",
  },
  emojiBtn: {
    fontSize: "2em",
    padding: "3px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
};

EmojiPicker;
