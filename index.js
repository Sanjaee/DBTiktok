const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const videoRouter = require("./routes/videos");
const cors = require("cors");
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", videoRouter);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
