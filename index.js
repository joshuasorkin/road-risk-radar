const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const polyline = require('@mapbox/polyline');
const axios = require('axios');
dotenv.config();
const app = express();
const port = 3000;

function getAllPolylines(googleMapsResponse){
    const routes = googleMapsResponse.data.routes;
    let allPolylines = [];
    console.log({routes});
    routes.forEach(route => {
      route.legs.forEach(leg => {
        leg.steps.forEach(step => {
          const stepPolyline = step.polyline.points;
          // Decode polyline points to latitude and longitude pairs
          const decodedPolyline = polyline.decode(stepPolyline);
          // Append decoded polyline coordinates to allPolylines array
          allPolylines = allPolylines.concat(decodedPolyline);
        });
      });
    });

    return allPolylines;
}
app.get('/api/new-route', async (req, res) => {
    try {
        console.log("generating route...");

        // Retrieve score and language from the request
        const origin = req.query.origin;
        const destination = req.query.destination;
        console.log({origin});
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
        console.log({queryParams});
        // If there are any query parameters, append them to the URL
        if (queryParams.length > 0) {
            url = process.env.GOOGLE_MAPS_URL + '&' + queryParams.join('&');
        }

        console.log({url});

        // Fetching the data from the URL
        const response = await axios.get(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log({response});
        const polylines = getAllPolylines(response);
        console.log({polylines});
        //res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});