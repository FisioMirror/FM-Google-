import { SendTokenModal } from './SendTokenModal';

export interface EmailFeatureModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  recipientName?: string | null;
  patientName?: string | null;
  token?: string;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
}

/**
 * Functional modal for sharing tokens with patients via email, SMS or WhatsApp.
 * Fully backwards-compatible with previous EmailFeatureModal call sites.
 */
export function EmailFeatureModal({
  open,
  isOpen,
  onClose,
  recipientName,
  patientName,
  token = '123456',
  recipientEmail,
  recipientPhone,
}: EmailFeatureModalProps) {
  const isModalOpen = open ?? isOpen ?? false;
  return (
    <SendTokenModal
      open={isModalOpen}
      isOpen={isModalOpen}
      onClose={onClose}
      token={token}
      recipientName={recipientName || patientName}
      patientName={patientName || recipientName}
      recipientEmail={recipientEmail}
      recipientPhone={recipientPhone}
    />
  );
}

export { SendTokenModal };
export default EmailFeatureModal;
