// Function to handle route submission (for route planner)
function submitRoute() {
  alert("Route submitted successfully!");
}

// Function to load bus stops from busStops.csv and populate the "Select Start Place" and "Select Destination Place" dropdowns
async function loadBusStops() {
  try {
    // Fetch the bus stops CSV file
    const response = await fetch("busStops.csv");
    const csvText = await response.text();
    
    // Split the CSV text into rows and extract the bus stops
    const rows = csvText.split("\n").map(row => row.trim());
    
    // Get the dropdown elements for Start Place and Destination Place
    const startPlaceDropdown = document.getElementById("startPlace");
    const destinationPlaceDropdown = document.getElementById("destinationPlace");

    // Clear existing options in the dropdowns
    startPlaceDropdown.innerHTML = "";
    destinationPlaceDropdown.innerHTML = "";

    // Populate both dropdowns with bus stops, omitting the header and empty values
    rows.slice(1).forEach(busStop => {
      if (busStop) { // Only add non-empty bus stops
        const optionStart = document.createElement("option");
        const optionDestination = document.createElement("option");

        optionStart.value = busStop;
        optionStart.textContent = busStop;

        optionDestination.value = busStop;
        optionDestination.textContent = busStop;

        startPlaceDropdown.appendChild(optionStart);
        destinationPlaceDropdown.appendChild(optionDestination);
      }
    });
  } catch (error) {
    console.error("Error loading bus stops:", error);
  }
}

// Function to load route numbers from farestagefarecharts_1.csv and populate the "Select Bus Number" dropdown
async function loadBusNumbers() {
  try {
    // Fetch the farestagefarecharts CSV file
    const response = await fetch("farestagefarecharts_1.csv");
    const csvText = await response.text();

    // Split the CSV text into rows and extract the route numbers
    const rows = csvText.split("\n").map(row => row.split(",").map(item => item.trim()));

    // Get the "Route No." column (assuming it's the 4th column, index 3)
    const routeNoIndex = 3;

    // Get the dropdown element for "Select Bus Number"
    const busNumberDropdown = document.getElementById("selectBusForRoute");

    // Clear existing options in the dropdown
    busNumberDropdown.innerHTML = "";

    // Populate the dropdown with route numbers, omitting header and empty values
    rows.slice(4).forEach(row => {  // Starting from row 4 to skip header
      const routeNumber = row[routeNoIndex];

      if (routeNumber && !busNumberDropdown.querySelector(`option[value="${routeNumber}"]`)) { 
        // Check for non-empty route numbers and avoid duplicates
        const optionBusNumber = document.createElement("option");
        optionBusNumber.value = routeNumber;
        optionBusNumber.textContent = routeNumber;

        // Append to the dropdown
        busNumberDropdown.appendChild(optionBusNumber);
      }
    });
  } catch (error) {
    console.error("Error loading route numbers:", error);
  }
}
let map;

// Function to display the map with the bus route and stops
// Function to display the map with the bus route and stops
function displayMap(startPoint, endPoint, busStops) {
  if (map) {
    map.remove(); // Remove any previous map instance
  }       

  // Initialize the map centered on Delhi
  map = L.map('map').setView([28.6139, 77.2090], 12); // Coordinates for Delhi

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Create route control
  L.Routing.control({
    waypoints: [
      L.latLng(startPoint.lat, startPoint.lng),
      L.latLng(endPoint.lat, endPoint.lng)
    ],
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim() // For better geocoding support
  }).addTo(map);

  // Add bus stops as markers
  busStops.forEach(stop => {
    L.marker([stop.lat, stop.lng])
      .addTo(map)
      .bindPopup(stop.name);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const startPoint = { lat: 28.6139, lng: 77.2090 }; // Example: India Gate
  const endPoint = { lat: 28.7041, lng: 77.1025 };   // Example: Red Fort
  const busStops = [
    { lat: 28.6200, lng: 77.2150, name: 'Stop 1' },
    { lat: 28.6300, lng: 77.2200, name: 'Stop 2' },
    { lat: 28.6400, lng: 77.2300, name: 'Stop 3' }
  ];

  displayMap(startPoint, endPoint, busStops);
});


// Call the functions to load bus stops and bus numbers on window load
window.onload = function () {
  loadBusStops();      // Load bus stops from CSV
  loadBusNumbers();    // Load bus numbers from CSV
};
