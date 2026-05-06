const API_URL = 'http://localhost:8080/api/estudos';
let registros = [];
let meuGrafico = null;

// --- LÓGICA DO TEMA (DARK MODE) ---
const btnTema = document.getElementById('btnTema');
const htmlElement = document.documentElement;

// Verifica se o usuário já tinha escolhido um tema antes
const temaSalvo = localStorage.getItem('temaTracker');
if (temaSalvo === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
    btnTema.innerText = '☀️';
}

function alternarTema() {
    if (htmlElement.getAttribute('data-theme') === 'dark') {
        htmlElement.removeAttribute('data-theme');
        localStorage.setItem('temaTracker', 'light');
        btnTema.innerText = '🌙';
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('temaTracker', 'dark');
        btnTema.innerText = '☀️';
    }
    atualizarGrafico(); // Atualiza as cores do gráfico
}

// --- LÓGICA DO POMODORO ---
let tempoRestante = 25 * 60;
let timerIntervalo;
let timerRodando = false;

const displayTimer = document.getElementById('timerDisplay');
const btnStart = document.getElementById('btnTimerStart');
const inputTempo = document.getElementById('tempo');
const inputMateria = document.getElementById('materia');

function atualizarDisplay() {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;
    displayTimer.innerText = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    document.title = timerRodando ? `${displayTimer.innerText} - Foco!` : "Tracker de Estudos";
}

function toggleTimer() {
    if (timerRodando) {
        clearInterval(timerIntervalo);
        timerRodando = false;
        btnStart.innerText = "Retomar";
        btnStart.style.backgroundColor = "#10b981";
    } else {
        timerRodando = true;
        btnStart.innerText = "Pausar";
        btnStart.style.backgroundColor = "#ef4444";
        
        timerIntervalo = setInterval(() => {
            if (tempoRestante > 0) {
                tempoRestante--;
                atualizarDisplay();
            } else {
                clearInterval(timerIntervalo);
                timerRodando = false;
                btnStart.innerText = "Iniciar";
                btnStart.style.backgroundColor = "#f59e0b";
                alert("Pomodoro finalizado! Excelente trabalho.");
                inputTempo.value = 25;
                inputMateria.focus();
                resetTimer();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerIntervalo);
    timerRodando = false;
    tempoRestante = 25 * 60;
    btnStart.innerText = "Iniciar";
    btnStart.style.backgroundColor = "#f59e0b";
    atualizarDisplay();
}

atualizarDisplay();

// --- LÓGICA DA API E GRÁFICOS ---
const form = document.getElementById('formEstudo');
const containerRegistros = document.getElementById('containerRegistros');
const containerGrafico = document.getElementById('containerGrafico');
const ctx = document.getElementById('graficoEstudos').getContext('2d');

async function carregarRegistros() {
    try {
        const resposta = await fetch(API_URL);
        registros = await resposta.json();
        renderizarRegistros();
    } catch (erro) {
        console.error("Erro ao conectar com a API:", erro);
        containerRegistros.innerHTML = '<p style="text-align:center; color: #ef4444;">Erro ao carregar os dados. Verifique se o back-end está rodando.</p>';
    }
}

function atualizarGrafico() {
    if (registros.length === 0) {
        containerGrafico.style.display = 'none';
        return;
    }

    containerGrafico.style.display = 'block';

    const tempoPorMateria = {};
    registros.forEach(registro => {
        const nomeMateria = registro.materia.trim();
        const tempo = parseInt(registro.tempo);
        if (tempoPorMateria[nomeMateria]) tempoPorMateria[nomeMateria] += tempo;
        else tempoPorMateria[nomeMateria] = tempo;
    });

    if (meuGrafico) meuGrafico.destroy();

    // Pega a cor do texto atual (claro ou escuro) para o Chart.js
    const corTexto = getComputedStyle(document.documentElement).getPropertyValue('--texto').trim();

    meuGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(tempoPorMateria),
            datasets: [{
                label: 'Minutos Estudados',
                data: Object.values(tempoPorMateria),
                backgroundColor: 'oklab(77.239% 0.07202 0.15701)',
                borderRadius: 6,
            }]
        },
        options: { 
            responsive: true, 
            color: corTexto, // Aplica a cor no texto do gráfico
            plugins: { legend: { display: false } }, 
            scales: { 
                y: { beginAtZero: true, ticks: { color: corTexto } },
                x: { ticks: { color: corTexto } }
            } 
        }
    });
}

function renderizarRegistros() {
    containerRegistros.innerHTML = '';
    if (registros.length === 0) {
        containerRegistros.innerHTML = '<p style="text-align:center; color: #6b7280; font-size: 0.9rem;">Nenhum estudo registrado ainda.</p>';
    } else {
        const registrosInvertidos = [...registros].reverse();
        registrosInvertidos.forEach(registro => {
            const dataFormatada = registro.data ? registro.data.split('-').reverse().join('/') : '';
            const div = document.createElement('div');
            div.className = 'item-estudo';
            div.innerHTML = `
                <div class="detalhes-estudo">
                    <strong>${registro.materia}</strong>
                    <span>${registro.tempo} min • ${dataFormatada}</span>
                </div>
                <button class="botao-remover" onclick="removerRegistro(${registro.id})">Excluir</button>
            `;
            containerRegistros.appendChild(div);
        });
    }
    atualizarGrafico();
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const materia = document.getElementById('materia').value;
    const tempo = document.getElementById('tempo').value;
    const dataAtual = new Date().toISOString().split('T')[0]; 

    const novoRegistro = { materia, tempo, data: dataAtual };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoRegistro)
        });
        form.reset();
        carregarRegistros();
    } catch (erro) {
        alert("Erro ao salvar o estudo. O servidor está rodando?");
    }
});

async function removerRegistro(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        carregarRegistros();
    } catch (erro) { console.error("Erro ao deletar:", erro); }
}

carregarRegistros();