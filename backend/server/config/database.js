const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDB = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    })
    .then(() => { console.log("Database connection established Successfully...")})
    .catch((error) => {
        console.log("Error while connecting with Database");
        console.error(error);
        process.exit(1);
    })
}