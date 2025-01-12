#include "MQTT.h"

void MQTT::init(std::function<void(char *topic, uint8_t *message, unsigned int length)> CallbackFunction)
{
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println(WiFi.localIP());
    mqttClient.setServer(MQTT_BROKER, 1883);
    mqttClient.setCallback(CallbackFunction);
}

void MQTT::loop()
{
    if (!mqttClient.connected())
    {
        reconnect();
    }
    mqttClient.loop();
}

void MQTT::notify(bool ALARM_STATE, bool is_ACCESS_GRANTED, String lat, String lon, String sat, float is_SHAKE, bool is_DOOR_OPEN, float POWER)
{
    Serial.println("publish data");
    String str_ALARM_STATE = ALARM_STATE ? "1" : "0";
    String str_is_ACCESS_GRANTED = is_ACCESS_GRANTED ? "1" : "0";

    String str_is_SHAKE = String(is_SHAKE, 2);

    // String str_is_SHAKE = is_SHAKE ? "1" : "0";

    String str_is_DOOR_OPEN = is_DOOR_OPEN ? "1" : "0";

    String message = str_ALARM_STATE + "," + str_is_ACCESS_GRANTED + "," + lat + "," + lon + "," + sat + "," + str_is_SHAKE + "," + str_is_DOOR_OPEN + "," + "5";
    mqttClient.publish(MQTT_OUT_TOPIC, message.c_str());
}

void MQTT::reconnect()
{
    while (!mqttClient.connected())
    {
        Serial.print("Attempting MQTT connection...");
        if (mqttClient.connect(MQTT_NAME))
        {
            Serial.println("connected");
            mqttClient.subscribe(MQTT_IN_TOPIC);
        }
        else
        {
            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            delay(2000);
        }
    }
}