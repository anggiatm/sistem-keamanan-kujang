import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";

const bgOccupied = "#FEB2B2";
const bgFree = "#C6F6D5";
const bgBooked = "#FEFCBF";
// const bgUnavailable = "#CBD5E0";

const endpoint = process.env.REACT_APP_API_URL;

const Booking = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const unixToTimeDate = (unix) => {
    const date = new Date(parseInt(unix));
    const twoDigits = (number) => (number < 10 ? `0${number}` : number);
    const formattedDate = `${twoDigits(date.getDate())}/${twoDigits(
      date.getMonth() + 1
    )}/${date.getFullYear()}`;
    const formattedTime = `${twoDigits(date.getHours())}:${twoDigits(
      date.getMinutes()
    )}`;
    const formattedDateTime = `${formattedDate} | ${formattedTime}`;
    return formattedDateTime;
  };

  const estimasiSampai = (unix, perjalanan) => {
    const date = new Date(parseInt(unix));
    const dur = parseInt(perjalanan.split(" ")[0]);

    date.setMinutes(date.getMinutes() + dur);

    const twoDigits = (number) => (number < 10 ? `0${number}` : number);
    const formattedDate = `${twoDigits(date.getDate())}/${twoDigits(
      date.getMonth() + 1
    )}/${date.getFullYear()}`;
    const formattedTime = `${twoDigits(date.getHours())}:${twoDigits(
      date.getMinutes()
    )}`;
    const formattedDateTime = `${formattedDate} | ${formattedTime}`;
    return formattedDateTime;
  };

  const waktuTunggu = (unix) => {
    const currentTime = new Date();
    const targetTime = new Date(parseInt(unix));

    const differenceMs = targetTime - currentTime;

    let minutes = Math.floor(differenceMs / (1000 * 60));
    if (minutes < 0) {
      minutes = 0;
    }
    return minutes + " min";
  };

  useEffect(() => {
    const login = localStorage.getItem("isLogin");
    const admin = localStorage.getItem("isAdmin");
    if (login && admin) {
      fetch(`${endpoint}/booking`)
        .then((response) => response.json())
        .then((data) => {
          setData(data);
        })
        .catch((error) => {
          console.error("Error fetching parking slot data:", error);
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      <Navbar />
      <TableContainer>
        <Table variant="simple" size="sm">
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th isNumeric>No</Th>
              <Th>No Pol</Th>
              <Th>Slot</Th>
              <Th>Tgl Booking</Th>
              <Th>perjalanan</Th>
              <Th>estimasi sampai</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>

          <Tbody>
            {data.map((item, index) => {
              let bg;
              switch (item.status) {
                case "booking berhasil":
                  bg = bgFree;
                  break;
                case "berhasil":
                  bg = bgFree;
                  break;
                case "booking gagal":
                  bg = bgOccupied;
                  break;
                case "gagal":
                  bg = bgOccupied;
                  break;
                case "dalam perjalanan":
                  bg = bgBooked;
                  break;

                default:
                  break;
              }
              return (
                <Tr key={index} bg={bg}>
                  <Td isNumeric>{index + 1}</Td>
                  <Td>{item.user}</Td>
                  <Td>{item.slot}</Td>
                  <Td>{unixToTimeDate(item.timestamp)}</Td>
                  <Td>{item.duration}</Td>
                  <Td>{estimasiSampai(item.timestamp, item.duration)}</Td>
                  <Td>
                    {item.status === "dalam perjalanan"
                      ? item.status +
                        " | " +
                        waktuTunggu(item.timestamp) +
                        " lagi"
                      : item.status}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Booking;
