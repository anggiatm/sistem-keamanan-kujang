import React from "react";
import { useNavigate } from "react-router-dom";

import { Button, Stack, Text } from "@chakra-ui/react";

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const handleDashboard = () => {
    navigate("/map");
  };

  const Logging = () => {
    navigate("/datachart");
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={4}
        align="center"
        backgroundColor="#edd6b9">
        <Button colorScheme="teal" variant="ghost" onClick={handleDashboard}>
          Dashboard
        </Button>
        <Button colorScheme="teal" variant="ghost" onClick={Logging}>
          Real-Time Logging
        </Button>
        <Text> Masuk sebagai</Text>
        <Text as="b">{localStorage.getItem("user")}</Text>
        <Button colorScheme="teal" variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>
    </>
  );
};

export default Navbar;
