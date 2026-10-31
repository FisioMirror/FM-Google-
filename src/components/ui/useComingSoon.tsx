import { useState } from 'react';
import { ComingSoonModal } from './ComingSoonModal';

export function useComingSoon() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<{ title?: string; description?: string }>({});

  const show = (title?: string, description?: string) => {
    setConfig({ title, description });
    setOpen(true);
  };

  const modal = <ComingSoonModal open={open} onClose={() => setOpen(false)} {...config} />;

  return { show, modal };
}
