"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jose_1 = require("jose");
const crypto_1 = require("crypto");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// OAuth Configuration
const CONFIG = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: process.env.REDIRECT_URI,
    JWT_SECRET: process.env.JWT_SECRET,
};
// Temporary store for authorization codes
const authCodes = new Map();
app.get('/api/oauth/authorize', (req, res) => {
    const { client_id, redirect_uri, state } = req.query;
    if (client_id !== CONFIG.CLIENT_ID) {
        return res.status(400).json({ error: 'invalid_client' });
    }
    if (redirect_uri !== CONFIG.REDIRECT_URI) {
        return res.status(400).json({ error: 'invalid_redirect_uri' });
    }
    const code = (0, crypto_1.randomBytes)(16).toString('hex');
    authCodes.set(code, client_id);
    console.log(`Generated Authorization Code: ${code}\n`);
    const redirectUrl = `${redirect_uri}?code=${code}${state ? `&state=${state}` : ''}`;
    return res.redirect(redirectUrl);
});
app.post('/api/oauth/token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { grant_type, code, redirect_uri, client_id, client_secret } = req.body;
        if (grant_type !== 'authorization_code') {
            return res.status(400).json({ error: 'invalid_grant' });
        }
        if (client_id !== CONFIG.CLIENT_ID || client_secret !== CONFIG.CLIENT_SECRET) {
            return res.status(400).json({ error: 'invalid_client' });
        }
        if (redirect_uri !== CONFIG.REDIRECT_URI) {
            return res.status(400).json({ error: 'invalid_redirect_uri' });
        }
        if (!code || !authCodes.has(code)) {
            return res.status(400).json({ error: 'invalid_code' });
        }
        authCodes.delete(code); // Remove the used code
        const secretKey = new TextEncoder().encode(CONFIG.JWT_SECRET);
        const payload = { user_id: 'user123' };
        const accessToken = yield new jose_1.SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(secretKey);
        const refreshToken = (0, crypto_1.randomBytes)(64).toString('hex');
        const result = {
            access_token: accessToken,
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: refreshToken,
        };
        console.log('Access token granted:', result);
        return res.json(result);
    }
    catch (error) {
        console.error('Error processing token request:', error);
        return res.status(500).json({ error: 'internal_error' });
    }
}));
// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`OAuth server running on http://localhost:${PORT}\n`));
