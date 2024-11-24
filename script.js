// Seleção dos elementos
const distanciaInput = document.getElementById('distancia');
const tempoInput = document.getElementById('tempo');
const paceInput = document.getElementById('pace');
const velocidadeInput = document.getElementById('velocidade');
const distButtons = document.querySelectorAll('.dist-btn');

// Flags para evitar loops de atualização
let updating = false;

// Funções de Conversão
function paceToSeconds(paceStr) {
    const [min, sec] = paceStr.split(':').map(Number);
    return min * 60 + sec;
}

function secondsToPace(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function timeToSeconds(timeStr) {
    const [hh, mm, ss] = timeStr.split(':').map(Number);
    return hh * 3600 + mm * 60 + ss;
}

function secondsToTime(seconds) {
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor((seconds % 3600) / 60);
    const ss = Math.floor(seconds % 60);
    return `${hh}:${mm < 10 ? '0' : ''}${mm}:${ss < 10 ? '0' : ''}${ss}`;
}

// Máscaras de Entrada
function maskTimeInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 6) value = value.slice(0, 6);
    let formatted = '';
    if (value.length > 0) formatted += value.slice(0, 2);
    if (value.length > 2) formatted += ':' + value.slice(2, 4);
    if (value.length > 4) formatted += ':' + value.slice(4, 6);
    e.target.value = formatted;
}

function maskPaceInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length < 3) {
        // Se houver menos de 3 dígitos, não aplicar nenhuma formatação
        e.target.value = value;
        return;
    }
    if (value.length > 4) value = value.slice(0, 4);
    let formatted = '';
    if (value.length === 3) {
        // Caso tenha 3 dígitos, formate como "m:ss"
        formatted = `${value[0]}:${value.slice(1, 3)}`;
        } else if (value.length === 4) {
        // Caso tenha 4 dígitos, formate como "mm:ss"
        formatted = `${value.slice(0, 2)}:${value.slice(2, 4)}`;
    }
    e.target.value = formatted;
}

function maskDecimalInput(e) {
    let value = e.target.value.replace(/,/g, '.').replace(/[^\d.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts[1];
    }
    if (parts[1] && parts[1].length > 4) {
        value = parts[0] + '.' + parts[1].slice(0, 4);
    }
    e.target.value = value.replace('.', ',');
}

// Event Listeners para Máscaras
tempoInput.addEventListener('input', (e) => {
    maskTimeInput(e);
    calculateFromInput('tempo');
});

paceInput.addEventListener('input', (e) => {
    maskPaceInput(e);
    calculateFromInput('pace');
});

distanciaInput.addEventListener('input', (e) => {
    maskDecimalInput(e);
    calculateFromInput('distancia');
});

velocidadeInput.addEventListener('input', (e) => {
    maskDecimalInput(e);
    calculateFromInput('velocidade');
});

// Botões de Distância Predefinida
distButtons.forEach(button => {
    button.addEventListener('click', () => {
        let distancia = parseFloat(button.getAttribute('data-distancia'));
        if (Number.isInteger(distancia)) {
            distancia = distancia.toString(); // Sem decimais para inteiros
        } else {
            distancia = distancia.toFixed(4).replace('.', ','); // Decimais para valores fracionários
        }
        distanciaInput.value = distancia;
        calculateFromInput('distancia');
    });
});

// Função de Cálculo
function calculateFromInput(source) {
    if (updating) return;
    updating = true;

    let distancia = parseFloat(distanciaInput.value.replace(',', '.'));
    let tempo = tempoInput.value;
    let pace = paceInput.value;
    let velocidade = parseFloat(velocidadeInput.value.replace(',', '.'));

    // Conversões para segundos e km/h
    let tempoSec = tempo ? timeToSeconds(tempo) : null;
    let paceSec = pace ? paceToSeconds(pace) : null;

    // Cálculos interdependentes
    if (source === 'distancia' && distancia) {
        if (paceSec) {
            // Preserve o pace e calcule o tempo
            tempoSec = paceSec * distancia;
            tempoInput.value = secondsToTime(tempoSec);
            velocidade = (distancia / (tempoSec / 3600)).toFixed(2).replace('.', ',');
            velocidadeInput.value = velocidade;
        } else if (tempoSec) {
            // Preserve o tempo e calcule o pace
            paceSec = tempoSec / distancia;
            paceInput.value = secondsToPace(paceSec);
            velocidade = (distancia / (tempoSec / 3600)).toFixed(2).replace('.', ',');
            velocidadeInput.value = velocidade;
        } else if (velocidade) {
            tempoSec = (distancia / velocidade) * 3600;
            tempoInput.value = secondsToTime(tempoSec);
            paceSec = tempoSec / distancia;
            paceInput.value = secondsToPace(paceSec);
        }
    } 
    else if (source === 'tempo' && tempoSec !== null && distancia) {
        paceSec = tempoSec / distancia;
        paceInput.value = secondsToPace(paceSec);
        velocidade = (distancia / (tempoSec / 3600)).toFixed(2).replace('.', ',');
        velocidadeInput.value = velocidade;
    }
    else if (source === 'pace' && paceSec !== null && distancia) {
        tempoSec = paceSec * distancia;
        tempoInput.value = secondsToTime(tempoSec);
        velocidade = (distancia / (tempoSec / 3600)).toFixed(2).replace('.', ',');
        velocidadeInput.value = velocidade;
    }
    else if (source === 'velocidade' && velocidade && distancia) {
        tempoSec = (distancia / velocidade) * 3600;
        tempoInput.value = secondsToTime(tempoSec);
        paceSec = tempoSec / distancia;
        paceInput.value = secondsToPace(paceSec);
    }

    updating = false;
}

// Validação e Formatação Inicial
function initialize() {
    // Definir valores padrão
    distanciaInput.value = "10";
    paceInput.value = "5:00";

    // Calcular tempo e velocidade a partir dos valores padrão
    calculateFromInput('pace');
}

initialize();
