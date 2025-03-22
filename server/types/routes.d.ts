import { Router } from 'express';

declare module './routes/auth' {
  const router: Router;
  export default router;
}

declare module './routes/journey' {
  const router: Router;
  export default router;
}

declare module './routes/dailyLog' {
  const router: Router;
  export default router;
}

declare module './routes/analytics' {
  const router: Router;
  export default router;
}

declare module './routes/faq' {
  const router: Router;
  export default router;
} 