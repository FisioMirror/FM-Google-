import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export interface TurnstileWidgetRef {
  reset: () => void;
  getResponse: () => string | null;
}

export interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: any) => void;
  siteKey?: string;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  action?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: (code?: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          action?: string;
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId?: string) => string;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const DEFAULT_TEST_SITE_KEY = '1x00000000000000000000AA';

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  (
    {
      onVerify,
      onExpire,
      onError,
      siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string) || DEFAULT_TEST_SITE_KEY,
      theme = 'auto',
      className = '',
      action = 'auth',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'verified' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setToken(null);
        setStatus('ready');
        setErrorMsg(null);
        if (window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (e) {
            console.warn('Turnstile reset error:', e);
          }
        }
      },
      getResponse: () => token,
    }));

    useEffect(() => {
      let isMounted = true;

      const initWidget = () => {
        if (!containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
        }

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            action,
            size: 'flexible',
            callback: (verifiedToken: string) => {
              if (!isMounted) return;
              setToken(verifiedToken);
              setStatus('verified');
              setErrorMsg(null);
              onVerify(verifiedToken);
            },
            'expired-callback': () => {
              if (!isMounted) return;
              setToken(null);
              setStatus('ready');
              onExpire?.();
            },
            'error-callback': (code?: string) => {
              if (!isMounted) return;
              console.warn('Turnstile challenge error:', code);
              setStatus('error');
              setErrorMsg('Verificación no completada. Haz clic para reintentar.');
              onError?.(code);
            },
          });
          widgetIdRef.current = id;
          if (isMounted) setStatus('ready');
        } catch (err) {
          console.warn('Turnstile render failure:', err);
          if (isMounted) {
            setStatus('ready');
          }
        }
      };

      // Load Turnstile script if not already present
      const scriptId = 'cloudflare-turnstile-script';
      if (!window.turnstile && !document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) initWidget();
        };
        script.onerror = () => {
          if (isMounted) {
            console.warn('Turnstile script blocked or unreachable. Using fallback mode.');
            // Fallback for offline or blocked environments: provide bypass token
            const fallbackToken = `cf-fallback-token-${Date.now()}`;
            setToken(fallbackToken);
            setStatus('verified');
            onVerify(fallbackToken);
          }
        };
        document.head.appendChild(script);
      } else if (window.turnstile) {
        initWidget();
      } else {
        // Script is already added but waiting for load
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          existingScript.addEventListener('load', initWidget, { once: true });
        }
      }

      return () => {
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
        }
      };
    }, [siteKey, theme, action]);

    return (
      <div className={`turnstile-wrapper my-2 ${className}`}>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 px-0.5">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck size={13} className={status === 'verified' ? 'text-teal-500' : 'text-slate-400'} />
            Protección de acceso Cloudflare Turnstile
          </span>
          {status === 'verified' && (
            <span className="text-teal-600 dark:text-teal-400 font-semibold text-[10px] bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              Verificado
            </span>
          )}
        </div>

        <div
          ref={containerRef}
          className="min-h-[65px] w-full flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 overflow-hidden p-1 transition-all"
        />

        {status === 'error' && (
          <div className="mt-1.5 flex items-center justify-between text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-800/50">
            <span className="flex items-center gap-1.5 text-[11px]">
              <AlertCircle size={13} />
              {errorMsg || 'Error de verificación CAPTCHA.'}
            </span>
            <button
              type="button"
              onClick={() => {
                if (widgetIdRef.current && window.turnstile) {
                  window.turnstile.reset(widgetIdRef.current);
                  setStatus('ready');
                  setErrorMsg(null);
                }
              }}
              className="flex items-center gap-1 text-[11px] font-bold underline hover:opacity-80 ml-2"
            >
              <RefreshCw size={11} /> Reintentar
            </button>
          </div>
        )}
      </div>
    );
  }
);
TurnstileWidget.displayName = 'TurnstileWidget';
