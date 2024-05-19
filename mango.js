const express = require("express");
const { MongoClient } = require("mongodb"); // Import MongoClient from mongodb module

const bodyParser = require("body-parser");

// Create Express app
const app = express();
const port = 4055;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection parameters

const mongoUrl = "mongodb://localhost:27017/";
const dbName = "mydatabase";
let db; // Variable to store the database connection

// Connect to MongoDB server
MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName); // Store the database reference in the db variable
        console.log(`Connected to MongoDB: ${dbName}`);
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit the process if unable to connect to MongoDB
    });

// Route to serve the HTML form
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Route to handle form submission and insert data into MongoDB
app.post("/insert", async (req, res) => {
    const { name, description } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); // Check if db is initialized
        return;
    }
    try {
        await db.collection("items").insertOne({ name, description });
        console.log("Number of documents inserted: " + res.insertedCount);
        res.redirect("/"); // Redirect back to the form after successful insertion
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});

// Endpoint to retrieve and display a simple report from MongoDB
app.get("/report", async (req, res) => {
    try {
        const items = await db.collection("items").find().toArray(); // Fetch items from the 'items' collection
        console.log(items);

        // Create HTML table for the report
        let tableContent = "<h1>Report</h1><table border='1'><tr><th>Name</th><th>Description</th></tr>";
        tableContent += items.map(item => `<tr><td>${item.name}</td><td>${item.description}</td></tr>`).join("");
        tableContent += "</table><a href='/'>Back to form</a>"; // Add link to go back to the form

        res.send(tableContent); // Send the report HTML content as response
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});


app.get("/delete", async (req, res) => {
    const nameToDelete = req.query.nameToDelete; 
    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    try {
        const result = await db.collection("items").deleteOne({ name: nameToDelete });
        if (result.deletedCount === 0) {
            console.log("No documents matched the query. Document not deleted.");
            res.send("No documents matched the query. Document not deleted.");
        } else {
            console.log("Document deleted");
            res.redirect("/");
        }
    } catch (err) {
        console.error("Error deleting data:", err);
        res.status(500).send("Failed to delete data");
    }
});

app.get("/deletemany", async (req, res) => {
    const nameToDelete = req.query.nameToDelete; // Use the correct input field ID
    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    try {
        const result = await db.collection("items").deleteMany({ name: nameToDelete });
        if (result.deletedCount === 0) {
            console.log("No documents matched the query. Document not deleted.");
            res.send("No documents matched the query. Document not deleted.");
        } else {
            console.log("Document(s) deleted");
            res.redirect("/");
        }
    } catch (err) {
        console.error("Error deleting data:", err);
        res.status(500).send("Failed to delete data");
    }
});

 
// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});