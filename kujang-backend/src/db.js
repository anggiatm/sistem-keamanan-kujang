const mysql = require("mysql");
require("dotenv").config();
const env = process.env;

// const connection = mysql.createConnection({
//   host: "api.bookingparkir.top",
//   user: "booking1_root", // Ganti dengan username MySQL Anda
//   password: "Giganex12", // Ganti dengan password MySQL Anda
//   database: "booking1_parkir", // Ganti dengan nama database Anda
// });

const connection = mysql.createConnection({
  host: env.DATABASE_URL,
  user: env.DATABASE_USER, // Ganti dengan username MySQL Anda
  password: env.DATABASE_PASS, // Ganti dengan password MySQL Anda
  database: env.DATABASE_NAME, // Ganti dengan nama database Anda
});

connection.connect((err) => {
  if (err) {
    console.error("Koneksi database gagal:", err);
  } else {
    console.log("Koneksi database berhasil");
  }
});

module.exports = connection;
