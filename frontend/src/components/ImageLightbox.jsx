import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Fullscreen image lightbox with keyboard support.
 * Esc closes · ←/→ navigate · click backdrop to close
 */
const ImageLightbox = ({
  images = [],
  index = 0,
  isOpen = false,
  onClose,
  onChangeIndex,
  alt = "Gallery image",
}) => {
  const total = images.length;
  const safeIndex = total > 0 ? ((index % total) + total) % total : 0;
  const current = total > 0 ? images[safeIndex] : null;

  const goPrev = useCallback(() => {
    if (total < 2 || !onChangeIndex) return;
    onChangeIndex(safeIndex === 0 ? total - 1 : safeIndex - 1);
  }, [total, safeIndex, onChangeIndex]);

  const goNext = useCallback(() => {
    if (total < 2 || !onChangeIndex) return;
    onChangeIndex(safeIndex === total - 1 ? 0 : safeIndex + 1);
  }, [total, safeIndex, onChangeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, goPrev, goNext]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col bg-haven-950/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Full screen image viewer"
          onClick={onClose}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 text-cream-100 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-sm text-cream-200/80">
              <ZoomIn className="w-4 h-4 text-accent-400" />
              <span className="font-medium tracking-wide uppercase text-[11px]">
                Full View
              </span>
              {total > 0 && (
                <span className="ml-2 text-cream-200/60">
                  {safeIndex + 1} / {total}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 border border-white/20 text-cream-100 hover:bg-white/10 hover:border-accent-400 transition-colors"
              aria-label="Close full screen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main image */}
          <div
            className="relative flex-1 flex items-center justify-center px-4 sm:px-16 pb-4 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {total > 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 sm:left-6 z-10 p-3 bg-white/10 border border-white/20 text-white hover:bg-accent-400 hover:text-haven-900 hover:border-accent-400 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={current}
                alt={`${alt} ${safeIndex + 1}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="max-h-full max-w-full object-contain select-none shadow-2xl"
                draggable={false}
                onError={(e) => {
                  e.target.style.opacity = "0.4";
                }}
              />
            </AnimatePresence>

            {total > 1 && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 sm:right-6 z-10 p-3 bg-white/10 border border-white/20 text-white hover:bg-accent-400 hover:text-haven-900 hover:border-accent-400 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {total > 1 && (
            <div
              className="flex-shrink-0 px-4 pb-5 pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center gap-2 overflow-x-auto max-w-4xl mx-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => onChangeIndex?.(i)}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-all ${
                      i === safeIndex
                        ? "border-accent-400 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-cream-200/40 mt-3">
                Esc to close · Arrow keys to navigate
              </p>
            </div>
          )}

          {total <= 1 && (
            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-cream-200/40 pb-5">
              Esc or click outside to close
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

ImageLightbox.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  index: PropTypes.number,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onChangeIndex: PropTypes.func,
  alt: PropTypes.string,
};

export default ImageLightbox;
