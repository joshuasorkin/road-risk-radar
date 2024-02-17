const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const app = express();
const port = 3000;

app.get('/api/new-route', async (req, res) => {
    try {
        console.log("generating route...");

        // Retrieve score and language from the request
        const origin = req.query.origin;
        const destination = req.session.destination;
        

        // Initialize the base URL
        let url = process.env.GOOGLE_MAP_URL.replace("[ORIGIN]",origin).replace("[DESTINATION]",destination);


        // Array to hold query parameters
        const queryParams = [];

        // Check if origin is not undefined and append it to queryParams
        if (origin !== undefined) {
            queryParams.push(`origin=${encodeURIComponent(origin)}`);
        }

        // Check if origin is not undefined and append it to queryParams
        if (destination !== undefined) {
            queryParams.push(`destination=${encodeURIComponent(destination)}`);
        }

        // If there are any query parameters, append them to the URL
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }

        console.log({url});

        // Fetching the data from the URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Proxy endpoint for check-game
app.get('/api/check-game', async (req, res) => {
    try {
        const { gameId, playerSolution } = req.query;
        const url = process.env.BACK_END_URI+`/check-game?gameId=${gameId}&playerSolution=${playerSolution}`;
        console.log({url});
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log({data});
        res.json(data); // Send the response back to the frontend
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.use(express.static('public'));

app.get('/language/:language', (req,res) => {
    req.session.language = req.params.language;
    res.sendFile(path.join(__dirname,'public','index.html'));
});






app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});