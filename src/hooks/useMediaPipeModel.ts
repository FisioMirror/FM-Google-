import { useState, useEffect, useMemo, useCallback } from 'react';

export type ModelPreference = 'auto' | 'pose' | 'holistic';
export type ActiveModel = 'pose' | 'holistic';
export type ExerciseComplexity = 'baja' | 'media' | 'alta';

interface DeviceCapabilities {
  hardwareConcurrency: number;
  deviceMemory: number;
  isMobile: boolean;
  isLowEnd: boolean;
}

export function useMediaPipeModel(exerciseComplexity: ExerciseComplexity = 'media') {
  const [preference, setPreference] = useState<ModelPreference>(() => {
    const saved = localStorage.getItem('fisio_mediapipe_model');
    if (saved === 'pose' || saved === 'holistic' || saved === 'auto') {
      return saved as ModelPreference;
    }
    return 'auto';
  });

  const capabilities: DeviceCapabilities = useMemo(() => {
    if (typeof window === 'undefined') {
      return { hardwareConcurrency: 4, deviceMemory: 4, isMobile: false, isLowEnd: false };
    }

    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const isLowEnd = cores <= 4 || memory < 4 || (isMobile && cores <= 6);

    return {
      hardwareConcurrency: cores,
      deviceMemory: memory,
      isMobile,
      isLowEnd,
    };
  }, []);

  const activeModel: ActiveModel = useMemo(() => {
    if (preference === 'pose') return 'pose';
    if (preference === 'holistic') return 'holistic';

    // Auto resolution:
    // If device is low-end or mobile, prefer 'pose' for smooth 60fps
    if (capabilities.isLowEnd) {
      return 'pose';
    }

    // High complexity exercises on capable desktop devices benefit from 'holistic'
    if (exerciseComplexity === 'alta' && !capabilities.isMobile && capabilities.hardwareConcurrency >= 6) {
      return 'holistic';
    }

    return 'pose';
  }, [preference, capabilities, exerciseComplexity]);

  const updatePreference = useCallback((newPref: ModelPreference) => {
    setPreference(newPref);
    localStorage.setItem('fisio_mediapipe_model', newPref);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'fisio_mediapipe_model' && e.newValue) {
        if (e.newValue === 'pose' || e.newValue === 'holistic' || e.newValue === 'auto') {
          setPreference(e.newValue as ModelPreference);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    preference,
    setPreference: updatePreference,
    activeModel,
    capabilities,
    isHolistic: activeModel === 'holistic',
  };
}
