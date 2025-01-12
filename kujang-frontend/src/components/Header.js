import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, GridItem, Button, Text } from "@chakra-ui/react";

const Header = ({ user }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };
  return (
    <>
      <Box w="100%" p={1} color="white" h="5vh">
        <Grid templateColumns="repeat(4, 1fr)" gap={3}>
          <GridItem colSpan={3} h="10" color={"#000"}>
            Masuk sebagai <Text as="b"> {user}</Text>
          </GridItem>
          <GridItem w="100%" h="100%">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </GridItem>
        </Grid>
      </Box>
    </>
  );
};

export default Header;
