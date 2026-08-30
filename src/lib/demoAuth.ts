import type { Profile } from '../types';

/**
 * Determines if a user or profile is a demo account.
 * Real accounts created manually for actual tests MUST NOT have mock demo data injected.
 */
export function isDemoAccount(user: Partial<Profile> | null | undefined): boolean {
  if (!user) return false;
  if (!user.id) return false;
  
  const id = String(user.id).toLowerCase();
  const email = String(user.email || '').toLowerCase();

  // Known demo accounts
  if (
    id === 'demo-fisio-001' ||
    id === 'demo-patient-001' ||
    id === 'fdf7cc26-59e3-413b-9e3a-43e54976a8e0' ||
    id === '5093ac77-e391-49ba-994a-8c75572c8313'
  ) return true;
  if (id.startsWith('demo-')) return true;
  if (email.includes('demo@') || email.includes('@demo.com') || email === 'fisio@demo.com' || email === 'paciente@demo.com') return true;

  return false;
}
