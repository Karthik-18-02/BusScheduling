let bestSolution = []; // Global variable to store the best solution

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

// Helper function to read and parse CSV files
function parseCSV(csvText) {
  const rows = csvText
    .trim()
    .split("\n")
    .map((row) => row.split(","));
  return rows.slice(1); // Exclude the header
}

<<<<<<< HEAD
// Load crew members and bus numbers from CSV files dynamically
async function loadCrewMembers() {
  try {
    const response = await fetch("RandomNames.csv");
    const text = await response.text();
=======
// Fetch the crew members from the database
async function fetchBusSchedulers() {
  try {
    const response = await fetch('http://https://busscheduling.onrender.com/getBusSchedulers');
    const busSchedulers = await response.json();
    return busSchedulers.map(user => user.name); // Extract crew names
  } catch (error) {
    console.error("Error fetching bus schedulers:", error);
    return [];
  }
}

async function loadCrewMembers() {
  try {
    const response = await fetch('http://https://busscheduling.onrender.com/getUsers'); // Fetch all users from backend
    const users = await response.json();

>>>>>>> 93fec7dbf2f2a62427f01d97b0096b70fa52fdfe
    console.log("Crew members loaded.");
    return parseCSV(text)
      .map((row) => row[0].trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Error loading crew members:", error);
    return [];
  }
}

async function loadBusData() {
  try {
    const response = await fetch("farestagefarecharts_1.csv");
    const text = await response.text();
    console.log("Bus data loaded.");
    return parseCSV(text)
      .map((row) => ({
        busNumber: row[3].trim(), // Bus number from 4th column
        busCount: parseInt(row[12].trim(), 10) || 0, // Number of buses from 13th column
      }))
      .filter(
        (bus) =>
          bus.busNumber && bus.busNumber !== "Route No." && bus.busCount > 0
      ); // Exclude "Route No." and rows with no bus count
  } catch (error) {
    console.error("Error loading bus data:", error);
    return [];
  }
}

// Genetic Algorithm (GA) parameters
let crewMembers = [];
let busData = [];
const populationSize = 10;
const mutationRate = 0.1;
const generations = 50;

// Initialize population
function initializePopulation() {
  return Array.from({ length: populationSize }, () => {
    let assignedBuses = [];
    busData.forEach((bus) => {
      for (let i = 1; i <= bus.busCount; i++) {
        const crewIndex = Math.floor(Math.random() * crewMembers.length);
        assignedBuses.push({
          bus: `${bus.busNumber}(${i})`,
          crew: crewMembers[crewIndex],
        });
      }
    });
    return assignedBuses;
  });
}

// Fitness function to measure quality of solution
function calculateFitness(individual) {
  const uniqueCrew = new Set(individual.map((assign) => assign.crew));
  return uniqueCrew.size; // Maximize unique crew assignments
}

// Crossover operation between two parents
function crossover(parent1, parent2) {
  const crossoverPoint = Math.floor(Math.random() * parent1.length);
  const child1 = [
    ...parent1.slice(0, crossoverPoint),
    ...parent2.slice(crossoverPoint),
  ];
  const child2 = [
    ...parent2.slice(0, crossoverPoint),
    ...parent1.slice(crossoverPoint),
  ];
  return [child1, child2];
}

async function saveAssignments() {
<<<<<<< HEAD
    console.log("Best Solution Assignments: ", bestSolution);
    try {
      const response = await fetch('http://localhost:5000/saveAssignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignments: bestSolution }),  // Ensure 'bestSolution' contains the correct data
=======
  console.log("Best Solution Assignments: ", bestSolution);
  try {
      const response = await fetch('http://https://busscheduling.onrender.com/saveAssignments', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assignments: bestSolution }),  // Send bestSolution to backend
>>>>>>> 93fec7dbf2f2a62427f01d97b0096b70fa52fdfe
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(data.message);  // Success message
      } else {
        alert('Error saving assignments: ' + data.error);
      }
<<<<<<< HEAD
=======
  } catch (error) {
      console.error('Error during save:', error);
  }
}



  
  async function populateCrewDropdown() {
    const crewMembers = await loadCrewMembers(); // Load crew members
    const dropdown = document.getElementById('availableCrewUnlinked');
  
    crewMembers.forEach(member => {
      const option = document.createElement('option');
      option.value = member;
      option.textContent = member;
      dropdown.appendChild(option); // Add each member to the dropdown
    });
  }
  
  // Call populateCrewDropdown on page load
  window.onload = function () {
    populateCrewDropdown();  // Populate the crew members dropdown
    initMap();  // Initialize map if needed
  };
  
  let existingAssignments = [];  // Store previously assigned buses

  // Fetch existing bus assignments from the backend
  async function fetchStoredAssignments() {
    try {
      const response = await fetch('http://https://busscheduling.onrender.com/getStoredAssignments');
      const assignments = await response.json();
      return assignments;
>>>>>>> 93fec7dbf2f2a62427f01d97b0096b70fa52fdfe
    } catch (error) {
      console.error('Error during save:', error);
    }
  }
  
  
  
  // Call saveAssignments after the GA finishes running
  async function runGeneticAlgorithm() {
    // Existing GA logic...
    displayResults(bestSolution);  // Display the result
    await saveAssignments();  // Save the result to the database
  }
  

// Mutate an individual by randomly changing the crew member of a bus
function mutate(individual) {
  return individual.map((assign) => {
    if (Math.random() < mutationRate) {
      const crewIndex = Math.floor(Math.random() * crewMembers.length);
      return { ...assign, crew: crewMembers[crewIndex] };
    }
    return assign;
  });
}

// Run the genetic algorithm to auto-assign crew members to buses
// Run the genetic algorithm to auto-assign crew members to buses
async function runGeneticAlgorithm() {
    try {
        crewMembers = await loadCrewMembers();
        busData = await loadBusData();
        console.log("Running Genetic Algorithm...");

        if (crewMembers.length === 0 || busData.length === 0) {
            alert("Error: Could not load crew members or buses. Please check CSV files.");
            return;
        }

        let population = initializePopulation();

        for (let generation = 0; generation < generations; generation++) {
            population.forEach(individual => individual.fitness = calculateFitness(individual));
            population.sort((a, b) => b.fitness - a.fitness);

            const newPopulation = [];
            for (let i = 0; i < populationSize / 2; i += 2) {
                const [child1, child2] = crossover(population[i], population[i + 1]);
                newPopulation.push(mutate(child1), mutate(child2));
            }

            population = newPopulation;
        }

        bestSolution = population[0]; // Store the best solution globally

        displayResults(bestSolution);

        // After assignment, determine unassigned crew and buses
        calculateUnassigned(bestSolution);

    } catch (error) {
        console.error('Error during GA execution:', error);
        alert("Error during GA execution. Check the console for more details.");
    }
}


// Display the results of the GA in the assigned buses list
function displayResults(bestSolution) {
  const assignedBusList = document.getElementById("assignedBusList");
  assignedBusList.innerHTML = "";
  bestSolution.forEach((assign) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${assign.crew} - ${assign.bus}`;
    assignedBusList.appendChild(listItem);
  });
  console.log("Results displayed.");
}

// let assignedCrew = new Set();
// let unassignedCrew = [];
// let unassignedBuses = [];

// // Run the genetic algorithm to auto-assign crew members to buses
// async function runGeneticAlgorithm() {
//   try {
//     crewMembers = await loadCrewMembers();
//     busData = await loadBusData();
//     console.log("Running Genetic Algorithm...");

//     if (crewMembers.length === 0 || busData.length === 0) {
//       alert(
//         "Error: Could not load crew members or buses. Please check CSV files."
//       );
//       return;
//     }

//     let population = initializePopulation();

//     for (let generation = 0; generation < generations; generation++) {
//       population.forEach(
//         (individual) => (individual.fitness = calculateFitness(individual))
//       );
//       population.sort((a, b) => b.fitness - a.fitness);

//       const newPopulation = [];
//       for (let i = 0; i < populationSize / 2; i += 2) {
//         const [child1, child2] = crossover(population[i], population[i + 1]);
//         newPopulation.push(mutate(child1), mutate(child2));
//       }

//       population = newPopulation;
//     }

//     displayResults(population[0]);

//     // After assignment, determine unassigned crew and buses
//     calculateUnassigned(population[0]);
//   } catch (error) {
//     console.error("Error during GA execution:", error);
//     alert("Error during GA execution. Check the console for more details.");
//   }
// }

// Function to calculate unassigned crew members and buses
function calculateUnassigned(bestSolution) {
    assignedCrew = new Set(bestSolution.map(assign => assign.crew));

    // Unassigned crew members (those who are not in the assignedCrew set)
    unassignedCrew = crewMembers.filter(crew => !assignedCrew.has(crew));

    // Track how many buses have been assigned for each route
    const busAssignmentCounts = {};
    bestSolution.forEach(assign => {
        const route = assign.bus.split('(')[0]; // Get the route number
        if (!busAssignmentCounts[route]) {
            busAssignmentCounts[route] = 0;
        }
        busAssignmentCounts[route] += 1; // Increment the count of assigned buses for the route
    });

    // Unassigned buses: buses that haven't been fully assigned
    unassignedBuses = busData.filter(bus => {
        const assignedCount = busAssignmentCounts[bus.busNumber] || 0;
        return assignedCount < bus.busCount;
    });

    console.log("Assigned Crew Count:", assignedCrew.size);
    console.log("Unassigned Crew (before auto-assign):", unassignedCrew.length);
    console.log("Unassigned Buses (before auto-assign):", unassignedBuses.length);

    // Automatically assign remaining crew to remaining buses
    autoAssignRemainingCrew();
}

// Function to display unassigned crew or buses in the unlinked duty section
function showUnassigned() {
    const unassignedCrewList = document.getElementById('availableCrewUnlinked');
    const unassignedBusList = document.getElementById('availableBusesUnlinked');

    // Clear previous entries
    unassignedCrewList.innerHTML = '';
    unassignedBusList.innerHTML = '';

    // Log the number of unassigned crew members for verification
    console.log("Unassigned Crew (after calculation):", unassignedCrew.length);
    console.log("Unassigned Buses (after calculation):", unassignedBuses.length);

    // Populate unassigned crew members
    unassignedCrew.forEach(crew => {
        const option = document.createElement('option');
        option.value = crew;
        option.textContent = crew;
        unassignedCrewList.appendChild(option);
    });

    // Populate unassigned buses
    unassignedBuses.forEach(bus => {
        const option = document.createElement('option');
        option.value = bus.busNumber;
        option.textContent = `${bus.busNumber} (${bus.busCount} buses remaining)`;
        unassignedBusList.appendChild(option);
    });

    console.log("Displayed unassigned crew and buses.");
}



// Function to automatically assign remaining crew members to remaining buses
function autoAssignRemainingCrew() {
    let busIndex = 0; // For iterating over unassigned buses

    // Assign as many unassigned crew members as possible to unassigned buses
    while (unassignedCrew.length > 0 && unassignedBuses.length > 0) {
        const crew = unassignedCrew.shift(); // Get the first unassigned crew member
        const bus = unassignedBuses[busIndex]; // Get the first unassigned bus
        
        // Calculate the next bus number to assign the crew
        const currentAssignedCount = bestSolution.filter(assign => assign.bus.split('(')[0] === bus.busNumber).length;
        const busNumber = `${bus.busNumber}(${currentAssignedCount + 1})`;

        // Add to the best solution
        bestSolution.push({ bus: busNumber, crew: crew });

        console.log(`Auto-Assigned: ${crew} to ${busNumber}`);

        // If the bus is now fully assigned, move to the next bus
        if (currentAssignedCount + 1 === bus.busCount) {
            unassignedBuses.shift(); // Remove the fully assigned bus
            busIndex = 0; // Reset the index for next bus
        }
    }

    // Log results after auto-assignment
    console.log("Remaining Unassigned Crew (after auto-assign):", unassignedCrew.length);
    console.log("Remaining Unassigned Buses (after auto-assign):", unassignedBuses.length);

    // Refresh the unassigned lists in the UI
    showUnassigned();
}


if (unassignedCrew.length > 0 && unassignedBuses.length === 0) {
    console.log("No buses remaining, but unassigned crew members are left:", unassignedCrew.length);
}
