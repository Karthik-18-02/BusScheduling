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
    const busNumberDropdown = document.getElementById("busRouteDropdown");
  
    // Clear existing options in the dropdown
    busNumberDropdown.innerHTML = "";
  
    // Populate the dropdown with route numbers, omitting header and empty values
    rows.slice(4).forEach(row => {  // Starting from row 4 to skip header
      const routeNumber = row[routeNoIndex];
  
      if (routeNumber && !busNumberDropdown.querySelector(option[value="${routeNumber}"])) { 
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
  
  // Ensure the bus numbers are loaded when the DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
  loadBusNumbers();  // Load bus numbers from CSV
  });
  
  // Event listener for Apply Leave button
  document.getElementById("applyLeaveButton").addEventListener("click", function() {
    window.location.href = "apply_leave.html"; // Redirect to the leave application page
  });
  
  // Function to load route numbers from farestagefarecharts_1.csv and populate the "Select Bus Number" dropdown
  async function loadAssignedBusRoute() {
    try {
      const response = await fetch("farestagefarecharts_1.csv");
      const csvText = await response.text();
  
      const rows = csvText.split("\n").map(row => row.split(",").map(item => item.trim()));
  
      const routeNoIndex = 3;
      const fareStagesIndex = 6;
  
      const busRouteDropdown = document.getElementById("busRouteDropdown");
      busRouteDropdown.innerHTML = "";
  
      rows.slice(1).forEach(row => {
        const routeNumber = row[routeNoIndex];
        const fareStages = row[fareStagesIndex];
        if (routeNumber && fareStages) {
          const optionBusRoute = document.createElement("option");
          optionBusRoute.value = fareStages; // Store fare stages as value
          optionBusRoute.textContent = routeNumber;
  
          busRouteDropdown.appendChild(optionBusRoute);
        }
      });
  
      busRouteDropdown.addEventListener('change', updateStartDestinationAndStops);
    } catch (error) {
      console.error("Error loading route numbers:", error);
    }
  }
  
  // Function to update the start and destination points based on selected route and populate stop points list
  function updateStartDestinationAndStops() {
    const busRouteDropdown = document.getElementById("busRouteDropdown");
    const selectedFareStages = busRouteDropdown.value; // Get the selected fare stages
  
    // Split the fare stages by a delimiter (assuming stops are separated by a space, comma, or period)
    const stops = selectedFareStages.split(/\s*[.,]\s*/).filter(Boolean); // Filter out empty values
  
    if (stops.length > 1) {
      // Omit the first stop and set the second stop as the "Assigned Start Point"
      const remainingStops = stops.slice(1); // Remove the first stop by slicing from index 1
  
      // Set the first remaining stop as the assigned start point
      document.getElementById("assignedStartPoint").textContent = remainingStops[0];
      // Set the last stop as the assigned destination point
      document.getElementById("assignedDestinationPoint").textContent = remainingStops[remainingStops.length - 1];
  
      // Populate the Stop Points List
      const stopPointsList = document.getElementById("stopPointsList");
      stopPointsList.innerHTML = ""; // Clear the existing list
  
      remainingStops.forEach(stop => {
        const listItem = document.createElement("li");
        listItem.textContent = stop;
        stopPointsList.appendChild(listItem);
      });
    } else {
      // Handle case where there are fewer than two stops (edge case)
      console.error("Not enough stops to assign start and destination points.");
    }
  }
  
  // Ensure the assigned bus route is loaded when the DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    loadAssignedBusRoute();  // Load the assigned bus route from CSV
  });
  
  
  function updateMapWithRoute() {
    const busRouteDropdown = document.getElementById("busRouteDropdown");
    const selectedRoute = JSON.parse(busRouteDropdown.value);
  
    document.getElementById("assignedStartPoint").textContent = selectedRoute.from;
    document.getElementById("assignedDestinationPoint").textContent = selectedRoute.to;
  
    // Get the bus stops, cleaning any extra spaces or commas
    const busStops = selectedRoute.fareStages
      .split(/[\s,]+/) // Split on space or comma
      .filter(Boolean); // Remove any empty values
  
    // Populate the stop points list
    const stopPointsList = document.getElementById("stopPointsList");
    stopPointsList.innerHTML = ""; // Clear existing list
  
    // Check if busStops array has values
    if (busStops.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.textContent = "No bus stops available.";
      stopPointsList.appendChild(emptyMessage);
      return;
    }
  
    // Add each stop to the list
    busStops.forEach(stop => {
      const listItem = document.createElement("li");
      listItem.textContent = stop.trim(); // Ensure any leading or trailing spaces are trimmed
      stopPointsList.appendChild(listItem);
    });
  
    // Update the map with the bus stops
    displayMap(selectedRoute.from, selectedRoute.to, busStops);
  }
  
  
  // Function to update the start and destination points based on selected route
  function updateStartAndDestinationPoints() {
    const busRouteDropdown = document.getElementById("busRouteDropdown");
    const selectedFareStages = busRouteDropdown.value; // Get the selected fare stages
  
    // Split the fare stages by the delimiter (assuming stops are separated by space or a comma)
    const stops = selectedFareStages.split(/\s*[.,]\s*/).filter(Boolean); // Filter out empty values
  
    if (stops.length > 0) {
      // Set the first stop as the assigned start point
      document.getElementById("assignedStartPoint").textContent = stops[0];
      // Set the last stop as the assigned destination point
      document.getElementById("assignedDestinationPoint").textContent = stops[stops.length - 1];
    }
  }
  
  // Ensure the assigned bus route is loaded when the DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    loadAssignedBusRoute();  // Load the assigned bus route from CSV
  });
  
  function updateStartDestinationAndStops() {
    const busRouteDropdown = document.getElementById("busRouteDropdown");
    const selectedFareStages = busRouteDropdown.value;
  
    const stops = selectedFareStages.split(/\s*[.,]\s*/).filter(Boolean);
  
    if (stops.length > 1) {
      const remainingStops = stops.slice(1);
  
      document.getElementById("assignedStartPoint").textContent = remainingStops[0];
      document.getElementById("assignedDestinationPoint").textContent = remainingStops[remainingStops.length - 1];
  
      const stopPointsList = document.getElementById("stopPointsList");
      stopPointsList.innerHTML = "";
  
      remainingStops.forEach(stop => {
        const listItem = document.createElement("li");
        listItem.textContent = stop;
        stopPointsList.appendChild(listItem);
      });
  
      // Update the map with the start, destination, and stops
      displayMap(stops[0], stops[stops.length - 1], remainingStops);
    } else {
      console.error("Not enough stops to assign start and destination points.");
    }
  }
  
  // Function to update the map and display the route and bus stops
  function updateMapWithRoute() {
    const busRouteDropdown = document.getElementById("busRouteDropdown");
    const selectedRoute = JSON.parse(busRouteDropdown.value);
  
    document.getElementById("assignedStartPoint").textContent = selectedRoute.from;
    document.getElementById("assignedDestinationPoint").textContent = selectedRoute.to;
  
    const busStops = selectedRoute.fareStages.split(/\s*[.,]\s*/).filter(Boolean);
  
    displayMap(selectedRoute.from, selectedRoute.to, busStops);
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