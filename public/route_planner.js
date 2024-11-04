// Function to initialize the Google Map
function initMap() {
  const mapOptions = {
    zoom: 12,
    center: { lat: 28.6139, lng: 77.209 },  // Default location (e.g., Delhi)
  };

  // Check if map placeholder exists in the DOM before rendering
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    const map = new google.maps.Map(mapContainer, mapOptions);

    // Example marker
    const marker = new google.maps.Marker({
      position: { lat: 28.6139, lng: 77.209 },
      map: map,
      title: "Delhi",
    });
  }
}

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

// Call the functions to load bus stops and bus numbers on window load
window.onload = function () {
  initMap();           // Initialize the Google Map
  loadBusStops();      // Load bus stops from CSV
  loadBusNumbers();    // Load bus numbers from CSV
};
