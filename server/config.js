const config = {
  mongoURL: process.env.MONGO_URL || 'mongodb://localhost:27017/mern-starter',
  port: process.env.PORT || 8000,
  guestToken: 'GUEST_TOKEN_HERE',
  key: 'KEY_TOKEN_HERE',
  facebook: {
    clientID: 'CLIENT_ID',
    clientSecret: 'CLIENT_SECRET',
    callbackURL: '/oauth/facebook/callback',
    profileFields: ['id', 'displayName', 'email', 'gender'],
  },
  app: {
    id: 'PRODUCT_ID',
    name: 'PRODUCT_NAME',
    description: 'PRODUCT_DESSCRIPTION',
    url: `${process.env.PROTOCOL}://${process.env.CHANNEL}.${process.env.DOMAIN}`,
    image: `${process.env.PROTOCOL}://${process.env.CHANNEL}.${process.env.DOMAIN}/ads.jpg`,
  },
  server: {
    host: `${process.env.PROTOCOL}://${process.env.CHANNEL}.${process.env.DOMAIN}`,
    port: process.env.PORT,
    channel: process.env.CHANNEL,
  },
};

export default config;
