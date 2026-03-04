/**
 * Templates de email para o Supabase Authentication.
 *
 * Estes templates devem ser copiados para o Supabase Dashboard:
 * Authentication → Email Templates → [cada seção]
 *
 * Variáveis disponíveis do Supabase (Go template):
 * - {{ .ConfirmationURL }} — Link completo de confirmação
 * - {{ .Token }}           — Código OTP (6 dígitos)
 * - {{ .TokenHash }}       — Hash do token
 * - {{ .SiteURL }}         — URL base do site configurada no Supabase
 *
 * Paleta GS Produções:
 * - Electric Indigo:  #6422F2
 * - Turquesa Viva:    #19E6C5
 * - Dark Indigo:      #2A2451
 * - Charcoal:         #333333
 * - Cinza Neve:       #F0EEEF
 *
 * Logo URL (Supabase Storage public bucket):
 * https://ohlyygukvmqbsfmwxbaq.supabase.co/storage/v1/object/public/public_/gs-logo-2.svg
 */

// =============================================================================
// 1. CONFIRM SIGN UP (Confirmação de cadastro)
// Subject: Confirme seu cadastro — Intranet GS Produções
// =============================================================================
export const CONFIRM_SIGNUP = `
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F0EEEF;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEF;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4A18C7,#1A1535);padding:28px 32px;text-align:center;">
              <img src="https://ohlyygukvmqbsfmwxbaq.supabase.co/storage/v1/object/public/public_/gs-logo-2.png" alt="GS Produções" width="48" height="38" style="display:inline-block;vertical-align:middle;margin-right:12px;" />
              <span style="display:inline-block;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Intranet</span>
            </td>
          </tr>
          <tr><td style="height:3px;background-color:#19E6C5;font-size:0;line-height:0;">&nbsp;</td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background-color:#6422F2;line-height:64px;text-align:center;margin-bottom:20px;">
                <span style="font-size:28px;color:#ffffff;">&#9993;</span>
              </div>
              <h2 style="margin:0 0 8px;color:#2A2451;font-size:22px;font-weight:700;">Confirme seu Email</h2>
              <p style="margin:0 0 24px;color:#333333;font-size:15px;line-height:1.6;">
                Obrigado por se cadastrar na Intranet GS Produções!<br/>
                Clique no botão abaixo para confirmar seu endereço de email.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#6422F2;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
                      Confirmar Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#666666;font-size:12px;line-height:1.5;">
                Se você não criou esta conta, ignore este email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #DADADA;text-align:center;background-color:#F0EEEF;">
              <p style="margin:0;color:#999999;font-size:11px;line-height:1.5;">
                Este é um email automático enviado pela<br/><strong style="color:#2A2451;">Intranet GS Produções</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// =============================================================================
// 2. INVITE USER (Convite para novo usuário)
// Subject: Você foi convidado — Intranet GS Produções
// =============================================================================
export const INVITE_USER = `
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F0EEEF;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEF;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4A18C7,#1A1535);padding:28px 32px;text-align:center;">
              <img src="https://ohlyygukvmqbsfmwxbaq.supabase.co/storage/v1/object/public/public_/gs-logo-2.png" alt="GS Produções" width="48" height="38" style="display:inline-block;vertical-align:middle;margin-right:12px;" />
              <span style="display:inline-block;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Intranet</span>
            </td>
          </tr>
          <tr><td style="height:3px;background-color:#19E6C5;font-size:0;line-height:0;">&nbsp;</td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background-color:#19E6C5;line-height:64px;text-align:center;margin-bottom:20px;">
                <span style="font-size:28px;color:#ffffff;">&#128075;</span>
              </div>
              <h2 style="margin:0 0 8px;color:#2A2451;font-size:22px;font-weight:700;">Você Foi Convidado!</h2>
              <p style="margin:0 0 24px;color:#333333;font-size:15px;line-height:1.6;">
                Você foi convidado para fazer parte da<br/>
                <strong>Intranet GS Produções</strong>.<br/>
                Clique no botão abaixo para aceitar o convite e criar sua conta.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#6422F2;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
                      Aceitar Convite
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#666666;font-size:12px;line-height:1.5;">
                Se você não esperava este convite, ignore este email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #DADADA;text-align:center;background-color:#F0EEEF;">
              <p style="margin:0;color:#999999;font-size:11px;line-height:1.5;">
                Este é um email automático enviado pela<br/><strong style="color:#2A2451;">Intranet GS Produções</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// =============================================================================
