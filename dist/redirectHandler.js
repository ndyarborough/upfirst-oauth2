"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get('/process', (req, res) => {
    const { code, state } = req.query;
    if (code) {
        return res.send(`Authorization successful! Code: ${code} State: ${state || 'N/A'}`);
    }
    else {
        return res.status(400).send('Authorization failed');
    }
});
app.listen(8081, () => {
    console.log('Redirect handler running on http://localhost:8081');
});
