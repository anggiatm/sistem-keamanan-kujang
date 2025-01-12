// import React, { useState, useEffect } from "react";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import Login from "./components/Login";
import Map from "./components/Map";
import Dashboard from "./components/Dashboard";
import Booking from "./components/Booking";
import Pelanggan from "./components/Pelanggan";
import DataChart from "./components/DataChart";

function App() {
  return (
    <ChakraProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<Map />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/pelanggan" element={<Pelanggan />} />
            <Route path="/datachart" element={<DataChart />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ChakraProvider>
  );
}

export default App;
