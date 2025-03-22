import express, { Request, Response } from 'express';
import { validateAuthToken } from '../middleware/auth';
import { db } from '../config/firebase';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const router = express.Router();

interface InviteBody {
  method: 'email' | 'sms';
  recipient: string;
  message?: string;
}

// Send invitation
router.post('/', validateAuthToken, async (req: Request<{}, {}, InviteBody>, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { method, recipient, message } = req.body;

    // Get user details for personalization
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    const senderName = userData?.displayName || 'A friend';

    // Generate invite code
    const inviteCode = generateInviteCode();

    // Store invitation in database
    const inviteData = {
      senderId: userId,
      recipient,
      method,
      inviteCode,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await db.collection('invites').add(inviteData);

    // Send invitation based on method
    const inviteUrl = `${process.env.APP_URL}/join?code=${inviteCode}`;

    if (method === 'sms') {
      await sendSMSInvite(recipient, senderName, message, inviteUrl, inviteCode);
    } else {
      await sendEmailInvite(recipient, senderName, message, inviteUrl, inviteCode);
    }

    res.json({ message: 'Invitation sent successfully', inviteCode });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ message: 'Error sending invitation' });
  }
});

// Helper functions
async function sendEmailInvite(
  email: string,
  senderName: string,
  personalMessage: string | undefined,
  inviteUrl: string,
  inviteCode: string
) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sparqconnection.com',
    templateId: process.env.SENDGRID_INVITE_TEMPLATE_ID,
    dynamicTemplateData: {
      senderName,
      personalMessage,
      inviteUrl,
      inviteCode
    }
  };

  await sgMail.send({
    ...msg,
    text: `${senderName} has invited you to join Sparq Connection! Click here to join: ${inviteUrl}`
  });
}

async function sendSMSInvite(
  phone: string,
  senderName: string,
  personalMessage: string | undefined,
  inviteUrl: string,
  inviteCode: string
) {
  const message = personalMessage
    ? `${senderName} has invited you to join Sparq Connection: "${personalMessage}". Join here: ${inviteUrl}`
    : `${senderName} has invited you to join Sparq Connection! Join here: ${inviteUrl}`;

  await twilioClient.messages.create({
    body: message,
    to: phone,
    from: process.env.TWILIO_PHONE_NUMBER
  });
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default router; 