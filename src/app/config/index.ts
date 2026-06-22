export const configs = {
  port: process.env.PORT as string,
  database_url: process.env.DATABASE_URL as string,
  node_env: process.env.NODE_ENV as string,

  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_access_expires: process.env.JWT_ACCESS_EXPIRES as string,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_refresh_expires: process.env.JWT_REFRESH_EXPIRES as string,

  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND as string,

  super_admin_email: process.env.SUPER_ADMIN_EMAIL as string,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD as string,

  admin_email: process.env.ADMIN_EMAIL as string,
  admin_password: process.env.ADMIN_PASSWORD as string,

  google_client_id: process.env.GOOGLE_CLIENT_ID as string,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
  google_callback_url: process.env.GOOGLE_CALLBACK_URL as string,

  express_session_secret: process.env.EXPRESS_SESSION_SECRET as string,

  frontend_url: process.env.FRONTEND_URL as string,

  STRIPE: {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY as string,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET as string,
  },

  CLOUDINARY: {
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY as string,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET as string,
  },

  EMAIL_SENDER: {
    smtp_host: process.env.SMTP_HOST as string,
    smtp_port: process.env.SMTP_PORT as string,
    smtp_user: process.env.SMTP_USER as string,
    smtp_pass: process.env.SMTP_PASS as string,
    smtp_from: process.env.SMTP_FROM as string,
  },

  REDIS: {
    redis_host: process.env.REDIS_HOST as string,
    redis_port: process.env.REDIS_PORT as string,
    redis_username: process.env.REDIS_USERNAME as string,
    redis_password: process.env.REDIS_PASSWORD as string,
  },
};
