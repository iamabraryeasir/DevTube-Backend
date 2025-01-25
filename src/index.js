// dotenv initialization
import "dotenv/config";

// dependency imports
import app from "./app.js";
import connectToDB from "./db/index.js";

// connecting to db
connectToDB().then(() => {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server is running at port => ${port}`);
  });
});
