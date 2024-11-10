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

    console.log("Crew members loaded.");

    // Filter only users with the 'bus-scheduler' role
    const busSchedulers = users.filter(user => user.role === 'crew');

    return busSchedulers.map(user => user.name); // Return names of bus schedulers
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
  console.log("Best Solution Assignments: ", bestSolution);
  try {
      const response = await fetch('http://https://busscheduling.onrender.com/saveAssignments', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assignments: bestSolution }),  // Send bestSolution to backend
      });

      const data = await response.json();
      if (response.ok) {
          alert(data.message);  // Success message
      } else {
          alert('Error saving assignments: ' + data.error);
      }
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
    } catch (error) {
      console.error("Error fetching stored assignments:", error);
      return [];
    }
  }

// Run the genetic algorithm and combine with existing assignments
async function runGeneticAlgorithm() {
  try {
    crewMembers = await loadCrewMembers();  // Load all crew members
    busData = await loadBusData();  // Load buses from the CSV
    existingAssignments = await fetchStoredAssignments();  // Fetch stored assignments
    console.log("Running Genetic Algorithm...");

    if (crewMembers.length === 0 || busData.length === 0) {
      alert("Error: Could not load crew members or buses. Please check CSV files.");
      return;
    }

    let population = initializePopulation();  // Generate initial population

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

    bestSolution = combineWithExistingAssignments(population[0]);  // Combine new and existing assignments

    displayResults(bestSolution);  // Display the results
    await saveAssignments();  // Save the new combined result to the backend

    // After assignment, determine unassigned crew and buses
    calculateUnassigned(bestSolution);

  } catch (error) {
    console.error('Error during GA execution:', error);
    alert("Error during GA execution. Check the console for more details.");
  }
}

// Combine new assignments with existing ones, avoiding duplication
function combineWithExistingAssignments(newAssignments) {
  const existingCrew = new Set(existingAssignments.map(assign => assign.crew));
  const existingBusAssignments = new Set(existingAssignments.map(assign => assign.bus)); // Track existing buses
  const combinedSolution = [...existingAssignments];  // Start with existing assignments

  newAssignments.forEach(assign => {
    if (!existingCrew.has(assign.crew) && !existingBusAssignments.has(assign.bus)) {
      combinedSolution.push(assign);  // Add only if the crew and bus haven't been assigned
      existingCrew.add(assign.crew);  // Track the new assignment
      existingBusAssignments.add(assign.bus);  // Track the assigned bus
    }
  });

  return combinedSolution;
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
// Display the results of the GA in the assigned buses list without duplicates
function displayResults(bestSolution) {
  const assignedBusList = document.getElementById("assignedBusList");
  assignedBusList.innerHTML = "";  // Clear previous entries
  const seen = new Set();  // Track seen bus-crew pairs to avoid duplicates

  bestSolution.forEach(assign => {
    const pair = `${assign.crew}-${assign.bus}`;
    if (!seen.has(pair)) {
      const listItem = document.createElement("li");
      listItem.textContent = `${assign.crew} - ${assign.bus}`;
      assignedBusList.appendChild(listItem);
      seen.add(pair);  // Mark the pair as seen
    }
  });
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

// Calculate unassigned buses and display them in the unlinked duty section
function calculateUnassigned(bestSolution) {
  const assignedCrew = new Set(bestSolution.map(assign => assign.crew));

  // Unassigned crew members
  unassignedCrew = crewMembers.filter(crew => !assignedCrew.has(crew));

  // Track bus assignment counts
  const busAssignmentCounts = {};
  bestSolution.forEach(assign => {
    const route = assign.bus.split('(')[0];
    if (!busAssignmentCounts[route]) {
      busAssignmentCounts[route] = 0;
    }
    busAssignmentCounts[route] += 1;
  });

  // Unassigned buses: buses that haven't been fully assigned
  unassignedBuses = busData.filter(bus => {
    const assignedCount = busAssignmentCounts[bus.busNumber] || 0;
    return assignedCount < bus.busCount;
  });

  // Show unassigned crew and buses in the unlinked duty section
  showUnassigned();
}


// Display unassigned buses and crew, grouped by route number
function showUnassigned() {
  const unassignedCrewList = document.getElementById('availableCrewUnlinked');
  const unassignedBusList = document.getElementById('availableBusesUnlinked');

  unassignedCrewList.innerHTML = '';  // Clear previous entries
  unassignedBusList.innerHTML = '';

  // Populate unassigned crew members
  unassignedCrew.forEach(crew => {
    const option = document.createElement('option');
    option.value = crew;
    option.textContent = crew;
    unassignedCrewList.appendChild(option);
  });

  // Group unassigned buses by route and count the remaining buses for each route
  const routeBusCounts = {};

  unassignedBuses.forEach(bus => {
    if (!routeBusCounts[bus.busNumber]) {
      routeBusCounts[bus.busNumber] = 0;  // Initialize count for this route
    }
    routeBusCounts[bus.busNumber] += 1;  // Increment the count of unassigned buses for this route
  });

  // Display grouped unassigned buses by route number and remaining bus count
  Object.keys(routeBusCounts).forEach(route => {
    const option = document.createElement('option');
    const remainingCount = routeBusCounts[route];
    option.value = route;
    option.textContent = `Route ${route} (${remainingCount} bus${remainingCount > 1 ? 'es' : ''} remaining)`;
    unassignedBusList.appendChild(option);
  });
}


// Automatically assign remaining unassigned crew to unassigned buses
function autoAssignRemainingCrew() {
  let busIndex = 0; // To iterate over unassigned buses

  // Assign each unassigned crew member to the next available unassigned bus
  while (unassignedCrew.length > 0 && unassignedBuses.length > 0) {
      const crew = unassignedCrew.shift(); // Take the first unassigned crew member
      const bus = unassignedBuses[busIndex]; // Current unassigned bus

      // Generate the next bus number for assignment
      const currentAssignedCount = bestSolution.filter(assign => assign.bus.split('(')[0] === bus.busNumber).length;
      const busNumber = `${bus.busNumber}(${currentAssignedCount + 1})`;

      // Add this assignment to the bestSolution
      bestSolution.push({ bus: busNumber, crew: crew });
      console.log(`Auto-Assigned: ${crew} to ${busNumber}`);

      // Check if the bus is fully assigned and should be removed from the unassigned list
      if (currentAssignedCount + 1 === bus.busCount) {
          unassignedBuses.shift(); // Remove the fully assigned bus from unassignedBuses
          busIndex = 0; // Reset index for the next bus
      }
  }

  // Log remaining unassigned items
  console.log("Remaining Unassigned Crew (after auto-assign):", unassignedCrew.length);
  console.log("Remaining Unassigned Buses (after auto-assign):", unassignedBuses.length);

  // Update the UI to show the latest unassigned crew and buses
  showUnassigned();
}



if (unassignedCrew.length > 0 && unassignedBuses.length === 0) {
    console.log("No buses remaining, but unassigned crew members are left:", unassignedCrew.length);
}
