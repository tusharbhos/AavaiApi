import jwt from 'jsonwebtoken';
import createError from 'http-errors';

export const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return next(createError.Unauthorized());

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer') return next(createError.Unauthorized());

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            console.error("JWT Error:", message);
            return next(createError.Unauthorized(message));
        }
        req.payload = payload;
        next();
    });
};
