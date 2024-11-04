require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const cors = require("cors");
app.use(cors());

const fs = require('fs');
// const path = require('path');
const csv = require('csv-parser');

// Function to load data from a CSV file
function loadCSVData(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(`Error loading CSV file ${filePath}: ${error.message}`));
  });
}

// Define paths to your CSV files
const busStopsFilePath = path.join(__dirname, 'public', 'busStops.csv');
const cleanedBusStopsFilePath = path.join(__dirname, 'public', 'cleaned_busStops.csv');
const fareStageFilePath = path.join(__dirname, 'public', 'farestagefarecharts_1.csv');
const finalCleanedBusStopsFilePath = path.join(__dirname, 'public', 'final_cleaned_busStops.csv');
const randomNamesFilePath = path.join(__dirname, 'public', 'RandomNames.csv');

// Load each CSV file
async function loadAllCSVFiles() {
  try {
    const busStopsData = await loadCSVData(busStopsFilePath);
    console.log("Bus Stops Data:", busStopsData);

    const cleanedBusStopsData = await loadCSVData(cleanedBusStopsFilePath);
    console.log("Cleaned Bus Stops Data:", cleanedBusStopsData);

    const fareStageData = await loadCSVData(fareStageFilePath);
    console.log("Fare Stage Data:", fareStageData);

    const finalCleanedBusStopsData = await loadCSVData(finalCleanedBusStopsFilePath);
    console.log("Final Cleaned Bus Stops Data:", finalCleanedBusStopsData);

    const randomNamesData = await loadCSVData(randomNamesFilePath);
    console.log("Random Names Data:", randomNamesData);

    // Return the data or process as needed
    return { busStopsData, cleanedBusStopsData, fareStageData, finalCleanedBusStopsData, randomNamesData };
  } catch (error) {
    console.error(error);
  }
}

// Call the function to load all data
loadAllCSVFiles().then(data => {
  if (data) {
    // Process data as needed
    console.log("All data loaded successfully.");
  }
});


// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static("public"));

// Connect to MongoDB
// mongoose.connect("mongodb://localhost:27017/mini", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Define user schema (including admin roles)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  loginId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [
      "administrator",
      "crew",
      "bus-scheduler",
      "route-planner",
      "passenger",
    ],
    default: "passenger",
  },
});


const User = mongoose.model("Administrator", UserSchema);

app.post("/addUser", (req, res) => {
  const newUser = new User(req.body);
  newUser
    .save()
    .then(() => res.status(201).json({ message: "User added successfully!" })) // Return JSON
    .catch((err) =>
      res.status(400).json({ error: "Error adding user: " + err })
    ); // Return JSON on error
});

// Route to specifically add an administrator
app.post("/addAdmin", (req, res) => {
  const { name, loginId, password } = req.body;

  // Check if all required fields are present
  if (!name || !loginId || !password) {
    return res.status(400).send("Missing required fields.");
  }

  const newAdmin = new User({
    name: name,
    loginId: loginId,
    password: password,
    role: "administrator", // Explicitly set role as 'administrator'
  });

  newAdmin
    .save()
    .then(() => res.status(201).send("Administrator added successfully!"))
    .catch((err) => res.status(400).send("Error adding administrator: " + err));
});

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Define the schema for crew-bus assignments
const AssignmentSchema = new mongoose.Schema({
  crew: { type: String, required: true },
  bus: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }, // Optional, to track when the assignment was made
});

const Assignment = mongoose.model("Assignment", AssignmentSchema);

app.post("/saveAssignments", async (req, res) => {
  try {
      const assignments = req.body.assignments;
      console.log("Received Assignments:", assignments); // Log the received data

      // Save all assignments to the database
      if (assignments && assignments.length > 0) {
          await Assignment.insertMany(assignments);
          res.status(201).json({ message: "Assignments saved successfully!" });
      } else {
          res.status(400).json({ error: "No assignments provided." });
      }
  } catch (err) {
      console.error("Error saving assignments:", err); // Log the error if something fails
      res.status(400).json({ error: "Error saving assignments: " + err });
  }
});


app.get('/getUsers', async (req, res) => {
  try {
    const users = await User.find();  // Find all users in the database
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

app.get('/getBusSchedulers', async (req, res) => {
  try {
    // Fetch users with the role of 'bus-scheduler'
    const busSchedulers = await User.find({ role: 'bus-scheduler' });
    res.json(busSchedulers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve bus schedulers' });
  }
});

app.get('/getStoredAssignments', async (req, res) => {
  try {
    const assignments = await Assignment.find(); // Retrieve all stored assignments
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assignments' });
  }
});

// Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const PORT = process.env.PORT || 5000; // Use the PORT environment variable or default to 10000
const HOST = '0.0.0.0'; // Bind to all IP addresses

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
