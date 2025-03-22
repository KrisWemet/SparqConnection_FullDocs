import express, { Request, Response } from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15'
});

interface StripeRequest extends Request {
  rawBody?: string;
}

router.post('/stripe', async (req: StripeRequest, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('No signature found');
  }

  try {
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      req.rawBody || '',
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle successful payment
        await handleSuccessfulPayment(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription update
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const canceledSubscription = event.data.object as Stripe.Subscription;
        // Handle subscription cancellation
        await handleSubscriptionCancellation(canceledSubscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

async function handleSuccessfulPayment(session: Stripe.Checkout.Session): Promise<void> {
  console.log('Payment successful:', session.id);
  // Add your payment handling logic here
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription updated:', subscription.id);
  // Add your subscription update logic here
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription canceled:', subscription.id);
  // Add your subscription cancellation logic here
}

export default router; 