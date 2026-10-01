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
    user: 'Felipe',
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
    efetivoPorSetor: { "Produção": 18, "Manutenção": 6, "Logística": 10, "Qualidade": 8 },
    registros: [
      { id: 101, tipo: 'sensor', setor: 'Prensa 3', energia: 58.5, agua: 125, temp: 41, obs: 'Ruído normal no pistão', autor: 'Felipe', hora: '08:30', status: 'Aprovado' },
      { id: 102, tipo: 'producao', lote: 'LOTE-A12', turno: '1º turno', boas: 520, refugo: 8, motivo: 'Rebarba leve', autor: 'Felipe', hora: '09:15', status: 'Aprovado' },
      { id: 103, tipo: 'inspecao', equip: 'Motor Compressor 2', statusInsp: 'Alerta', detalhes: 'Vibração leve no rolamento', autor: 'Gabriel', hora: '09:40', status: 'Pendente' }
    ]
  };

  const $ = sel => document.querySelector(sel);   const $$ = sel => document.querySelectorAll(sel);

  /* ---------- Login / Sessão ---------- */
  window.logout = function () {
    showToast("Sessão encerrada.");
  };

  window.setUser = function (u) {
    state.user = u;
    $('#sideUser').textContent = u;
    $('#sideAvatar').textContent = u.charAt(0);     $$('#profilePick button').forEach(b => {
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

    if (v === 'registro-dados') {
      renderTabelaRegistros();
      atualizarKpisRegistros();
    }
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

    if (query.includes('resumo') || query.includes('status') || query.includes('geral')) {
      const pending = state.alerts.filter(a => !a.resolved).length;
      response = `Panorama da Linha 3: Energia a <b>${state.energy.toFixed(1)} kWh</b>, Água a <b>${state.water.toFixed(0)} L/h</b>. Temos <span class="ai-highlight">${pending} alerta(s)</span> e <span class="ai-highlight">${state.registros.length} registro(s)</span> gravados hoje.`;
    } 
    else if (query.includes('registro') || query.includes('apontamento') || query.includes('producao')) {
      response = `Temos <b>${state.registros.length} registros operacionais</b> hoje. Você pode adicionar novas medições na aba <i>"Registrar dados"</i>.`;
    }
    else if (query.includes('energia') || query.includes('kwh')) {
      response = `Consumo de energia atual em <span class="ai-highlight">${state.energy.toFixed(1)} kWh</span>.`;
    } 
    else {
      response = `Não ententido totalmente. Você pode me pedir um <b>resumo</b> ou verificar <b>registros</b>, <b>energia</b> e <b>alertas</b>.`;
    }

    output.innerHTML = `<span class="ai-message">${response}</span>`;
    input.value = '';
  };

  /* ---------- Módulo: Registrar Dados ---------- */
  window.setTab = function (tabName) {
    $$('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));$$
('.tab-content').forEach(form => form.classList.toggle('active', form.id === `form-registro-${tabName}`));
  };

  window.salvarRegistroSensor = function (e) {
    e.preventDefault();
    const setor = $('#reg-sensor-setor').value;
    const energia = parseFloat($('#reg-sensor-energia').value);
    const agua = parseFloat($('#reg-sensor-agua').value);
    const temp = parseFloat($('#reg-sensor-temp').value);
    const obs = $('#reg-sensor-obs').value.trim();

    const novo = {
      id: Date.now(),
      tipo: 'sensor',
      setor,
      energia,
      agua,
      temp,
      obs: obs || 'Sem observações',
      autor: state.user || 'Operador',
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: (energia > state.thresholds.energy || temp > state.thresholds.temp) ? 'Pendente' : 'Aprovado'
    };

    // Caso valores estejam acima do limite, gera alerta automático
    if (energia > state.thresholds.energy) {
      state.alerts.unshift({
        id: state.nextAlertId++,
        title: `Consumo alto lançado em ${setor}: ${energia} kWh`,
        cat: 'energia',
        time: 'agora',
        resolved: false
      });
      renderAlerts();
    }

    state.registros.unshift(novo);
    e.target.reset();
    showToast("Medição de sensores registrada!");
    renderTabelaRegistros();
    atualizarKpisRegistros();
  };

  window.salvarRegistroProducao = function (e) {
    e.preventDefault();
    const lote = $('#reg-prod-lote').value;
    const turno = $('#reg-prod-turno').value;
    const boas = parseInt($('#reg-prod-boas').value, 10);
    const refugo = parseInt($('#reg-prod-refugo').value, 10);
    const motivo = $('#reg-prod-motivo').value.trim();

    const novo = {
      id: Date.now(),
      tipo: 'producao',
      lote,
      turno,
      boas,
      refugo,
      motivo: motivo || 'Nenhum motivo indicado',
      autor: state.user || 'Operador',
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: refugo > 20 ? 'Pendente' : 'Aprovado'
    };

    state.registros.unshift(novo);
    e.target.reset();
    showToast("Apontamento de produção salvo!");
    renderTabelaRegistros();
    atualizarKpisRegistros();
  };

  window.salvarRegistroInspecao = function (e) {
    e.preventDefault();
    const equip = $('#reg-insp-equip').value;
    const statusInsp = $('#reg-insp-status').value;
    const detalhes = $('#reg-insp-detalhes').value.trim();

    const novo = {
      id: Date.now(),
      tipo: 'inspecao',
      equip,
      statusInsp,
      detalhes,
      autor: state.user || 'Técnico',
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: statusInsp === 'Crítico' ? 'Pendente' : 'Aprovado'
    };

    if (statusInsp === 'Crítico') {
      state.alerts.unshift({
        id: state.nextAlertId++,
        title: `Inspeção crítica em: ${equip}`,
        cat: 'manutencao',
        time: 'agora',
        resolved: false
      });
      renderAlerts();
    }

    state.registros.unshift(novo);
    e.target.reset();
    showToast("Inspeção gravada!");
    renderTabelaRegistros();
    atualizarKpisRegistros();
  };

  window.renderTabelaRegistros = function () {
    const tbody = $('#tbody-registros');
    const filtroTipo = $('#filter-tipo-registro').value;
    const busca = $('#search-registro').value.toLowerCase();

    const filtrados = state.registros.filter(r => {
      const matchTipo = filtroTipo === 'todos' || r.tipo === filtroTipo;
      const texto = JSON.stringify(r).toLowerCase();
      const matchBusca = texto.includes(busca);
      return matchTipo && matchBusca;
    });

    if (filtrados.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Nenhum registro encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtrados.map(r => {
      let badgeTag = '';
      let resumo = '';

      if (r.tipo === 'sensor') {
        badgeTag = `<span class="badge-type type-sensor">Sensor</span>`;
        resumo = `<b>${r.setor}</b> — ${r.energia}kWh / ${r.agua}L/h / ${r.temp}°C`;
      } else if (r.tipo === 'producao') {
        badgeTag = `<span class="badge-type type-prod">Produção</span>`;
        resumo = `Lote <b>${r.lote}</b> (${r.turno}) — Boas: ${r.boas} | Refugo: ${r.refugo}`;
      } else {
        badgeTag = `<span class="badge-type type-insp">Inspeção</span>`;
        resumo = `<b>${r.equip}</b>: ${r.statusInsp}`;
      }

      const statusBadge = r.status === 'Aprovado' 
        ? `<span class="kpi-tag tag-ok">Aprovado</span>` 
        : `<span class="kpi-tag tag-warn">Pendente</span>`;

      return `
        <tr>
          <td>${badgeTag}</td>
          <td><div style="font-size:12px;">${resumo}</div></td>
          <td><small style="color:var(--text-dim);">${r.autor} (${r.hora})</small></td>
          <td>${statusBadge}</td>
          <td style="text-align:right;">
            ${r.status === 'Pendente' ? `<button class="btn-confirmar" style="font-size:10px; padding:2px 6px;" onclick="aprovarRegistro(${r.id})">Aprovar</button>` : ''}
            <button class="btn-confirmar" style="font-size:10px; padding:2px 6px; color:var(--danger);" onclick="excluirRegistro(${r.id})">✕</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.aprovarRegistro = function (id) {
    const reg = state.registros.find(r => r.id === id);
    if (reg) {
      reg.status = 'Aprovado';
      showToast("Registro aprovado!");
      renderTabelaRegistros();
      atualizarKpisRegistros();
    }
  };

  window.excluirRegistro = function (id) {
    state.registros = state.registros.filter(r => r.id !== id);
    showToast("Registro removido.");
    renderTabelaRegistros();
    atualizarKpisRegistros();
  };

  function atualizarKpisRegistros() {
    $('#kpi-count-hoje').textContent = state.registros.length;
    
    const pendentes = state.registros.filter(r => r.status === 'Pendente').length;
    $('#kpi-count-pendente').textContent = pendentes;
    $('#tag-pendente').textContent = pendentes > 0 ? 'Atenção' : 'OK';

    const sensores = state.registros.filter(r => r.tipo === 'sensor');
    if (sensores.length > 0) {
      const somaE = sensores.reduce((acc, curr) => acc + curr.energia, 0);
      $('#kpi-media-energia').textContent = (somaE / sensores.length).toFixed(1);
    } else {
      $('#kpi-media-energia').textContent = '0.0';
    }

    const producoes = state.registros.filter(r => r.tipo === 'producao');
    const totalRefugo = producoes.reduce((acc, curr) => acc + (curr.refugo || 0), 0);
    $('#kpi-total-refugo').textContent = totalRefugo;
  }

  window.exportarCSV = function () {
    if (state.registros.length === 0) return showToast("Sem registros para exportar!");

    let csvContent = "data:text/csv;charset=utf-8,ID,Tipo,Autor,Hora,Status,Detalhes\n";
    state.registros.forEach(r => {
      const detalhe = (r.setor || r.lote || r.equip || '').replace(/,/g, ' ');
      csvContent += `${r.id},${r.tipo},${r.autor},${r.hora},${r.status},${detalhe}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecomonitor_registros_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Relatório CSV baixado!");
  };

  /* ---------- Mural de Avisos ---------- */
  window.renderMural = function () {
    const lista = $('#mural-lista');
    const painel = $('#painel-lista');
    if (!lista || !painel) return;

    const fSetor = $('#filtro-setor').value;
    const fTurno = $('#filtro-turno').value;

    const filtrados = state.avisos.filter(a => {
      const matchSetor = fSetor === 'todos' || a.setor === fSetor;
      const matchTurno = fTurno === 'todos' || a.turno === fTurno || a.turno === 'Geral';
      return matchSetor && matchTurno;
    });

    if (filtrados.length === 0) {
      lista.innerHTML = `<div class="empty-state">Nenhum aviso encontrado.</div>`;
    } else {
      lista.innerHTML = filtrados.map(a => `
        <div class="aviso-card">
          <div class="aviso-meta"><span><b>${a.setor}</b> · ${a.turno}</span><span>Por ${a.autor}</span></div>
          <div class="aviso-texto">${a.texto}</div>
        </div>
      `).join('');
    }
  };

  window.publicarAviso = function (e) {
    e.preventDefault();
    const setor = $('#input-setor').value;
    const turno = $('#input-turno').value;
    const texto = $('#input-texto').value.trim();
    if (!texto) return;

    state.avisos.unshift({
      id: Date.now(), setor, turno, texto, critico: $('#input-critico').checked, autor: state.user, dataHora: 'agora', confirmacoes: []
    });
    $('#input-texto').value = '';
    renderMural();
    showToast("Aviso publicado!");
  };

  /* ---------- Alertas & Filtros ---------- */
  window.renderAlerts = function () {
    const badge = $('#alertBadge');
    const activeAlerts = state.alerts.filter(a => !a.resolved);
    if (badge) badge.textContent = activeAlerts.length;

    const mini = $('#mini-alerts');
    if (mini) {
      if (activeAlerts.length === 0) {
        mini.innerHTML = `<div class="empty-state">Nenhum alerta ativo!</div>`;
      } else {
        mini.innerHTML = activeAlerts.slice(0, 3).map(a => `
          <div class="alert-item">
            <div class="alert-dot" style="background:${CATS[a.cat]?.color || 'var(--danger)'}"></div>
            <div class="alert-body">
              <div class="alert-title">${a.title}</div>
              <button class="resolve-btn" onclick="resolveAlert(${a.id})">✓ Resolver</button>
            </div>
          </div>
        `).join('');
      }
    }

    const list = $('#alert-list');
    if (list) {
      list.innerHTML = state.alerts.map(a => `
        <div class="alert-item" style="opacity: ${a.resolved ? '0.5' : '1'}">
          <div class="alert-dot" style="background:${CATS[a.cat]?.color || 'var(--text-dim)'}"></div>
          <div class="alert-body"><span class="alert-title">${a.title}</span></div>
          ${!a.resolved ? `<button class="btn-primary" style="width:auto; padding:4px 8px; font-size:11px;" onclick="resolveAlert(${a.id})">Resolver</button>` : ''}
        </div>
      `).join('');
    }
  };

  window.resolveAlert = function (id) {
    const alert = state.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      renderAlerts();
      showToast("Alerta resolvido!");
    }
  };

  /* ---------- Gráfico SVG ---------- */
  function renderChart() {
    const lineE = $('#lineEnergy');
    const lineW = $('#lineWater');
    if (!lineE || !lineW) return;

    const ePts = state.energyData.map((val, idx) => `${(idx / (state.energyData.length - 1)) * 460},${160 - (val / 80) * 150}`).join(' ');
    const wPts = state.waterData.map((val, idx) => `${(idx / (state.waterData.length - 1)) * 460},${160 - (val / 160) * 150}`).join(' ');

    lineE.setAttribute('points', ePts);
    lineW.setAttribute('points', wPts);
  }

  /* ---------- Relógio & Simulação ---------- */
  function updateClock() {
    const clock = $('#clock');
    if (clock) clock.textContent = new Date().toLocaleTimeString('pt-BR') + ' - ' + new Date().toLocaleDateString('pt-BR');
  }

  function simulateLiveData() {
    state.energy = +(state.energy + (Math.random() * 2 - 1)).toFixed(1);
    state.water = +(state.water + (Math.random() * 4 - 2)).toFixed(0);

    if ($('#val-energy')) $('#val-energy').textContent = state.energy;
    if ($('#val-water')) $('#val-water').textContent = state.water;

    state.energyData.shift(); state.energyData.push(state.energy);
    state.waterData.shift(); state.waterData.push(state.water);
    renderChart();
  }

  /* ---------- Acessibilidade ---------- */
  window.toggleContrast = function (btn) {
    state.contrast = !state.contrast;
    btn.classList.toggle('on', state.contrast);
    $('#app').classList.toggle('high-contrast', state.contrast);
  };

  function showToast(msg) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* ---------- Inicialização ---------- */
  function init() {
    setInterval(updateClock, 1000);
    setInterval(simulateLiveData, 3000);
    updateClock();
    renderAlerts();
    renderMural();
    renderChart();
    renderTabelaRegistros();
    atualizarKpisRegistros();
  }

  init();
})();