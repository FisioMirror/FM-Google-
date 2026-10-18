import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { GlassPanel } from '../components/ui/Glass';
import { SkeletonCard as SkeletonCardUI } from '../components/ui/Skeleton';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastProvider';
import { cn } from '../lib/utils';
import { EmailFeatureModal } from '../components/ui/EmailFeatureModal';
import { isDemoAccount } from '../lib/demoAuth';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Dialog';
import { Tooltip } from '../components/ui/Tooltip';

interface TokenRow {
  id: string;
  token: string;
  patientName: string | null;
  status: 'pendiente' | 'activado' | 'expirado';
  createdAt: string;
}

const filterKeys = ['tok.fAll', 'tok.fPending', 'tok.fActive', 'tok.fExpired'];

const defaultDemoTokens: TokenRow[] = [
  { id: 'demo-token-1', token: '482910', patientName: 'Carlos Mendoza', status: 'activado', createdAt: '2026-03-20T10:00:00Z' },
  { id: 'demo-token-2', token: '839201', patientName: 'María Delgado', status: 'activado', createdAt: '2026-03-22T14:30:00Z' },
  { id: 'demo-token-3', token: '194820', patientName: 'Lucía Fernández', status: 'pendiente', createdAt: '2026-03-24T09:15:00Z' },
  { id: 'demo-token-4', token: '582019', patientName: 'Jorge Ramírez', status: 'pendiente', createdAt: '2026-03-25T11:45:00Z' },
];

