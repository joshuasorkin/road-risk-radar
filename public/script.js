document.getElementById('getRoute').addEventListener('click', async function() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    // Inside the event listener for 'getRoute' button click
    const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${googleMapsApiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&avoid=tolls|highways`;

    try {
        const response = await fetch(`/api/new-route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
        const coordinates = await response.json();
        
        // Display coordinates
        document.getElementById('coordinates').value = JSON.stringify(coordinates, null, 2);
        
        // Display map
        document.getElementById('map').innerHTML = `<iframe width="100%" height="100%" frameborder="0" style="border:0" src="${mapUrl}" allowfullscreen></iframe>`;
    } catch (error) {
        console.error('Error fetching route:', error);
    }
});
