import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IOSInstallModal({ isOpen, onClose }: IOSInstallModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface border border-primary/20 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-4 border-b border-outline/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                  <Smartphone className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Instalar en iPhone / iPad</h3>
                  <p className="text-xs text-on-surface-variant">Acceso directo como app nativa</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-surface-container-low border border-primary/10">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    Abre en Safari y toca <Share className="size-4 text-primary" />
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    En la barra inferior de Safari, pulsa el botón Compartir.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-surface-container-low border border-primary/10">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    Elige <PlusSquare className="size-4 text-primary" /> "Agregar a pantalla de inicio"
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Desplázate hacia abajo en el menú y selecciona la opción.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-surface-container-low border border-primary/10">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    Toca "Agregar" <CheckCircle2 className="size-4 text-emerald-500" />
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    ¡Listo! Podrás abrir FisioMirror a pantalla completa y sin barras de navegador.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all active:scale-[0.98] shadow-md shadow-primary/20"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default IOSInstallModal;
