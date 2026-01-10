  const express = require('express');
  const cookies = require('cookie-parser');
  const bodyParser = require('body-parser');
  const session = require("express-session");
  const cors = require('cors');
  const connectDb = require("./connection")
  require('dotenv').config();

  const User = require('./Routes/user');
  const Admin = require('./Routes/admin');

  const app = express();

  connectDb(process.env.MONGO_URL);

  app.use(express.json());

  app.use(bodyParser.urlencoded({ extended: true }));

  // Middleware setup
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));

  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(cookies());
  
  app.use(session({
    secret:'qwertyi',
    resave:true,
    saveUninitialized:true
}))

  app.use(express.static('public'));
  app.use(express.json())


  app.use('/', User);
  app.use('/admin', Admin);


  // Database connection
  module.exports= app;
  // app.listen(port ,function(){
  //     console.log("Server started on port " + port);
  // })