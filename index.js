const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const polyline = require('@mapbox/polyline');
const axios = require('axios');
const fs = require('fs');
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
        const polylines = getAllPolylines(response);

        // Submit each coordinate pair to the trafficresponse API
        const trafficDataPromises = polylines.map(coordPair => {
            return axios.post('https://lululopez.app.modelbit.com/v1/trafficv1_deploy/latest', {
                data: coordPair // Assuming coordPair is in the format [latitude, longitude]
            })
            .then(response => {
                const incidentRatio = response.data.data[0]; // Assuming the first element is INCIDENT_RATIO
                return `[${coordPair.toString()}]: risk level ${incidentRatio.toFixed(2)}`; // Format to 2 decimal places
            })
            .catch(error => {
                console.error('Error fetching traffic data:', error);
                return `[${coordPair.toString()}]: risk level unavailable`;
            });
        });
        console.log("submitting all promises");
        const riskLevels = await Promise.all(trafficDataPromises);

        /*

         // Generate synthetic risk levels for all coordinate pairs
         const riskLevels = polylines.map(coordPair => {
            // Generate a random risk level between 0 and 100
            const riskLevel = Math.floor(Math.random() * 11); // 101 because Math.random() is exclusive of 1
            return `[${coordPair.toString()}]: risk level ${riskLevel}`;
        });

        */

        res.send(riskLevels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading index.html file:', err);
            res.status(500).send('Server error');
            return;
        }
        // Replace a placeholder in your HTML with the actual API key
        const result = data.replace(/YOUR_GOOGLE_MAPS_API_KEY/g, process.env.GOOGLE_MAPS_API_KEY);
        res.send(result);
    });
});

// Static files middleware for CSS, JS, etc.
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});