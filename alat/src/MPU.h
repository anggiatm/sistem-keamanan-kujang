#ifndef __MPU_H__
#define __MPU_H__

#include "I2Cdev.h"
#include "MPU6050.h"
#include "Wire.h"
#include <configuration.h>

class MPU
{
public:
    void init(void);
    void loop();
    void shake_reset();
    void print_output();
    float shake_value();

    // uint8_t threshold = 30;
    float init_Gx, init_Gy, init_Gz;
    bool shake = false;
    float shake_Gx, shake_Gy, shake_Gz;

private:
    MPU6050 mpu;
    int16_t ax, ay, az;
    int16_t gx, gy, gz;
    float Gx, Gy, Gz;
};

#endif