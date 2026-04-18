import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedTooltip({ children, text, delay = 200 }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-50 whitespace-nowrap"
          >
            <div className="rounded-lg border border-cyan-300/40 bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-cyan-100 shadow-[0_8px_24px_rgba(34,211,238,0.3)] backdrop-blur-xl">
              {text}
              <div className="absolute left-1/2 top-full -translate-x-1/2 w-2 h-2 bg-slate-900/95 border-r border-b border-cyan-300/40 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
