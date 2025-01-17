export const corsConfig = {
  origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '*').split(',');
    if (allowedOrigins.includes('*') || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'token',
    'accept',
    'origin',
    'access-control-allow-origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 3600,
  preflightContinue: false,
  optionsSuccessStatus: 204
}; 