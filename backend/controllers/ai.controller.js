import * as ai from '../services/ai.service.js';


export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        const result = await ai.generateResult(prompt);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(typeof result === 'string' ? JSON.stringify({ result }) : JSON.stringify(result));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({ message: error.message }));
    }
}