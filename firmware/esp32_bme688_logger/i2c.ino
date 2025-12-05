#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME680.h>

Adafruit_BME680 bme;

void setup() {
  Serial.begin(115200);

  Wire.begin(21, 22); // ESP32 SDA = 21, SCL = 22

  if (!bme.begin(0x76)) {   // 주소 0x76 (혹은 0x77로 바꿔야 할 수도 있음)
    Serial.println("Could not find a valid BME688 sensor!");
    while (1);
  }

  // 센서 설정
  bme.setTemperatureOversampling(BME680_OS_8X);
  bme.setHumidityOversampling(BME680_OS_8X);
  bme.setPressureOversampling(BME680_OS_8X);
  bme.setGasHeater(320, 150); // 온도, 시간(ms) → VOC 반응 안정화
}

void loop() {
  if (!bme.performReading()) {
    Serial.println("Reading failed!");
    return;
  }

  Serial.print("Temp: ");
  Serial.print(bme.temperature);
  Serial.print(" °C, Hum: ");
  Serial.print(bme.humidity);
  Serial.print(" %, Pres: ");
  Serial.print(bme.pressure / 100.0);
  Serial.print(" hPa, Gas: ");
  Serial.print(bme.gas_resistance / 1000.0);
  Serial.println(" kΩ");

  delay(1000); // 1초마다 측정
}