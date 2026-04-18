import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImagePreview({ file, onRemove }) {
  const [preview, setPreview] = useState(null);

  if (!file) return null;

  if (!preview) {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <AnimatePresence>
      {preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-xl overflow-hidden border border-cyan-300/30 bg-cyan-950/20 p-3"
        >
          <img
            src={preview}
            alt="Preview"
            className="h-48 w-full object-cover rounded-lg"
          />
          <button
            onClick={() => {
              setPreview(null);
              onRemove?.();
            }}
            className="absolute top-5 right-5 rounded-lg bg-red-600/90 hover:bg-red-500 px-2 py-1.5 text-xs font-semibold text-white transition-all"
            title="Remove this image"
          >
            ✕ Remove
          </button>
          <p className="mt-2 text-xs text-cyan-200/70">
            📸 {Math.round(file.size / 1024)} KB - Ready to upload
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
