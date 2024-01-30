/* eslint-disable no-undef */
// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const cors = require('cors');
require('dotenv').config(); // Load environmental variables from .env file

const app = express();
app.use(cors())
const port = process.env.PORT;

// Connect to MongoDB Atlas using Mongoose
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    location:String,
    hobbies:String,
  });
  
  const User = mongoose.model('User', userSchema,'users');
  
  // Middleware to parse incoming requests
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Route to handle user registration
  app.get("/fetchUsers", async (req, res) => {
    try {
      const user =await  User.find();
     
      if (user) {
        res.status(200).json({ message: 'fetched successful', user })
  
        
        }
       else {
        res.status(401).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      console.log(error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.post('/api/signup', async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      const hashedPassword = password;
      // Create a new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password:hashedPassword,
        hobbies:'',
        location:'',
      });
  
      // Save the user to the MongoDB Atlas database
      const savedUser = await newUser.save();
     
      res.status(201).json(savedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.put('/editUser/:id', async (req, res) => {
    try {
      console.log("hello")
      const userId = req.params.id;
      // Check if the userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
  
      // Use updateOne to update a single document based on the provided ID
      const result = await User.updateOne(
        { _id: userId },
        {
          $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            hobbies:req.body.hobbies,
            location:req.body.location,
            password:req.body.password
          }
        }
      );
  
      // Check the result of the update operation
      console.log(result)
        res.status(200).json({ message: 'User updated successfully',result });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });