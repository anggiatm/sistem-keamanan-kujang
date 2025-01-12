#include "systems.h"

void SYSTEMS::init(void)
{
    pinMode(LED_BUILTIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(DOOR_PIN, INPUT_PULLUP);

    pinMode(SERVO_PIN, OUTPUT);
    // servo.attach(SERVO_PIN);

    for (uint8_t i = 0; i < 4; i++)
    {
        digitalWrite(LED_BUILTIN, HIGH);
        delay(50);
        digitalWrite(LED_BUILTIN, LOW);
        delay(50);
    }

    for (uint8_t i = 0; i < 4; i++)
    {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(60);
        digitalWrite(BUZZER_PIN, LOW);
        delay(60);
    }
}
void SYSTEMS::door_lock()
{
    digitalWrite(SERVO_PIN, LOW);
    // servo.write(SERVO_LOCK);
};

void SYSTEMS::door_unlock()
{
    digitalWrite(SERVO_PIN, HIGH);
    // servo.write(SERVO_UNLOCK);
};

void SYSTEMS::buzzer_alarm()
{
    digitalWrite(BUZZER_PIN, HIGH);
    vTaskDelay(1500 / portTICK_PERIOD_MS);
    digitalWrite(BUZZER_PIN, LOW);
    vTaskDelay(800 / portTICK_PERIOD_MS);
};

void SYSTEMS::buzzer_warning()
{
    digitalWrite(BUZZER_PIN, HIGH);
    vTaskDelay(1000 / portTICK_PERIOD_MS);
    digitalWrite(BUZZER_PIN, LOW);
}

void SYSTEMS::buzzer_silence()
{
    digitalWrite(BUZZER_PIN, LOW);
};

bool SYSTEMS::is_door_open()
{
    return digitalRead(DOOR_PIN);
}

void SYSTEMS::lock()
{
    digitalWrite(LED_BUILTIN, LOW);

    for (uint8_t i = 0; i < 3; i++)
    {
        digitalWrite(BUZZER_PIN, HIGH);
        vTaskDelay(60 / portTICK_PERIOD_MS);
        digitalWrite(BUZZER_PIN, LOW);
        vTaskDelay(60 / portTICK_PERIOD_MS);
    }

    // door_lock();
}

void SYSTEMS::unlock()
{
    digitalWrite(LED_BUILTIN, HIGH);

    for (uint8_t i = 0; i < 2; i++)
    {
        digitalWrite(BUZZER_PIN, HIGH);
        vTaskDelay(80 / portTICK_PERIOD_MS);
        digitalWrite(BUZZER_PIN, LOW);
        vTaskDelay(80 / portTICK_PERIOD_MS);
    }

    // door_unlock();
    // buzzer_silence();
}