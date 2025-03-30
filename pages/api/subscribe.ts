import { NextApiRequest, NextApiResponse } from 'next';
import sendgrid from '@sendgrid/mail';

// Set your SendGrid API Key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, name } = req.body; // Include 'name' for dynamic data

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    try {
      // Send a dynamic template email using SendGrid
      await sendgrid.send({
        to: email, // The recipient's email address
        from: 'admin@lookinit.com', // Your verified sender email address
        templateId: process.env.SENDGRID_DYNAMIC_TEMPLATE_ID || '', // Use template ID from .env
        dynamicTemplateData: {
          name: name || 'Subscriber', // Pass dynamic data for placeholders
        },
      });

      console.log(`Dynamic subscription email sent to: ${email}`);
      return res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send subscription email' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}