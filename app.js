const config = require('./config/default.js');
const fs = require('fs');
const axios = require('axios');
const privateKeyName = ''; // Should be valid path to the private key
const jwt = require('jsonwebtoken');
const payload = {
    'iss': config.authorizationURL,
    'sub': config.clientID,
    'aud': 'https://revolut.com'
};

async function run() {
    const privateKey = fs.readFileSync(privateKeyName);
    const token = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: 60 * 60
    });
    axios.get('https://b2b.revolut.com/api/1.0/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(function (response) {
            // handle success
            console.log(response);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
}

run();
