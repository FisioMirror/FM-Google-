import { useState } from 'react';
import { FolderUp, CheckCircle2, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const DragDropRetry = () => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [isDragOver, setIsDragOver] = useState(false);

  const simulateUpload = () => {
    if (status === 'success' || status === 'uploading') return;
    setStatus('uploading');
    setTimeout(() => setStatus(Math.random() > 0.4 ? 'success' : 'error'), 1500);
  };

  return (
    <div className={`border-2 border-dashed border-teal-500 rounded-3xl p-12 text-center cursor-pointer transition-all ${isDragOver ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-slate-50 dark:bg-slate-800'} ${status === 'uploading' ? 'opacity-60 pointer-events-none' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); simulateUpload(); }} onClick={simulateUpload}>
      <div className="flex items-center justify-center gap-2 text-lg font-medium text-slate-700 dark:text-slate-200">
        <FolderUp size={22} className="text-primary" />
        <span>Arrastra un archivo o haz clic</span>
      </div>
      <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
        {status === 'idle' && <span>Esperando archivo...</span>}
        {status === 'uploading' && <><Loader2 size={16} className="animate-spin text-primary" /> <span>Subiendo...</span></>}
        {status === 'success' && <><CheckCircle2 size={16} className="text-emerald-500" /> <span className="text-emerald-600 dark:text-emerald-400 font-medium">Archivo subido correctamente</span></>}
        {status === 'error' && <><AlertCircle size={16} className="text-red-500" /> <span className="text-red-600 dark:text-red-400 font-medium">Error en la subida. Reintenta.</span></>}
      </div>
      {status === 'error' && (
        <button className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-full font-semibold text-sm hover:bg-teal-600 transition-colors" onClick={(e) => { e.stopPropagation(); setStatus('idle'); setTimeout(simulateUpload, 300); }}>
          <RotateCcw size={16} /> <span>Reintentar</span>
        </button>
      )}
    </div>
  );
};
export default DragDropRetry;
