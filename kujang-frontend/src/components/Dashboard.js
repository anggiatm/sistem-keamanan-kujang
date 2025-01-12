import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

import { Grid, GridItem } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Container } from "@chakra-ui/react";

import Slot from "./Slot";

const endpoint = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  // const [isAdmin, setIsAdmin] = useState(null);
  // const [isLogin, setIsLogin] = useState(null);

  const [booked, setBooked] = useState(0);
  const [kosong, setKosong] = useState(0);
  const [terisi, setTeisi] = useState(0);
  const [slot, setSlot] = useState([]);

  useEffect(() => {
    const login = localStorage.getItem("isLogin");
    const admin = localStorage.getItem("isAdmin");
    if (login && admin) {
      console.log(endpoint);

      const pollingInterval = setInterval(() => {
        fetch(`${endpoint}/slot`)
          .then((response) => response.json())
          .then((data) => {
            setBooked(filter(data, "booked").length);
            setTeisi(filter(data, "terisi").length);
            setKosong(filter(data, "kosong").length);
            setSlot(data);
          })
          .catch((error) => {
            console.error("Error fetching parking slot data:", error);
          });
      }, 2000); // polling setiap 5 detik

      // Membersihkan interval ketika komponen di-unmount atau dihancurkan
      return () => clearInterval(pollingInterval);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const filter = (data, statusFilter) => {
    return data.filter(function (item) {
      console.log(item.status);
      return item.status === statusFilter;
    });
  };

  // if (isAdmin !== null) {
  //   console.log(isAdmin);
  //   console.log(isLogin);
  // }

  return (
    <>
      <Navbar />
      <Container maxW="container.2xl" color="white">
        <Box bg="#1a3263" w="100%" p={4} color="white" h="10vh">
          <p>Slot Parkir Terisi = {terisi}</p>
          <p>Slot Parkir Kosong = {kosong}</p>
          <p>Slot Parkir di Booking = {booked}</p>
        </Box>

        <Box bg="#e8e2db" w="100%" p={2} color="white" h="80vh">
          <Grid templateColumns="repeat(5, 110px)" gap={2}>
            {slot.map((item) => {
              return (
                <>
                  <GridItem w="100%" h="200" bg="blue.500">
                    <Slot
                      id={item.id}
                      status={item.status}
                      bookedBy={item.booking_id}
                    />
                  </GridItem>
                </>
              );
            })}
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default Dashboard;
