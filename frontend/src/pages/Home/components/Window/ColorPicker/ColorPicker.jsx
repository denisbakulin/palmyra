import { useState, useRef, useEffect } from 'react';
import './ColorPicker.css';


const ColorPicker = ({ initialColor = '#3a86ff', onChange }) => {
  const [color, setColor] = useState(initialColor);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  
  // Конвертация HEX в RGB
  const hexToRgb = (hex) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  };
  
  // Конвертация RGB в HEX
  const rgbToHex = (r, g, b) => {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16).padStart(2, '0');
      return hex;
    }).join('')}`;
  };
  
  // Определение контрастного цвета текста
  const getContrastColor = (hexColor) => {
    const { r, g, b } = hexToRgb(hexColor);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };
  
  // Обработчики изменений
  const handleHexChange = (e) => {
    const value = e.target.value;
    setColor(value)

   
  };
  
  const handleRgbChange = (channel, value) => {
    const rgb = hexToRgb(color);
    rgb[channel] = Math.min(255, Math.max(0, parseInt(value) || 0))
    setColor(rgbToHex(rgb.r, rgb.g, rgb.b));
  };
  

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  
  useEffect(() => {
    if (onChange) onChange(color);
  }, [color, onChange]);

  return (
    <div className="color-picker-container" ref={pickerRef}>
      <div 
        className="color-preview"
        style={{ backgroundColor: color }}
        onClick={() => setShowPicker(!showPicker)}
      >
        <span style={{ color: getContrastColor(color), marginBlock: "0.5em" }} >Цвет сообщения</span>

        {showPicker && (
        <div className="color-panel" onClick={e => e.stopPropagation()}>
          <div className="color-sliders">
            {['r', 'g', 'b'].map(channel => {
              const value = hexToRgb(color)[channel];
              return (
                <div key={channel} className="slider-container">
                  <label>{channel.toUpperCase()}</label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={value}
                    onChange={(e) => handleRgbChange(channel, e.target.value)}
                  />
                 
                  <span style={{}}>{value}</span>
                </div>
              );
            })}
          </div>
          
          <div className="hex-input">
            <label>HEX</label>
            <input
              type="text"
              value={color}
              onChange={handleHexChange}
              maxLength="7"
            />
          </div>
        </div>
      )}
      </div>
      
     
    </div>
  );
};

export default ColorPicker;