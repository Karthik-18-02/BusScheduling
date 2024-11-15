// Function to navigate from the home page to the login page
function navigateToLogin() {
  document.getElementById('home-page').classList.add('hidden');
  document.getElementById('login-container').classList.remove('hidden');
}

// Function to navigate back to the home page from the login page
function navigateToHome() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('home-page').classList.remove('hidden');
}

// Example login function (to be expanded based on actual logic)
function login() {
  const loginId = document.getElementById("newLoginId").value.trim();
  const password = document.getElementById("newPassword").value.trim(); // Assuming password validation if needed
  const role = document.getElementById("role").value;

  // Validate the input fields to ensure they are not empty
  if (!loginId || !password || !role) {
    alert("Please fill out all fields to log in.");
    return;
  }

  // Role-based validation
  if (role === "crew.html") {
    // Check if the login ID exists in the crew list
    if (!crewNames.includes(loginId)) {
      alert("You are not registered as a crew member. Please contact the administrator.");
      return;
    }
  }

  // At this point, the user has successfully logged in
  // Redirect based on the user's role
  switch (role) {
    case 'administrator.html':
      window.location.href = 'administrator.html'; // Redirect to administrator page
      break;
    case 'bus_scheduler.html':
      window.location.href = 'bus_scheduler.html'; // Redirect to bus scheduler page
      break;
    case 'crew.html':
      window.location.href = 'crew.html'; // Redirect to crew page
      break;
    case 'route_planner.html':
      window.location.href = 'route_planner.html'; // Redirect to route planner page
      break;
    case 'passenger.html':
      window.location.href = 'passenger.html'; // Redirect to passenger page
      break;
    default:
      alert('Invalid role selected.');
  }
}

// Attach event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.addEventListener('click', login);
  } else {
    console.error("Element with ID 'loginButton' not found");
  }
});


function addUser() {
  const newName = document.getElementById("newName").value;
  const newLoginId = document.getElementById("newLoginId").value;
  const newPassword = document.getElementById("newPassword").value;
  const newRole = document.getElementById("newRole").value;

  if (newName && newLoginId && newPassword && newRole) {
    const userList = document.getElementById("userList");
    const newUserItem = document.createElement("li");
    newUserItem.textContent = `${newName} (${newRole}) - ${newLoginId}`;
    userList.appendChild(newUserItem);

    // Clear input fields after adding user
    document.getElementById("newName").value = "";
    document.getElementById("newLoginId").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("newRole").value = "bus-scheduler";

    alert("New user added successfully!");
  } else {
    alert("Please fill out all fields to add a new user.");
  }
}

function showLinkedDuty() {
  document.getElementById("linked-duty-section").classList.remove("hidden");
  document.getElementById("unlinked-duty-section").classList.add("hidden");
}

function showUnlinkedDuty() {
  document.getElementById("unlinked-duty-section").classList.remove("hidden");
  document.getElementById("linked-duty-section").classList.add("hidden");
}

function assignLinkedDuty() {
  alert("Linked duty assigned successfully!");
}

function assignUnlinkedDuty() {
  alert("Unlinked duty assigned successfully!");
}

function submitRoute() {
  alert("Route submitted successfully!");
}

function displayTimetable() {
  document.getElementById("timetableDisplay").classList.remove("hidden");
}



let crewNames = [];  // Store all crew names loaded from the CSV
let busAssignments = {}; // Track how many times each bus has been assigned
let availableBuses = [];  // Store available buses from the CSV

