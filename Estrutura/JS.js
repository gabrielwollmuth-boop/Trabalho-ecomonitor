(function () {
  const CATS = {
    energia:   { label: 'Energia', color: 'var(--energy)' },
    agua:      { label: 'Água', color: 'var(--water)' },
    temp:      { label: 'Temperatura', color: 'var(--danger)' },
    automacao: { label: 'Automação', color: 'var(--text-dim)' },
    seguranca: { label: 'Segurança', color: 'var(--security)' },
    manutencao:{ label: 'Manutenção', color: 'var(--ok)' }
  };

  const state = {
    user: null,
    contrast: false,
    thresholds: { energy: 60, water: 130, temp: 42 },
    energy: 42.8,
    water: 118,
    temp: 34,
    energyData: [40, 41, 39, 42, 45, 44, 46, 48, 50, 49, 47, 46, 44, 43, 45, 46, 44, 43, 42, 43, 44, 42, 43, 42.8],
    waterData:  [95, 98, 100, 105, 110, 108, 112, 118, 122, 120, 116, 112, 110, 108, 112, 116, 120, 118, 115, 113, 116, 118, 120, 118],
    alerts: [
      { id: 1, title: 'Pressão de água alterada no setor 2', cat: 'agua', time: '10 min atrás', resolved: false },
      { id: 2, title: 'Superaquecimento leve no painel elétrico', cat: 'temp', time: '25 min atrás', resolved: false }
    ],
    resolvedCount: 0,
    nextAlertId: 3,
    filter: 'todos',
    avisos: [
      { id: 1, setor: "Produção", turno: "1º turno", texto: "Manutenção preventiva na prensa 3 amanhã.", critico: true, autor: "Segurança", dataHora: "hoje, 07:12", confirmacoes: ["Felipe"] }
    ],
    efetivoPorSetor: { "Produção": 18, "Manutenção": 6, "Logística": 10, "Qualidade": 8 }
  };

  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);    /* ---------- Login Gate ---------- */   let selectedGateUser = null;    window.pickUser = function (el, user) {     $$('.gate-user').forEach(u => u.classList.remove('selected'));
    el.classList.add('selected');
    selectedGateUser = user;
    $('#gate-enter').classList.add('ready');
  };

  window.enterApp = function () {
    if (!selectedGateUser) return;
    setUser(selectedGateUser);
    $('#gate').classList.add('hidden');
    showToast(`Bem-vindo, ${selectedGateUser}!`);
  };

  window.logout = function () {
    state.user = null;
    $('#gate').classList.remove('hidden');     $$('.gate-user').forEach(u => u.classList.remove('selected'));$('#gate-enter').classList.remove('ready');
  };

  window.setUser = function (u) {
    state.user = u;
    $('#sideUser').textContent = u;
    $('#sideAvatar').textContent = u.charAt(0);      $$('#profilePick button').forEach(b => {
      b.classList.toggle('active', b.dataset.user === u);
    });

    renderMural();
  };

  /* ---------- Navegação de Telas (Views) ---------- */
  window.setView = function (v) {
    $$('nav button').forEach(b => {       b.classList.toggle('active', b.dataset.view === v);     });$$
('.view').forEach(sec => {
      sec.classList.toggle('active', sec.dataset.view === v);
    });
  };

  /* ---------- Inteligência Artificial (Bot) ---------- */
  window.handleAIPress = function (e) {
    if (e.key === 'Enter') askAI();
  };

  window.askAI = function () {
    const input = $('#ai-input');
    const output = $('#ai-output');
    const rawText = input.value.trim();
    if (!rawText) return;

    const query = rawText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let response = "";

    if (query.includes('resumo') || query.includes('status') || query.includes('geral') || query.includes('tudo')) {
      const pending = state.alerts.filter(a => !a.resolved).length;
      response = `Aqui está o panorama da Linha 3: Energia a <b>${state.energy.toFixed(1)} kWh</b>, Água a <b>${state.water.toFixed(0)} L/h</b> e Temperatura em <b>${state.temp.toFixed(0)}°C</b>. Temos <span class="ai-highlight">${pending} alerta(s)</span> pendente(s).`;
    } 
    else if (query.includes('energia') || query.includes('eletrica') || query.includes('kwh')) {
      const status = state.energy > state.thresholds.energy ? "acima do limite" : "dentro do normal";
      const maxE = Math.max(...state.energyData).toFixed(1);
      response = `O consumo de energia agora é de <span class="ai-highlight">${state.energy.toFixed(1)} kWh</span> (${status}). O pico mais alto registrado no gráfico recente foi de <b>${maxE} kWh</b>.`;
    } 
    else if (query.includes('agua') || query.includes('litro')) {
      const status = state.water > state.thresholds.water ? "acima do limite" : "normal";
      const maxW = Math.max(...state.waterData).toFixed(0);
      response = `O fluxo de água está em <span class="ai-highlight">${state.water.toFixed(0)} L/h</span> (${status}). O volume máximo no gráfico hoje atingiu <b>${maxW} L/h</b>.`;
    } 
    else if (query.includes('temperatura') || query.includes('grau') || query.includes('quente')) {
      const status = state.temp > state.thresholds.temp ? "em superaquecimento!" : "segura";
      response = `A temperatura atual do painel é <span class="ai-highlight">${state.temp.toFixed(0)}°C</span>, uma faixa considerada <b>${status}</b> (O limite configurado é ${state.thresholds.temp}°C).`;
    } 
    else if (query.includes('alerta') || query.includes('aviso') || query.includes('problema') || query.includes('erro')) {
      const pending = state.alerts.filter(a => !a.resolved);
      if (pending.length === 0) {
        response = `Ótima notícia! Nenhum alerta pendente agora. Vocês já resolveram <b>${state.resolvedCount}</b> problema(s) nesta sessão.`;
      } else {
        response = `Atenção: temos <span class="ai-highlight">${pending.length} alerta(s) ativos</span>. O mais recente é: <i>"${pending[0].title}"</i>.`;
      }
    } 
    else if (query.includes('economia') || query.includes('dinheiro') || query.includes('reai') || query.includes('custo') || query.includes('relatorio')) {
      response = `Neste mês, a economia total calculada é de <span class="ai-highlight">R$ 1.240 (+12%)</span>. Sendo aproximadamente R$ 780 poupados em energia e R$ 460 em água na Linha 3.`;
    } 
    else if (query.includes('mural') || query.includes('comunicado')) {
      response = `Atualmente temos <b>${state.avisos.length} aviso(s)</b> publicado(s) no mural de avisos da fábrica.`;
    } 
    else {
      response = `Não entendi exatamente. Experimente perguntar sobre <b>resumo</b>, <b>energia</b>, <b>água</b>, <b>temperatura</b>, <b>alertas</b> ou <b>economia</b>.`;
    }

    output.innerHTML = `<span class="ai-message">${response}</span>`;
    input.value = '';
  };

  /* ---------- Mural de Avisos ---------- */
  window.renderMural = function () {
    const lista = $('#mural-lista');
    const painel = $('#painel-lista');
    const fSetor = $('#filtro-setor').value;
    const fTurno = $('#filtro-turno').value;

    const filtrados = state.avisos.filter(a => {
      const matchSetor = fSetor === 'todos' || a.setor === fSetor;
      const matchTurno = fTurno === 'todos' || a.turno === fTurno || a.turno === 'Geral';
      return matchSetor && matchTurno;
    });

    if (filtrados.length === 0) {
      lista.innerHTML = `<div class="empty-state">Nenhum aviso encontrado para este filtro.</div>`;
    } else {
      lista.innerHTML = filtrados.map(a => {
        const jaConfirmou = a.confirmacoes.includes(state.user);
        const btnConfirmar = a.critico
          ? `<button class="btn-confirmar ${jaConfirmou ? 'confirmado' : ''}" onclick="confirmarAviso(${a.id})">
              ${jaConfirmou ? '✓ Leitura Confirmada' : 'Confirmar Leitura'}
             </button>`
          : '';

        return `
          <div class="aviso-card">
            <div class="aviso-meta">
              <span><b>${a.setor}</b> · ${a.turno}</span>
              <span>Por ${a.autor} (${a.dataHora})</span>
            </div>
            <div class="aviso-texto">${a.texto}</div>
            <div class="aviso-rodape">
              <span>${a.critico ? '⚠️ Exige confirmação' : 'Informativo'}</span>
              ${btnConfirmar}
            </div>
          </div>
        `;
      }).join('');
    }

    // Painel de Confirmações (Para Avisos Críticos)
    const criticos = state.avisos.filter(a => a.critico);
    if (criticos.length === 0) {
      painel.innerHTML = `<div class="empty-state">Nenhum aviso crítico ativo no momento.</div>`;
    } else {
      painel.innerHTML = criticos.map(a => {
        const total = state.efetivoPorSetor[a.setor] || 10;
        const confirmados = a.confirmacoes.length;
        const pct = Math.round((confirmados / total) * 100);

        return `
          <div class="painel-item">
            <div class="painel-topo">
              <p><b>${a.setor}</b>: "${a.texto.substring(0, 30)}..."</p>
              <span class="painel-percentual">${pct}%</span>
            </div>
            <div class="report-bar-track">
              <div class="report-bar-fill" style="width:${pct}%; background:var(--water);"></div>
            </div>
            <div class="painel-nomes">
              Confirmado por: ${a.confirmacoes.join(', ') || 'Ninguém ainda'} (${confirmados}/${total})
            </div>
          </div>
        `;
      }).join('');
    }
  };

  window.publicarAviso = function (e) {
    e.preventDefault();
    if (!state.user) return showToast("Selecione um usuário primeiro!");

    const setor = $('#input-setor').value;
    const turno = $('#input-turno').value;
    const texto = $('#input-texto').value.trim();
    const critico = $('#input-critico').checked;

    if (!texto) return;

    const novo = {
      id: Date.now(),
      setor,
      turno,
      texto,
      critico,
      autor: state.user,
      dataHora: 'agora',
      confirmacoes: []
    };

    state.avisos.unshift(novo);
    $('#input-texto').value = '';
    $('#input-critico').checked = false;
    renderMural();
    showToast("Aviso publicado com sucesso!");
  };

  window.confirmarAviso = function (id) {
    const aviso = state.avisos.find(a => a.id === id);
    if (aviso && !aviso.confirmacoes.includes(state.user)) {
      aviso.confirmacoes.push(state.user);
      renderMural();
      showToast("Leitura confirmada!");
    }
  };

  /* ---------- Alertas & Filtros ---------- */
  window.renderAlerts = function () {
    const badge = $('#alertBadge');
    const activeAlerts = state.alerts.filter(a => !a.resolved);
    badge.textContent = activeAlerts.length;

    // Mini Alertas (Painel Principal)
    const mini = $('#mini-alerts');
    if (activeAlerts.length === 0) {
      mini.innerHTML = `<div class="empty-state">Tudo em ordem. Nenhum alerta ativo!</div>`;
    } else {
      mini.innerHTML = activeAlerts.slice(0, 3).map(a => `
        <div class="alert-item">
          <div class="alert-dot" style="background:${CATS[a.cat]?.color || 'var(--danger)'}"></div>
          <div class="alert-body">
            <div class="alert-title">${a.title}</div>
            <div class="alert-actions">
              <button class="resolve-btn" onclick="resolveAlert(${a.id})">✓ Marcar como resolvido</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Tela de Alertas Completa
    const list = $('#alert-list');
    const filtrados = state.filter === 'todos' 
      ? state.alerts 
      : state.alerts.filter(a => a.cat === state.filter);

    if (filtrados.length === 0) {
      list.innerHTML = `<div class="empty-state">Nenhum alerta nesta categoria.</div>`;
    } else {
      list.innerHTML = filtrados.map(a => `
        <div class="alert-item" style="opacity: ${a.resolved ? '0.5' : '1'}">
          <div class="alert-dot" style="background:${CATS[a.cat]?.color || 'var(--text-dim)'}"></div>
          <div class="alert-body">
            <div>
              <span class="alert-cat" style="background:${CATS[a.cat]?.color || '#fff'}; color:#000;">${CATS[a.cat]?.label || a.cat}</span>
              <span class="alert-title">${a.title}</span>
            </div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:4px;">${a.time} ${a.resolved ? '· (Resolvido)' : ''}</div>
          </div>
          ${!a.resolved ? `<button class="btn-primary" style="width:auto; padding:4px 8px; font-size:11px;" onclick="resolveAlert(${a.id})">Resolver</button>` : ''}
        </div>
      `).join('');
    }

    renderBreakdown();
  };

  window.resolveAlert = function (id) {
    const alert = state.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      state.resolvedCount++;
      renderAlerts();
      showToast("Alerta resolvido com sucesso!");
    }
  };

  function renderFilterChips() {
    const container = $('#filterRowAlertas');
    const categories = ['todos', ...Object.keys(CATS)];
    container.innerHTML = categories.map(c => `
      <button class="filter-chip ${state.filter === c ? 'active' : ''}" onclick="setFilter('${c}')">
        ${c === 'todos' ? 'Todos' : CATS[c].label}
      </button>
    `).join('');
  }

  window.setFilter = function (f) {
    state.filter = f;
    renderFilterChips();
    renderAlerts();
  };

  function renderBreakdown() {
    const breakdown = $('#alert-breakdown');
    if (state.alerts.length === 0) {
      breakdown.innerHTML = "Sem alertas registrados.";
      return;
    }
    const counts = {};
    state.alerts.forEach(a => counts[a.cat] = (counts[a.cat] || 0) + 1);

    breakdown.innerHTML = Object.keys(counts).map(cat => `
      <div class="report-bar-row">
        <div class="report-bar-label"><span>${CATS[cat]?.label || cat}</span><span class="mono">${counts[cat]}</span></div>
        <div class="report-bar-track"><div class="report-bar-fill" style="width:${(counts[cat] / state.alerts.length) * 100}%; background:${CATS[cat]?.color || 'var(--water)'};"></div></div>
      </div>
    `).join('');
  }

  /* ---------- Gráfico SVG Dinâmico ---------- */
  function renderChart() {
    const ePts = state.energyData.map((val, idx) => {
      const x = (idx / (state.energyData.length - 1)) * 460;
      const y = 160 - (val / 80) * 150;
      return `${x},${y}`;
    }).join(' ');

    const wPts = state.waterData.map((val, idx) => {
      const x = (idx / (state.waterData.length - 1)) * 460;
      const y = 160 - (val / 160) * 150;
      return `${x},${y}`;
    }).join(' ');

    $('#lineEnergy').setAttribute('points', ePts);
    $('#lineWater').setAttribute('points', wPts);
  }

  window.chartHover = function (e) {
    const svg = $('#chartSvg');
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const idx = Math.round(pct * (state.energyData.length - 1));

    const eVal = state.energyData[idx];
    const wVal = state.waterData[idx];

    const hoverLine = $('#hoverLine');
    hoverLine.setAttribute('x1', pct * 460);
    hoverLine.setAttribute('x2', pct * 460);
    hoverLine.setAttribute('opacity', '1');

    const tip = $('#chartTip');
    tip.style.opacity = '1';
    tip.style.left = `${Math.min(pct * 100, 70)}%`;
    tip.style.top = '10px';
    tip.innerHTML = `Ponto ${idx + 1}<br><span style="color:var(--energy)">Energia: ${eVal} kWh</span><br><span style="color:var(--water)">Água: ${wVal} L/h</span>`;
  };

  window.chartOut = function () {
    $('#hoverLine').setAttribute('opacity', '0');
    $('#chartTip').style.opacity = '0';
  };

  /* ---------- Relógio & Atualização de Dados ---------- */
  function updateClock() {
    const now = new Date();
    $('#clock').textContent = now.toLocaleTimeString('pt-BR') + ' - ' + now.toLocaleDateString('pt-BR');
  }

  function simulateLiveData() {
    // Oscilação dos valores
    state.energy = +(state.energy + (Math.random() * 2 - 1)).toFixed(1);
    state.water = +(state.water + (Math.random() * 4 - 2)).toFixed(0);

    $('#val-energy').textContent = state.energy;
    $('#val-water').textContent = state.water;

    state.energyData.shift(); state.energyData.push(state.energy);
    state.waterData.shift(); state.waterData.push(state.water);

    renderChart();
  }

  /* ---------- Acessibilidade ---------- */
  window.toggleContrast = function (btn) {
    state.contrast = !state.contrast;
    btn.classList.toggle('on', state.contrast);
    app.classList.toggle('high-contrast', state.contrast);
  };

  /* ---------- Helpers ---------- */
  function showToast(msg) {
    const toast = $('#toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* ---------- Inicialização ---------- */
  function init() {
    setInterval(updateClock, 1000);
    setInterval(simulateLiveData, 3000);
    updateClock();
    renderFilterChips();
    renderAlerts();
    renderMural();
    renderChart();
  }

  init();
})();