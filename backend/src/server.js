const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const app = require("./app");


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server running on port: " + process.env.PORT);
    });
  })
  .catch((err) => console.error(err));
