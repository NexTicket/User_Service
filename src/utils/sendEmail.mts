// import sgMail from '@sendgrid/mail';
// import { config } from 'dotenv';

// config(); // Load .env variables

// if (!process.env.SENDGRID_API_KEY) {
//   throw new Error('SENDGRID_API_KEY is not defined in environment variables');
// }

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// export const sendLoginEmail = async ({
//   to,
//   email,
//   password,
//   firstName,
//   role
// }: {
//   to: string;
//   email: string;
//   password: string;
//   firstName?: string;
//   role: string;
// }) => {
//   if (!process.env.SENDGRID_FROM_EMAIL) {
//     throw new Error('SENDGRID_FROM_EMAIL is not defined in environment variables');
//   }

//   const msg = {
//     to,
//     from: process.env.SENDGRID_FROM_EMAIL,
//     subject: `Your ${role} account for NexTicket`,
//     html: `
//       <h2>Hi ${firstName || 'User'},</h2>
//       <p>Your ${role} account has been created on NexTicket.</p>
//       <p><strong>Login Email:</strong> ${email}<br/>
//          <strong>Password:</strong> ${password}</p>
//       <p>You can now log in at <a href="https://nexticket.com/login">NexTicket Login</a></p>
//       <br/>
//       <p>Best regards,<br/>NexTicket Team</p>
//     `,
//   };

//   await sgMail.send(msg);
// };


