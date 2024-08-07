const mongoose = require("mongoose");

const connectDataBase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database is connected successfully.");
  } catch (error) {
    console.log("Database is not connected due to " + error);
  }
};

module.exports = connectDataBase;
