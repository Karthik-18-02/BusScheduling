// Function to load bus stops from busStops.csv and populate the "Select Start Place" and "Select Destination Place" dropdowns
async function loadBusStops() {
  try {
    // Fetch the bus stops CSV file (busStops.csv)
    const response = await fetch("final_cleaned_busStops.csv");
    const csvText = await response.text();

    // Split the CSV text into rows and extract the bus stops from the "Names" column
    const rows = csvText.split("\n").map(row => row.trim().split(","));
    const busStops = rows
      .slice(1) // Skip the header row
      .map(row => row[0]?.trim().toLowerCase()) // Extract and normalize the bus stop names
      .filter(busStop => busStop && busStop.length > 0); // Omit empty values

    // Get the dropdown elements for Start Place and Destination Place
    const startPlaceDropdown = document.getElementById("passengerStartPlace");
    const destinationPlaceDropdown = document.getElementById("passengerDestinationPlace");

    // Clear existing options in the dropdowns
    startPlaceDropdown.innerHTML = "";
    destinationPlaceDropdown.innerHTML = "";

    // Populate both dropdowns with bus stops
    busStops.forEach(busStop => {
      const optionStart = document.createElement("option");
      const optionDestination = document.createElement("option");

      optionStart.value = busStop;
      optionStart.textContent = busStop.charAt(0).toUpperCase() + busStop.slice(1);

      optionDestination.value = busStop;
      optionDestination.textContent = busStop.charAt(0).toUpperCase() + busStop.slice(1);

      startPlaceDropdown.appendChild(optionStart);
      destinationPlaceDropdown.appendChild(optionDestination);
    });
  } catch (error) {
    console.error("Error loading bus stops:", error);
  }
}

// Function to display the timetable based on selected start and destination
async function displayTimetable() {
  // Get selected start and destination bus stops
  const startPlace = document.getElementById("passengerStartPlace").value.toLowerCase();
  const destinationPlace = document.getElementById("passengerDestinationPlace").value.toLowerCase();

  try {
    // Fetch the fare stages CSV file (farestagefarecharts_1.csv)
    const response = await fetch("farestagefarecharts_1.csv");
    const csvText = await response.text();

    // Split the CSV text into rows and map it into an array
    const rows = csvText.split("\n").map(row => row.trim().split(","));
    
    // Cleaning the data: Extract Route No. and Fare Stages Up Direction
    let matchingRoutes = [];

    rows.slice(1).forEach(row => {
      const fareStages = row[6]?.toLowerCase().trim(); // 'Fare Stages Up Direction' column (assuming it's the 6th index)
      const routeNo = row[3]?.trim(); // 'Route No.' column (assuming it's the 3rd index)

      // Omit rows with empty values in either 'Fare Stages Up Direction' or 'Route No.'
      if (fareStages && routeNo) {
        // Check if both start and destination are in the same fareStages element
        if (fareStages.includes(startPlace) && fareStages.includes(destinationPlace)) {
          // Find the bus stops between start and destination
          const busStops = fareStages.split(/\s*\d+\.\s*/).filter(stop => stop); // Split by "1. ", "2. ", etc.
          
          // Get the index of the start and destination stops
          const startIndex = busStops.findIndex(stop => stop.includes(startPlace));
          const endIndex = busStops.findIndex(stop => stop.includes(destinationPlace));

          // If both start and destination are found, capture the stops between them
          if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
            const stopsInBetween = busStops.slice(startIndex, endIndex + 1).join(", ");
            matchingRoutes.push(`${routeNo} - ${stopsInBetween}`);
          }
        }
      }
    });

    // Get the timetable display element
    const timetableDisplay = document.getElementById("timetableDisplay");

    // Clear any previous output
    timetableDisplay.innerHTML = "";

    if (matchingRoutes.length > 0) {
      // Create an unordered list (<ul>) for matching routes
      const ul = document.createElement("ul");
      
      // Add each matching route number and stops as a list item (<li>)
      matchingRoutes.forEach(route => {
        const li = document.createElement("li");
        li.textContent = route;
        ul.appendChild(li);
      });

      // Append the unordered list to the display div
      timetableDisplay.appendChild(ul);
    } else {
      // If no routes are found, display a message
      timetableDisplay.innerHTML = "<p>No routes found for the selected bus stops.</p>";
    }

    // Unhide the timetable display if hidden
    timetableDisplay.classList.remove("hidden");

  } catch (error) {
    console.error("Error displaying timetable:", error);
  }
}

// Call the functions to load bus stops on window load
window.onload = function () {
  loadBusStops(); // Load bus stops from the CSV
};
