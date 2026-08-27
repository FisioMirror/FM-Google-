import { useState } from 'react';
import { FileText, Trash2, Undo2, RotateCcw } from 'lucide-react';

type ItemState = 'exists' | 'deleting' | 'gone';

const DeleteAnimation = () => {
  const [itemState, setItemState] = useState<ItemState>('exists');
  const handleToggle = () => {
    if (itemState === 'gone') setItemState('exists');
    else if (itemState === 'exists') { setItemState('deleting'); setTimeout(() => setItemState('gone'), 500); }
  };
  return (
    <div className="flex justify-between items-center gap-4">
      {itemState !== 'gone' && (
        <span className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-6 py-3 rounded-full border transition-all duration-500 text-sm font-medium ${itemState === 'deleting' ? 'scale-20 rotate-120 opacity-0' : ''}`}>
          <FileText size={16} className="text-primary" />
          <span>Documento_importante.pdf</span>
        </span>
      )}
      <button className="flex items-center gap-1.5 px-5 py-2 border border-slate-300 dark:border-slate-600 text-red-500 rounded-full font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm" onClick={handleToggle}>
        {itemState === 'exists' && <><Trash2 size={16} /> <span>Eliminar</span></>}
        {itemState === 'deleting' && <><Undo2 size={16} /> <span>Deshacer</span></>}
        {itemState === 'gone' && <><RotateCcw size={16} /> <span>Restaurar</span></>}
      </button>
    </div>
  );
};
export default DeleteAnimation;
