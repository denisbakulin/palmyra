import { useEffect,  useMemo, useRef, useState} from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Toast({ message, onClose, bg="green", color="white",  duration = 2000 }) {
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef(null);


  useEffect(() => {
    
    timerRef.current = setTimeout(onClose, duration)

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [isVisible, duration, onClose]);
  

  return useMemo(() => (
    <AnimatePresence>
      <motion.div
        style={{backgroundColor: bg, padding: "0.5em", color: color, borderRadius: "12px 12px 0 0"}}
      >
        {message}
      </motion.div>
      
    </AnimatePresence>
  ))
}