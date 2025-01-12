#include "MPU.h"

void MPU::init(void)
{
    Wire.begin();
    mpu.initialize();

    // verify connection
    Serial.println("Testing device connections...");
    Serial.println(mpu.testConnection() ? "MPU6050 connection successful" : "MPU6050 connection failed");

    mpu.setXGyroOffset(192);
    mpu.setYGyroOffset(-7);
    mpu.setZGyroOffset(-11);

    mpu.setXAccelOffset(-3967);
    mpu.setYAccelOffset(-933);
    mpu.setZAccelOffset(825);

    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

    init_Gx = float(gx) / 131;
    init_Gy = float(gy) / 131;
    init_Gz = float(gz) / 131;
}

void MPU::loop()
{
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    Gx = float(gx) / 131;
    Gy = float(gy) / 131;
    Gz = float(gz) / 131;

    shake_Gx = abs(Gx - init_Gx);
    shake_Gy = abs(Gy - init_Gy);
    shake_Gz = abs(Gz - init_Gz);

    if (shake_Gx < 1)
    {
        init_Gx = Gx;
    }

    if (shake_Gy < 1)
    {
        init_Gy = Gy;
    }

    if (shake_Gz < 1)
    {
        init_Gz = Gz;
    }

    if (shake_Gx >= GYRO_THRESHOLD || shake_Gy >= GYRO_THRESHOLD || shake_Gz >= GYRO_THRESHOLD)
    {
        shake = true;
    }
}

float MPU::shake_value()
{
    float max = shake_Gx; // anggap a adalah yang terbesar
    if (shake_Gy > max)
    {
        max = shake_Gy; // jika b lebih besar, maka ganti max
    }
    if (shake_Gz > max)
    {
        max = shake_Gz; // jika c lebih besar, maka ganti max
    }
    return max; // kembalikan nilai maksimum
}

void MPU::print_output()
{
    Serial.print("Gx : ");
    Serial.print(Gx);
    Serial.print("\t");
    Serial.print("Gy : ");
    Serial.print(Gy);
    Serial.print("\t");
    Serial.print("Gz : ");
    Serial.println(Gz);
    // Serial.print(",");
    // Serial.print(Ax);
    // Serial.print(",");
    // Serial.print(Ay);
    // Serial.print(",");
    // Serial.println(Az);
}

void MPU::shake_reset()
{
    shake = false;
}
