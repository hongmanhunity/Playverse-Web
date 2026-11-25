const nodemailer = require('nodemailer');
const env = require('../config/env');

const buildOtpEmailHtml = ({ title, subtitle, otp, expireMinutes = 10 }) => `
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 36px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06);">
            <!-- Top gradient bar -->
            <tr>
              <td style="height: 4px; background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%); font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="padding: 28px 32px 18px; border-bottom: 1px solid #F1F5F9;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <span style="font-size: 22px; font-weight: 800; letter-spacing: 0.5px; font-style: italic; color: #0F172A;">
                        Play<span style="color: #4F46E5;">verse</span>
                      </span>
                    </td>
                    <td align="right">
                      <span style="display: inline-block; padding: 4px 10px; border-radius: 999px; background-color: #EEF2FF; color: #4F46E5; font-size: 11.5px; font-weight: 600;">
                        Xác thực bảo mật
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 28px 32px;">
                <h1 style="margin: 0 0 10px; font-size: 20px; font-weight: 700; color: #0F172A;">
                  ${title}
                </h1>
                <p style="margin: 0 0 24px; font-size: 14.5px; line-height: 1.65; color: #475569;">
                  ${subtitle}
                </p>

                <!-- Hero OTP Code Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="background-color: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; padding: 22px 16px;">
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #6366F1; font-weight: 700; margin-bottom: 8px;">
                        Mã xác nhận của bạn
                      </div>
                      <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #4F46E5; padding-left: 10px;">
                        ${otp}
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Security Warning Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="background-color: #F8FAFC; border-left: 3px solid #F59E0B; border-radius: 0 8px 8px 0; padding: 12px 14px;">
                      <p style="margin: 0; font-size: 12.5px; line-height: 1.55; color: #475569;">
                        Mã có hiệu lực trong <strong style="color: #0F172A;">${expireMinutes} phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #F8FAFC; padding: 16px 32px; border-top: 1px solid #F1F5F9; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #94A3B8;">
                  PlayVerse Digital Store &bull; Email tự động, vui lòng không trả lời.
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

/**
 * Gửi email OTP hỗ trợ cả HTTPS API (Resend - không bị VPS chặn port) và SMTP (Nodemailer)
 */
const sendOtpEmail = async ({ to, subject, title, subtitle, otp, expireMinutes = 10 }) => {
  const html = buildOtpEmailHtml({ title, subtitle, otp, expireMinutes });

  // 1. Ưu tiên Resend HTTP API (Port 443 - hoạt động mọi VPS)
  if (env.email.resendApiKey) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.email.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.email.from,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API error: ${errText}`);
    }
    return { delivered: true, provider: 'resend' };
  }

  // 2. Nodemailer SMTP (Gmail App Password / Brevo / Mailgun)
  if (env.email.smtpHost && env.email.smtpUser && env.email.smtpPass) {
    const transporter = nodemailer.createTransport({
      host: env.email.smtpHost,
      port: env.email.smtpPort,
      secure: env.email.smtpPort === 465,
      auth: {
        user: env.email.smtpUser,
        pass: env.email.smtpPass,
      },
    });

    await transporter.sendMail({
      from: env.email.from,
      to,
      subject,
      html,
    });
    return { delivered: true, provider: 'smtp' };
  }

  // 3. Fallback khi chạy local chưa cấu hình SMTP/Resend
  console.log(`[Email Dev Mode] To: ${to} | Subject: ${subject} | OTP: ${otp}`);
  return { delivered: false, provider: 'dev-console' };
};

module.exports = { sendOtpEmail };
