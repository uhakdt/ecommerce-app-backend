const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.SECRET;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/api\/v1\/product(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/category(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/order(.*)/,methods: ['GET', 'OPTIONS', 'POST']},
            {url: /\/api\/v1\/user(.*)/,methods: ['GET', 'OPTIONS', 'POST']},
            {url: /\/api\/v1\/postcode(.*)/,methods: ['GET', 'OPTIONS', 'POST']},
            '/api/v1/user/login',
            '/api/v1/user/register',
        ]
    })
}

async function isRevoked(req, payload, done) {
    if(!payload.isAdmin) {
        done(null, true)
    }

    done();
}

module.exports = authJwt