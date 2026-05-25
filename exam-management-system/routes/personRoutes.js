// routes/personRoutes.js

const express = require('express');

// Create a router object
const router = express.Router();

// Import the controller functions
const personController = require('../controllers/personController');

// Define the routes and attach controller functions

// POST /api/persons - Create a new person
router.post('/', personController.createPerson);

// GET /api/persons - Get all persons
router.get('/', personController.getAllPersons);

// GET /api/persons/:email - Get one person by email
// The : makes it a dynamic parameter
router.get('/:email', personController.getPersonByEmail);

// PUT /api/persons/:email - Update a person
router.put('/:email', personController.updatePerson);

// DELETE /api/persons/:email - Delete a person
router.delete('/:email', personController.deletePerson);

// Export the router
module.exports = router;