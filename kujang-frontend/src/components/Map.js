import React, { useState, useEffect } from "react";
import { Button, Grid, GridItem, Text, Heading, Input } from "@chakra-ui/react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Navbar from "./Navbar";

import DataChart from "./DataChart";
import moment from "moment-timezone";

const containerStyle = {
  width: "auto",
  height: "95vh",
};

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

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });
  // const [map, setMap] = React.useState(null);

  const [position, setPosition] = useState([]);
  const [distance, setDistance] = useState(null);
  const [zoom, setZoom] = useState(2);

  const [center_lat, setCenter_lat] = useState(-6.599584066525912);
  const [center_lon, setCenter_lon] = useState(106.8109289531242);

  const [lastSeen, setLastSeen] = useState("Unknown");
  const [lastSeenColor, setLastSeenColor] = useState("red.200");

  const [val_1, setVal_1] = useState(null);
  const [val_2, setVal_2] = useState(null);
  const [val_3, setVal_3] = useState(null);
  const [val_4, setVal_4] = useState(null);
  const [val_5, setVal_5] = useState(null);
  const [val_6, setVal_6] = useState(null);

  const [label, setLabel] = useState("none");
  const [data, setData] = useState([]);

  const [clickedLocation, setClickedLocation] = useState(null);
  const [lastupdate, setLastupdate] = useState(new Date());
  const navigate = useNavigate();

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds({
      lat: center_lat,
      lng: center_lon,
    });
    // const zoom = new window.google.maps.Size(12);

    map.fitBounds(bounds);
    // map.fitBounds(zoom);
    // setMap(map);
  }, []);

  // const onUnmount = React.useCallback(function callback(map) {
  //   setMap(null);
  // }, []);

  useEffect(() => {
    const login = localStorage.getItem("isLogin");
    if (login) {
      // setIsLogin(true);
      const pollingInterval = setInterval(() => {
        fetch(`${endpoint}/datas`)
          .then((response) => response.json())
          .then((data) => {
            data.sort((a, b) => a.id - b.id);
            const last_data = data[data.length - 1];
            const limitedData = data.slice(-10); // Ambil 20 data terakhir

            setVal_1(last_data.alarm);
            setVal_2(last_data.kunci);
            setVal_3(last_data.num_sat);
            setVal_4(last_data.getaran);
            setVal_5(last_data.pintu);
            setVal_6(last_data.power);
            setLastupdate(last_data.timestamp);
            setPosition([{ lat: last_data.gps_lat, lng: last_data.gps_lon }]);
            setData(limitedData);
            console.log(limitedData);
            setZoom(12);
            const formattedTime = moment(last_data.timestamp)
              .tz("Asia/Bangkok") // Atau gunakan 'GMT+7'
              .format("YYYY-MM-DD HH:mm:ss");
            // console.log(formattedTime);
            setLabel(formattedTime);
            // console.log(formatDistanceToNow(last_data.timestamp));

            let ls = formatDistanceToNow(last_data.timestamp, {
              addSuffix: true,
            });

            setLastSeen(ls);

            if (ls === "less than a minute ago") {
              setLastSeenColor("green.200");
            } else if (ls === "1 minute ago") {
              setLastSeenColor("yellow.200");
            } else {
              setLastSeenColor("red.200");
            }

            let dis = calculate_distance(
              last_data.gps_lat,
              last_data.gps_lon,
              center_lat,
              center_lon
            );
            // console.log(dis);
            setDistance(dis);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      }, 2000);

      return () => {
        clearInterval(pollingInterval); // Cleanup the interval on component unmount
      };
    } else {
      navigate("/login");
    }
  }, [navigate, distance]);

  const commandHandle = (command) => {
    fetch(`${endpoint}/command`, {
      method: "POST", // Metode HTTP POST
      headers: {
        "Content-Type": "application/json", // Tipe konten yang dikirim adalah JSON
      },
      body: JSON.stringify({ command }), // Mengonversi objek JavaScript ke string JSON
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Mengonversi respons menjadi JSON
      })
      .then((data) => {
        console.log(data); // Menampilkan data yang diterima dari server
      })
      .catch((error) => {
        console.error("There was a problem with your fetch operation:", error);
      });
  };
  const handleMapClick = (event) => {
    const { latLng } = event;
    const lat = latLng.lat();
    const lng = latLng.lng();
    setClickedLocation({ lat, lng });
    console.log(`Latitude: ${lat}, Longitude: ${lng}`);
  };

  // const handleSetHomeClick = () => {
  //   if (clickedLocation) {
  //     console.log(
  //       `Home set to Latitude: ${clickedLocation.lat}, Longitude: ${clickedLocation.lng}`
  //     );
  //     // Tambahkan logika untuk menyimpan lokasi sebagai home di sini
  //     // Misalnya: menyimpan lokasi ke state global atau localStorage
  //   }
  // };

  const latChangeHandle = (event) => {
    setCenter_lat(parseFloat(event.target.value));

    let dis = calculate_distance(
      position[0].lat,
      position[0].lng,
      parseFloat(event.target.value),
      center_lon
    );

    // console.log(dis);
    setDistance(dis);
    // setCenter({
    //   lat: parseFloat(event.target.value),
    //   lng: center.lng,
    // });
  };
  const lonChangeHandle = (event) => {
    setCenter_lon(parseFloat(event.target.value));

    let dis = calculate_distance(
      position[0].lat,
      position[0].lng,
      center_lat,
      parseFloat(event.target.value)
    );

    // console.log(dis);
    setDistance(dis);
    // console.log(event.target.value);
    // setCenter({
    //   lat: center.lat,
    //   lng: parseFloat(event.target.value),
    // });
  };

  const sensorsBox = {
    display: "flex",
    margin: "3px",
    justifyContent: "center",
  };

  // console.log(position);

  return isLoaded ? (
    <div>
      <Navbar />
      <Grid templateRows="auto" gap={0} p={0}>
        <GridItem>
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "65% 35%",
              md: "65% 35%",
              lg: "65% 35%",
              xl: "65% 35%",
            }}
            gap={0}>
            <GridItem>
              <Grid templateRows="auto" gap={1} p={2}>
                <GridItem>
                  <Grid templateColumns="70% 30%">
                    <GridItem alignContent={"center"}>
                      <Heading
                        as="h4"
                        size="md"
                        textAlign="center"
                        color={"#e88b1a"}>
                        Sistem Informasi Kujang
                      </Heading>
                    </GridItem>

                    <GridItem>
                      <Grid templateRows="auto" gap={0}>
                        <GridItem sx={{ display: "flex" }}>
                          <Text as="b" marginRight="10px">
                            Status :
                          </Text>
                          <Text bg={val_1 === 0 ? "green.200" : "red.200"}>
                            {val_1 === 0 ? "Sistem Normal" : "Sistem Alarm"}
                          </Text>
                        </GridItem>
                        <GridItem sx={{ display: "flex" }}>
                          <Text as="b" marginRight="10px">
                            Status Kunci :
                          </Text>
                          <Text>
                            {val_2 === 0 ? "Terkunci" : "Tidak Terkunci"}
                          </Text>
                        </GridItem>
                      </Grid>
                    </GridItem>
                  </Grid>
                </GridItem>
                <hr></hr>

                <GridItem></GridItem>

                <GridItem>
                  <Grid templateColumns="10% 10% 20% 16% 15% 23%" margin={2}>
                    <GridItem sx={{ display: "flex", textAlign: "center" }}>
                      <Text as="b">Sensors:</Text>
                      {/* <Button colorScheme="teal" size="xs">
                        Update
                      </Button> */}
                    </GridItem>

                    <GridItem
                      sx={sensorsBox}
                      backgroundColor={val_3 > 4 ? "green.200" : "red.200"}>
                      <Text as="b" marginRight="10px">
                        GPS :
                      </Text>
                      <Text>{val_3 === null ? "Unknown" : val_3}</Text>
                    </GridItem>

                    <GridItem
                      sx={sensorsBox}
                      backgroundColor={
                        distance < 200 ? "green.200" : "red.200"
                      }>
                      <Text as="b" marginRight="10px">
                        Home :
                      </Text>
                      <Text>{distance === null ? "Unknown" : distance} m</Text>
                    </GridItem>

                    <GridItem
                      sx={sensorsBox}
                      backgroundColor={val_4 < 50 ? "green.200" : "red.200"}>
                      <Text as="b" marginRight="10px">
                        Getar :
                      </Text>
                      <Text>{val_4 == null ? "Unknown" : val_4 + " m/s²"}</Text>
                    </GridItem>

                    <GridItem
                      sx={sensorsBox}
                      backgroundColor={val_5 === 0 ? "green.200" : "red.200"}>
                      <Text as="b" marginRight="10px">
                        Pintu :
                      </Text>
                      <Text>{val_5 === 0 ? "Tertutup" : "Terbuka"}</Text>
                    </GridItem>

                    <GridItem sx={sensorsBox} backgroundColor={lastSeenColor}>
                      <Text as="b" marginRight="10px">
                        Last Seen :
                      </Text>
                      <Text>{lastSeen}</Text>
                    </GridItem>
                  </Grid>
                </GridItem>

                <GridItem>
                  <Grid templateColumns="60px 35% 35% 30%" margin={2}>
                    <GridItem>
                      <Text>Home</Text>
                    </GridItem>
                    <GridItem sx={sensorsBox}>
                      <Text as="b" marginRight="10px">
                        Latitude
                      </Text>
                      <Input
                        size="xs"
                        value={center_lat}
                        onChange={latChangeHandle}></Input>
                    </GridItem>
                    <GridItem sx={sensorsBox}>
                      <Text as="b" marginRight="10px">
                        Longitude
                      </Text>
                      <Input
                        size="xs"
                        value={center_lon}
                        onChange={lonChangeHandle}></Input>
                    </GridItem>

                    <GridItem>
                      <Button
                        colorScheme="green"
                        size="xs"
                        onClick={() =>
                          commandHandle(`home,${center_lat},${center_lon}`)
                        }>
                        Save
                      </Button>
                    </GridItem>
                  </Grid>
                </GridItem>

                <GridItem textAlign={"center"}>
                  <Text as="b">Real-Time Chart</Text>
                </GridItem>

                <GridItem>
                  <DataChart />
                </GridItem>

                {/* <GridItem>
                  <Box bg="cyan.500" color="white" p={2}>
                    <Heading as="h4" size="md">
                      Sistem Informasi Kujang
                    </Heading>
                  </Box>
                </GridItem>

                <GridItem>
                  <Grid templateColumns="30% 60%" gap={0}>
                    <Text as="b">Status Alarm</Text>
                    <Text bg={val_1 === 0 ? "green.200" : "red"}>
                      {val_1 === 0 ? "Sistem Normal" : "Sistem Alarm"}
                    </Text>
                  </Grid>
                </GridItem>

                <GridItem>
                  <Grid templateColumns="30% 50% 10%" gap={0}>
                    <Text as="b">Status Kunci</Text>
                    <Text>{val_2 === 0 ? "Terkunci" : "Tidak Terkunci"}</Text>

                    {val_2 === 0 ? (
                      <Button
                        colorScheme="yellow"
                        size="xs"
                        onClick={() => commandHandle("unlock")}>
                        Buka Kunci
                      </Button>
                    ) : (
                      <Button
                        colorScheme="green"
                        size="xs"
                        onClick={() => commandHandle("lock")}>
                        Kunci
                      </Button>
                    )}
                  </Grid>
                </GridItem>

                <hr></hr>
                <br></br>

                <GridItem>
                  <Grid templateColumns="90px 70px" gap={0}>
                    <Text as="i">Sensors:</Text>
                    <Button colorScheme="teal" size="xs">
                      Update
                    </Button>
                  </Grid>
                </GridItem>

                <GridItem>
                  <Grid templateColumns="30% 50% 10%" gap={0}>
                    <Text as="b">GPS</Text>
                    <Text>{val_3 === null ? "Unknown" : val_3}</Text>
                    <Box display="flex" alignItems="center">
                      <Dot color={val_3 > 4 ? "green" : "red"} />
                    </Box>
                  </Grid>
                </GridItem>

                <GridItem>
                  <Grid templateColumns="30% 50% 10%" gap={0}>
                    <Text as="b">Jarak ke Home</Text>
                    <Text>{distance === null ? "Unknown" : distance} m</Text>
                    <Box display="flex" alignItems="center">
                      <Dot color={distance < 200 ? "green" : "red"} />
                    </Box>
                  </Grid>
                </GridItem>

                <GridItem>
                  <Grid templateColumns="30% 50% 10%" gap={0}>
                    <Text as="b">Getaran</Text>
                    <Text>{val_4 == null ? "Unknown" : val_4 + " m/s²"}</Text>
                    <Box display="flex" alignItems="center">
                      <Dot color={val_4 < 50 ? "green" : "red"} />
                    </Box>
                  </Grid>
                </GridItem>

                <GridItem>
                  <Grid templateColumns="30% 50% 10%" gap={0}>
                    <Text as="b">Pintu</Text>
                    <Text>{val_5 === 0 ? "Tertutup" : "Terbuka"}</Text>
                    <Box display="flex" alignItems="center">
                      <Dot color={val_5 === 0 ? "green" : "red"} />
                    </Box>
                  </Grid>
                </GridItem> */}

                {/* <GridItem>
                    <Grid templateColumns="30% 50% 10%" gap={0}>
                      <Text as="b">Power</Text>
                      <Text>{val_6 == null ? "Unknown" : val_6 + " v"}</Text>
                      <Box display="flex" alignItems="center">
                        <Dot
                          color={
                            val_6 > 3.7
                              ? "green"
                              : val_6 < 3.4
                              ? "red"
                              : "yellow"
                          }
                        />
                      </Box>
                    </Grid>
                  </GridItem> */}

                {/* <GridItem>
                  <Grid templateColumns="30% 50% 10%" gap={0}>
                    <Text as="b">Last Seen</Text>
                    <Text>{lastSeen}</Text>
                    <Box display="flex" alignItems="center">
                      <Dot color={lastSeenColor} />
                    </Box>
                  </Grid>
                </GridItem>
                <hr></hr>
                <br></br>
                <GridItem>
                  <Text as="i">Home:</Text>
                </GridItem>
                <GridItem>
                  <Grid templateColumns="90px auto" gap={0}>
                    <Text as="b">Latitude</Text>
                    <Input
                      size="xs"
                      value={center_lat}
                      onChange={latChangeHandle}></Input>
                  </Grid>
                </GridItem>
                <GridItem>
                  <Grid templateColumns="90px auto" gap={0}>
                    <Text as="b">Longitude</Text>
                    <Input
                      size="xs"
                      value={center_lon}
                      onChange={lonChangeHandle}></Input>
                  </Grid>
                </GridItem>

                <Button
                  colorScheme="green"
                  size="xs"
                  onClick={() =>
                    commandHandle(`home,${center_lat},${center_lon}`)
                  }>
                  Save
                </Button> */}
              </Grid>
            </GridItem>
            <GridItem>
              <GoogleMap
                mapContainerStyle={containerStyle}
                zoom={zoom}
                onLoad={onLoad}
                onClick={handleMapClick}>
                {data.map((d, index) => {
                  return index !== data.length - 1 ? (
                    <Marker
                      key={d.id}
                      position={{
                        lat: d.gps_lat,
                        lng: d.gps_lon,
                      }}
                      label={{
                        color: "black",
                        fontSize: "15px",
                        fontWeight: "bold",
                        text: (
                          parseInt(d.id) -
                          parseInt(data[0].id) +
                          1
                        ).toString(),
                      }}
                      title={moment(d.timestamp)
                        .tz("Asia/Bangkok")
                        .format("YYYY-MM-DD HH:mm:ss")}
                      icon={{
                        path: window.google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
                        fillColor: "yellow",
                        fillOpacity: 0.7,
                        strokeColor: "black",
                        strokeWeight: 0.5,
                        scale: 5,
                      }}></Marker>
                  ) : (
                    <Marker
                      key={d.id}
                      position={{
                        lat: d.gps_lat,
                        lng: d.gps_lon,
                      }}
                      label={{
                        color: "black",
                        fontSize: "15px",
                        fontWeight: "bold",
                        text: (
                          parseInt(d.id) -
                          parseInt(data[0].id) +
                          1
                        ).toString(),
                      }}
                      title={moment(d.timestamp)
                        .tz("Asia/Bangkok")
                        .format("YYYY-MM-DD HH:mm:ss")}
                      icon={{
                        path: window.google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
                        fillColor: "red",
                        fillOpacity: 0.7,
                        strokeColor: "black",
                        strokeWeight: 0.5,
                        scale: 5,
                      }}></Marker>
                  );
                })}

                <Marker
                  key={"home"}
                  position={{ lat: center_lat, lng: center_lon }}
                  label={{
                    color: "black",
                    text: "home",
                    fontSize: "12px",
                    fontWeight: "bold",
                    opacity: "50",
                  }}
                  title="Home"
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: "blue",
                    fillOpacity: 0.7,
                    strokeColor: "black",
                    strokeWeight: 0.5,
                    scale: 12,
                  }}></Marker>
              </GoogleMap>
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </div>
  ) : (
    <></>
  );
};

// {clickedLocation && (
//   <Marker
//     position={clickedLocation}
//     label={{
//       color: "green",
//       text: `o`,
//       fontSize: "14px",
//       fontWeight: "bold",
//     }}
//     icon={{
//       path: window.google.maps.SymbolPath.CIRCLE,
//       fillColor: "green",
//       fillOpacity: 0.5,
//       strokeColor: "green",
//       strokeWeight: 0.5,
//       scale: 6,
//     }}
//   />
// )}

export default Map;
