const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'j5pmsdev@gmail.com',
        pass: 'cifu voyi bkny ewyd' // App Password
    }
});

const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const mailOptions = {
            from: 'J5 Pharmacy Management System <j5pmsdev@gmail.com>',
            to: email,
            subject: 'Password Reset Request - J5 Pharmacy',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2563eb; text-align: center;">Password Reset Request</h1>
                    <p>You have requested to reset your password. Here is your password reset code:</p>
                    <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                        <h2 style="font-size: 32px; margin: 0; color: #333;">${resetToken}</h2>
                    </div>
                    <p>Please enter this code in the password reset page to continue.</p>
                    <p style="color: #666;">If you did not request this reset, please ignore this email.</p>
                    <p style="color: #666;">This code will expire in 15 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This is an automated message from J5 Pharmacy Management System. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendPasswordResetEmail
}; 