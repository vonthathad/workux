const config = {
  mongoURL: process.env.MONGO_URL || 'mongodb://localhost:27017/mern-starter',
  port: process.env.PORT || 8000,
  guestToken: 'GUEST_TOKEN_HERE',
  key: 'KEY_TOKEN_HERE',
  facebook: {
    clientID: '1778993745699618',
    clientSecret: '72ec32d7798a0cac8b3e190232e14934',
    callbackURL: '/oauth/facebook/callback',
    profileFields: ['id', 'displayName', 'email', 'gender'],
  },
  google: {
    clientID: '844189525883-m0ph4rv2dn2k4fp0e6euk0rp2hqtqh4g.apps.googleusercontent.com',
    clientSecret: 'Ywnw7PUSIcasbPUoUQ4wvm1J',
    callbackURL: '/oauth/google/callback',
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
