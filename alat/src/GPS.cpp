#include "GPS.h"

void GPS::init(void)
{
    Serial2.begin(9600);
}

void GPS::smartDelay(unsigned long ms)
{
    unsigned long start = millis();
    do
    {
        while (Serial2.available())
        {
            // Serial.print(Serial2.read());
            gps.encode(Serial2.read());
        }

    } while (millis() - start < ms);
}

void GPS::loop()
{
    smartDelay(1000);
    numSat = gps.satellites.isValid() ? String(gps.satellites.value()) : "11";
    lat = gps.location.lat() ? String(gps.location.lat(), 6) : "-6.599584066525856";
    lng = gps.location.lng() ? String(gps.location.lng(), 6) : "106.8109289531424";
    distance = GPS::getDistance();

    // sat = gps.satellites.value();
    // if (!lat.equals("err") && !lng.equals("err"))
    // {
    d_lat = gps.location.lat() ? gps.location.lat() : -6.599584066525856;
    d_lon = gps.location.lng() ? gps.location.lng() : 106.8109289531424;
    d_sat = gps.satellites.isValid() ? (gps.satellites.value()) : 11;

    // Serial.println(d_lat);
    // Serial.println(d_lon);

    // double d_lat = gps.location.lat();
    // double d_lon = gps.location.lng();
    // int d_sat = gps.satellites.value();
    // }
}

void GPS::setHome(double lat, double lon)
{
    // Serial.println(lat, 15);
    // Serial.println(lon, 15);
    home_lat = lat;
    home_lon = lon;
}

//
float GPS::getDistance()
{
    int jarak = gps.distanceBetween(-6.599893, 106.810836, d_lat, d_lon);
    return gps.distanceBetween(home_lat, home_lon, d_lat, d_lon);
}

void GPS::print_output()
{
    Serial.print("num sat : ");
    Serial.print(numSat);
    Serial.print("\t\t");

    Serial.print("lat : ");
    Serial.print(lat);
    Serial.print("\t\t\t");

    Serial.print("lng : ");
    Serial.print(lng);
    Serial.println("\t\t\t");
}