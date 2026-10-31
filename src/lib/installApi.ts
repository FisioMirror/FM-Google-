import { createContext, useContext } from 'react';

/**
 * Contexto y hook de instalación PWA sin componentes (react-refresh).
 * `installContext.tsx` solo exporta el provider.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallContextValue {
  isInstalled: boolean;
  isInstallable: boolean;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  triggerInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

export const InstallContext = createContext<InstallContextValue>({
  isInstalled: false,
  isInstallable: false,
  modalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  triggerInstall: async () => 'unavailable',
});

export const useInstall = () => useContext(InstallContext);
