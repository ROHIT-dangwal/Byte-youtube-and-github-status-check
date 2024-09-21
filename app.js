const express = require("express");
const passport = require("passport");
const session = require("express-session");
const dotenv=require('dotenv');
const axios = require("axios");
const path=require("path");
const githubauth=require('./githubauth.js');
const ytauth = require("./ytauth.js");
const app = express();
dotenv.config();
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
      secret: process.env.secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    })
  );
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, cb) => {
    cb(null, user);
  });
passport.deserializeUser((obj, cb) => {
    cb(null, obj);
  });
githubauth(app);
ytauth(app);
app.get("/logout", (req, res, next) => {
    req.logout(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect("/"); 
    });
  });
const PORT= process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("Running");
  });
