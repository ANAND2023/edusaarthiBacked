const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"EduSaarthi" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'EduSaarthi - Verify your email address',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:'Google Sans',Roboto,Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Logo Section -->
          <tr>
            <td style="padding:40px 48px 20px 48px;text-align:center;">
              <div style="font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                <span style="color:#1e3a5f;">Edu</span><span style="color:#f97316;">Saarthi</span>
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:0 48px 16px 48px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:400;color:#202124;line-height:1.4;">
                Verify your email address
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;">
              <hr style="border:none;border-top:1px solid #e0e0e0;margin:0;" />
            </td>
          </tr>

          <!-- Body Text -->
          <tr>
            <td style="padding:24px 48px 8px 48px;">
              <p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:#5f6368;">
                EduSaarthi received a request to use <strong style="color:#202124;">${email}</strong> as the email address for your EduSaarthi account.
              </p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#5f6368;">
                Use this code to finish setting up your account:
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td style="padding:24px 48px;" align="center">
              <div style="display:inline-block;border:2px solid #1e3a5f;border-radius:8px;padding:16px 40px;background-color:#f8fafc;">
                <span style="font-size:36px;font-weight:700;letter-spacing:6px;color:#1e3a5f;font-family:'Google Sans',Roboto,monospace;">
                  ${otp}
                </span>
              </div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td style="padding:8px 48px 16px 48px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#5f6368;">
                This code will expire in <strong style="color:#202124;">10 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Safety Notice -->
          <tr>
            <td style="padding:16px 48px 40px 48px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#5f6368;">
                If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:20px 48px;border-top:1px solid #e0e0e0;">
              <p style="margin:0;font-size:11px;color:#9aa0a6;text-align:center;line-height:1.6;">
                © ${new Date().getFullYear()} EduSaarthi — Connecting Educators with Institutions
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP');
  }
};

module.exports = { sendOTP };
