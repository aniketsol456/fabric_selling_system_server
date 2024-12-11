const express = require("express");
const app = express();
const router = require("./routes/router");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('./db/connection');
const port = 8009;

// app.get("/",(req,res) => {
//     res.status(201).json("server created")
// });
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(router);

app.listen(port, () => {
    console.log(`server start at port no : ${port}`);
})