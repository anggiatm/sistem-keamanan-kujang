import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Divider, Box, Grid, GridItem } from "@chakra-ui/react";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrasi komponen yang diperlukan di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const endpoint = process.env.REACT_APP_API_URL;

const calculate_distance = (lat_from, lng_from, lat_to, lng_to) => {
  // Konversi derajat ke radian
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // Radius Bumi dalam meter
  const dLat = toRad(lat_to - lat_from); // Perbaikan urutan parameter
  const dLon = toRad(lng_to - lng_from); // Perbaikan urutan parameter
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat_from)) *
      Math.cos(toRad(lat_to)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Jarak dalam meter
  return distance.toFixed(1);
};

const DataChart = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [center_lat, setCenter_lat] = useState(-6.599584066525912);
  const [center_lon, setCenter_lon] = useState(106.8109289531242);

  // const names = data.map(item => item.name);
  // console.log(names); // Output: ['Alice', 'Bob', 'Charlie']

  useEffect(() => {
    const login = localStorage.getItem("isLogin");
    const admin = localStorage.getItem("isAdmin");
    if (login && admin) {
      fetch(`${endpoint}/datas`)
        .then((response) => response.json())
        .then((data) => {
          data.sort((a, b) => a.id - b.id);
          setData(data);
          console.log(data);
        })
        .catch((error) => {
          console.error("Error fetching parking slot data:", error);
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const maxDataPoints = 20;
  const limitedData = data.slice(-maxDataPoints); // Ambil 100 data terakhir

  const dataJarak = {
    labels: limitedData.map((item) =>
      format(new Date(item.timestamp), "HH:mm:ss")
    ),
    datasets: [
      {
        label: "Jarak ke Home",
        data: limitedData.map((item) =>
          calculate_distance(item.gps_lat, item.gps_lon, center_lat, center_lon)
        ),
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.4,
      },
    ],
  };

  const dataGetaran = {
    labels: limitedData.map((item) =>
      format(new Date(item.timestamp), "HH:mm:ss")
    ),
    datasets: [
      {
        label: "Guncangan (m/s^2)",
        data: limitedData.map((item) => item.getaran),
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.2)",
        tension: 0.4,
      },
    ],
  };

  const dataSatelit = {
    labels: limitedData.map((item) =>
      format(new Date(item.timestamp), "HH:mm:ss")
    ),
    datasets: [
      {
        label: "Jumlah Satelit",
        data: limitedData.map((item) => item.num_sat),
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.2)",
        tension: 0.4,
      },
    ],
  };

  const dataPintu = {
    labels: limitedData.map((item) =>
      format(new Date(item.timestamp), "HH:mm:ss")
    ),
    datasets: [
      {
        label: "Pintu",
        data: limitedData.map((item) => item.pintu),
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.2)",
        tension: 0,
      },
    ],
  };

  // Opsi untuk chart
  const optionsJarak = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
      title: {
        display: true,
        text: "Jarak ke Home",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const originalTimestamp = data[index].timestamp;
            const formattedDateTime = format(
              new Date(originalTimestamp),
              "dd-MM-yy HH:mm:ss"
            );
            return `${context.dataset.label}: ${context.raw} ( ${formattedDateTime} )`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Opsi untuk chart
  const optionsGuncangan = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
      title: {
        display: true,
        text: "Guncangan",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const originalTimestamp = data[index].timestamp;
            const formattedDateTime = format(
              new Date(originalTimestamp),
              "dd-MM-yy HH:mm:ss"
            );
            return `${context.dataset.label}: ${context.raw} ( ${formattedDateTime} )`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Opsi untuk chart
  const optionsSatelit = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
      title: {
        display: true,
        text: "Satelit",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const originalTimestamp = data[index].timestamp;
            const formattedDateTime = format(
              new Date(originalTimestamp),
              "dd-MM-yy HH:mm:ss"
            );
            return `${context.dataset.label}: ${context.raw} ( ${formattedDateTime} )`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const optionsPintu = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
      title: {
        display: true,
        text: "Pintu",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const originalTimestamp = data[index].timestamp;
            const formattedDateTime = format(
              new Date(originalTimestamp),
              "dd-MM-yy HH:mm:ss"
            );
            return `${context.dataset.label}: ${context.raw} ( ${formattedDateTime} )`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      {/* <Navbar /> */}
      <Grid templateRows="auto" p={0}>
        <GridItem>
          <Box height="170px" color="white">
            <Line data={dataJarak} options={optionsJarak} />
          </Box>
        </GridItem>

        <Divider borderWidth="3px" borderColor="gray.200" />

        <GridItem>
          <Box height="170px" color="white">
            <Line data={dataGetaran} options={optionsGuncangan} />
          </Box>
        </GridItem>

        <Divider borderWidth="3px" borderColor="gray.200" />

        <GridItem>
          <Box height="170px" color="white">
            <Line data={dataSatelit} options={optionsSatelit} />
          </Box>
        </GridItem>

        <Divider borderWidth="3px" borderColor="gray.200" />

        <GridItem>
          <Box height="170px" color="white">
            <Line data={dataPintu} options={optionsPintu} />
          </Box>
        </GridItem>
      </Grid>
    </>
  );
};

export default DataChart;
