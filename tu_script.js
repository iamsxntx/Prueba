let socket = new WebSocket('ws://192.168.0.33:81');

socket.onopen = () => {
    console.log("Conexión establecida");
};

socket.onclose = () => {
    console.log("Conexión cerrada");
};

socket.onmessage = (event) => {
    handleData(event.data);
};

socket.onerror = (event) => {
    console.error("Error en WebSocket:", event);
};

let temperatura_sensor, humedad_sensor, luz_sensor;

function handleData(data) {
    const jsonData = JSON.parse(data);
    temperatura_sensor = jsonData.temperatura;
    humedad_sensor = jsonData.humedad;
    luz_sensor = jsonData.luz;

    // Llama a la función de monitoreo después de recibir datos
    monitorearCultivo();
}

const requisitosCultivos = {
    mora: { luminosidad: "6-8 horas", humedad: "60-70%", temperatura: "15-25°C" },
    lulo: { luminosidad: "8-10 horas", humedad: "70-80%", temperatura: "15-20°C" },
    frijol: { luminosidad: "6-8 horas", humedad: "50-60%", temperatura: "20-30°C" },
    cafe: { luminosidad: "5-7 horas", humedad: "70-80%", temperatura: "18-24°C" },
    maiz: { luminosidad: "10-12 horas", humedad: "55-75%", temperatura: "20-30°C" },
    arveja: { luminosidad: "6-8 horas", humedad: "50-70%", temperatura: "15-20°C" },
    yuca: { luminosidad: "8-10 horas", humedad: "60-70%", temperatura: "25-30°C" },
    auyama: { luminosidad: "6-8 horas", humedad: "60-70%", temperatura: "20-25°C" },
    papa: { luminosidad: "8-10 horas", humedad: "70-80%", temperatura: "15-20°C" },
    cebolla: { luminosidad: "10-12 horas", humedad: "60-70%", temperatura: "15-20°C" },
    tomate: { luminosidad: "8-10 horas", humedad: "60-70%", temperatura: "20-25°C" },
    naranjas: { luminosidad: "8-10 horas", humedad: "50-60%", temperatura: "25-30°C" },
};

let chart;

function analizarCultivo() {
    const cultivo = document.getElementById("cultivo").value;
    const resultadosDiv = document.getElementById("resultados");

    const requisitos = requisitosCultivos[cultivo];

    if (!requisitos) {
        resultadosDiv.innerHTML = `<p>El cultivo ${cultivo} no está en la lista.</p>`;
        return;
    }

    resultadosDiv.innerHTML = `
        <h3>Requisitos para cultivar ${cultivo.charAt(0).toUpperCase() + cultivo.slice(1)}:</h3>
        <ul>
            <li><strong>Luminosidad:</strong> ${requisitos.luminosidad}</li>
            <li><strong>Humedad:</strong> ${requisitos.humedad}</li>
            <li><strong>Temperatura:</strong> ${requisitos.temperatura}</li>
        </ul>
        <p>¡Verifica si las condiciones de tu suelo son adecuadas!</p>
    `;

    mostrarGrafico(requisitos);
}

function mostrarGrafico(requisitos) {
    const container = document.getElementById('graficoContainer');

    const oldCanvas = document.getElementById('graficoCondiciones');
    if (oldCanvas) {
        oldCanvas.remove();
    }

    const nuevoCanvas = document.createElement('canvas');
    nuevoCanvas.id = 'graficoCondiciones';
    nuevoCanvas.width = 500; 
    nuevoCanvas.height = 300; 
    container.appendChild(nuevoCanvas);

    const ctx = nuevoCanvas.getContext('2d');

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Luminosidad (h)', 'Humedad (%)', 'Temperatura (°C)'],
            datasets: [
                {
                    label: 'Requisitos óptimos',
                    data: [
                        parseFloat(requisitos.luminosidad.split('-')[0]),
                        parseFloat(requisitos.humedad.split('-')[0]),
                        parseFloat(requisitos.temperatura.split('-')[0])
                    ],
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Condiciones actuales',
                    data: [luz_sensor || 0, humedad_sensor || 0, temperatura_sensor || 0], 
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#000",
                        font: { size: 14 }
                    }
                },
                x: {
                    ticks: {
                        color: "#000",
                        font: { size: 14 }
                    }
                }
            }
        }
    });
}

function monitorearCultivo() {
    const temp = temperatura_sensor;
    const hum = humedad_sensor;
    const luz = luz_sensor;
    const respuesta = construir_respuesta_html(temp, hum, luz);
    document.getElementById("monitoreoResultados").innerHTML = respuesta;
}

function construir_respuesta_html(temp, hum, luz) {
    let respuesta = `<!DOCTYPE html><html><head> 
    <meta charset='UTF-8'> 
    <title>Monitor de Cultivo</title> 
    <meta name='viewport' content='width=device-width, initial-scale=1'> 
    <meta http-equiv='refresh' content='10'> 
    <style> 
    body { 
        font-family: Arial, sans-serif; 
        text-align: center; 
        background-color: #f4f4f4; 
        margin: 0; 
        padding: 0;
    } 
    .container { 
        width: 80%; 
        margin: auto; 
    } 
    .card { 
        background: white; 
        padding: 20px; 
        margin: 15px auto; 
        border-radius: 10px; 
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
        max-width: 300px;
    } 
    h1 { 
        color: #333; 
    } 
    .temp { 
        border-left: 5px solid #ff5722; 
    } 
    .hum { 
        border-left: 5px solid #03a9f4; 
    } 
    .luz { 
        border-left: 5px solid #ffeb3b; 
    } 
    </style>
    </head>
    <body> 
        <h1>🌱 Monitor de Cultivo Inteligente</h1> 
        <div class='container'>`;

    respuesta += crear_card("🌡 Temperatura", temp, "°C", "temp");
    respuesta += crear_card("💧 Humedad", hum, "%", "hum");
    respuesta += crear_card("☀ Luz", luz, " lux", "luz");

    respuesta += `</div></body></html>`;
    return respuesta;
}

function crear_card(titulo, valor, unidad, clase) {
    let card = `<div class='card ${clase}'><h2>${titulo}</h2><p>`;
    if (isNaN(valor)) {
        card += "Error al leer sensor";
    } else {
        card += `${valor} ${unidad}`;
    }
    card += "</p></div>";
    return card;
}
