// services/emailService.js
import nodemailer from 'nodemailer';

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send referral invitation email to a doctor
 */
export const sendReferralEmail = async (recipientEmail, referralCode, referrerName, referralLink) => {
  try {
    const mailOptions = {
      from: `"Dental Referrals" <${process.env.EMAIL_FROM}>`,
      to: recipientEmail,
      subject: `${referrerName} invited you to join Dental`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                     padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #667eea; 
                       padding: 20px; text-align: center; margin: 20px 0; 
                       border-radius: 8px; }
            .code { font-size: 24px; font-weight: bold; color: #667eea; 
                   letter-spacing: 2px; font-family: monospace; }
            .button { display: inline-block; background: #667eea; color: white; 
                     padding: 15px 30px; text-decoration: none; border-radius: 5px; 
                     margin: 20px 0; font-weight: bold; }
            .rewards { background: #e8f5e9; padding: 20px; border-radius: 8px; 
                      margin: 20px 0; }
            .rewards h3 { color: #2e7d32; margin-top: 0; }
            .reward-item { display: flex; align-items: center; margin: 10px 0; }
            .reward-icon { color: #4caf50; margin-right: 10px; font-size: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦷 Dental Invitation</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px;">Hi there!</p>
              
              <p><strong>Dr. ${referrerName}</strong> thinks you'd be a great fit for Dental - 
              the modern dental practice management platform that's helping dentists streamline 
              their clinics.</p>
              
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your Referral Code</p>
                <div class="code">${referralCode}</div>
              </div>
              
              <p style="text-align: center;">
                <a href="${referralLink}" class="button">
                  Join Dental Now →
                </a>
              </p>
              
              <div class="rewards">
                <h3>🎁 Special Referral Benefits</h3>
                <div class="reward-item">
                  <span class="reward-icon">✓</span>
                  <span>Extended free trial period</span>
                </div>
                <div class="reward-item">
                  <span class="reward-icon">✓</span>
                  <span>Priority onboarding support</span>
                </div>
                <div class="reward-item">
                  <span class="reward-icon">✓</span>
                  <span>Exclusive training sessions</span>
                </div>
                <div class="reward-item">
                  <span class="reward-icon">✓</span>
                  <span>Help ${referrerName} earn rewards</span>
                </div>
              </div>
              
              <h3>Why Dental?</h3>
              <ul style="color: #555;">
                <li>📅 Smart appointment scheduling</li>
                <li>📊 Patient management & records</li>
                <li>💰 Billing & invoicing automation</li>
                <li>📈 Analytics & insights</li>
                <li>☁️ Cloud-based accessibility</li>
              </ul>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This invitation is valid for 30 days. Click the button above or use 
                the referral code during signup.
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Dental. All rights reserved.</p>
              <p style="font-size: 12px; color: #999;">
                This email was sent because ${referrerName} referred you to Dental.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Referral email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending referral email:', error);
    throw error;
  }
};

/**
 * Send notification to referrer when their referral registers
 */
export const sendReferralRegisteredEmail = async (referrerEmail, referrerName, referredDoctorName) => {
  try {
    const mailOptions = {
      from: `"DentalX Referrals" <${process.env.EMAIL_FROM}>`,
      to: referrerEmail,
      subject: '🎉 Your referral just registered!',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                       padding: 30px; text-align: center; border-radius: 10px;">
              <h1 style="color: white; margin: 0;">🎊 Great News!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 18px;">Hi Dr. ${referrerName},</p>
              
              <p><strong>${referredDoctorName}</strong> has just registered on DentalX using your referral!</p>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; color: #1976d2;">
                  💰 You'll earn rewards when they purchase a subscription plan:
                </p>
                <ul style="color: #1976d2; margin: 10px 0;">
                  <li>₹500 for Yearly Plan</li>
                  <li>₹200 for Monthly Plan</li>
                </ul>
              </div>
              
              <p>Track all your referrals in your dashboard to see when they activate paid plans.</p>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/referrals" 
                   style="display: inline-block; background: #667eea; color: white; 
                          padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                  View Dashboard →
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Registration notification sent to referrer');
  } catch (error) {
    console.error('❌ Error sending registration notification:', error);
  }
};

/**
 * Send notification when referral is accepted (subscription purchased)
 */
export const sendReferralAcceptedEmail = async (referrerEmail, referrerName, amount, planType) => {
  try {
    const mailOptions = {
      from: `"Dental Referrals" <${process.env.EMAIL_FROM}>`,
      to: referrerEmail,
      subject: '💰 You earned a referral reward!',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); 
                       padding: 30px; text-align: center; border-radius: 10px;">
              <h1 style="color: white; margin: 0;">💰 Reward Earned!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 18px;">Congratulations Dr. ${referrerName}!</p>
              
              <div style="background: white; border: 3px solid #4caf50; padding: 30px; 
                         text-align: center; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0; color: #666; font-size: 16px;">You've earned</p>
                <p style="font-size: 48px; color: #4caf50; font-weight: bold; margin: 10px 0;">
                  ₹${amount}
                </p>
                <p style="margin: 0; color: #666;">from ${planType} referral</p>
              </div>
              
              <p>Your referred doctor has purchased a subscription, and your reward has been credited!</p>
              
              <p style="background: #fff3cd; padding: 15px; border-radius: 5px; font-size: 14px;">
                💡 <strong>Keep referring!</strong> The more doctors you refer, the more you earn.
              </p>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/referrals" 
                   style="display: inline-block; background: #4caf50; color: white; 
                          padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                  View Earnings →
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Reward notification sent to referrer');
  } catch (error) {
    console.error('❌ Error sending reward notification:', error);
  }
};

// Verify email configuration on startup
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
};