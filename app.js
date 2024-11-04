const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MongoDB connection string (update this with your actual MongoDB URI)
const mongoURI = 'mongodb://localhost:27017/mini';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch((error) => console.error('MongoDB connection error:', error));

// Define User Schema for MongoDB
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  loginId: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

// Create Mongoose model based on the schema
const User = mongoose.model('User', userSchema);

// Route to handle adding new users
app.post('/api/users', async (req, res) => {
  try {
    const { name, loginId, password, role } = req.body;

    // Create a new user instance and save it to MongoDB
    const newUser = new User({ name, loginId, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
