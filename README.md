# Estação de Monitoramento IoT — Grupo GP2

## Arquivos de entrega

- `firmware_estacao_iot.ino`: código para ESP32 (Arduino IDE).
- `index.html`, `index.css`, `index.js`: dashboard web em página única.
- `mosquitto.conf`: configuração do broker MQTT e WebSockets.
- `assets/images/`: três ilustrações usadas na apresentação do projeto.

## Antes de testar

1. No arquivo `firmware_estacao_iot.ino`, informe `WIFI_SSID`, `WIFI_PASSWORD` e o IP do computador do broker em `MQTT_SERVER`.
2. No arquivo `index.js`, informe esse mesmo IP em `MQTT_HOST`.
3. Instale na Arduino IDE as bibliotecas **DHT sensor library**, **Adafruit Unified Sensor** e **PubSubClient**.
4. Copie ou una o conteúdo de `mosquitto.conf` à configuração ativa do Mosquitto e reinicie o serviço:

```powershell
net stop mosquitto
net start mosquitto
```

5. Abra `index.html` no navegador ou use um servidor local simples. A senha do grupo é persistida na chave `iot_gp2_senha` do `localStorage`; substitua o valor inicial por aquela fornecida pelo professor no DevTools.

## Log para entrega

Após publicar dados pelo ESP32, o broker gravará o arquivo definido em `mosquitto.conf`:

```text
C:\Program Files\mosquitto\mosquitto.log
```

Copie esse arquivo real para a pasta de entrega. Ele precisa ser gerado no computador que executa o Mosquitto, pois registra as publicações feitas durante o teste.
