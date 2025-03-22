import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import https from 'https';
import fs from 'fs';
import ngrok from 'ngrok';

// Load environment variables from root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = JSON.parse(process.env.FIREBASE_ADMIN_SDK || '{}');
initializeApp({
  credential: cert(firebaseAdminConfig)
});

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? process.env.DEV_CORS_ORIGIN 
    : process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting - except for Stripe webhooks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit for development
  skip: (req) => req.path === process.env.WEBHOOK_PATH // Skip rate limiting for webhooks
});
app.use(limiter);

// Compression
app.use(compression());

// Body parsing - Raw body for Stripe webhooks, JSON for other routes
app.use(express.json({
  verify: (req: Request, res: Response, buf: Buffer) => {
    if (req.path === process.env.WEBHOOK_PATH) {
      (req as any).rawBody = buf.toString();
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Import routes
import authRoutes from './routes/auth';
import journeyRoutes from './routes/journey';
import dailyLogRoutes from './routes/dailyLog';
import analyticsRoutes from './routes/analytics';
import faqRoutes from './routes/faq';
import webhookRoutes from './routes/webhooks';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/dailyLog', dailyLogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server startup function
async function startServer() {
  const PORT = process.env.PORT || process.env.LOCAL_BACKEND_PORT || 8080;
  
  // Create server instance based on environment
  let server;
  
  if (process.env.NODE_ENV === 'development' && process.env.LOCAL_HTTPS === 'true') {
    // HTTPS server for local development
    const httpsOptions = {
      key: fs.readFileSync(process.env.LOCAL_SSL_KEY || ''),
      cert: fs.readFileSync(process.env.LOCAL_SSL_CERT || '')
    };
    server = https.createServer(httpsOptions, app);
  } else {
    server = app;
  }

  // Start the server
  server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`CORS Origin: ${process.env.NODE_ENV === 'development' ? process.env.DEV_CORS_ORIGIN : process.env.CORS_ORIGIN}`);

    // Start ngrok in development mode if configured
    if (process.env.NODE_ENV === 'development' && process.env.NGROK_AUTH_TOKEN) {
      try {
        const url = await ngrok.connect({
          addr: PORT,
          authtoken: process.env.NGROK_AUTH_TOKEN,
          region: process.env.NGROK_REGION || 'us',
          subdomain: process.env.NGROK_SUBDOMAIN,
          configPath: path.join(__dirname, '../ngrok.yml')
        });
        console.log(`Ngrok tunnel created: ${url}`);
        console.log(`Stripe webhook URL: ${url}${process.env.WEBHOOK_PATH}`);
        console.log('Use this URL in your Stripe webhook settings');
      } catch (error) {
        console.error('Failed to create ngrok tunnel:', error);
      }
    }
    
    // Log test configuration if in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log(`Max Test Couples: ${process.env.MAX_TEST_COUPLES}`);
      console.log(`Test Duration: ${process.env.TEST_DURATION_DAYS} days`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      if (process.env.NODE_ENV === 'development') {
        ngrok.kill();
      }
    });
  });
}

// Start the server
startServer().catch(console.error); 