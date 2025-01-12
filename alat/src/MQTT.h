#ifndef __MQTT_H__
#define __MQTT_H__

// #include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <configuration.h>

class MQTT
{
public:
    MQTT() : mqttClient(wifiClient) {}
    void init(std::function<void(char *topic, uint8_t *message, unsigned int length)> CallbackFunction);
    void reconnect();
    void loop();
    void notify(bool ALARM_STATE, bool is_ACCESS_GRANTED, String lat, String lon, String sat, float is_SHAKE, bool is_DOOR_OPEN, float POWER);

private:
    WiFiClient wifiClient;
    PubSubClient mqttClient;
};

#endif