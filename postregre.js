const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = 3000;
// Start the server
app.listen(port, () => {
 console.log(`Server is listening at http://localhost:${port}`);
});
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// PostgreSQL connection configuration
const pool = new Pool({
 user: 'postgres',
host: 'localhost',
database: 'postgres',
password: '7010123540',
port: 5432,
});
// Serve the HTML form file
app.get('/', (req, res) => {
 res.sendFile(__dirname + "/postregre.html");
});
// Create the "user_details" table
pool.connect((err) => {
 if (err) {
 return console.error('Error acquiring client', err.stack);
 }
 pool.query(`CREATE TABLE IF NOT EXISTS user_details (
 id SERIAL PRIMARY KEY,
 name VARCHAR(255),
 email VARCHAR(255))`, (err, result) => {
 if (err) {
 return console.error("Error creating table 'user_details':", err); }
 console.log("Table 'user_details' created successfully");
 });
});
// Handle form submission
// Route to handle form submission and insert data into PostgreSQL
app.post("/insert", async (req, res) => {
    const { name, email } = req.body;
 // Insert the form data into the database
try {
 await pool.query("INSERT INTO user_details (name, email) VALUES ($1, $2);", [name, email]);
 res.redirect("/");
 } catch (err) {
 console.error('Error executing query', err.stack);
 res.status(500).send('Error inserting data');
 }
});
// Endpoint to retrieve and display a simple report from PostgreSQL
app.get("/report", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM user_details;");
        const items = result.rows;

        // Create HTML table for the report
        let tableContent = "<h1>Report</h1><table border='1'><tr><th>name</th><th>E-mail</th></tr>";
        tableContent += items.map(item => `<tr><td>${item.name}</td><td>${item.email}</td></tr>`).join("");
        tableContent += "</table><a href='/'>Back to form</a>"; // Add link to go back to the form

        res.send(tableContent); // Send the report HTML content as response
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});

app.get("/delete", async (req, res) => {
    const { nameToDelete } = req.query;
    try {
        const result = await pool.query("DELETE FROM user_details WHERE name = $1;", [nameToDelete]);
        if (result.rowCount === 0) {
            res.send("No documents matched the query. Document not deleted.");
        } else {
            res.redirect("/");
        }
    } catch (err) {
        console.error("Error deleting data:", err);
        res.status(500).send("Failed to delete data");
    }
});

    app.post("/update", async (req, res) => {
        const {filter,newDescription} = req.body;
        try {
            const result = await pool.query(
                "UPDATE user_details SET email = $1 WHERE name = $2",
                [newDescription, filter]
            );
            if (result.rowCount === 0) {
                console.log("No documents matched the query. Document not updated.");
                res.send("No documents matched the query. Document not updated.");
            } else {
                console.log("Document updated");
                res.redirect("/");
            }
        } catch (err) {
            console.error("Error updating data:", err);
            res.status(500).send("Failed to update data");
        }
    });
    
