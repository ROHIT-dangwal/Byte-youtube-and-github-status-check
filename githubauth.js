const express = require("express");
const passport = require("passport");
const GithubStrategy = require("passport-github2").Strategy;
const dotenv=require('dotenv');
const axios = require("axios");
const path=require("path");
function githubauth(app){
    dotenv.config();
    passport.use(
        new GithubStrategy(
          {
            clientID: process.env.github_client_id,
            clientSecret: process.env.github_client_secret,
            callbackURL: "http://localhost:8080/github_registered",
          },
          function (accessToken, refreshToken, profile, cb) {
            profile.accessToken = accessToken;
            return cb(null, profile);
          }
        )
      );
      app.get(
        "/github_register",
        passport.authenticate("github", { scope: ["user:email"] })
      );
      
      app.get("/github_registered",
        passport.authenticate("github", { failureRedirect: "/github_register" }),
        async (req, res) => {
          res.redirect("/github_dashboard");
        }
      );
      app.get("/github_dashboard", async (req, res) => {
        if (req.isAuthenticated()) {
          try {
            const response = await axios.get(
              `https://api.github.com/users/${req.user.username}/following/bytemait`,
              {
                headers: {
                  Authorization: `token ${req.user.accessToken}`,
                },
              }
            );
      
            if (response.status === 204) {
              res.render("following.ejs",{
                user: req.user
              })
            } else {
              res.render("notfollowing.ejs")
            }
          } catch (error) {
      res.render("notfollowing.ejs")
          }
        } 
        else {
          res.redirect("/github_register");
        }
      });
      app.get('/',(req,res)=>{
          res.sendFile(path.join(__dirname,'public','Login.html'));
      })




    

}

module.exports=githubauth;