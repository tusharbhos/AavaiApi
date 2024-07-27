import asyncHandler from 'express-async-handler';
import Admin from '../models/admin.model';
import createError from 'http-errors';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwtHelper';
import { redis } from '../utils/redisConnect';

// Register Admin
export const registerAdmin = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    const adminExist = await Admin.findOne({ email });
    if (adminExist) throw createError.Conflict('User already registered.');

    const newAdmin = new Admin(req.body);
    const savedAdmin = await newAdmin.save();

    const accessToken = await signAccessToken(savedAdmin.id);
    const refreshToken = await signRefreshToken(savedAdmin.id);

    res.json({ accessToken, refreshToken });
});

// Login User
export const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) throw createError.NotFound('User not found.');

    const isMatched = await admin.ComparePassword(password);
    if (!isMatched) throw createError.Unauthorized('Invalid credentials.');

    const accessToken = await signAccessToken(admin.id);
    const refreshToken = await signRefreshToken(admin.id);

    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    res.json({ success: true, accessToken, refreshToken });
});

// Refresh Token
export const refreshToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) throw createError.BadRequest('Refresh token is required.');

    const userId = await verifyRefreshToken(refreshToken);
    const newAccessToken = await signAccessToken(userId);
    const newRefreshToken = await signRefreshToken(userId);
    res.cookie('accessToken', newAccessToken, { httpOnly: true });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});

// Logout User
export const logoutUser = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) throw createError.BadRequest('No refresh token found.');

    const userId = await verifyRefreshToken(refreshToken);
    redis.del(userId, (err) => {
        if (err) {
            console.error(err.message);
            throw createError.InternalServerError();
        }

        res.cookie('accessToken', '', { maxAge: 1 });
        res.cookie('refreshToken', '', { maxAge: 1 });

        res.json({ success: true, message: 'Logged out successfully.' });
    });
});