export function TokenGeneratorPage() {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();
  const toast = useToast();
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [activeFilter, setActiveFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailModalToken, setEmailModalToken] = useState<TokenRow | null>(null);
  const [deleteConfirmToken, setDeleteConfirmToken] = useState<TokenRow | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTokens();
  }, [user?.id]);

  const loadTokens = async () => {
    setLoading(true);
    if (!user?.id) {
      setTokens(isDemoAccount(user) ? defaultDemoTokens : []);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('activation_tokens')
        .select('id, token, paciente_id, terapeuta_id, created_at')
        .eq('terapeuta_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setTokens(isDemoAccount(user) ? defaultDemoTokens : []);
        return;
      }

      // Get patient names
      const patientIds = data.map((d) => d.paciente_id).filter(Boolean);
      let patientMap: Record<string, string> = {};
      if (patientIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', patientIds);
        if (profiles) {
          patientMap = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]));
        }
      }

      const realTokens = data.map((t) => ({
        id: t.id,
        token: t.token,
        patientName: t.paciente_id ? patientMap[t.paciente_id] ?? t('common.patientDefault') : null,
        status: (t.paciente_id ? 'activado' : 'pendiente') as TokenRow['status'],
        createdAt: t.created_at,
      }));

      if (isDemoAccount(user)) {
        const merged = [...realTokens];
        for (const d of defaultDemoTokens) {
          if (!merged.some(m => m.token === d.token)) {
            merged.push(d);
          }
        }
        setTokens(merged);
      } else {
        setTokens(realTokens);
      }
    } catch {
      setTokens(isDemoAccount(user) ? defaultDemoTokens : []);
    } finally {
      setLoading(false);
    }
  };

  const createQuickToken = async () => {
    setGenerating(true);
    const randomSixDigits = String(Math.floor(100000 + Math.random() * 900000));
    try {
      if (user?.id) {
        const { data, error } = await supabase.from('activation_tokens').insert({
          terapeuta_id: user.id,
          token: randomSixDigits,
        }).select().single();
        if (!error && data) {
          toast.success(t('tok.generated', { tok: randomSixDigits }));
          loadTokens();
          return;
        }
      }
    } catch {
      // fallback
    } finally {
      setGenerating(false);
    }
    const newDemoToken: TokenRow = {
      id: `tok-${Date.now()}`,
      token: randomSixDigits,
      patientName: null,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };
    setTokens(prev => [newDemoToken, ...prev]);
    toast.success(t('tok.generated', { tok: randomSixDigits }));
    setGenerating(false);
  };

  const [waveKey] = useState(0);

  const regenerateToken = async (id: string) => {
    try {
      const newToken = String(Math.floor(100000 + Math.random() * 900000));
      const { error } = await supabase
        .from('activation_tokens')
        .update({ token: newToken })
        .eq('id', id);
      if (error) throw error;
      toast.success(t('tok.regenerated'));
      loadTokens();
    } catch {
      toast.error(t('tok.regenerateError'));
    }
  };

  const deleteToken = async (id: string) => {
    try {
      const { error } = await supabase.from('activation_tokens').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('tok.deleted'));
      loadTokens();
    } catch {
      toast.error(t('tok.deleteError'));
    }
  };

  const copyToken = (id: string, token: string) => {
    try {
      navigator.clipboard?.writeText(token);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error(t('tok.copyError'));
    }
  };

  const filteredTokens = tokens.filter((t) => {
    if (activeFilter === 0) return true;
    return t.status === t(filterKeys[activeFilter]).toLowerCase();
  });

  return (
    <div className="fm-page-narrow">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative">
        {waveKey > 0 && (
          <div
            key={waveKey}
            className="wave-expand-effect w-32 h-32 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ animationDuration: '0.8s' }}
          />
        )}
        <div className="relative z-10">
          <h1 className="font-display fm-title gradient-text-living">{t('tok.pageTitle')}</h1>
          <p className="text-on-surface-variant text-xs sm:text-sm font-medium mt-1">{t('tok.pageSubtitle')}</p>
        </div>
        <div className="relative z-10 shrink-0">
          <Button
            onClick={createQuickToken}
            variant="glow"
            glowEffect
            loading={generating}
            size="default"
            icon={<Icon name="add" size={18} />}
          >{t('tok.newToken')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
         {filterKeys.map((fKey, i) => (
          <button
            key={fKey}
            onClick={() => setActiveFilter(i)}
            className={cn(
              'px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all',
              i === activeFilter
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container/70 hover:bg-surface-container text-on-surface-variant border border-outline/15',
            )}
          >{t(fKey)}
          </button>
        ))}
      </div>

      {/* Token cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCardUI />
          <SkeletonCardUI />
        </div>
      ) : filteredTokens.length === 0 ? (
        <div className="empty-state-premium ios-glass-heavy refraction-border p-12 rounded-3xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto mb-4">
            <Icon name="key" size={28} />
          </div>
          <h3 className="font-display text-lg font-bold text-on-surface mb-1.5">{t('tok.emptyTitle')}</h3>
          <p className="text-on-surface-variant text-xs sm:text-sm max-w-md mx-auto">
            {t('tok.emptySubtitle')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTokens.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
            >
              <GlassPanel className="card-glow-hover p-5 sm:p-6 rounded-3xl border border-outline/15 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-2xs uppercase text-on-surface-variant font-bold tracking-wider mb-1">{t('tok.activationCode')}</p>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-teal-700 dark:text-teal-300 select-all">{t.token}</span>
                        <button
                          onClick={() => copyToken(t.id, t.token)}
                          aria-label={t("tok.copyToken")}
                          className={cn(
                            'flex items-center justify-center size-9 rounded-xl transition-all active:scale-95',
                            copiedId === t.id
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20',
                          )}
                          title={t("tok.copyClipboard")}
                        >
                          <Icon name={copiedId === t.id ? 'check' : 'content_copy'} size={16} />
                        </button>
                      </div>
                    </div>
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-bold border',
                      t.status === 'pendiente' && 'bg-warning/10 border-warning/20 text-warning dark:text-warning',
                      t.status === 'activado' && 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
                      t.status === 'expirado' && 'bg-slate-500/10 border-slate-500/20 text-on-surface-variant',
                    )}>
                      {t('tok.status.' + t.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm py-2">
                    <div className="flex items-center gap-2 text-on-surface">
                      <Icon name="person" size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="font-semibold">{t.patientName || t('tok.unassigned')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Icon name="schedule" size={16} className="text-outline shrink-0" />
                      <span>{new Date(t.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-outline/15">
                  <Tooltip content={t("tok.regenerateTip")} side="top">
                    <button
                      onClick={() => regenerateToken(t.id)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Icon name="refresh" size={14} /> {t('tok.regenerate')}
                    </button>
                  </Tooltip>
                  <Tooltip content={t("tok.sendEmailTip")} side="top">
                    <button
                      onClick={() => setEmailModalToken(t)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Icon name="mail" size={14} /> {t('tok.send')}
                    </button>
                  </Tooltip>
                  <Tooltip content={t("tok.deleteTip")} side="top">
                    <button
                      onClick={() => setDeleteConfirmToken(t)}
                      aria-label={t("tok.deleteToken")}
                      className="py-2.5 px-3 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger dark:text-danger transition-all flex items-center justify-center"
                      title={t("tok.deleteToken")}
                    >
                      <Icon name="delete" size={14} />
                    </button>
                  </Tooltip>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      )}

      <EmailFeatureModal
        open={emailModalToken !== null}
        onClose={() => setEmailModalToken(null)}
        recipientName={emailModalToken?.patientName}
        token={emailModalToken?.token}
      />

      {/* Glass Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirmToken !== null}
        onOpenChange={(open) => !open && setDeleteConfirmToken(null)}
        title={t("tok.confirmDeleteTitle")}
        description={t('tok.confirmDeleteDesc', { tok: deleteConfirmToken?.token })}
        confirmText={t("tok.confirmDelete")}
        cancelText={t("tok.keep")}
        confirmVariant="destructive"
        onConfirm={() => {
          if (deleteConfirmToken) {
            deleteToken(deleteConfirmToken.id);
            setDeleteConfirmToken(null);
          }
        }}
      />
    </div>
  );
}
