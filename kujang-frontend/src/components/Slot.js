import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { Center, Grid, GridItem, Heading } from "@chakra-ui/react";

const bgOccupied = "#E53E3E";
const bgFree = "#38A169";
const bgBooked = "#ECC94B";
const bgUnavailable = "#CBD5E0";

const Slot = ({ id, status, bookedBy }) => {
  const [bg, setBg] = useState(null);
  const [ket, setKet] = useState(null);

  useEffect(() => {
    if (status === "booked") {
      setBg(bgBooked);
      setKet("id booking " + bookedBy);
    } else if (status === "kosong") {
      setBg(bgFree);
      setKet("Slot kosong");
    } else if (status === "terisi") {
      setBg(bgOccupied);
      setKet("Slot terisi");
    } else {
      setBg(bgUnavailable);
    }
  }, [status, bookedBy]); // Masukkan status dan bookedBy ke dalam array dependensi

  return (
    <Box bg={bg} w="auto" paddingTop={"30%"} h="100%" color="white">
      <Grid templateRows="repeat(2, 1fr)" gap={1}>
        <GridItem w="100%" h="100">
          <Center h="100%" color="white">
            <Heading as="h3" size="lg">
              {id}
            </Heading>
          </Center>
        </GridItem>
        <GridItem w="100%" h="1">
          <Center h="100%" color="white">
            <p>{ket}</p>
          </Center>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Slot;
