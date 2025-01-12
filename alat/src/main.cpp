#include "RFID.h"
#include "MPU.h"
#include "GPS.h"
#include "MQTT.h"
#include "SYSTEMS.h"
#include "EEPROM.h"

RFID rf;
MPU mpu;
GPS gps;
MQTT mqtt;
SYSTEMS sys;

bool is_SHAKE = false;
bool is_DOOR_OPEN = false;
bool is_ACCESS_GRANTED = true;
bool is_ACCESS_GRANTED_before = true;
bool is_SERVER_ALARM = false;
// float distance = 0;

bool ALARM_STATE = false;
bool ALARM_STATE_before = false;

String lat;
String lon;
String sat;

TaskHandle_t RFID_HANDLE;
TaskHandle_t GPS_HANDLE;
TaskHandle_t MPU_HANDLE;
TaskHandle_t SYSTEMS_HANDLE;
TaskHandle_t ALARM_HANDLE;

String split_string(String text, char delimiter, int index)
{
  int startIndex = 0;
  int endIndex = -1;
  int currentIndex = 0;

  while (currentIndex <= index)
  {
    endIndex = text.indexOf(delimiter, startIndex);

    if (endIndex == -1)
    {
      endIndex = text.length(); // If no more delimiters, set endIndex to the length of the string
    }

    if (currentIndex == index)
    {
      return text.substring(startIndex, endIndex); // Return the substring at the specified index
    }

    startIndex = endIndex + 1; // Move to the next part of the string
    currentIndex++;
  }

  return ""; // Return an empty string if the index is out of bounds
}

void onRFID_valid_event()
{
  Serial.println("  --> Card Valid");
  is_ACCESS_GRANTED = !is_ACCESS_GRANTED;
  is_ACCESS_GRANTED ? sys.unlock() : sys.lock();
}

void onRFID_invalid_event()
{
  Serial.println("  --> Card Invalid");
  sys.buzzer_warning();
}

void onMQTT_event(char *topic, uint8_t *message, unsigned int length)
{
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String command;

  for (int i = 0; i < length; i++)
  {
    command += (char)message[i];
  };

  Serial.print(command);

  if (command == "lock")
  {
    is_ACCESS_GRANTED = false;
    sys.unlock();
  }
  else if (command == "unlock")
  {
    is_ACCESS_GRANTED = true;
    sys.lock();
  }

  else if (command == "alarm")
  {
    is_SERVER_ALARM = true;
  }

  else if (command == "silence")
  {
    is_SERVER_ALARM = false;
  }
  else
  {
    if (split_string(command, ',', 0).equals("home"))
    {
      double new_lat = split_string(command, ',', 1).toDouble();
      double new_lon = split_string(command, ',', 2).toDouble();
      gps.setHome(new_lat, new_lon);
    }

    // bool is_set_home = ;

    // Serial.println(new_lat, 15);
    // Serial.println(new_lon, 15);
    // Serial.println(is_set_home);

    // Serial.println(gps.home_lat, 15);
  }
}

void RFID_TASK(void *parameter)
{
  rf.init();
  rf.setValidCardCallback(onRFID_valid_event);
  rf.setInvalidCardCallback(onRFID_invalid_event);
  vTaskDelay(2000 / portTICK_PERIOD_MS);
  while (true)
  {
    rf.loop();
    vTaskDelay(20 / portTICK_PERIOD_MS);
  }
}

