import { Router, Request, Response } from 'express';
import { admin } from '../config/firebase';
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { validateAuthToken, AuthRequest } from '../middleware/auth';
import { isValidEmail, isValidPhone } from '../utils/validation';

const router = Router();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface InviteRequest extends Request {
  body: {
    method: 'email' | 'sms';
    recipient: string;
    message?: string;
  };
  user?: {
    id: string;
    uid: string;
    role: string;
    email?: string;
    displayName?: string;
  };
}

/**
 * @route POST /api/invite
 * @desc Send an invitation to a partner via email or SMS
 * @access Private
 */
router.post('/', validateAuthToken, async (req: InviteRequest, res: Response) => {
  try {
    const { method, recipient, message } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    if (!method || !recipient) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (method === 'email' && !isValidEmail(recipient)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (method === 'sms' && !isValidPhone(recipient)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 15);

    // Store invite in Firestore
    const inviteRef = admin.firestore().collection('invites').doc();
    await inviteRef.set({
      inviteCode,
      senderId: user.id,
      senderEmail: user.email,
      senderName: user.displayName,
      recipient,
      method,
      message: message || '',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      ),
    });

    // Send invitation based on method
    if (method === 'email') {
      await sendEmailInvite(
        recipient,
        user.displayName || 'Your partner',
        message,
        inviteCode
      );
    } else {
      await sendSMSInvite(
        recipient,
        user.displayName || 'Your partner',
        message,
        inviteCode
      );
    }

    res.status(200).json({
      message: 'Invitation sent successfully',
      inviteId: inviteRef.id,
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

/**
 * Send invitation via email using SendGrid
 */
async function sendEmailInvite(
  email: string,
  senderName: string,
  message: string | undefined,
  inviteCode: string
) {
  const inviteUrl = `${process.env.CLIENT_URL}/accept-invite/${inviteCode}`;
  
  await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sparqconnection.com',
    templateId: process.env.SENDGRID_INVITE_TEMPLATE_ID,
    dynamicTemplateData: {
      senderName,
      personalMessage: message,
      inviteUrl,
      inviteCode,
    },
  });
}

/**
 * Send invitation via SMS using Twilio
 */
async function sendSMSInvite(
  phone: string,
  senderName: string,
  message: string | undefined,
  inviteCode: string
) {
  const inviteUrl = `${process.env.CLIENT_URL}/accept-invite/${inviteCode}`;
  
  const smsBody = `${senderName} has invited you to connect on Sparq Connection!\n\n${
    message ? message + '\n\n' : ''
  }Join here: ${inviteUrl}`;

  await twilioClient.messages.create({
    body: smsBody,
    to: phone,
    from: process.env.TWILIO_PHONE_NUMBER,
  });
}

/**
 * @route GET /api/invite/:code
 * @desc Validate an invite code
 * @access Public
 */
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const inviteSnapshot = await admin
      .firestore()
      .collection('invites')
      .where('inviteCode', '==', code)
      .where('status', '==', 'pending')
      .where('expiresAt', '>', admin.firestore.Timestamp.now())
      .get();

    if (inviteSnapshot.empty) {
      return res.status(404).json({ error: 'Invalid or expired invite code' });
    }

    const invite = inviteSnapshot.docs[0].data();
    res.json({
      valid: true,
      senderName: invite.senderName,
      message: invite.message,
    });
  } catch (error) {
    console.error('Error validating invite:', error);
    res.status(500).json({ error: 'Failed to validate invite code' });
  }
});

export default router; 