const { expressjwt } = require('express-jwt');

function authJWT() {
    const secret = process.env.SECRET;

    return expressjwt({
        secret: secret,
        algorithms: ['HS256'],
        // isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            '/api/v1/users/login',
            '/api/v1/users/register',
        ]
    })
};

async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true);
    }
    done();
}

module.exports = authJWT;