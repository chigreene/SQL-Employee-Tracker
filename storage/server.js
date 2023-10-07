const express = require('express')
const mysql = require("mysql2");

const PORT = process.env.PORT || 3001
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const connection = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "r8D3Rh0Und",
    database: "myCompany_db",
  },
  console.log("Connected to the myCompany_db database.")
);

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database!");
});

app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`);
})

module.exports = connection;
