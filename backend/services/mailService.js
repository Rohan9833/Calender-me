// services/mailService.js
require("dotenv").config();

// Import Brevo SDK - Correct way for v3+
const SibApiV3Sdk = require('@sendinblue/client');

// Create API instance directly
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Set API key correctly
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.EMAIL_PASS);

console.log("📧 Sender Email:", process.env.EMAIL_USER);
console.log("🔑 Brevo API Key:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing");

const sendConsentMail = async (doctor) => {
  try {
    const consentLink = `https://calendarme.digilateral.com/api/doctors/consent/${doctor._id}`;

    // Create email using object literal (simpler)
    const sendSmtpEmail = {
      sender: {
        email: process.env.EMAIL_USER,
        name: 'Calendar Campaign'
      },
      to: [{ email: doctor.email }],
      subject: 'Doctor Consent Required for Calendar Campaign',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Consent Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px; color: white;">
            <h1 style="margin: 0;">Calendar Campaign</h1>
            <p style="margin-top: 10px;">Your Consent Matters</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; margin-top: 20px;">
            <h2>Dear ${doctor.doctorName},</h2>
            <p>We request your consent to participate in the Personalized Calendar Campaign.</p>
            <p>Please click the button below to provide your consent:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${consentLink}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Give Consent
              </a>
            </div>
            
            <p>If you have any questions, please contact your Medical Representative.</p>
            <p>Thank you for your cooperation!</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully! Message ID:', result.messageId);
    console.log('📧 To:', doctor.email);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    if (error.response) {
      console.error('📝 Error details:', error.response.text);
    }
    throw error;
  }
};

module.exports = { sendConsentMail };
