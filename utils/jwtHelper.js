import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { redis } from './redisConnect';
import { configDotenv } from 'dotenv';
configDotenv()

export const signAccessToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        const secret = process.env.ACCESS_TOKEN_SECRET;
        const options = {
            expiresIn: '1h',
            issuer: "AavaiTech",
            audience: userId
        };

        jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.error(err.message);
                return reject(createError.InternalServerError());
            }
            resolve(token);
        });
    });
};

export const signRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        const secret = process.env.REFRESH_TOKEN_SECRET;
        const options = {
            expiresIn: '1y',
            issuer: "AavaiTech",
            audience: userId
        };

        jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.error(err.message);
                return reject(createError.InternalServerError());
            }

            redis.set(userId, token, 'EX', 365 * 24 * 60 * 60, (err) => {
                if (err) {
                    console.error(err.message);
                    return reject(createError.InternalServerError());
                }
                resolve(token);
            });
        });
    });
};

export const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
            if (err) return reject(createError.Unauthorized());

            const userId = payload.aud;

            redis.get(userId, (err, result) => {
                if (err) {
                    console.error(err.message);
                    return reject(createError.InternalServerError());
                }

                if (refreshToken === result) return resolve(userId);
                reject(createError.Unauthorized());
            });
        });
    });
};
