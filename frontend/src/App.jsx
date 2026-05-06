import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrando os componentes do Chart.js para o React
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:8080/api/estudos';

function App() {
  const [registros, setRegistros] = useState([]);
  const [tema, setTema] = useState(localStorage.getItem('temaTracker') || 'light');
  
  const [materia, setMateria] = useState('');
  const [tempo, setTempo] = useState('');

  const [tempoRestante, setTempoRestante] = useState(25 * 60);
  const [timerRodando, setTimerRodando] = useState(false);

  useEffect(() => {
    carregarRegistros();
  }, []);

  useEffect(() => {
    if (tema === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('temaTracker', tema);
  }, [tema]);

  useEffect(() => {
    let intervalo = null;
    if (timerRodando && tempoRestante > 0) {
      intervalo = setInterval(() => {
        setTempoRestante(t => t - 1);
      }, 1000);
      document.title = `${formatarTempo(tempoRestante)} - Foco!`;
    } else if (timerRodando && tempoRestante === 0) {
      setTimerRodando(false);
      document.title = "Tracker de Estudos";
      alert("Pomodoro finalizado! Excelente trabalho.");
      setTempo('25'); 
      setTempoRestante(25 * 60);
    } else {
      document.title = "Tracker de Estudos";
    }
    return () => clearInterval(intervalo);
  }, [timerRodando, tempoRestante]);

  const carregarRegistros = async () => {
    try {
      const resposta = await fetch(API_URL);
      const dados = await resposta.json();
      setRegistros(dados);
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
    }
  };

  const salvarEstudo = async (e) => {
    e.preventDefault();
    const dataAtual = new Date().toISOString().split('T')[0];
    const novoRegistro = { materia, tempo, data: dataAtual };

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoRegistro)
      });
      setMateria('');
      setTempo('');
      carregarRegistros();
    } catch (erro) {
      alert("Erro ao salvar o estudo. O servidor Java está rodando?");
    }
  };

  const deletarEstudo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      carregarRegistros();
    } catch (erro) {
      console.error("Erro ao deletar:", erro);
    }
  };

  const formatarTempo = (segundosTotais) => {
    const minutos = Math.floor(segundosTotais / 60);
    const segundos = segundosTotais % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  const alternarTema = () => setTema(tema === 'dark' ? 'light' : 'dark');
  const alternarTimer = () => setTimerRodando(!timerRodando);
  const resetarTimer = () => {
    setTimerRodando(false);
    setTempoRestante(25 * 60);
  };

  const tempoPorMateria = registros.reduce((acc, registro) => {
    const nome = registro.materia.trim();
    acc[nome] = (acc[nome] || 0) + parseInt(registro.tempo);
    return acc;
  }, {});

  const dadosGrafico = {
    labels: Object.keys(tempoPorMateria),
    datasets: [{
      label: 'Minutos Estudados',
      data: Object.values(tempoPorMateria),
      backgroundColor: 'oklab(77.239% 0.07202 0.15701)',
      borderRadius: 6,
    }]
  };

  const corTexto = tema === 'dark' ? '#f9fafb' : '#1f2937';
  const opcoesGrafico = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { color: corTexto } },
      x: { ticks: { color: corTexto } }
    }
  };

  return (
    <div className="container">
      <header>
        <div className="logo-formiga">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M35 30 Q20 10 15 15" stroke="white" strokeWidth="6" strokeLinecap="round" />
            <path d="M65 30 Q80 10 85 15" stroke="white" strokeWidth="6" strokeLinecap="round" />
            <circle cx="50" cy="55" r="25" fill="white" />
            <circle cx="40" cy="50" r="4" fill="var(--cor-icone)" />
            <circle cx="60" cy="50" r="4" fill="var(--cor-icone)" />
          </svg>
        </div>
        <h1>Meu Tracker</h1>
        <button className="btn-tema" onClick={alternarTema} title="Alternar Tema">
          {tema === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <div className="layout-principal">
        <div className="pomodoro-container">
          <h2>Modo Foco</h2>
          <div className="timer-display">{formatarTempo(tempoRestante)}</div>
          <div className="timer-controls">
            <button 
              type="button" 
              className="btn-timer" 
              style={{ backgroundColor: timerRodando ? '#ef4444' : (tempoRestante < 25 * 60 ? '#10b981' : '#f59e0b') }}
              onClick={alternarTimer}
            >
              {timerRodando ? "Pausar" : (tempoRestante < 25 * 60 ? "Retomar" : "Iniciar")}
            </button>
            <button type="button" className="btn-timer btn-reset" onClick={resetarTimer}>Resetar</button>
          </div>
        </div>

        <form onSubmit={salvarEstudo}>
          <div className="form-group">
            <label>O que você estudou?</label>
            <input 
              type="text" 
              placeholder="Ex: Spring Boot" 
              required 
              value={materia} 
              onChange={(e) => setMateria(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Tempo investido (minutos)</label>
            <input 
              type="number" 
              placeholder="Ex: 25" 
              min="1" 
              required 
              value={tempo} 
              onChange={(e) => setTempo(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn-submit">Registrar Estudo</button>
        </form>
      </div>

      {Object.keys(tempoPorMateria).length > 0 && (
        <div className="secao-grafico">
          <h2>Tempo por Matéria</h2>
          <Bar data={dadosGrafico} options={opcoesGrafico} />
        </div>
      )}

      <div className="lista-estudos">
        <h2>Histórico</h2>
        {registros.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>Nenhum estudo registrado ainda.</p>
        ) : (
          [...registros].reverse().map((registro) => {
            const dataFormatada = registro.data ? registro.data.split('-').reverse().join('/') : '';
            return (
              <div className="item-estudo" key={registro.id}>
                <div className="detalhes-estudo">
                  <strong>{registro.materia}</strong>
                  <span>{registro.tempo} min • {dataFormatada}</span>
                </div>
                <button className="botao-remover" onClick={() => deletarEstudo(registro.id)}>Excluir</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default App;