// 3. MAGIC LINK (Login via link mágico)
// Subject: Seu link de acesso — Intranet GS Produções
// =============================================================================
export const MAGIC_LINK = `
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F0EEEF;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEF;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4A18C7,#1A1535);padding:28px 32px;text-align:center;">
              <img src="https://ohlyygukvmqbsfmwxbaq.supabase.co/storage/v1/object/public/public_/gs-logo-2.png" alt="GS Produções" width="48" height="38" style="display:inline-block;vertical-align:middle;margin-right:12px;" />
              <span style="display:inline-block;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Intranet</span>
            </td>
          </tr>
          <tr><td style="height:3px;background-color:#19E6C5;font-size:0;line-height:0;">&nbsp;</td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background-color:#6422F2;line-height:64px;text-align:center;margin-bottom:20px;">
                <span style="font-size:28px;color:#ffffff;">&#10024;</span>
              </div>
              <h2 style="margin:0 0 8px;color:#2A2451;font-size:22px;font-weight:700;">Seu Link de Acesso</h2>
              <p style="margin:0 0 24px;color:#333333;font-size:15px;line-height:1.6;">
                Clique no botão abaixo para acessar a Intranet GS Produções.<br/>
                Este link é válido por tempo limitado e uso único.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#6422F2;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
                      Entrar na Intranet
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#666666;font-size:12px;line-height:1.5;">
                Se você não solicitou este acesso, ignore este email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #DADADA;text-align:center;background-color:#F0EEEF;">
              <p style="margin:0;color:#999999;font-size:11px;line-height:1.5;">
                Este é um email automático enviado pela<br/><strong style="color:#2A2451;">Intranet GS Produções</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// =============================================================================
// 4. CHANGE EMAIL ADDRESS (Confirmação de troca de email)
// Subject: Confirme seu novo email — Intranet GS Produções
// =============================================================================
export const CHANGE_EMAIL = `
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F0EEEF;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEF;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4A18C7,#1A1535);padding:28px 32px;text-align:center;">
              <img src="https://ohlyygukvmqbsfmwxbaq.supabase.co/storage/v1/object/public/public_/gs-logo-2.png" alt="GS Produções" width="48" height="38" style="display:inline-block;vertical-align:middle;margin-right:12px;" />
              <span style="display:inline-block;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Intranet</span>
            </td>
          </tr>
          <tr><td style="height:3px;background-color:#19E6C5;font-size:0;line-height:0;">&nbsp;</td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background-color:#F4E1C1;line-height:64px;text-align:center;margin-bottom:20px;">
                <span style="font-size:28px;color:#2A2451;">&#9998;</span>
              </div>
              <h2 style="margin:0 0 8px;color:#2A2451;font-size:22px;font-weight:700;">Confirme seu Novo Email</h2>
              <p style="margin:0 0 24px;color:#333333;font-size:15px;line-height:1.6;">
                Você solicitou a alteração do email da sua conta<br/>
                na Intranet GS Produções.<br/>
                Clique no botão abaixo para confirmar o novo endereço.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#6422F2;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
                      Confirmar Novo Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#666666;font-size:12px;line-height:1.5;">
                Se você não solicitou esta alteração, ignore este email.<br/>
                Seu email atual permanecerá inalterado.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #DADADA;text-align:center;background-color:#F0EEEF;">
              <p style="margin:0;color:#999999;font-size:11px;line-height:1.5;">
                Este é um email automático enviado pela<br/><strong style="color:#2A2451;">Intranet GS Produções</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// =============================================================================
