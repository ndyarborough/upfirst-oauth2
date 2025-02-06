import express, { Request, Response } from 'express';

const app = express();

app.get('/process', (req: Request, res: Response) => {
    const { code, state } = req.query;
    if (code) {
        return res.send(`Authorization successful! Code: ${code} State: ${state || 'N/A'}`);
    } else {
        return res.status(400).send('Authorization failed');
    }
});

app.listen(8081, () => {
    console.log('Redirect handler running on http://localhost:8081');
});