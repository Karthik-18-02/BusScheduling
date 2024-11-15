const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const cors = require("cors");
app.use(cors());

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/mini", {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
