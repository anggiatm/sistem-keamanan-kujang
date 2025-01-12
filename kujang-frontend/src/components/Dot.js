import React from "react";
import { Box } from "@chakra-ui/react";

const Dot = ({ color }) => {
  return (
    <Box
      width="10px" // Lebar dot
      height="10px" // Tinggi dot
      borderRadius="50%" // Membuat dot menjadi lingkaran
      bg={color || "red.500"} // Warna latar belakang menggunakan prop color
      display="inline-block" // Agar dot tidak mempengaruhi elemen lain
    />
  );
};

export default Dot;
