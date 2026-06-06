import nodemailer from 'nodemailer';

export const sendOTPEmail = async (toEmail, otpCode, type = 'verify') => {
    try {
        const isReady = process.env.EMAIL_USER && process.env.EMAIL_PASS;

        // In dev environment or missing env variables, use Ethereal dummy account
        let transporter;
        if (!isReady) {
            console.log('⚠️ No EMAIL_USER or EMAIL_PASS configured in .env. Using mock Ethereal Email service for testing.');
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        } else {
            transporter = nodemailer.createTransport({
                service: 'gmail', // or configured host
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        }

        const isReset = type === 'reset';

        const mailOptions = {
            from: '"TradeSim Security" <noreply@tradesim.com>',
            to: toEmail,
            subject: isReset ? 'Your Password Reset OTP - TradeSim' : 'Verify your TradeSim Account',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #3b82f6; text-align: center;">TradeSim</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">
            ${isReset ? 'You requested a password reset.' : 'Welcome to TradeSim! Please verify your email address.'}
          </p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Your 6-digit OTP code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #111827; margin: 0;">${otpCode}</h1>
          </div>
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            This code will expire in ${isReset ? '15' : '10'} minutes. Do not share this code with anyone.
          </p>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);

        if (!isReady) {
            console.log(`✉️ [MOCK EMAIL SENT] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        } else {
            console.log(`✉️ Real Email OTP sent to ${toEmail}`);
        }

        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        // Even if it fails (due to bad credentials), we still resolve so it doesn't crash the server.
        return false;
    }
};
