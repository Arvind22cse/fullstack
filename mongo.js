const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 2000;

const bodyParser = require("body-parser");
// Use built-in URL-encoded parsing (recommended for Express >= 4.16)
app.use(bodyParser.urlencoded({ extended: true }));

const mongo = "mongodb://localhost:27017/";
const dbname = "Practice_db";

MongoClient.connect(mongo)
    .then((client) => {
        db = client.db(dbname);
        console.log(`Connected to ${dbname}`);
    })
    .catch((err) => {
        console.error("ERROR", err);
        process.exit(1);
    });

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/mongo.html");
});

app.post("/insert", async (req, res) => {
    try {
        // Check if name and email exist in req.body before destructuring
        if (!req.body.name || !req.body.email) {
            throw new Error("Name or email is missing in the request body.");
        }

        const { name, email } = req.body;
        await db.collection("Mongo").insertOne({ name, email });
        console.log(`Inserted count: ${res.insertedCount}`);
        res.redirect("/");
    } catch (error) {
        console.error("Error:", error);
        // Consider sending an error response to the client
        res.status(400).send("Error inserting data: " + error.message);
    }
});
app.post("/update",async(req,res)=>{
    const{nname,nemail}=req.body;
    try{
await db.collection("Mongo").updateOne({"name":nname},{$set:{email:nemail}});
console.log("Updated multiple documents");
        res.redirect("/");
    } catch (err) {
        console.error("Error updating data:", err);
        res.status(500).send("Failed to update data");
    }
});


app.post("/delete", async (req, res) => {
  try {
    const nameToDelete = req.body.namedel; 

    const deleteResult = await db.collection("Mongo").deleteOne({ name: nameToDelete });

    if (deleteResult.deletedCount === 0) {
      console.log('No documents matched the deletion criteria');
      res.redirect("/"); // Or provide a user-friendly message
    } else {
      console.log('Deleted successfully');
      res.redirect("/");
    }
  } catch (err) {
    console.error("Error deleting data:", err);
    res.status(500).send("Failed to delete data");
  }
});
app.get("/read", async (req, res) => {
    try {
      const items = await db.collection("Mongo").find().toArray(); // Use await for async operation
      console.log(items);
  
      // Construct the table content using a template literal and map function
      const tableContent = `
        <body>
          <h1>Report</h1>
          <table border='1'>
            <thead>
              <th>Name</th>
              <th>Email</th>
            </thead>
            <tbody>
              ${items.map((data) => `<tr><td>${data.name}</td><td>${data.email}</td></tr>`)}
            </tbody>
          </table>
          <a href='/'>Back to form</a>
        </body>
      `;
  
      res.send(tableContent); // Send the constructed HTML content
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).send("Failed to fetch data");
    }
  });
app.listen(port, () => {
    console.log(`Running on port http://localhost:${port}`);
});