const mongoose = require("mongoose");

module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.connect(process.env.MongoUri, connectionParams);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
    console.log("Unable to connect to the database");
  }
};
