import express, { Request, Response } from 'express';
import { SignJWT } from 'jose';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// OAuth 2.0 configuration
const CONFIG = {
    CLIENT_ID: process.env.CLIENT_ID as string,
    CLIENT_SECRET: process.env.CLIENT_SECRET as string,
    REDIRECT_URI: process.env.REDIRECT_URI as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
};

// Temporary store for authorization codes and state
const authRequests = new Map<string, { clientId: string, state: string }>();

// Authorization endpoint
app.get('/api/oauth/authorize', (req: Request, res: Response) => {
    const { client_id, redirect_uri, state } = req.query;

    if (!state) {
        return res.status(400).json({ error: 'missing_state' });
    }

    if (client_id !== CONFIG.CLIENT_ID || redirect_uri !== CONFIG.REDIRECT_URI) {
        return res.status(400).json({ error: 'invalid_client_or_redirect_uri' });
    }

    // Generate and store authorization code
    const code = randomBytes(16).toString('hex');
    authRequests.set(code, { clientId: client_id as string, state: state as string });

    const redirectUrl = `${redirect_uri}?code=${code}&state=${state}`;
    return res.redirect(redirectUrl);
});

// Token exchange endpoint
app.post('/api/oauth/token', async (req: Request, res: Response) => {
    try {
        const { grant_type, code, redirect_uri, client_id, client_secret, state } = req.body;

        if (grant_type !== 'authorization_code') {
            return res.status(400).json({ error: 'invalid_grant' });
        }

        if (client_id !== CONFIG.CLIENT_ID || client_secret !== CONFIG.CLIENT_SECRET || redirect_uri !== CONFIG.REDIRECT_URI) {
            return res.status(400).json({ error: 'invalid_client_or_redirect_uri' });
        }

        const authData = authRequests.get(code);
        if (!authData || authData.state !== state) {
            return res.status(400).json({ error: 'invalid_code_or_state' });
        }

        authRequests.delete(code); // Remove used code

        const secretKey = new TextEncoder().encode(CONFIG.JWT_SECRET);
        const accessToken = await new SignJWT({ user_id: 'user123' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(secretKey);

        const refreshToken = randomBytes(64).toString('hex');

        return res.json({
            access_token: accessToken,
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: refreshToken,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'internal_error' });
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`OAuth server running on http://localhost:${PORT}`));