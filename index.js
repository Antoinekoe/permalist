import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "", // PUT YOUR PASSWORD HERE
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true })); // Middleware for form
app.use(express.static("public")); // Set static files

app.get("/", async (req, res) => {
  // Main page, it gets redirected here when we add or edit stuff
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    res.render("index.ejs", {
      listTitle: "Today", // Send back the title of the list
      listItems: result.rows, // Send back the content from the DB
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/add", async (req, res) => {
  // Add an item in the DB
  try {
    const item = req.body.newItem;
    const result = await db.query(
      "INSERT INTO items (title) VALUES ($1) RETURNING title", // When adding new item, push the new item in the DB
      [item]
    );
  } catch (error) {
    console.log(error);
  }
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  // Edit an item in the DB
  try {
    let itemToUpdate = req.body.updatedItemId;
    let titleToUpdate = req.body.updatedItemTitle;
    const result = await db.query("UPDATE items SET title = $1 WHERE id = $2", [
      titleToUpdate,
      itemToUpdate,
    ]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async (req, res) => {
  // Delete an item in the DB
  try {
    let itemToDelete = req.body.deleteItemId;
    const result = await db.query("DELETE FROM items WHERE id = $1", [
      itemToDelete,
    ]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
