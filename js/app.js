// app.js — Основная логика приложения
// Marvel-style cinematic slideshow для Миши

(function() {
  'use strict';

  // ========== STATE ==========
  const state = {
    scenes: [],
    currentIndex: 0,
    isAutoplay: true,
    isMuted: sessionStorage.getItem('muted') === 'true',
    isLoading: true,
    audioUnlocked: false,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    lastManualAction: 0
  };

  // ========== DOM ELEMENTS ==========
  const el = {
    intro: document.getElementById('intro'),
    slideshow: document.getElementById('slideshow'),
    finale: document.getElementById('finale'),
    startBtn: document.getElementById('start'),
    startLabel: document.getElementById('start-label'),
    muteBtn: document.getElementById('mute'),
    soundLabel: document.getElementById('sound-label'),
    playPauseBtn: document.getElementById('play-pause'),
    prevBtn: document.getElementById('previous'),
    nextBtn: document.getElementById('next'),
    restartBtn: document.getElementById('restart'),
    shareBtn: document.getElementById('share'),
    sceneImages: document.getElementById('scene-images'),
    sceneBackground: document.getElementById('scene-background'),
    sceneCopy: document.getElementById('scene-copy'),
    sceneNumber: document.getElementById('scene-number'),
    heroName: document.getElementById('hero-name'),
    sceneCaption: document.getElementById('scene-caption'),
    progress: document.getElementById('progress'),
    posterGrid: document.getElementById('poster-grid'),
    effectDecoration: document.getElementById('effect-decoration'),
    transition: document.getElementById('transition'),
    comicFlip: document.getElementById('comic-flip'),
    toast: document.getElementById('toast'),
    collage: document.getElementById('collage'),
    loadingFill: document.getElementById('loading-fill'),
    loadingText: document.getElementById('loading-text'),
    loadingPercent: document.getElementById('loading-percent'),
    shareDialog: document.getElementById('share-dialog'),
    shareLink: document.getElementById('share-link'),
    copyLinkBtn: document.getElementById('copy-link'),
    closeShareBtn: document.getElementById('close-share')
  };

  // ========== AUDIO ==========
  const audio = {
    music: null,
    thunder: null,
    whoosh: null,
    impact: null
  };

  // ========== EFFECTS ENGINE ==========
  let effects = null;

  // ========== INIT ==========
  async function init() {
    document.body.classList.remove('booting');
    
    // Инициализация эффектов
    effects = new EffectsEngine('effects');
    
    // Определение низкой мощности устройства
    if (effects.devicePower === 'low') {
      document.body.classList.add('low-power');
    }
    
    // Загрузка сцен
    try {
      const response = await fetch('scenes.json');
      if (!response.ok) throw new Error('scenes.json not found');
      state.scenes = await response.json();
    } catch (err) {
      showToast('Не удалось загрузить сцены');
      console.error(err);
      state.scenes = [];
    }

    if (state.scenes.length === 0) {
      showToast('Нет сцен для показа');
      return;
    }

    // Preload
    await preloadAssets();
    
    // Setup
    setupAudio();
    setupEventListeners();
    buildCollage();
    buildSlideshow();
    
    // Ready
    state.isLoading = false;
    el.startBtn.disabled = false;
    el.startLabel.textContent = 'НАЖМИ, ЧТОБЫ НАЧАТЬ';
    document.getElementById('loading').classList.add('complete');
  }

  // ========== PRELOAD ==========
  async function preloadAssets() {
    const total = state.scenes.length + 4; // images + audio
    let loaded = 0;

    const updateProgress = () => {
      loaded++;
      const percent = Math.round((loaded / total) * 100);
      el.loadingFill.style.width = percent + '%';
      el.loadingPercent.textContent = percent + '%';
      
      if (loaded === 1) el.loadingText.textContent = 'ЗАГРУЖАЕМ ФОТО';
      if (loaded === state.scenes.length) el.loadingText.textContent = 'ГОТОВИМ ЭФФЕКТЫ';
    };

    // Preload images
    const imagePromises = state.scenes.map(scene => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => { updateProgress(); resolve(); };
        img.onerror = () => { 
          console.warn('Failed to load:', scene.image); 
          updateProgress();
          resolve(); 
        };
        img.src = scene.image;
      });
    });

    await Promise.all(imagePromises);

    // Preload audio (non-blocking)
    const audioFiles = [
      { name: 'music', src: 'audio/music.mp3' },
      { name: 'thunder', src: 'audio/thunder.mp3' },
      { name: 'whoosh', src: 'audio/whoosh.mp3' },
      { name: 'impact', src: 'audio/impact.mp3' }
    ];

    audioFiles.forEach(({ name, src }) => {
      const a = new Audio();
      a.preload = 'auto';
      a.volume = 0.7;
      a.src = src;
      a.onerror = () => {
        console.warn('Audio not available:', src);
        updateProgress();
      };
      a.oncanplaythrough = () => updateProgress();
      audio[name] = a;
    });

    // Даём 2 секунды на аудио
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // ========== AUDIO SETUP ==========
  function setupAudio() {
    if (audio.music) {
      audio.music.loop = true;
      audio.music.volume = 0.4;
    }

    updateMuteButton();
  }

  function unlockAudio() {
    if (state.audioUnlocked) return;
    
    // Mobile требует user interaction для audio
    if (audio.music && !state.isMuted) {
      audio.music.play().catch(() => {
        showToast('Звук недоступен', 2000);
        state.isMuted = true;
        updateMuteButton();
      });
    }
    
    state.audioUnlocked = true;
  }

  function playSound(name) {
    if (state.isMuted || !audio[name]) return;
    
    const sound = audio[name];
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  function updateMuteButton() {
    const icon = el.muteBtn.querySelector('use');
    if (state.isMuted) {
      icon.setAttribute('href', '#i-muted');
      el.soundLabel.textContent = 'ЗВУК ВЫКЛ';
      el.muteBtn.setAttribute('aria-pressed', 'true');
      el.muteBtn.setAttribute('aria-label', 'Включить звук');
      if (audio.music) audio.music.pause();
    } else {
      icon.setAttribute('href', '#i-sound');
      el.soundLabel.textContent = 'ЗВУК ВКЛ';
      el.muteBtn.setAttribute('aria-pressed', 'false');
      el.muteBtn.setAttribute('aria-label', 'Выключить звук');
      if (audio.music && state.audioUnlocked) audio.music.play().catch(() => {});
    }
  }

  // ========== EVENT LISTENERS ==========
  function setupEventListeners() {
    el.startBtn.addEventListener('click', startExperience);
    el.muteBtn.addEventListener('click', toggleMute);
    el.playPauseBtn.addEventListener('click', togglePlayPause);
    el.prevBtn.addEventListener('click', () => navigate(-1));
    el.nextBtn.addEventListener('click', () => navigate(1));
    el.restartBtn.addEventListener('click', restart);
    el.shareBtn.addEventListener('click', share);
    el.copyLinkBtn.addEventListener('click', copyLink);
    el.closeShareBtn.addEventListener('click', () => el.shareDialog.close());

    // Swipe navigation
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;
    
    el.slideshow.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      isSwiping = true;
    }, { passive: true });
    
    el.slideshow.addEventListener('touchmove', e => {
      if (!isSwiping) return;
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    el.slideshow.addEventListener('touchend', e => {
      if (!isSwiping) return;
      isSwiping = false;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const diffX = touchStartX - touchEndX;
      const diffY = Math.abs(touchStartY - touchEndY);
      
      // Игнорируем если свайп больше вертикальный чем горизонтальный
      if (diffY > Math.abs(diffX)) return;
      
      // Минимальная дистанция свайпа 50px
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) navigate(1);
        else navigate(-1);
      }
    }

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (el.slideshow.hidden) return;
      
      if (e.key === 'ArrowLeft') navigate(-1);
      else if (e.key === 'ArrowRight') navigate(1);
      else if (e.key === ' ') { e.preventDefault(); togglePlayPause(); }
    });

    // Progress segments click
    el.progress.addEventListener('click', e => {
      const segment = e.target.closest('.progress-segment');
      if (segment) {
        const index = parseInt(segment.dataset.index);
        if (!isNaN(index)) goToScene(index);
      }
    });
  }

  // ========== COLLAGE ==========
  function buildCollage() {
    const count = Math.min(3, state.scenes.length);
    const indices = [0, Math.floor(state.scenes.length / 2), state.scenes.length - 1];
    
    indices.slice(0, count).forEach(i => {
      const scene = state.scenes[i];
      const fig = document.createElement('figure');
      fig.className = 'photo-card';
      fig.innerHTML = `
        <img src="${scene.image}" alt="">
        <figcaption><small>ДОСЬЕ</small>${scene.hero}</figcaption>
      `;
      el.collage.appendChild(fig);
    });
  }

  // ========== COMIC FLIP INTRO ==========
  function playComicFlip() {
    return new Promise(resolve => {
      el.comicFlip.classList.add('running');
      
      let index = 0;
      const interval = setInterval(() => {
        if (index >= state.scenes.length) {
          clearInterval(interval);
          setTimeout(() => {
            el.comicFlip.classList.remove('running');
            resolve();
          }, 300);
          return;
        }
        
        const img = document.createElement('img');
        img.src = state.scenes[index].image;
        el.comicFlip.innerHTML = '';
        el.comicFlip.appendChild(img);
        index++;
      }, 180);
    });
  }

  // ========== START EXPERIENCE ==========
  async function startExperience() {
    unlockAudio();
    
    // Comic flip
    await playComicFlip();
    
    // Transition
    el.intro.hidden = true;
    el.slideshow.hidden = false;
    
    goToScene(0);
    startAutoplay();
  }

  // ========== SLIDESHOW ==========
  function buildSlideshow() {
    // Build images
    state.scenes.forEach((scene, i) => {
      const img = document.createElement('img');
      img.className = 'scene-photo';
      img.src = scene.image;
      img.alt = `${scene.hero}: ${scene.caption}`;
      img.dataset.index = i;
      el.sceneImages.appendChild(img);
    });

    // Build progress segments
    state.scenes.forEach((_, i) => {
      const seg = document.createElement('button');
      seg.className = 'progress-segment';
      seg.dataset.index = i;
      seg.innerHTML = '<span></span>';
      seg.setAttribute('aria-label', `Сцена ${i + 1}`);
      el.progress.appendChild(seg);
    });

    // Ken Burns on capable devices
    if (effects.devicePower !== 'low' && !state.reducedMotion) {
      el.sceneImages.classList.add('ken-burns');
    }
  }

  function goToScene(index, transition = 'flash') {
    if (index < 0 || index >= state.scenes.length) return;
    
    state.currentIndex = index;
    const scene = state.scenes[index];
    
    // Transition effect
    if (!state.reducedMotion) {
      playTransition(transition);
    }
    
    // Update images
    document.querySelectorAll('.scene-photo').forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
    
    // Update background
    el.sceneBackground.style.backgroundImage = `url(${scene.image})`;
    
    // Update text
    el.sceneNumber.textContent = `СЦЕНА ${index + 1} ИЗ ${state.scenes.length}`;
    el.heroName.textContent = scene.hero;
    el.sceneCaption.textContent = scene.caption;
    el.sceneCopy.classList.remove('arrive');
    void el.sceneCopy.offsetWidth; // reflow
    el.sceneCopy.classList.add('arrive');
    
    // Update progress
    document.querySelectorAll('.progress-segment').forEach((seg, i) => {
      const span = seg.querySelector('span');
      
      seg.classList.toggle('active', i === index);
      seg.classList.toggle('done', i < index);
      
      // Сбрасываем анимацию у всех
      span.style.animation = 'none';
      span.style.transform = i < index ? 'scaleX(1)' : 'scaleX(0)';
      
      // Запускаем анимацию только у текущего
      if (i === index) {
        void span.offsetWidth; // reflow
        span.style.animation = state.isAutoplay ? 'progress-fill 5.5s linear' : 'none';
      }
    });
    
    // Play effect
    playSceneEffect(scene.effect);
    
    // Sound
    if (['thunder', 'shield', 'hulk'].includes(scene.effect)) {
      playSound('impact');
    } else if (['magic', 'ironman'].includes(scene.effect)) {
      playSound('whoosh');
    }
  }

  function playSceneEffect(effectName) {
    // Очистка предыдущих классов
    el.effectDecoration.className = 'effect-decoration';
    el.slideshow.classList.remove('shake');
    
    // Применение эффекта
    if (effectName) {
      el.effectDecoration.classList.add(`effect-${effectName}`);
      
      // Canvas эффект
      effects.play(effectName);
      
      // Shake
      if (['thunder', 'hulk'].includes(effectName) && !state.reducedMotion) {
        setTimeout(() => {
          el.slideshow.classList.add('shake');
        }, 200);
      }
    }
  }

  function playTransition(type) {
    el.transition.className = 'transition-layer ' + type;
    void el.transition.offsetWidth;
    el.transition.style.opacity = 1;
    setTimeout(() => {
      el.transition.style.opacity = 0;
    }, 50);
  }

  function navigate(direction) {
    pauseAutoplayTemporarily();
    
    const transitions = ['flash', 'glitch', 'wipe'];
    const nextIndex = state.currentIndex + direction;
    
    if (nextIndex < 0 || nextIndex >= state.scenes.length) {
      if (nextIndex >= state.scenes.length) {
        showFinale();
      }
      return;
    }
    
    const trans = transitions[Math.floor(Math.random() * transitions.length)];
    goToScene(nextIndex, trans);
    
    // Возобновляем автоплей через 8 секунд
    if (state.isAutoplay) {
      setTimeout(() => {
        if (Date.now() - state.lastManualAction >= 7500) {
          startAutoplay();
        }
      }, 8000);
    }
  }

  function togglePlayPause() {
    state.isAutoplay = !state.isAutoplay;
    
    const icon = el.playPauseBtn.querySelector('use');
    if (state.isAutoplay) {
      icon.setAttribute('href', '#i-pause');
      el.playPauseBtn.setAttribute('aria-label', 'Приостановить показ');
      startAutoplay();
    } else {
      icon.setAttribute('href', '#i-play');
      el.playPauseBtn.setAttribute('aria-label', 'Продолжить показ');
      stopAutoplay();
    }
  }

  let autoplayTimer = null;

  function startAutoplay() {
    if (!state.isAutoplay) return;
    stopAutoplay();
    
    autoplayTimer = setTimeout(() => {
      navigate(1);
    }, 5500);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function pauseAutoplayTemporarily() {
    state.lastManualAction = Date.now();
    stopAutoplay();
    
    if (state.isAutoplay) {
      setTimeout(() => {
        if (Date.now() - state.lastManualAction >= 7500) {
          startAutoplay();
        }
      }, 8000);
    }
  }

  // ========== FINALE ==========
  function showFinale() {
    stopAutoplay();
    effects.stop();
    
    el.slideshow.hidden = true;
    el.finale.hidden = false;
    
    // Build poster grid
    el.posterGrid.innerHTML = '';
    state.scenes.forEach(scene => {
      const img = document.createElement('img');
      img.src = scene.image;
      img.alt = scene.hero;
      el.posterGrid.appendChild(img);
    });
    
    // Confetti effect (simplified)
    setTimeout(() => {
      playSound('whoosh');
      if (!state.reducedMotion) {
        createConfetti();
      }
    }, 500);
  }

  function createConfetti() {
    const count = effects.devicePower === 'low' ? 20 : 40;
    const canvas = document.getElementById('effects');
    const ctx = canvas.getContext('2d');
    
    const particles = [];
    const colors = ['#ed1d24', '#e9b66e', '#72caff', '#ff3037', '#ffd700'];
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        shape: Math.random() > 0.5 ? 'square' : 'circle'
      });
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.rotation += p.rotationSpeed;
        
        if (p.y < canvas.height + 50) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          
          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
          
          ctx.restore();
          alive = true;
        }
      });
      
      if (alive) requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    animate();
  }

  function restart() {
    el.finale.hidden = true;
    el.intro.hidden = false;
    
    state.currentIndex = 0;
    state.isAutoplay = true;
    
    document.getElementById('loading').classList.add('complete');
    el.startBtn.disabled = false;
  }

  // ========== SHARE ==========
  function share() {
    const url = window.location.href;
    const title = 'МИША — настоящий герой';
    const text = 'Посмотри эту крутую историю!';
    
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else {
      el.shareLink.value = url;
      el.shareDialog.showModal();
    }
  }

  function copyLink() {
    el.shareLink.select();
    document.execCommand('copy');
    showToast('Ссылка скопирована!');
    el.shareDialog.close();
  }

  // ========== MUTE ==========
  function toggleMute() {
    state.isMuted = !state.isMuted;
    sessionStorage.setItem('muted', state.isMuted);
    updateMuteButton();
  }

  // ========== TOAST ==========
  function showToast(message, duration = 2000) {
    el.toast.textContent = message;
    el.toast.classList.add('show');
    
    setTimeout(() => {
      el.toast.classList.remove('show');
    }, duration);
  }

  // ========== НАЧАЛО ==========
  init();
})();