async function loadBusNumbersAndCrew() {
  try {
    // Load bus numbers from farestagefarecharts_1.csv
    const busResponse = await fetch("farestagefarecharts_1.csv");
    const busCsvText = await busResponse.text();
    const busRows = busCsvText.split("\n").map((row) => row.split(","));

    // Load crew names from RandomNames.csv
    const crewResponse = await fetch("RandomNames.csv");
    const crewCsvText = await crewResponse.text();
    const crewRows = crewCsvText.split("\n").map((row) => row.split(","));

    // Get the bus and route number columns from the bus CSV
    const busHeader = busRows[3];  // Assuming header is in row 1
    const routeNoIndex = busHeader.indexOf("Route No.");
    const busesNoIndex = busHeader.indexOf("No. of Buses");

    if (routeNoIndex === -1 || busesNoIndex === -1) {
      console.error("Required columns not found in the bus CSV");
      return;
    }

    // Populate bus numbers and limits
    availableBuses = busRows.slice(1).map(row => ({
      routeNumber: row[routeNoIndex]?.trim(),
      busLimit: parseInt(row[busesNoIndex]?.trim(), 10)
    })).filter(bus => bus.routeNumber && bus.busLimit > 0);

    // Reset bus assignment counts
    availableBuses.forEach(bus => {
      busAssignments[bus.routeNumber] = 0;  // Initialize assignment counts
    });

    // Populate crew names
    crewNames = crewRows.slice(1).map(row => row[0]?.trim()).filter(Boolean);

    // DEBUG: Log the loaded data
    console.log("Loaded bus data:", availableBuses);
    console.log("Loaded crew data:", crewNames);

  } catch (error) {
    console.error("Error loading data from CSV files:", error);
  }
}

// Ensure this function is called when the page loads
window.onload = function () {
  loadBusNumbersAndCrew();
};




// let crewNames = [];  // Store all crew names loaded from the CSV
let assignedCrew = [];  // Track assigned crew members
// let availableBuses = [];  // Store available buses from the CSV

// Function to auto-assign crew to buses in Linked Duty Scheduling
function autoAssignCrew() {
  // DEBUG: Log to see if the function is called
  console.log("Auto Assign Crew triggered");

  if (crewNames.length === 0 || availableBuses.length === 0) {
    alert("No crew or buses available for assignment.");
    return;
  }

  // DEBUG: Log crew and bus data just before genetic algorithm
  console.log("Crew Names:", crewNames);
  console.log("Available Buses:", availableBuses);

  geneticAlgorithmAssignCrew();
}



// Function to show unassigned crew in Unlinked Duty Scheduling
// Function to show unassigned crew in Unlinked Duty Scheduling
// Function to show unassigned crew in Unlinked Duty Scheduling
// Function to show unassigned crew in Unlinked Duty Scheduling
function showUnassignedCrew() {
  const unassignedCrewList = document.getElementById("unassignedCrewList");
  unassignedCrewList.innerHTML = "";  // Clear the list

  // Filter the crew who have not been assigned
  const unassignedCrew = crewNames.filter(crew => !assignedCrew.includes(crew));

  if (unassignedCrew.length === 0) {
    unassignedCrewList.innerHTML = "<li>All crew members are assigned.</li>";
  } else {
    // Add unassigned crew members to the list
    unassignedCrew.forEach(crew => {
      const listItem = document.createElement("li");
      listItem.textContent = crew;
      unassignedCrewList.appendChild(listItem);
    });
  }
}


// Function to send assignment data to the backend for saving in the database
function saveAssignmentToDatabase(crew, busNumber, busNumberCount) {
  const scheduleData = {
    crew,
    busNumber,
    busNumberCount,
    timingsFrom: "09:00", // Example timings, you can make it dynamic
    timingsTo: "18:00",
    breakFrom: "12:00",
    breakTo: "13:00",
  };

  // Send data to the backend
  fetch("http://localhost:5000/addSchedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scheduleData),
  })
    .then((response) => response.text())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
}
// Function to show unassigned crew in Unlinked Duty Scheduling
// Function to show unassigned crew in Unlinked Duty Scheduling
// function showUnassignedCrew() {
//   const unassignedCrewList = document.getElementById("unassignedCrewList");
//   unassignedCrewList.innerHTML = "";  // Clear the list

//   // Filter the crew who have not been assigned
//   const unassignedCrew = crewNames.filter(crew => !assignedCrew.includes(crew));

