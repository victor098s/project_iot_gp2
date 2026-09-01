"use strict";

// Ajuste apenas o IP para o computador onde o Mosquitto está sendo executado.
const MQTT_HOST = "10.136.42.122";
const MQTT_PORT = 9001;
const TOPICS = {
  temperature: "aulas/professortupi/temperatura",
  humidity: "aulas/professortupi/umidade",
  air: "aulas/professortupi/qualidade_ar",
};

const connectionStatus = document.querySelector("#connection-status");
const lastUpdate = document.querySelector("#last-update");
let mqttClient;

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});
document.querySelector("[data-go-dashboard]").addEventListener("click", () => showView("dashboard"));

function showView(viewId) {
  document.querySelectorAll(".view").forEach((view) => {
    const current = view.id === viewId;
    view.hidden = !current;
    view.classList.toggle("active", current);
  });
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setConnection(connected, label) {
  connectionStatus.classList.toggle("connected", connected);
  connectionStatus.classList.toggle("disconnected", !connected);
  connectionStatus.querySelector("span").textContent = label;
}

function updateMetric(kind, payload) {
  const value = Number.parseFloat(payload.replace(",", "."));
  if (Number.isNaN(value)) return;
  const limits = { temperature: 28, humidity: 56, air: 400 };
  const states = {
    temperature: value > limits.temperature ? "Alerta: temperatura alta" : "Dentro do ideal",
    humidity: value > limits.humidity ? "Alerta: umidade alta" : "Dentro do ideal",
    air: value > limits.air ? "Alerta: nível de gás alto" : "Qualidade aceitável",
  };
  const valueElement = document.querySelector(`#${kind}-value`);
  const stateElement = document.querySelector(`#${kind}-state`);
  valueElement.textContent = value.toFixed(1).replace(".0", "");
  stateElement.textContent = states[kind];
  stateElement.classList.toggle("alert", value > limits[kind]);
  lastUpdate.textContent = new Date().toLocaleTimeString("pt-BR");
}

function connectMQTT() {
  if (!window.Paho) { setConnection(false, "Biblioteca MQTT indisponível"); return; }
  const clientId = `web_gp2_${crypto.getRandomValues(new Uint32Array(1))[0].toString(16)}`;
  mqttClient = new Paho.MQTT.Client(MQTT_HOST, Number(MQTT_PORT), clientId);
  mqttClient.onConnectionLost = () => { setConnection(false, "Conexão perdida"); setTimeout(connectMQTT, 3000); };
  mqttClient.onMessageArrived = (message) => {
    const topicMap = { [TOPICS.temperature]: "temperature", [TOPICS.humidity]: "humidity", [TOPICS.air]: "air" };
    const kind = topicMap[message.destinationName];
    if (kind) updateMetric(kind, message.payloadString);
  };
  mqttClient.connect({
    timeout: 4,
    useSSL: false,
    onSuccess: () => { Object.values(TOPICS).forEach((topic) => mqttClient.subscribe(topic)); setConnection(true, "Conectado ao Mosquitto"); },
    onFailure: () => { setConnection(false, "Desconectado · tentando novamente"); setTimeout(connectMQTT, 5000); },
  });
}

// A senha da equipe é persistida quando informada pelo professor/atividade.
const password = window.localStorage.getItem("iot_gp2_senha");
if (!password) window.localStorage.setItem("iot_gp2_senha", "PENDENTE_DEFINICAO_PROFESSOR");
connectMQTT();
