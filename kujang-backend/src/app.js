const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db"); // Import modul koneksi database
const cors = require("cors"); // Import modul cors
const mqtt = require("mqtt");
// const { setInterval } = require("timers");
const path = require("path");
require("dotenv").config();
const env = process.env;
const app = express();
const mqttClient = mqtt.connect(env.MQTT_BROKER); // Ganti dengan alamat broker MQTT yang sesuai

app.use(express.static(path.join(__dirname, "frontend/build")));
app.use(bodyParser.json());
app.use(cors());

// Fungsi untuk dijalankan setiap kali ada pesan MQTT masuk
mqttClient.on("message", function (topic, message) {
  if (topic === env.TOPIC_IN) {
    console.log(`Menerima pesan, topik ${topic}: ${message.toString()}`);
    message = message.toString();
    let array_msg = message.split(",");

    if (array_msg.length === parseInt(env.VALID_DATA_LENGTH)) {
      console.log("message valid");

      // console.log(array_msg);

      const alarm = array_msg[0];
      const kunci = array_msg[1];
      const gps_lat = array_msg[2] === "err" ? 0.0 : parseFloat(array_msg[2]);

      const gps_lon = array_msg[3] === "err" ? 0.0 : parseFloat(array_msg[3]);
      const num_sat = array_msg[4] === "err" ? 0.0 : parseInt(array_msg[4]);

      const getaran = parseFloat(array_msg[5]);
      const pintu = parseInt(array_msg[6]);
      const power = parseFloat(array_msg[7]);

      db.query(
        "INSERT INTO " +
          env.DATABASE_NAME +
          "." +
          env.MAIN_TABLE +
          " (alarm, kunci, gps_lat, gps_lon, num_sat, getaran, pintu, power) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [alarm, kunci, gps_lat, gps_lon, num_sat, getaran, pintu, power],
        (err, results) => {
          if (err) {
            console.error("Error:", err);
          } else {
            console.log(results.insertId);
          }
        }
      );
    }
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// Endpoint untuk mendapatkan semua data slot parkir
app.get("/datas", (req, res) => {
  db.query("SELECT * FROM datas ORDER BY timestamp ASC", (err, results) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Gagal mengambil data posisi" });
    } else {
      res.json(results);
    }
  });
});

app.post("/command", (req, res) => {
  const { command } = req.body;
  mqttClient.publish(env.TOPIC_OUT, command);
  res.json({ msg: `published. topic:${env.TOPIC_OUT}, command: ${command}` });
});

app.get("/slot/:id", (req, res) => {
  console.log(req.params.id);
  const id = req.params.id;

  db.query("SELECT * FROM slot WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Gagal mengambil data booking" });
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ error: "Data booking tidak ditemukan" });
      }
    }
  });
});

// Endpoint untuk mendapatkan semua data booking
app.get("/booking", (req, res) => {
  db.query("SELECT * FROM booking", (err, results) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Gagal mengambil data booking" });
    } else {
      res.json(results);
    }
  });
});

// Endpoint untuk mendapatkan data booking berdasarkan ID
app.get("/booking/:id", (req, res) => {
  const bookingId = req.params.id;
  db.query(
    "SELECT * FROM booking WHERE id = ?",
    [bookingId],
    (err, results) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Gagal mengambil data booking" });
      } else {
        if (results.length > 0) {
          res.json(results[0]);
        } else {
          res.status(404).json({ error: "Data booking tidak ditemukan" });
        }
      }
    }
  );
});

app.get("/user/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM user WHERE username = ?", [id], (err, results) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Gagal mengambil data booking" });
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ error: "Data booking tidak ditemukan" });
      }
    }
  });
});

app.post("/user", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "INSERT INTO user (username, password) VALUES (?, ?)",
    [username, password],
    (err, results) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Gagal membuat user" });
      } else {
        res.json({
          message: "User berhasil dibuat",
          id: results.insertId,
        });
      }
    }
  );
});

app.listen(env.SERVER_PORT, () => {
  console.log(`Server berjalan di port:${env.SERVER_PORT}`);
  mqttClient.subscribe(env.TOPIC_IN);
});
