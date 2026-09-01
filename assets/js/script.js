      // --- CONFIGURAÇÕES DE CONEXÃO ---
      // Substitua pelo IP do notebook onde o Mosquitto está rodando
      const MQTT_HOST = "10.136.42.122";
      const MQTT_PORT = 9001; // Porta WebSocket configurada no mosquitto.conf

      // Tópicos exatos publicados pelo ESP32
      const TOPIC_TEMP = "aulas/gp2/temperatura";
      const TOPIC_HUM = "aulas/gp2/umidade";
      const TOPIC_AIR = "aulas/gp2/qualidade_ar";

      // Criação do ID de Cliente único para o navegador
      const clientID = "WebDash_" + Math.random().toString(16).substr(2, 8);

      // Inicializa o cliente MQTT Paho
      const client = new Paho.MQTT.Client(
        MQTT_HOST,
        Number(MQTT_PORT),
        clientID,
      );

      // Callbacks do cliente
      client.onConnectionLost = onConnectionLost;
      client.onMessageArrived = onMessageArrived;

      // Conecta ao broker
      client.connect({
        onSuccess: onConnect,
        onFailure: onFailure,
      });

      function onConnect() {
        const statusDiv = document.getElementById("status");
        statusDiv.innerText = "Status: Conectado ao Mosquitto";
        statusDiv.className = "status connected";

        // Assina os tópicos após conectar com sucesso
        client.subscribe(TOPIC_TEMP);
        client.subscribe(TOPIC_HUM);
        client.subscribe(TOPIC_AIR);
      }

      function onFailure(responseObject) {
        const statusDiv = document.getElementById("status");
        statusDiv.innerText =
          "Status: Falha na conexão (" + responseObject.errorMessage + ")";
        statusDiv.className = "status disconnected";
      }

      function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
          const statusDiv = document.getElementById("status");
          statusDiv.innerText = "Status: Conexão Perdida";
          statusDiv.className = "status disconnected";
        }
      }

      // Processa as mensagens recebidas nos tópicos assinados
      function onMessageArrived(message) {
        const topic = message.destinationName;
        const payload = message.payloadString;

        if (topic === TOPIC_TEMP) {
          document.getElementById("temp").innerText = payload;
        } else if (topic === TOPIC_HUM) {
          document.getElementById("umid").innerText = payload;
        } else if (topic === TOPIC_AIR) {
          document.getElementById("gas").innerText = payload;
        } 
      }