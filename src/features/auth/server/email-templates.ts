/**
 * Templates de email para o sistema de autenticação.
 * Utiliza HTML inline (sem dependência de @react-email/components).
 *
 * Paleta oficial GS Produções:
 * - Electric Indigo:  #6422F2 (primário / CTAs)
 * - Turquesa Viva:    #19E6C5 (accent / destaques)
 * - Dark Indigo:      #2A2451 (títulos / header)
 * - Charcoal:         #333333 (texto)
 * - Cinza Neve:       #F0EEEF (fundo)
 * - Vanilla:          #F4E1C1 (destaque suave)
 */

/** URL base para assets (logo) em produção */
const BASE_URL = 'https://www.gsintra.online';

/** Logo hospedado no Supabase Storage (public bucket) — usar PNG pois SVG não renderiza em email */
const LOGO_URL = 'https://ohlyygukvmqbsfmwxbaq.supabase.co/storage/v1/object/public/public_/gs-logo-2.png';

/** Header padrão com gradient brand + logo */
function emailHeader(): string {
  return `
          <!-- Header com gradient brand -->
          <tr>
            <td style="background:linear-gradient(135deg,#4A18C7,#1A1535);padding:28px 32px;text-align:center;">
              <img
                src="${LOGO_URL}"
                alt="GS Produções"
                width="48"
                height="38"
                style="display:inline-block;vertical-align:middle;margin-right:12px;"
              />
              <span style="display:inline-block;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
                Intranet
              </span>
            </td>
          </tr>
          <!-- Accent bar turquesa -->
          <tr>
            <td style="height:3px;background-color:#19E6C5;font-size:0;line-height:0;">&nbsp;</td>
          </tr>`;
}

/** Footer padrão */
function emailFooter(): string {
  return `
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #DADADA;text-align:center;background-color:#F0EEEF;">
              <p style="margin:0;color:#999999;font-size:11px;line-height:1.5;">
                Este é um email automático enviado pela<br/>
                <strong style="color:#2A2451;">Intranet GS Produções</strong>
              </p>
            </td>
          </tr>`;
}

interface NewUserNotificationParams {
  fullName: string;
  email: string;
  registeredAt: string;
}

/**
 * Template de notificação para o admin quando um novo usuário se cadastra.
 * Enviado para comunicacao@gsproducao.com para aprovação manual.
 */
export function buildNewUserNotificationHtml({
  fullName,
  email,
  registeredAt,
}: NewUserNotificationParams): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Novo Cadastro - Intranet GS Produções</title>
</head>
<body style="margin:0;padding:0;background-color:#F0EEEF;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEF;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          ${emailHeader()}
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px;color:#2A2451;font-size:18px;font-weight:700;">
                Novo Cadastro Recebido
              </h2>
              <p style="margin:0 0 24px;color:#333333;font-size:14px;line-height:1.5;">
                Um novo usuário se cadastrou na intranet e aguarda aprovação.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEF;border-radius:8px;border:1px solid #DADADA;">
                <tr>
                  <td style="padding:20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#666666;font-size:13px;font-weight:500;width:100px;vertical-align:top;">Nome</td>
                        <td style="padding:8px 0;color:#1D1D1F;font-size:14px;font-weight:600;">${fullName}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666666;font-size:13px;font-weight:500;vertical-align:top;">Email</td>
                        <td style="padding:8px 0;color:#1D1D1F;font-size:14px;">
                          <a href="mailto:${email}" style="color:#6422F2;text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666666;font-size:13px;font-weight:500;vertical-align:top;">Data/Hora</td>
                        <td style="padding:8px 0;color:#1D1D1F;font-size:14px;">${registeredAt}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a
                      href="${BASE_URL}/admin/users"
                      style="display:inline-block;background-color:#6422F2;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;letter-spacing:-0.2px;"
                    >
                      Gerenciar Cadastros
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;color:#666666;font-size:13px;line-height:1.6;text-align:center;">
                Acesse o painel de administração para aprovar ou recusar este cadastro.
              </p>
            </td>
          </tr>
          ${emailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ---------------------------------------------------------------------------
// Email de aprovação — enviado ao usuário quando o admin aprova o cadastro
// ---------------------------------------------------------------------------

interface UserApprovedParams {
  fullName: string;
}

/**
 * Template de email enviado ao usuário quando seu cadastro é aprovado.
 */
export function buildUserApprovedHtml({ fullName }: UserApprovedParams): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cadastro Aprovado - Intranet GS Produções</title>
</head>
<body style="margin:0;padding:0;background-color:#F0EEEF;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEF;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          ${emailHeader()}
          <!-- Body -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <!-- Check icon -->
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background-color:#19E6C5;line-height:64px;text-align:center;margin-bottom:20px;">
                <span style="font-size:32px;color:#ffffff;">&#10003;</span>
              </div>

              <h2 style="margin:0 0 8px;color:#2A2451;font-size:22px;font-weight:700;">
                Cadastro Aprovado!
              </h2>
              <p style="margin:0 0 24px;color:#333333;font-size:15px;line-height:1.6;">
                Olá, <strong>${fullName}</strong>!<br/>
                Seu cadastro na Intranet GS Produções foi aprovado com sucesso.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEF;border-radius:8px;border:1px solid #DADADA;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px;text-align:left;">
                    <p style="margin:0 0 6px;color:#2A2451;font-size:14px;font-weight:600;">O que você pode fazer agora:</p>
                    <ul style="margin:0;padding:0 0 0 20px;color:#333333;font-size:13px;line-height:2;">
                      <li>Acessar os módulos internos da intranet</li>
                      <li>Visualizar documentos e formulários corporativos</li>
                      <li>Utilizar as ferramentas de trabalho disponíveis</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a
                      href="${BASE_URL}/login"
                      style="display:inline-block;background-color:#6422F2;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:-0.2px;"
                    >
                      Acessar a Intranet
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;color:#666666;font-size:12px;line-height:1.5;">
                Use o mesmo email e senha que você cadastrou para fazer login.
              </p>
            </td>
          </tr>
          ${emailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
