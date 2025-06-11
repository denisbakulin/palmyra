import React from "react";

export default function SizeSlider ({ messageSize, setMessageSize }) {
    const minSize = 8
    const maxSize = 48

    const handleIncrement = () => {
        const mS = Math.min(messageSize + 1, maxSize)
        setMessageSize(mS);
        localStorage.setItem("messageSize", mS)
    };

    const handleDecrement = () => {
        const mS = Math.min(messageSize - 1, maxSize)
        setMessageSize(mS);
        localStorage.setItem("messageSize", mS)
    };
  
    return (
        <div style={{
            display: 'flex',
            flexDirection: "column",
            alignItems: 'center',
            overflow: "hidden",
            backgroundColor: 'var(--color1)',
            borderRadius: '12px',
            width: "100%",
          }}>
            <p style={{
                backgroundColor: "var(--color2)", 
                width: "100%",
                textAlign: "center",
                fonTsize: "1em",
                fonTweight: "600",
                padding:"0.3em"
            }}>Размер Сообщения</p>
            <div style={{
                  display: "flex",
                  alignItems: 'center',
                  margin: "0.5em"
            }}>
            <button
              onClick={handleDecrement}
              disabled={messageSize === minSize}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: messageSize === minSize ? 'var(--text)' :  'var(--color2)',
                color: messageSize === minSize ? 'var(--color2)' : 'var(--text)' ,
                fontSize: '24px',
                cursor: messageSize === minSize ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              −
            </button>
            
            <div style={{
              minWidth: '60px',
              textAlign: 'center',
              fontSize: '1.5',
              fontWeight: 300,
              color: 'var(--text)'
            }}>
              {messageSize}
            </div>
            
            <button
              onClick={handleIncrement}
              disabled={messageSize === maxSize}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: messageSize === maxSize ? 'var(--text)' :  'var(--color2)',
                color: messageSize === maxSize ? 'var(--color2)' : 'var(--text)' ,
                fontSize: '24px',
                cursor: messageSize === maxSize ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              +
            </button>
            </div>
          </div>
    )
}


