#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// Preencha com a rede e com o IP do computador que executa o Mosquitto.
const char* WIFI_SSID = "SUA_REDE_WIFI";
const char* WIFI_PASSWORD = "SUA_SENHA_WIFI";
const char* MQTT_SERVER = "192.168.0.10";
const uint16_t MQTT_PORT = 1883;

const char* TOPIC_TEMPERATURA = "aulas/professortupi/temperatura";
const char* TOPIC_UMIDADE = "aulas/professortupi/umidade";
const char* TOPIC_QUALIDADE_AR = "aulas/professortupi/qualidade_ar";

constexpr uint8_t PINO_DHT = 14;
constexpr uint8_t TIPO_DHT = DHT11;
constexpr uint8_t PINO_MQ135 = 34; // ADC: use somente entrada analógica
constexpr uint8_t LED_TEMPERATURA = 25;
constexpr uint8_t LED_UMIDADE = 26;
constexpr uint8_t LED_GAS = 27;
constexpr unsigned long INTERVALO_LEITURA = 3000;

DHT dht(PINO_DHT, TIPO_DHT);
WiFiClient espClient;
PubSubClient mqtt(espClient);
unsigned long ultimaLeitura = 0;

void conectarWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWi-Fi conectado: " + WiFi.localIP().toString());
}

void conectarMQTT() {
  while (!mqtt.connected()) {
    String clientId = "ESP32_GP2_" + String((uint32_t)esp_random(), HEX);
    Serial.print("Conectando ao MQTT...");
    if (mqtt.connect(clientId.c_str())) Serial.println(" conectado");
    else { Serial.printf(" erro %d; nova tentativa em 2 s\n", mqtt.state()); delay(2000); }
  }
}

void publicar(const char* topico, float valor) {
  char texto[12];
  dtostrf(valor, 0, 1, texto);
  mqtt.publish(topico, texto, true); // retained: o dashboard mostra a última leitura ao conectar
  Serial.printf("%s -> %s\n", topico, texto);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_TEMPERATURA, OUTPUT); pinMode(LED_UMIDADE, OUTPUT); pinMode(LED_GAS, OUTPUT);
  analogReadResolution(12);
  dht.begin(); conectarWiFi(); mqtt.setServer(MQTT_SERVER, MQTT_PORT);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) conectarWiFi();
  if (!mqtt.connected()) conectarMQTT();
  mqtt.loop();
  if (millis() - ultimaLeitura < INTERVALO_LEITURA) return;
  ultimaLeitura = millis();
  float temperatura = dht.readTemperature();
  float umidade = dht.readHumidity();
  int gas = analogRead(PINO_MQ135); // leitura bruta 0–4095; calibre o limiar conforme seu módulo
  if (isnan(temperatura) || isnan(umidade)) { Serial.println("Falha ao ler DHT11"); return; }
  digitalWrite(LED_TEMPERATURA, temperatura > 28 ? HIGH : LOW);
  digitalWrite(LED_UMIDADE, umidade > 56 ? HIGH : LOW);
  digitalWrite(LED_GAS, gas > 400 ? HIGH : LOW);
  publicar(TOPIC_TEMPERATURA, temperatura); publicar(TOPIC_UMIDADE, umidade); publicar(TOPIC_QUALIDADE_AR, gas);
}
