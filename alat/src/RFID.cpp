
#include "RFID.h"

void RFID::init(void)
{
    SPI.begin();
    mfrc522.PCD_Init(SS, RFID_RST_PIN);
    mfrc522.PCD_DumpVersionToSerial();
}

void RFID::loop()
{
    // bool result = false;
    if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial())
    {
        Serial.print(F("Card UID:"));
        dump_byte_array(mfrc522.uid.uidByte, mfrc522.uid.size);
        Serial.println();

        mfrc522.PICC_HaltA();
        mfrc522.PCD_StopCrypto1();
    }
}

void RFID::dump_byte_array(byte *buffer, byte bufferSize)
{
    bool check[7];
    for (byte i = 0; i < bufferSize; i++)
    {
        Serial.print(buffer[i]);
        Serial.print(" ");
        check[i] = buffer[i] == REGISTERED_RFID[i];
    }

    if (check[0] && check[1] && check[2] && check[3] && check[4] && check[5] && check[6] && valid_callback)
    {
        valid_callback();
    }
    else
    {
        invalid_callback();
    }
}

void RFID::setValidCardCallback(CallbackFunction cb)
{
    valid_callback = cb;
}

void RFID::setInvalidCardCallback(CallbackFunction cb)
{
    invalid_callback = cb;
}