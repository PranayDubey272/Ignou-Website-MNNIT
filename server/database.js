import pg from "pg";
import env from "dotenv";

const { Pool } = pg;
env.config();

const db = new Pool({
  user: process.env.DB_USER,      // Replace with your local PostgreSQL username
  host: process.env.DB_HOS,          // Local database host
  database:process.env.DB_DATABASE_NAME,   // Replace with your local database name
  password: process.env.DB_PASSWORD,  // Replace with your local PostgreSQL password
  port: process.env.DB_PORT,                 // Default PostgreSQL port
});

db.connect()
  .then(() => {
    console.log("Connected to the local PostgreSQL database");
  })
  .catch((error) => {
    console.error("Error connecting to the PostgreSQL database:", error);
  });

export default db;
