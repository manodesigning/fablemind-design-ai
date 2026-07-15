import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function Tooltip({ children, content, side = 'top', delay = 0 }) {
  const [visible, setVisible] = useState(false);
  let timeout;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => { timeout = setTimeout(() => setVisible(true), delay || 500); }}
      onMouseLeave={() => { clearTimeout(timeout); setVisible(false); }}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className={`absolute ${positions[side]} z-50 pointer-events-none`}
          >
            <div className="bg-[#1E1E28] border border-border text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-xl">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
