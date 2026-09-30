(function () {
  const CATS = {
    energia:   { label: 'Energia',     color: 'var(--energy)' },
    agua:      { label: 'Água',        color: 'var(--water)'  },
    temp:      { label: 'Temperatura', color: 'var(--danger)' },
    automacao: { label: 'Automação',   color: 'var(--text-dim)' },
    seguranca: { label: 'Segurança',   color: 'var(--security)' },
    manutencao:{ label: 'Manutenção',  color: 'var(--ok)'     }
  };

  const state = {
    user: null,
    contrast: false,
    thresholds: { energy: 60, water: 130, temp: 42 },
    energy: 42.8, water: 118, temp: 34,
    energyData: [40, 41, 39, 42, 45, 44, 46, 48, 50, 49, 47, 46, 44, 43, 45, 46, 44, 43, 42, 43, 44, 42, 43, 42.8],
    waterData: [95, 98, 100, 105, 110, 108, 112, 118, 122, 120, 116, 112, 110, 108, 112, 116, 120, 118, 115, 113, 116, 118, 120, 118],
    alerts: [],
    resolvedCount: 0,
    nextAlertId: 1,
    filter: 'todos',
    nextAvisoId: 4,
    avisos: [
      { id: 1, setor: "Produção", turno: "1º turno", texto: "Manutenção preventiva na prensa 3 amanhã.", critico: true, autor: "Segurança", dataHora: "hoje, 07:12", confirmacoes: ["Felipe"] }
    ],
    efetivoPorSetor: { "Produção": 18, "Manutenção": 6, "Logística": 10, "Qualidade": 8 }
  };

  const $ = sel => document.querySelector(sel);
  const app = $('#app');

  /* ---------- Lógica da Inteligência Artificial (Bot) ---------- */
  window.handleAIPress = function (e) {
    if (e.key === 'Enter') askAI();
  };

  window.askAI = function () {
    const input = $('#ai-input');
    const output = $('#ai-output');
    const rawText = input.value.trim();
    if (!rawText) return;

    // Normaliza o texto digitado (tira acentos e coloca tudo em minúsculo)
    const query = rawText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let response = "";

    // 1. Resumo Geral
    if (query.includes('resumo') || query.includes('status') || query.includes('geral') || query.includes('tudo')) {
      const pending = state.alerts.filter(a => !a.resolved).length;
      response = `Aqui está o panorama da Linha 3: Energia a <b>${state.energy.toFixed(1)} kWh</b>, Água a <b>${state.water.toFixed(0)} L/h</b> e Temperatura em <b>${state.temp.toFixed(0)}°C</b>. Temos <span class="ai-highlight">${pending} alerta(s)</span> pendente(s).`;
    }
    // 2. Energia e Picos do Gráfico
    else if (query.includes('energia') || query.includes('eletrica') || query.includes('kwh')) {
      const status = state.energy > state.thresholds.energy ? "acima do limite" : "dentro do normal";
      const maxE = Math.max(...state.energyData).toFixed(1);
      response = `O consumo de energia agora é de <span class="ai-highlight">${state.energy.toFixed(1)} kWh</span> (${status}). O pico mais alto registrado no gráfico recente foi de <b>${maxE} kWh</b>.`;
    }
    // 3. Água e Picos do Gráfico
    else if (query.includes('agua') || query.includes('litro')) {
      const status = state.water > state.thresholds.water ? "acima do limite" : "normal";
      const maxW = Math.max(...state.waterData).toFixed(0);
      response = `O fluxo de água está em <span class="ai-highlight">${state.water.toFixed(0)} L/h</span> (${status}). O volume máximo no gráfico hoje atingiu <b>${maxW} L/h</b>.`;
    }
    // 4. Temperatura
    else if (query.includes('temperatura') || query.includes('grau') || query.includes('quente')) {
      const status = state.temp > state.thresholds.temp ? "em superaquecimento!" : "segura";
      response = `A temperatura atual do painel é <span class="ai-highlight">${state.temp.toFixed(0)}°C</span>, uma faixa considerada <b>${status}</b> (O limite configurado é ${state.thresholds.temp}°C).`;
    }
    // 5. Alertas e Histórico de Resoluções
    else if (query.includes('alerta') || query.includes('aviso') || query.includes('problema') || query.includes('erro')) {
      const pending = state.alerts.filter(a => !a.resolved);
      if (pending.length === 0) {
        response = `Ótima notícia! Nenhum alerta pendente agora. Vocês já resolveram <b>${state.resolvedCount}</b> problema(s) nesta sessão.`;
      } else {
        response = `Atenção: temos <span class="ai-highlight">${pending.length} alerta(s) ativos</span>. O mais recente é: <i>"${pending[0].title}"</i>.`;
      }
    }
    // 6. Economia e Finanças
    else if (query.includes('economia') || query.includes('dinheiro') || query.includes('reai') || query.includes('custo') || query.includes('relatorio')) {
      response = `Neste mês, a economia total calculada é de <span class="ai-highlight">R$ 1.240 (+12%)</span>. Sendo aproximadamente R$ 780 poupados em energia e R$ 460 em consumo de água.`;
    }
    // Resposta padrão caso não entenda
    else {
      response = `Não compreendi exatamente. Você pode tentar me perguntar sobre: <b>resumo geral</b>, <b>energia</b>, <b>água</b>, <b>temperatura</b>, <b>alertas</b> ou <b>economia</b>.`;
    }

    output.innerHTML = `<span class="ai-message">${response}</span>`;
    input.value = '';
  };

  /* ---------- Funções de UI / Navegação ---------- */
  window.pickUser = function (el, user) {
    document.querySelectorAll('.gate-user').forEach(u => u.classList.remove('selected'));
    el.classList.add('selected');
    state.selectedTempUser = user;
    $('#gate-enter').classList.add('ready');
  };

  window.enterApp = function () {
    if (!state.selectedTempUser) return;
    setUser(state.selectedTempUser);
    $('#gate').classList.add('hidden');
  };

  window.setUser = function (user) {
    state.user = user;
    $('#sideUser').textContent = user;
    $('#sideAvatar').textContent = user.charAt(0);
    document.querySelectorAll('.profile-pick button').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-user') === user);
    });
  };

  window.logout = function () {
    $('#gate').classList.remove('hidden');
  };

  window.setView = function (viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));

    const targetView = $(`[data-view="${viewName}"].view`);
    const targetBtn = $(`nav button[data-view="${viewName}"]`);

    if (targetView) targetView.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');
  };

  window.toggleContrast = function (btn) {
    state.contrast = !state.contrast;
    btn.classList.toggle('on', state.contrast);
    if (state.contrast) {
      document.body.style.filter = 'contrast(1.25)';
    } else {
      document.body.style.filter = 'none';
    }
  };

  /* ---------- Renderização do Gráfico SVG ---------- */
  function updateChart() {
    const eLine = $('#lineEnergy');
    const wLine = $('#lineWater');
    if (!eLine || !wLine) return;

    const ePts = state.energyData.map((val, i) => `${(i / 23) * 460},${170 - (val / 80) * 160}`).join(' ');
    const wPts = state.waterData.map((val, i) => `${(i / 23) * 460},${170 - (val / 160) * 160}`).join(' ');

    eLine.setAttribute('points', ePts);
    wLine.setAttribute('points', wPts);
  }

  window.chartHover = function (e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const idx = Math.round((x / rect.width) * 23);

    if (idx >= 0 && idx < 24) {
      const hLine = $('#hoverLine');
      const tip = $('#chartTip');
      const posX = (idx / 23) * rect.width;

      hLine.setAttribute('x1', (idx / 23) * 460);
      hLine.setAttribute('x2', (idx / 23) * 460);
      hLine.setAttribute('opacity', '1');

      tip.style.opacity = '1';
      tip.style.left = `${posX}px`;
      tip.style.top = `10px`;
      tip.innerHTML = `Hora ${idx}:00<br>Energia: <b>${state.energyData[idx]} kWh</b><br>Água: <b>${state.waterData[idx]} L/h</b>`;
    }
  };

  window.chartOut = function () {
    const hLine = $('#hoverLine');
    const tip = $('#chartTip');
    if (hLine) hLine.setAttribute('opacity', '0');
    if (tip) tip.style.opacity = '0';
  };

  /* ---------- Relógio ---------- */
  function updateClock() {
    const now = new Date();
    const clock = $('#clock');
    if (clock) {
      clock.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' }) + ' · ' + now.toLocaleTimeString('pt-BR');
    }
  }

  // Inicialização
  setInterval(updateClock, 1000);
  updateClock();
  updateChart();
})();