//   if (unassignedCrew.length === 0) {
//     unassignedCrewList.innerHTML = "<li>All crew members are assigned.</li>";
//   } else {
//     // Add unassigned crew members to the list
//     unassignedCrew.forEach(crew => {
//       const listItem = document.createElement("li");
//       listItem.textContent = crew;
//       unassignedCrewList.appendChild(listItem);
//     });
//   }
// }

// Example function to load crew names from a CSV
// Example function to load crew names from a CSV or directly set crew names
async function loadCrewFromCsv() {
  try {
    const response = await fetch("RandomNames.csv");
    const data = await response.text();
    const rows = data.split("\n").map(row => row.split(","));

    // Assuming crew names are in the first column
    crewNames = rows.slice(1).map(row => row[0]?.trim()).filter(Boolean);
    console.log("Crew names loaded:", crewNames); // Debugging to check loaded names

  } catch (error) {
    console.error("Error loading crew from CSV:", error);
  }
}

// Call this function to load the crew on page load
window.onload = function () {
  loadCrewFromCsv();
};


// Call this function on window load to load crew and bus data from CSVs
window.onload = function () {
  loadBusNumbersAndCrew(); // Load bus and crew data from CSVs
};

// Function to navigate from the home page to the login page
// Function to navigate to the login page (simulate new page)
function navigateToLogin() {
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('login-container').style.display = 'block';
}


// Function to navigate back to the home page from the login page
function navigateToHome() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('home-page').style.display = 'block';
}


// Function to handle login and display the selected role's page dynamically (SPA)
function login() {
  const selectedRolePage = document.getElementById("role").value;
  // Navigate to the selected role's HTML page
  window.location.href = selectedRolePage;
}

// Function to hide all role-specific pages
function hideAllPages() {
  const pages = document.querySelectorAll('.role-container'); // Select all role-specific containers
  pages.forEach((page) => {
    page.classList.add('hidden'); // Hide each role-specific container
  });

  // Hide the login container
  document.getElementById('login-container').classList.add('hidden');
}
// Function to initialize the Google Map
// Function to initialize the Google Map for both route planner and crew page
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

// Ensure the Google Map is initialized when the window loads
window.onload = function () {
  initMap();  // Initialize the map when the page is loaded
};

