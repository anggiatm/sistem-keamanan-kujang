#ifndef __RFID_H__
#define __RFID_H__

#include <SPI.h>
#include <MFRC522.h>
#include <configuration.h>

class RFID
{
public:
    typedef std::function<void()> CallbackFunction;
    void init(void);
    void loop();
    void setValidCardCallback(CallbackFunction cb);
    void setInvalidCardCallback(CallbackFunction cb);

private:
    void dump_byte_array(byte *buffer, byte bufferSize);

    // const int REGISTERED_RFID[7] = {5, 138, 97, 126, 214, 3, 0};
    const int REGISTERED_RFID[4] = {177, 189, 118, 0};
    // const int REGISTERED_RFID[7] = {4, 32, 114, 210, 236, 92, 128};

    MFRC522 mfrc522;
    CallbackFunction valid_callback;
    CallbackFunction invalid_callback;
};

#endif