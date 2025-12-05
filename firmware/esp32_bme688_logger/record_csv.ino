#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME680.h>

Adafruit_BME680 bme;

String currentLabel = "";
bool isRecording = false;
unsigned long sessionStart = 0;
const unsigned long SESSION_DURATION = 90000; // 1분 30초 (90,000ms)

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!bme.begin(0x76)) {
    Serial.println("Could not find BME688 sensor!");
    while (1);
  }

  bme.setTemperatureOversampling(BME680_OS_8X);
  bme.setHumidityOversampling(BME680_OS_8X);
  bme.setPressureOversampling(BME680_OS_8X);
  bme.setGasHeater(320, 150);

  Serial.println("=== BME688 90 Secs Session Logger Ready ===");
  Serial.println("Commands: n = normal, f = fragrance, s = smoke");
  Serial.println("Enter a label to start a new session.");
  Serial.println("Format: timestamp_ms,temp,hum,pres,gas_kohm,label");
}

void loop() {
  // --- 라벨 입력 처리 ---
  if (!isRecording && Serial.available()) {
    char cmd = Serial.read();
    if (cmd == 'n') currentLabel = "normal";
    if (cmd == 'f') currentLabel = "fragrance";
    if (cmd == 's') currentLabel = "smoke";

    if (currentLabel != "") {
      Serial.print("\n=== New session started: ");
      Serial.print(currentLabel);
      Serial.println(" ===");
      Serial.println("Recording for 90 secs ...");
      sessionStart = millis();
      isRecording = true;
    }
  }

  // --- 세션이 진행 중일 때 ---
  if (isRecording) {
    unsigned long now = millis();

    // 1분 지나면 세션 종료
    if (now - sessionStart >= SESSION_DURATION) {
      Serial.println("\n=== Session finished. Enter n/f/s to start next session. ===");
      isRecording = false;
      currentLabel = "";
      return;
    }

    // 센서 읽기
    if (bme.performReading()) {
      Serial.print(now);
      Serial.print(",");
      Serial.print(bme.temperature);
      Serial.print(",");
      Serial.print(bme.humidity);
      Serial.print(",");
      Serial.print(bme.pressure / 100.0);
      Serial.print(",");
      Serial.print(bme.gas_resistance / 1000.0);
      Serial.print(",");
      Serial.println(currentLabel);
    }

    delay(1000); // 1초 간격으로 기록
  }
}