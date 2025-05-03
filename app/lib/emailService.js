// For email sending functionality we use nodemailer
import nodemailer from 'nodemailer';

// SMTP Configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL || "apiloggerapp@gmail.com",
    pass: process.env.SMTP_PASSWORD || "kpqs ztua eqkd mjdm"
  }
};

// Create transporter
const transporter = nodemailer.createTransport(SMTP_CONFIG);

/**
 * Sends an email using the configured transporter
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @returns {Promise<any>} - Nodemailer response
 */
async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: process.env.DEFAULT_SENDER_EMAIL || "apiloggerapp@gmail.com",
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Sends a hotel booking confirmation email
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - Recipient name
 * @param {Object} bookingDetails - Hotel booking details
 * @returns {Promise<void>}
 */
export async function sendHotelBookingConfirmation(toEmail, userName, bookingDetails) {
  const subject = "Your Hotel Booking Confirmation - TripSage";
  
  // Format dates for display
  const checkInDate = new Date(bookingDetails.check_in_date);
  const checkOutDate = new Date(bookingDetails.check_out_date);
  const formattedCheckIn = checkInDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedCheckOut = checkOutDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Parse hotel details
  const hotelDetails = typeof bookingDetails.hotel_details === 'string' 
    ? JSON.parse(bookingDetails.hotel_details) 
    : bookingDetails.hotel_details;
  
  const hotelName = hotelDetails.hotel_name || 'Your Hotel';
  const hotelLocation = hotelDetails.hotel_location || 'Destination';
  const roomType = hotelDetails.room_type || 'Standard Room';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hotel Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 20px; text-align: center; color: white; }
        .booking-id { background-color: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 4px; font-size: 14px; margin-top: 5px; display: inline-block; }
        .content { padding: 20px; }
        .booking-details { background-color: #f9fafb; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .booking-details h3 { margin-top: 0; color: #4f46e5; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { text-align: right; }
        .total-price { font-size: 18px; color: #4f46e5; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; background-color: #f9fafb; }
        .button { display: inline-block; background: linear-gradient(to right, #4f46e5, #7c3aed); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .help-text { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px; }
        .help-text h3 { margin-top: 0; color: #4f46e5; }
        .contact-info { margin-top: 15px; display: flex; justify-content: center; gap: 20px; }
        .contact-method { text-align: center; }
        .contact-method p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmation</h1>
          <span class="booking-id">Booking ID: ${bookingDetails.id || 'TRH' + Date.now().toString().substring(6)}</span>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Thank you for choosing TripSage! Your hotel booking has been confirmed. Here are your booking details:</p>
          
          <div class="booking-details">
            <h3>${hotelName}</h3>
            <p>${hotelLocation}</p>
            
            <div class="detail-row">
              <span class="detail-label">Room Type:</span>
              <span class="detail-value">${roomType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-in:</span>
              <span class="detail-value">${formattedCheckIn}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-out:</span>
              <span class="detail-value">${formattedCheckOut}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Guests:</span>
              <span class="detail-value">${bookingDetails.guests}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Price:</span>
              <span class="detail-value total-price">₹${parseFloat(bookingDetails.total_price).toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <p>Special Requests: ${bookingDetails.special_requests || 'None'}</p>
          
          <p style="text-align: center;">
            <a href="https://tripsage.vercel.app/my-bookings" class="button">View Booking</a>
          </p>
          
          <div class="help-text">
            <h3>Need Help?</h3>
            <p>If you need to modify or cancel your booking, please do so at least 24 hours before check-in to avoid cancellation fees.</p>
            
            <div class="contact-info">
              <div class="contact-method">
                <p>Email</p>
                <p><a href="mailto:support@tripsage.com">support@tripsage.com</a></p>
              </div>
              <div class="contact-method">
                <p>Phone</p>
                <p>+91 123-456-7890</p>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>This is a confirmation of your booking. You don't need to print this email.</p>
          <p>&copy; ${new Date().getFullYear()} TripSage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await sendEmail(toEmail, subject, html);
  } catch (error) {
    console.error('Error sending hotel booking confirmation email:', error);
    return Promise.resolve();
  }
}

/**
 * Sends a travel package booking confirmation email
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - Recipient name
 * @param {Object} bookingDetails - Travel booking details
 * @returns {Promise<void>}
 */
export async function sendTravelBookingConfirmation(toEmail, userName, bookingDetails) {
  const subject = "Your Travel Package Confirmation - TripSage";
  
  // Format dates for display
  const travelDate = new Date(bookingDetails.travel_date);
  const formattedTravelDate = travelDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Parse travel details
  const travelDetails = typeof bookingDetails.travel_details === 'string' 
    ? JSON.parse(bookingDetails.travel_details) 
    : bookingDetails.travel_details;
  
  const packageName = travelDetails.package_name || 'Travel Package';
  const destination = travelDetails.destination || 'Exciting Destination';
  const duration = travelDetails.duration || 'Standard Duration';
  
  // Parse participants if it's a string
  const participants = typeof bookingDetails.participants === 'string'
    ? JSON.parse(bookingDetails.participants)
    : bookingDetails.participants || [];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Travel Package Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(to right, #10b981, #3b82f6); padding: 20px; text-align: center; color: white; }
        .booking-id { background-color: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 4px; font-size: 14px; margin-top: 5px; display: inline-block; }
        .content { padding: 20px; }
        .booking-details { background-color: #f0fdf4; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .booking-details h3 { margin-top: 0; color: #10b981; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { text-align: right; }
        .total-price { font-size: 18px; color: #10b981; font-weight: bold; }
        .participants-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .participants-table th { background-color: #e2e8f0; padding: 8px; text-align: left; }
        .participants-table td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; background-color: #f9fafb; }
        .button { display: inline-block; background: linear-gradient(to right, #10b981, #3b82f6); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .help-text { background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px; }
        .help-text h3 { margin-top: 0; color: #3b82f6; }
        .itinerary-highlight { background-color: #f3f4f6; padding: 10px; border-left: 4px solid #10b981; margin-top: 15px; }
        .contact-info { margin-top: 15px; display: flex; justify-content: center; gap: 20px; }
        .contact-method { text-align: center; }
        .contact-method p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Travel Package Confirmation</h1>
          <span class="booking-id">Booking ID: ${bookingDetails.id || 'TRP' + Date.now().toString().substring(6)}</span>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Your travel package has been confirmed! Get ready for an amazing experience at ${destination}. Here are your booking details:</p>
          
          <div class="booking-details">
            <h3>${packageName}</h3>
            <p>Destination: ${destination}</p>
            
            <div class="detail-row">
              <span class="detail-label">Travel Date:</span>
              <span class="detail-value">${formattedTravelDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${duration}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Guests:</span>
              <span class="detail-value">${bookingDetails.guests}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Price:</span>
              <span class="detail-value total-price">₹${parseFloat(bookingDetails.total_price).toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          ${participants.length > 0 ? `
          <h3>Participant Details</h3>
          <table class="participants-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
              </tr>
            </thead>
            <tbody>
              ${participants.map(participant => `
                <tr>
                  <td>${participant.name}</td>
                  <td>${participant.age}</td>
                  <td>${participant.gender}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : ''}
          
          <div class="itinerary-highlight">
            <p><strong>Preparation Tip:</strong> We recommend packing appropriate clothing for ${destination}'s weather during your travel dates.</p>
          </div>
          
          <p>Special Requests: ${bookingDetails.special_requests || 'None'}</p>
          
          <p style="text-align: center;">
            <a href="https://tripsage.vercel.app/my-bookings" class="button">View Booking</a>
          </p>
          
          <div class="help-text">
            <h3>Need Help?</h3>
            <p>If you need to modify or cancel your booking, please contact us at least 72 hours before the travel date to avoid cancellation fees.</p>
            
            <div class="contact-info">
              <div class="contact-method">
                <p>Email</p>
                <p><a href="mailto:support@tripsage.com">support@tripsage.com</a></p>
              </div>
              <div class="contact-method">
                <p>Phone</p>
                <p>+91 123-456-7890</p>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>This is a confirmation of your booking. You don't need to print this email.</p>
          <p>&copy; ${new Date().getFullYear()} TripSage. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await sendEmail(toEmail, subject, html);
  } catch (error) {
    console.error('Error sending travel booking confirmation email:', error);
    return Promise.resolve();
  }
} 