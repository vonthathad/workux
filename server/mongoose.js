import serverConfig from './config';
// const mongoose = require('mongoose');

export default (mongoose, callback) => {
// Set native promises as mongoose promise
  const mong = mongoose;
  mong.Promise = global.Promise;

  const db = mongoose.connect(serverConfig.mongoURL, { server: { auto_reconnect: true } });
  // console.log(config.database);
  const dbc = mongoose.connection;
  // dbc.on('error', console.error.bind(console, 'connection error:'));
  // dbc.once('open', () =>  {
  //     console.log("DB connect successfully!");
  //     callback();
  // });

  dbc.on('connecting', () => {
    // console.log('connecting to MongoDB...');
  });

  dbc.on('error', () => {
    // console.error(`Error in MongoDb connection: ${error}`);
    mongoose.disconnect();
  });
  dbc.on('connected', () => {
    // console.log('MongoDB connected!');
  });
  dbc.once('open', () => {
    // console.log('MongoDB connection opened!');
    callback();
  });
  dbc.on('reconnected', () => {
    // console.log('MongoDB reconnected!');
  });
  dbc.on('disconnected', () => {
    // console.log('MongoDB disconnected!');
    // mongoose.connect(serverConfig.database, { server: { auto_reconnect: true } });
  });

  return db;
};
// require('../models/user.model');
// require('../models/category.model');
// require('../models/content.model');
// require('../models/comment.model');
