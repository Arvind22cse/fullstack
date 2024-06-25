const express = require("express");
const { Pool } = require("pg");
const path=require("path");
const app = express();
const port = 2000;

const bodyParser = require("body-parser");
// Use built-in URL-encoded parsing (recommended for Express >= 4.16)
app.use(bodyParser.urlencoded({ extended: true }));
const pool=new Pool({
    user:'postgres',
    password:'7010123540',
    host:'localhost',
    database:'postgres',
    port:5432,
})
pool.connect((data)=>
pool.query(`create table if not exists student(name varchar(30),email varchar(30))`))

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
        await pool.query("insert into student (name,email) values ($1,$2); ",[name,email])
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
await pool.query("update student set email=$1 where name=$2",[nemail,nname])
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

    const deleteResult = await pool.query("delete from student where name=$1;",[nameToDelete]);

    if (deleteResult.rowCount === 0) {
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
      const result = await pool.query("select * from student"); // Use clear variable name
      const items = result.rows; // Access data from rows property
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