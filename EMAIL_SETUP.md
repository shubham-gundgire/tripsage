# Email Service Setup for TripSage

This document explains how to set up and use the email service for sending booking confirmations.

## SMTP Configuration

The email service uses nodemailer with SMTP to send emails. Here are the configuration values:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=apiloggerapp@gmail.com
SMTP_PASSWORD=kpqs ztua eqkd mjdm
DEFAULT_SENDER_EMAIL=apiloggerapp@gmail.com
```

## Setting Up Environment Variables

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add the SMTP configuration values to this file

## Email Templates

Two HTML email templates have been created:

1. **Hotel Booking Confirmation** - Sent when a user successfully books a hotel
2. **Travel Package Confirmation** - Sent when a user successfully books a travel package

## How It Works

1. When a user books a hotel or travel package, the API endpoint creates the booking record in the database
2. After successful booking creation, the system sends a confirmation email to the user's email address
3. The email contains all the relevant booking details formatted in a visually appealing HTML template

## Troubleshooting

If emails are not being sent:

1. Check that the SMTP credentials are correct
2. Verify that the user's email address is valid
3. Look at the server logs for any error messages related to email sending
4. Make sure nodemailer is installed (run `npm install nodemailer`)

## Testing Email Sending

You can test the email sending functionality by:

1. Creating a hotel or travel booking through the UI
2. Checking the server logs for "Email sent successfully" messages
3. Verifying that the email was received at the specified address

## Security Considerations

- The SMTP password is stored in environment variables which are not committed to version control
- For production, consider using a dedicated email service like SendGrid, Mailgun, or Amazon SES 