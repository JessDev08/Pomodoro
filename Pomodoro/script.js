(() => {
  // Estado e elementos
  const modes = {
    pomodoro: { label: 'Pomodoro', defaultMinutes: 25 },
    shortBreak: { label: 'Pausa Curta', defaultMinutes: 5 },
    longBreak: { label: 'Pausa Longa', defaultMinutes: 15 },
  };

  let timer = null;
  let secondsLeft = 0;
  let currentMode = 'pomodoro';
  let isRunning = false;

  const timeDisplay = document.getElementById('time');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resetBtn = document.getElementById('reset');
  const progressBar = document.getElementById('progress');
  const progressPercent = document.getElementById('progress-percentage');

  const timerButtons = document.querySelectorAll('.timer-button');

  // Configurações e preferências
  const settingsSection = document.querySelector('.settings');
  const settingsForm = document.getElementById('settings-form');
  const settingsLink = document.getElementById('settings');
  const closeSettingsBtn = document.getElementById('close-button');

  const themeButtons = document.querySelectorAll('.theme-selection button');

  // Citações motivacionais
  const quotes = [
    { text: "Comece onde você está. Use o que você tem. Faça o que puder.", author: "Arthur Ashe" },
    { text: "A disciplina é a ponte entre metas e realizações.", author: "Jim Rohn" },
    { text: "Você não precisa ser ótimo para começar, mas precisa começar para ser ótimo.", author: "Zig Ziglar" },
    { text: "O sucesso é a soma de pequenos esforços repetidos dia após dia.", author: "Robert Collier" },
    { text: "Foque no progresso, não na perfeição.", author: "Unknown" },
  ];

  const quoteTextEl = document.getElementById('quote');
  const quoteAuthorEl = document.getElementById('author');

  // Funções

  // Carrega configurações do localStorage ou usa padrão
  function loadSettings() {
    const saved = JSON.parse(localStorage.getItem('pomodoroSettings'));
    if (saved) {
      for (const modeKey in modes) {
        if (saved[modeKey]) {
          modes[modeKey].defaultMinutes = saved[modeKey];
        }
      }
      applyTheme(saved.theme || 'light');
      settingsForm['pomodoro-time'].value = modes.pomodoro.defaultMinutes;
      settingsForm['short-break-time'].value = modes.shortBreak.defaultMinutes;
      settingsForm['long-break-time'].value = modes.longBreak.defaultMinutes;
      setThemeButtons(saved.theme || 'light');
    } else {
      applyTheme('light');
    }
  }

  // Salva configurações no localStorage
  function saveSettings() {
    const newSettings = {
      pomodoro: parseInt(settingsForm['pomodoro-time'].value, 10),
      shortBreak: parseInt(settingsForm['short-break-time'].value, 10),
      longBreak: parseInt(settingsForm['long-break-time'].value, 10),
      theme: getSelectedTheme(),
    };

    for (const key in newSettings) {
      if (typeof newSettings[key] === 'number' && (newSettings[key] < 1 || isNaN(newSettings[key]))) {
        alert('Por favor, insira valores válidos para os tempos.');
        return false;
      }
    }

    modes.pomodoro.defaultMinutes = newSettings.pomodoro;
    modes.shortBreak.defaultMinutes = newSettings.shortBreak;
    modes.longBreak.defaultMinutes = newSettings.longBreak;

    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
    applyTheme(newSettings.theme);
    return true;
  }

  // Atualiza o display do tempo
  function updateDisplay() {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    timeDisplay.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    updateProgress();
  }

  // Atualiza a barra de progresso
  function updateProgress() {
    const totalSeconds = modes[currentMode].defaultMinutes * 60;
    const percent = Math.floor(((totalSeconds - secondsLeft) / totalSeconds) * 100);
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
  }

  // Muda o modo atual do timer
  function changeMode(newMode) {
    if (isRunning) stopTimer();
    currentMode = newMode;
    secondsLeft = modes[newMode].defaultMinutes * 60;
    updateDisplay();
    updateTimerButtons();
    toggleControlButtons('start');
  }

  // Atualiza botões de modo para refletir o selecionado
  function updateTimerButtons() {
    timerButtons.forEach(btn => {
      const mode = btn.getAttribute('data-mode');
      if (mode === currentMode) {
        btn.classList.add('timer-selected');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('timer-selected');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  // Controle dos botões iniciar/pausar/resetar
  function toggleControlButtons(show) {
    if (show === 'start') {
      startBtn.classList.add('visible');
      pauseBtn.classList.remove('visible');
    } else if (show === 'pause') {
      startBtn.classList.remove('visible');
      pauseBtn.classList.add('visible');
    } else if (show === 'reset') {
      // Ambos visíveis para permitir reinício rápido
      startBtn.classList.add('visible');
      pauseBtn.classList.remove('visible');
    }
  }

  // Inicia o timer
  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    toggleControlButtons('pause');
    timer = setInterval(() => {
      if (secondsLeft > 0) {
        secondsLeft--;
        updateDisplay();
      } else {
        stopTimer();
        showNotification(`Tempo de ${modes[currentMode].label} finalizado!`);
        nextQuote();
      }
    }, 1000);
  }

  // Pausa o timer
  function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timer);
    toggleControlButtons('start');
  }

  // Para o timer (usado para resetar)
  function stopTimer() {
    isRunning = false;
    clearInterval(timer);
  }

  // Reseta o timer para o tempo padrão do modo atual
  function resetTimer() {
    stopTimer();
    secondsLeft = modes[currentMode].defaultMinutes * 60;
    updateDisplay();
    toggleControlButtons('start');
  }

  // Alterna entre temas claro e escuro
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    setThemeButtons(theme);
  }

  // Atualiza os botões de tema selecionado
  function setThemeButtons(selectedTheme) {
    themeButtons.forEach(btn => {
      const theme = btn.getAttribute('data-theme');
      if (theme === selectedTheme) {
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.classList.remove('selected');
        btn.setAttribute('aria-checked', 'false');
      }
    });
  }

  // Retorna o tema selecionado nos botões
  function getSelectedTheme() {
    const selected = [...themeButtons].find(btn => btn.classList.contains('selected'));
    return selected ? selected.getAttribute('data-theme') : 'light';
  }

  // Atualiza a mensagem motivacional
  function nextQuote() {
    const index = Math.floor(Math.random() * quotes.length);
    const quote = quotes[index];
    quoteTextEl.textContent = `"${quote.text}"`;
    quoteAuthorEl.textContent = `– ${quote.author}`;
  }

  // Mostra/Esconde a seção de configurações
  function toggleSettings(show) {
    if (show) {
      settingsSection.setAttribute('aria-hidden', 'false');
      settingsSection.style.display = 'block';
      // Focar no primeiro campo
      settingsForm['pomodoro-time'].focus();
    } else {
      settingsSection.setAttribute('aria-hidden', 'true');
      settingsSection.style.display = 'none';
    }
  }

  // Evento para mudar modo
  timerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      changeMode(btn.getAttribute('data-mode'));
    });
  });

  // Botões controlar timer
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);

  // Abrir configurações
  settingsLink.addEventListener('click', e => {
    e.preventDefault();
    toggleSettings(true);
  });

  // Fechar configurações
  closeSettingsBtn.addEventListener('click', () => {
    toggleSettings(false);
  });

  // Tema dentro das configurações
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.getAttribute('data-theme');

      themeButtons.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });

      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');

      applyTheme(selectedTheme); // Aplica o tema imediatamente
    });
  });

  // Salvar configurações
  settingsForm.addEventListener('submit', e => {
    e.preventDefault();
    if (saveSettings()) {
      toggleSettings(false);
      resetTimer();
      updateTimerButtons();
    }
  });

  // Notificações simples
  function showNotification(message) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(message);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(message);
          }
        });
      }
    } else {
      alert(message);
    }
  }

  // Inicialização
  function init() {
    loadSettings();
    changeMode(currentMode);
    nextQuote();
  }

  init();
})();
