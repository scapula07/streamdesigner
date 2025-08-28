import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, text, html } = req.body;
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Configure your SMTP transport (use environment variables for real secrets)
  const transporter = nodemailer.createTransport({
    host: process.env.NEXT_SMTP_HOST,
    port: Number(process.env.NEXT_SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NEXT_SMTP_USER,
      pass: process.env.NEXT_SMTP_PASS,
    },
    // logger:true,
    // debug:true,
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.NEXT_SMTP_FROM || process.env.NEXT_SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
