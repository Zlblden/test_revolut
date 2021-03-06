const http = require('http');
const fs = require('fs');
const config = require('./config/default.js');
const express = require('express');
const qs = require('qs');
let passport = require('passport');
let OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
let app = express();
const exp = Date.now() / 1000 + 60;
const axios = require('axios');
const jwt = require('jsonwebtoken');
const payload = {
    'iss': '127.0.0.1',
    'sub': config.clientID,
    'aud': 'https://revolut.com',
    'exp': exp
};
const privateKey = fs.readFileSync(config.privateKey);
const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
});

passport.use('provider', new OAuth2Strategy({
        authorizationURL: 'https://sandbox-business.revolut.com/app-confirm',
        clientID: config.clientID,
        tokenURL: 'https://sandbox-b2b.revolut.com/api/1.0/auth/token',
        callbackURL: config.redirect_uri
    },
    function (accessToken, refreshToken, profile, done) {}
));


/* GET users listing. */
app.get('/', passport.authenticate('provider'));

app.get('/auth/provider/callback', (req, res, next) => {
    axios.post('https://sandbox-b2b.revolut.com/api/1.0/auth/token', qs.stringify({
        grant_type: 'authorization_code',
        code: req.query.code,
        client_id: config.clientID,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: token,
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(function (response) {
            console.log(response.data);
            axios.get('https://sandbox-b2b.revolut.com/api/1.0/accounts', {
                headers: { 'Authorization': `Bearer ${response.data.access_token}` }
            })
                .then(function (response) {
                   res.send(response.data)
                })
                .catch(function (error) {
                    console.dir(error)
                    res.send(error)
                });
        })
        .catch(function (error) {
            console.dir(error)
            res.send(error)
        });
    
});

const server = http.createServer(app);
server.listen('8000', () => {
});


