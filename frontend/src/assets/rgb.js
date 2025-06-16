export const hexToRgb = (hex) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}
  
// Конвертация RGB в HEX
export const rgbToHex = (r, g, b) => {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16).padStart(2, '0');
      return hex;
    }).join('')}`;
  };
  
// Определение контрастного цвета текста
export const getContrastColor = (hexColor) => {
    if (hexColor == "var(--color1)") return "var(--text)"
    const { r, g, b } = hexToRgb(hexColor);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
};