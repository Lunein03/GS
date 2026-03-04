import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY não configurada nas variáveis de ambiente');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email de destino para notificações administrativas.
 */
export const NOTIFICATION_EMAIL = 'comunicacao@gsproducao.com';

/**
 * Email remetente (FROM).
 *
 * O domínio gsintra.online precisa estar verificado no Resend Dashboard
 * para enviar como intranet@gsintra.online.
 *
 * Enquanto não verificado, usa 'onboarding@resend.dev' (sandbox do Resend).
 * Para ativar o domínio real, verifique em: https://resend.com/domains
 * e defina RESEND_DOMAIN_VERIFIED=true nas variáveis de ambiente.
 */
export const SENDER_EMAIL = process.env.RESEND_DOMAIN_VERIFIED === 'true'
  ? 'intranet@gsintra.online'
  : 'onboarding@resend.dev';
