document.getElementById('findRoute').addEventListener('click', function() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;

    if (!origin || !destination) {
        alert('Please enter both origin and destination.');
        return;
    }

    fetch(`/api/new-route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`)
        .then(response => response.json())
        .then(data => {
            const coordinatesText = data.map(coord => `${coord[0]}, ${coord[1]}`).join('\n');
            document.getElementById('coordinates').value = coordinatesText;
        })
        .catch(error => {
            console.error('Error fetching route:', error);
            alert('Failed to fetch route. Please try again.');
        });
});