// 5. RESET PASSWORD (Redefinição de senha)
// Subject: Redefinir sua senha — Intranet GS Produções
// =============================================================================
export const RESET_PASSWORD = `
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F0EEEF;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEF;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4A18C7,#1A1535);padding:28px 32px;text-align:center;">
              <img src="https://ohlyygukvmqbsfmwxbaq.supabase.co/storage/v1/object/public/public_/gs-logo-2.png" alt="GS Produções" width="48" height="38" style="display:inline-block;vertical-align:middle;margin-right:12px;" />
              <span style="display:inline-block;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Intranet</span>
            </td>
          </tr>
          <tr><td style="height:3px;background-color:#19E6C5;font-size:0;line-height:0;">&nbsp;</td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background-color:#2A2451;line-height:64px;text-align:center;margin-bottom:20px;">
                <span style="font-size:28px;color:#ffffff;">&#128274;</span>
              </div>
              <h2 style="margin:0 0 8px;color:#2A2451;font-size:22px;font-weight:700;">Redefinir Senha</h2>
              <p style="margin:0 0 24px;color:#333333;font-size:15px;line-height:1.6;">
                Recebemos uma solicitação para redefinir a senha<br/>
                da sua conta na Intranet GS Produções.<br/>
                Clique no botão abaixo para criar uma nova senha.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#6422F2;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#666666;font-size:12px;line-height:1.5;">
                Se você não solicitou a redefinição de senha, ignore este email.<br/>
                Sua senha atual permanecerá inalterada.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #DADADA;text-align:center;background-color:#F0EEEF;">
              <p style="margin:0;color:#999999;font-size:11px;line-height:1.5;">
                Este é um email automático enviado pela<br/><strong style="color:#2A2451;">Intranet GS Produções</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// =============================================================================
// 6. REAUTHENTICATION (Reautenticação — código OTP)
// Subject: Código de verificação — Intranet GS Produções
// =============================================================================
export const REAUTHENTICATION = `
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F0EEEF;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEF;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4A18C7,#1A1535);padding:28px 32px;text-align:center;">
              <img src="https://ohlyygukvmqbsfmwxbaq.supabase.co/storage/v1/object/public/public_/gs-logo-2.png" alt="GS Produções" width="48" height="38" style="display:inline-block;vertical-align:middle;margin-right:12px;" />
              <span style="display:inline-block;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Intranet</span>
            </td>
          </tr>
          <tr><td style="height:3px;background-color:#19E6C5;font-size:0;line-height:0;">&nbsp;</td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background-color:#2A2451;line-height:64px;text-align:center;margin-bottom:20px;">
                <span style="font-size:28px;color:#19E6C5;">&#128272;</span>
              </div>
              <h2 style="margin:0 0 8px;color:#2A2451;font-size:22px;font-weight:700;">Código de Verificação</h2>
              <p style="margin:0 0 24px;color:#333333;font-size:15px;line-height:1.6;">
                Para continuar com a ação solicitada,<br/>
                use o código de verificação abaixo:
              </p>
              <!-- OTP Code -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#F0EEEF;border:2px solid #6422F2;border-radius:12px;padding:16px 40px;">
                      <span style="font-size:32px;font-weight:700;color:#2A2451;letter-spacing:8px;font-family:'Courier New',monospace;">{{ .Token }}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#666666;font-size:12px;line-height:1.5;">
                Este código é válido por tempo limitado.<br/>
                Se você não solicitou esta verificação, ignore este email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #DADADA;text-align:center;background-color:#F0EEEF;">
              <p style="margin:0;color:#999999;font-size:11px;line-height:1.5;">
                Este é um email automático enviado pela<br/><strong style="color:#2A2451;">Intranet GS Produções</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
