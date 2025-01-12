#ifndef __SYSTEMS_H__
#define __SYSTEMS_H__

#include <ESP32Servo.h>
#include <configuration.h>

class SYSTEMS
{
public:
    void init(void);
    void door_lock();
    void door_unlock();
    void buzzer_alarm();
    void buzzer_warning();
    void buzzer_silence();
    bool is_door_open();

    void lock();
    void unlock();

private:
    Servo servo;
};

#endif
