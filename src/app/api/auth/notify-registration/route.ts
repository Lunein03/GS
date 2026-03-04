import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resend, NOTIFICATION_EMAIL, SENDER_EMAIL } from '@/shared/lib/resend';
import { buildNewUserNotificationHtml } from '@/features/auth/server/email-templates';

const bodySchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
});

/**
 * POST /api/auth/notify-registration
 *
 * Envia email de notificação para o admin quando um novo usuário se cadastra.
 * Chamado pelo formulário de registro após signUp bem-sucedido.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { detail: 'Dados inválidos', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { fullName, email } = parsed.data;

    const registeredAt = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date());

    const { error } = await resend.emails.send({
      from: `Intranet GS Produções <${SENDER_EMAIL}>`,
      to: [NOTIFICATION_EMAIL],
      subject: `Novo cadastro na Intranet: ${fullName}`,
      html: buildNewUserNotificationHtml({ fullName, email, registeredAt }),
    });

    if (error) {
      console.error('[notify-registration] Resend error:', error);
      return NextResponse.json(
        { detail: 'Falha ao enviar email de notificação', code: error.name },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[notify-registration] Unexpected error:', err);
    return NextResponse.json(
      { detail: 'Erro interno ao processar notificação' },
      { status: 500 }
    );
  }
}
