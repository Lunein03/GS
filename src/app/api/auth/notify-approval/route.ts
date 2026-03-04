import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resend, SENDER_EMAIL } from '@/shared/lib/resend';
import { buildUserApprovedHtml } from '@/features/auth/server/email-templates';

const bodySchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
});

/**
 * POST /api/auth/notify-approval
 *
 * Envia email ao usuário informando que seu cadastro foi aprovado.
 * Chamado pelo admin ao clicar em "Aprovar" na tela de gestão de usuários.
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

    const { error } = await resend.emails.send({
      from: `Intranet GS Produções <${SENDER_EMAIL}>`,
      to: [email],
      subject: 'Seu cadastro foi aprovado! — Intranet GS Produções',
      html: buildUserApprovedHtml({ fullName }),
    });

    if (error) {
      console.error('[notify-approval] Resend error:', error);
      return NextResponse.json(
        { detail: 'Falha ao enviar email de aprovação', code: error.name },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[notify-approval] Unexpected error:', err);
    return NextResponse.json(
      { detail: 'Erro interno ao processar notificação' },
      { status: 500 }
    );
  }
}
