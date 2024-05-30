const express = require("express");
//install mongodb in terminal using the following command.. npm install mongodb
//install mongodb module.
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT ||4055;

app.use(bodyParser.urlencoded({ extended: true }));

const mongoUrl = "mongodb://localhost:27017";
const dbName = "mydatabase";
let db;

MongoClient.connect(mongoUrl) .then((client) => 
{
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
});
//APP METHOD CALLED
app.get("/", (req, res) => 
{
    res.sendFile(__dirname + "/index.html");
});
  
// Route for inserting data
app.post("/insert", async (req, res) => 
{
        const { name, description } = req.body;
        if (!db) 
        {
            res.status(500).send("Database not initialized"); // Check if db is initialized
            return;
        }
        try
         {
            await db.collection("items").insertOne({ name, description });
            res.redirect("/");
        } 
        catch (err)
         {
            console.error("Error inserting data:", err);
            res.status(500).send("Failed to insert data");
        }
});  
// Endpoint to retrieve and display a simple report
/*app.get("/report", async (req, res) => 
{
    try 
    {
        const items = await db.collection("items").find().toArray();
        res.send(`<h1>Report</h1>${items.map(item => `<p>${item.name}: ${item.description}</p>`).join("")}<a href="/">Back to form</a>`);
    } 
    catch (err)
    {
        res.status(500).send("Failed to fetch data");
    }
});*/
app.get("/report", async (req, res) => {
    try {
      const items = await db.collection("items").find().toArray();
  
      // Create the table headers
      let tableContent = "<h1>Report</h1><table border='1'><tr><th>Name</th><th>Description</th></tr>";
  
      // Populate the table with data from the database
      tableContent += items.map(item => `<tr><td>${item.name}</td><td>${item.description}</td></tr>`).join("");
  
      // Closing the table and adding a link back to the form
      tableContent += "</table><a href='/'>Back to form</a>";
  
      res.send(tableContent);
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).send("Failed to fetch data");
    }
  });
  
app.listen(port, () => 
{
  console.log(`Server running at http://localhost:${port}`);
});
mongo.txt
Displa