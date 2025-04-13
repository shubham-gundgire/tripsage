// For a production app, you would use a real email service like SendGrid, Mailgun, etc.
// This is a placeholder implementation that logs the email content to the console.

/**
 * Sends a password reset email
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - Recipient name
 * @param {string} resetLink - Password reset link
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(toEmail, userName, resetLink) {
  // In a real app, you would use an email service SDK here
  
  console.log(`
  =============== PASSWORD RESET EMAIL ===============
  To: ${toEmail}
  Subject: Reset Your TripSage Password
  
  Hello ${userName},
  
  We received a request to reset your password. If you didn't make this request, you can ignore this email.
  
  To reset your password, click the link below (valid for 1 hour):
  ${resetLink}
  
  Best regards,
  The TripSage Team
  ====================================================
  `);
  
  // For now, we'll just simulate sending an email
  return Promise.resolve();
}

/**
 * Sends a welcome email after registration
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - Recipient name
 * @returns {Promise<void>}
 */
export async function sendWelcomeEmail(toEmail, userName) {
  // In a real app, you would use an email service SDK here
  
  console.log(`
  =============== WELCOME EMAIL ===============
  To: ${toEmail}
  Subject: Welcome to TripSage!
  
  Hello ${userName},
  
  Thank you for joining TripSage! We're excited to help you plan your next adventure.
  
  Get started by exploring destinations or checking out our travel guides.
  
  Best regards,
  The TripSage Team
  ===============================================
  `);
  
  // For now, we'll just simulate sending an email
  return Promise.resolve();
} 