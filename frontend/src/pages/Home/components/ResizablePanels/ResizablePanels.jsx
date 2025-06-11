import "./ResizablePanels.css"
import React, {useState, useRef, useEffect} from "react";


export default function ResizablePanels ({left, right}) {
  
  const [leftWidth, setLeftWidth] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(leftWidth);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startX.current = e.clientX;
    startWidth.current = leftWidth;
    document.body.style.userSelect = 'none'; // Блокировка выделения текста
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = '';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const delta = e.clientX - startX.current;
    const containerWidth = container.offsetWidth;
    const newWidth = startWidth.current + (delta / containerWidth) * 100;

    
    const clampedWidth = Math.max(30, Math.min(70, newWidth));
    setLeftWidth(clampedWidth);
  };

  useEffect(() => {
    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'select';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      cleanup();
    }

    return cleanup;
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="resize-container"
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="left-panel"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
        <div 
          className={`resizer ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />
      </div>
      
      <div 
        className="right-panel"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
};