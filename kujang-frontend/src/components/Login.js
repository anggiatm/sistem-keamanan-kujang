import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Center } from "@chakra-ui/react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
} from "@chakra-ui/react";

const endpoint = process.env.REACT_APP_API_URL;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState({});

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    fetch(`${endpoint}/user/${username}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setUser(data);
      })
      .catch((error) => {
        console.error("Error fetching parking slot data:", error);
      });

    e.preventDefault();
    if (username === user.username && password === user.password) {
      localStorage.setItem("isLogin", true);
      localStorage.setItem("user", user.username);

      if (user.username === "admin") {
        localStorage.setItem("isAdmin", true);
        navigate("/map");
      } else if (user.role === "user") {
        localStorage.setItem("isUser", true);
        navigate("/map");
      }
    } else {
      setError("Username atau password salah.");
    }
  };

  return (
    <div>
      <Center bg="#e8e2db" h="100vh" color="#000">
        <Box
          bg="#edd6b9"
          p={4}
          borderWidth="1px"
          borderColor="#1a3263"
          borderRadius="md"
          boxShadow="xl"
          paddingLeft="50px"
          paddingRight="50px">
          <Heading as="h2" size="lg" mb={4}>
            Login
          </Heading>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <Button type="submit" color="#000" size="md" bgColor={"#fab95b"}>
                Log In
              </Button>
            </Stack>
          </form>
        </Box>
      </Center>
    </div>
  );
};

export default Login;