void GPS_TASK(void *parameter)
{
  gps.init();
  vTaskDelay(2000 / portTICK_PERIOD_MS);
  while (true)
  {
    gps.loop();
    lat = gps.lat;
    lon = gps.lng;
    sat = gps.numSat;

    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

void MPU_TASK(void *parameter)
{
  mpu.init();
  vTaskDelay(2000 / portTICK_PERIOD_MS);
  while (true)
  {
    mpu.loop();
    // mpu.print_output();
    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

void ALARM_TASK(void *parameter)
{
  while (true)
  {
    if (ALARM_STATE)
    {
      sys.buzzer_alarm();
    }

    vTaskDelay(20 / portTICK_PERIOD_MS);
  }
}

void SYSTEMS_TASK(void *parameter)
{
  sys.init();
  unsigned long previousMillis = 0;
  const long update_interval = 10000;
  vTaskDelay(1000 / portTICK_PERIOD_MS);

  while (true)
  {
    unsigned long currentMillis = millis();

    is_DOOR_OPEN = sys.is_door_open();
    is_SHAKE = mpu.shake;
    // distance = gps.distance;

    if (is_ACCESS_GRANTED)
    {
      mpu.shake_reset();
      sys.door_unlock();
      ALARM_STATE = false;
    }
    else
    {
      sys.door_lock();
    }

    ALARM_STATE = (!is_ACCESS_GRANTED && (is_DOOR_OPEN || is_SHAKE || (gps.distance > 200 && gps.d_sat > 4))) || is_SERVER_ALARM;

    if (!ALARM_STATE)
      sys.buzzer_silence();

    if (ALARM_STATE != ALARM_STATE_before)
    {
      // Serial.println("Notify");
      mqtt.notify(ALARM_STATE, is_ACCESS_GRANTED, lat, lon, sat, mpu.shake_value(), is_DOOR_OPEN, gps.distance);
      ALARM_STATE_before = ALARM_STATE;
    }
    if (is_ACCESS_GRANTED != is_ACCESS_GRANTED_before)
    {
      // Serial.println("Notify");
      mqtt.notify(ALARM_STATE, is_ACCESS_GRANTED, lat, lon, sat, mpu.shake_value(), is_DOOR_OPEN, gps.distance);
      is_ACCESS_GRANTED_before = is_ACCESS_GRANTED;
    }

    if (currentMillis - previousMillis >= update_interval)
    {
      // Simpan waktu terakhir eksekusi
      previousMillis = currentMillis;

      Serial.print("alarm: ");
      Serial.print(ALARM_STATE);
      Serial.print("\t");

      Serial.print("access: ");
      Serial.print(is_ACCESS_GRANTED);
      Serial.print("\t");

      Serial.print("gps: ");
      Serial.print(" lat: ");
      Serial.print(lat);
      Serial.print(" lon: ");
      Serial.print(lon);
      Serial.print(" sat: ");
      Serial.print(sat);
      Serial.print("\t");

      Serial.print("shake: ");
      Serial.print(mpu.shake_value());
      Serial.print("\t");

      Serial.print("door: ");
      Serial.print(is_DOOR_OPEN);
      Serial.print("\t");

      Serial.print("distance: ");
      Serial.print(gps.distance);
      Serial.print("\t");

      Serial.print("home lat: ");
      Serial.println(gps.home_lat);

      mqtt.notify(ALARM_STATE, is_ACCESS_GRANTED, lat, lon, sat, mpu.shake_value(), is_DOOR_OPEN, gps.distance);
    }

    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

// void dump_byte_array(byte *buffer, byte bufferSize, int *REGISTERED_RFID)
// {
//   bool check[7];
//   for (byte i = 0; i < bufferSize; i++)
//   {
//     Serial.print(buffer[i]);
//     Serial.print(" ");
//     check[i] = buffer[i] == REGISTERED_RFID[i];
//   }

//   if (check[0] && check[1] && check[2] && check[3] && check[4] && check[5] && check[6])
//   {
//     // valid_callback();
//     Serial.print("Valid");
//   }
//   else
//   {
//     // invalid_callback();
//     Serial.print("Invalid");
//   }
// }

void setup()
{
  Serial.begin(115200);
  // Serial2.begin(9600);

  mqtt.init(onMQTT_event);
  vTaskDelay(1000 / portTICK_PERIOD_MS);

  xTaskCreatePinnedToCore(RFID_TASK, "RFID", 2048, NULL, 1, &RFID_HANDLE, 1);
  xTaskCreatePinnedToCore(GPS_TASK, "GPS", 2048, NULL, 1, &GPS_HANDLE, 1);
  xTaskCreatePinnedToCore(MPU_TASK, "MPU", 2048, NULL, 1, &MPU_HANDLE, 1);
  xTaskCreatePinnedToCore(SYSTEMS_TASK, "SYSTEMS", 2048, NULL, 1, &SYSTEMS_HANDLE, 0);
  xTaskCreatePinnedToCore(ALARM_TASK, "ALARM", 1024, NULL, 1, &ALARM_HANDLE, 1);

  // const int REGISTERED_RFID[3][7] = {
  //     {4, 32, 114, 210, 236, 92, 128},
  //     {0, 0, 0, 0, 0, 0, 0},
  //     {1, 1, 1, 1, 1, 1, 1}};

  // const int buffer[7] = {0, 0, 0, 0, 1, 1, 1};

  // bool registered[3];

  // for (int r = 0; r < 3; r++)
  // {
  //   bool check[7];
  //   for (byte i = 0; i < 7; i++)
  //   {
  //     Serial.print(buffer[i]);
  //     Serial.print(" ");
  //     check[i] = buffer[i] == REGISTERED_RFID[r][i];
  //   }

  //   registered[r] = check[0] && check[1] && check[2] && check[3] && check[4] && check[5] && check[6];
  // }

  // if (registered[0] || registered[1] || registered[2])
  // {
  //   // valid_callback();
  //   Serial.print("Valid");
  // }
  // else
  // {
  //   // invalid_callback();
  //   Serial.print("Invalid");
  // }
}

void loop()
{
  mqtt.loop();
}
