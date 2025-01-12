#ifndef __GPS_H__
#define __GPS_H__

#include <TinyGPSPlus.h>

class GPS
{
public:
    void init(void);
    void loop();
    void print_output();
    float getDistance();

    void setHome(double lat, double lon);

    String numSat;
    String lat;
    String lng;
    float distance;

    double d_lat = -6.599584076525856;
    double d_lon = 106.8109288531424;
    int d_sat = 11;

    double home_lat = -6.599584066525912;
    double home_lon = 106.8109289531242;

private:
    TinyGPSPlus gps;
    void smartDelay(unsigned long ms);
};

#endif