// Other functions like loading crew, bus stops, and routes can remain unchanged...

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
    const passengerStart = document.getElementById("passengerStartPlace");
    const passengerDestination = document.getElementById("passengerDestinationPlace");

    // Check if elements are found before setting properties
    if (!startPlaceDropdown || !destinationPlaceDropdown || !passengerStart || !passengerDestination) {
      // console.error("One or more dropdown elements not found in the DOM.");
      return;
    }

    // Clear existing options in the dropdowns
    startPlaceDropdown.innerHTML = "";
    destinationPlaceDropdown.innerHTML = "";
    passengerStart.innerHTML = "";
    passengerDestination.innerHTML = "";

    // Populate both dropdowns with bus stops, omitting the header and empty values
    rows.slice(1).forEach(busStop => {
      if (busStop) { // Only add non-empty bus stops
        const optionStart = document.createElement("option");
        const optionDestination = document.createElement("option");
        const optionStartPassenger = document.createElement("option");
        const optionDestinationPassenger = document.createElement("option");

        optionStart.value = busStop;
        optionStart.textContent = busStop;

        optionDestination.value = busStop;
        optionDestination.textContent = busStop;

        optionStartPassenger.value = busStop;
        optionStartPassenger.textContent = busStop;

        optionDestinationPassenger.value = busStop;
        optionDestinationPassenger.textContent = busStop;

        startPlaceDropdown.appendChild(optionStart);
        destinationPlaceDropdown.appendChild(optionDestination);
        passengerStart.appendChild(optionStartPassenger);
        passengerDestination.appendChild(optionDestinationPassenger);
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

    // Check if the bus number dropdown exists before populating it
    if (!busNumberDropdown) {
      // console.error("Bus Number dropdown element not found in the DOM.");
      return;
    }

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

// Call the functions to load bus stops and bus numbers on window load
window.onload = function () {
  loadBusStops();
  loadBusNumbers();
};


function geneticAlgorithmAssignCrew() {
  // DEBUG: Ensure the genetic algorithm is called
  console.log("Genetic Algorithm triggered");

  if (crewNames.length === 0 || availableBuses.length === 0) {
    alert("No crew or buses available for assignment.");
    return;
  }

  // Parameters for the genetic algorithm
  const populationSize = 100;
  const maxGenerations = 50;
  const mutationRate = 0.05;

  // Step 1: Create an initial population (random assignments of crew to buses)
  let population = createInitialPopulation(populationSize);
  console.log("Initial Population:", population);

  for (let generation = 0; generation < maxGenerations; generation++) {
    // Step 2: Evaluate fitness of each individual
    population = evaluatePopulationFitness(population);

    // Step 3: Perform selection, crossover, and mutation to create the next generation
    population = createNextGeneration(population, mutationRate);
  }

  // Step 4: Select the best individual from the population
  const bestAssignment = selectBestIndividual(population);
  console.log("Best Assignment:", bestAssignment);

  // Step 5: Display the assigned crew and buses
  displayAssignedCrewAndBuses(bestAssignment);
}


function createInitialPopulation(size) {
  const population = [];
  for (let i = 0; i < size; i++) {
    const individual = [];
    crewNames.forEach(crew => {
      const randomBus = availableBuses[Math.floor(Math.random() * availableBuses.length)];
      individual.push({ crew, bus: randomBus.routeNumber });
    });
    population.push(individual);
  }
  return population;
}

function evaluatePopulationFitness(population) {
  return population.map(individual => {
    // Fitness is based on how evenly the crew is distributed across buses
    const fitness = individual.reduce((score, assignment) => {
      const busLimit = availableBuses.find(bus => bus.routeNumber === assignment.bus).busLimit;
      const assignedCount = individual.filter(a => a.bus === assignment.bus).length;
      if (assignedCount <= busLimit) {
        score += 1;
      }
      return score;
    }, 0);
    return { individual, fitness };
  });
}

function createNextGeneration(population, mutationRate) {
  const newPopulation = [];
  population.sort((a, b) => b.fitness - a.fitness);

  // Keep the best individuals
  newPopulation.push(...population.slice(0, population.length / 2).map(p => p.individual));

  // Perform crossover and mutation to create new individuals
  for (let i = 0; i < population.length / 2; i++) {
    const parentA = population[i].individual;
    const parentB = population[population.length - 1 - i].individual;
    const child = crossover(parentA, parentB);

    // Apply mutation
    if (Math.random() < mutationRate) {
      mutate(child);
    }

    newPopulation.push(child);
  }

  return newPopulation;
}

function crossover(parentA, parentB) {
  const child = [];
  for (let i = 0; i < parentA.length; i++) {
    child.push(Math.random() < 0.5 ? parentA[i] : parentB[i]);
  }
  return child;
}

function mutate(individual) {
  const randomIndex = Math.floor(Math.random() * individual.length);
  const randomBus = availableBuses[Math.floor(Math.random() * availableBuses.length)];
  individual[randomIndex].bus = randomBus.routeNumber;
}

function selectBestIndividual(population) {
  population.sort((a, b) => b.fitness - a.fitness);
  return population[0].individual;
}

function displayAssignedCrewAndBuses(assignment) {
  const assignedBusList = document.getElementById("assignedBusList");
  assignedBusList.innerHTML = "";

  assignment.forEach(({ crew, bus }) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${crew} - ${bus}`;
    assignedBusList.appendChild(listItem);
  });

  alert("Crew has been assigned using genetic algorithm!");
}
function autoAssignCrew() {
  geneticAlgorithmAssignCrew();
}
// Call the functions to load bus stops and bus numbers on window load
window.onload = function () {
  loadBusStops();
  loadBusNumbers();
};
