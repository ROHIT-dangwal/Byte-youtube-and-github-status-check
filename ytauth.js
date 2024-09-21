const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
const dotenv=require('dotenv');
function ytauth(app){
    dotenv.config();
    passport.use(new GoogleStrategy({
        clientID: process.env.google_client_id,
        clientSecret: process.env.google_client_secret,
        callbackURL: "/yt_registered",
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'],
    }, async (accessToken, refreshToken, profile, done) => {
        profile.accessToken = accessToken;
        return done(null, profile);
    }));
    async function isUserSubscribedToChannel(accessToken, channelId) {
        try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    part: 'snippet',
                    mine: true,
                    forChannelId: channelId,
                },
            });
            return response.data.items.length > 0;
        } catch (error) {
            console.error('Error checking YouTube subscription:', error.response?.data || error.message);
            return false;
        }
    }
    app.get('/yt_register', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'] }));
app.get('/yt_registered', passport.authenticate('google', {
    failureRedirect: '/yt_register',
}), async (req, res) => {
    const channelId = 'UCgIzTPYitha6idOdrr7M8sQ';
    const isSubscribed = await isUserSubscribedToChannel(req.user.accessToken, channelId);
    if (isSubscribed) {
        res.render("subscribed.ejs",{
            user: req.user
          });
    } else {
        res.render("notsubscribed.ejs");
    }
});
    
}
module.exports=ytauth;