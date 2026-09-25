const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Campus Security Backend is running!");
});

app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});