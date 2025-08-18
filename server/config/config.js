require('dotenv').config();

module.exports = {
  // Configuration de la base de données
  database: {
    path: process.env.DB_PATH || './database/edutrack.db'
  },

  // Configuration CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'edutrack_dev_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Configuration de la limite de taux
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Configuration des emails
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@edutrack.com',
    secure: false
  },

  // Configuration des SMS
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
  },

  // Configuration des uploads
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },

  // Configuration de la sécurité
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'edutrack_session_secret_dev'
  },

  // Configuration des logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/edutrack.log'
  },

  // Configuration des notifications
  notifications: {
    emailEnabled: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
    smsEnabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  },

  // Configuration des fonctionnalités
  features: {
    emailNotifications: true,
    smsNotifications: false,
    fileUploads: true,
    realTimeUpdates: false
  }
};