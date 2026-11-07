// effects.js — Canvas-эффекты для сцен
// Оптимизировано для мобильных устройств

class EffectsEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
    this.particles = [];
    this.isRunning = false;
    this.currentEffect = null;
    this.frameId = null;
    this.devicePower = this.detectPower();
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
    });
  }

  detectPower() {
    // Определяем производительность устройства
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
    
    if (mem < 4 || cores < 4 || isMobile) return 'low';
    if (mem >= 8 && cores >= 8) return 'high';
    return 'medium';
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.w = this.canvas.width;
    this.h = this.canvas.height;
  }

  play(effectName) {
    this.stop();
    this.currentEffect = effectName;
    
    // Вибрация на импакт-эффектах
    if (['thunder', 'shield', 'hulk'].includes(effectName)) {
      this.vibrate([30, 50, 30]);
    }
    
    switch(effectName) {
      case 'thunder': this.thunder(); break;
      case 'shield': this.shield(); break;
      case 'panther': this.panther(); break;
      case 'embers': this.embers(); break;
      case 'hulk': this.hulk(); break;
      case 'ironman': this.ironman(); break;
      case 'magic': this.magic(); break;
    }
  }

  stop() {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.particles = [];
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  vibrate(pattern) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // ========== ЭФФЕКТЫ ==========

  thunder() {
    this.isRunning = true;
    const bolts = this.devicePower === 'low' ? 2 : 4;
    
    const drawBolt = () => {
      const startX = Math.random() * this.w;
      const startY = 0;
      let x = startX;
      let y = startY;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.strokeStyle = `rgba(180, 200, 255, ${0.6 + Math.random() * 0.4})`;
      this.ctx.lineWidth = 2 + Math.random() * 3;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = '#c0d8ff';
      
      while (y < this.h) {
        x += (Math.random() - 0.5) * 60;
        y += 40 + Math.random() * 30;
        this.ctx.lineTo(x, y);
      }
      
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    };

    let frame = 0;
    const animate = () => {
      if (!this.isRunning) return;
      
      this.ctx.clearRect(0, 0, this.w, this.h);
      
      if (frame < 8 && Math.random() > 0.6) {
        for (let i = 0; i < bolts; i++) drawBolt();
      }
      
      frame++;
      if (frame < 25) {
        this.frameId = requestAnimationFrame(animate);
      } else {
        this.stop();
      }
    };
    
    animate();
  }

  shield() {
    this.isRunning = true;
    
    // Спарки от удара
    const particleCount = this.devicePower === 'low' ? 15 : 30;
    const cx = this.w / 2;
    const cy = this.h / 2;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * (2 + Math.random() * 4),
        vy: Math.sin(angle) * (2 + Math.random() * 4),
        life: 1,
        color: `hsl(${200 + Math.random() * 40}, 100%, ${60 + Math.random() * 20}%)`
      });
    }

    const animate = () => {
      if (!this.isRunning) return;
      
      this.ctx.clearRect(0, 0, this.w, this.h);
      
      this.particles = this.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life -= 0.02;
        
        if (p.life > 0) {
          this.ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('hsl', 'hsla');
          this.ctx.fillRect(p.x, p.y, 3, 3);
          return true;
        }
        return false;
      });
      
      if (this.particles.length > 0) {
        this.frameId = requestAnimationFrame(animate);
      } else {
        this.stop();
      }
    };
    
    animate();
  }

  panther() {
    this.isRunning = true;
    const particleCount = this.devicePower === 'low' ? 20 : 40;
    
    // Фиолетовые энергетические частицы
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        size: 2 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 0.8 + Math.random() * 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      if (!this.isRunning) return;
      
      this.ctx.clearRect(0, 0, this.w, this.h);
      
      this.particles = this.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.1;
        p.life -= 0.008;
        
        if (p.life > 0) {
          const opacity = p.life * (0.5 + Math.sin(p.pulse) * 0.3);
          this.ctx.fillStyle = `rgba(180, 130, 255, ${opacity})`;
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = '#b482ff';
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
          return true;
        }
        return false;
      });
      
      if (this.particles.length > 0) {
        this.frameId = requestAnimationFrame(animate);
      } else {
        this.stop();
      }
    };
    
    animate();
  }

  embers() {
    this.isRunning = true;
    const particleCount = this.devicePower === 'low' ? 10 : 20;
    
    const spawnEmber = () => {
      if (!this.isRunning) return;
      
      this.particles.push({
        x: Math.random() * this.w,
        y: this.h + 10,
        size: 1 + Math.random() * 2,
        vy: -1 - Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.5,
        life: 1,
        hue: 20 + Math.random() * 30
      });
      
      if (this.particles.length < particleCount) {
        setTimeout(spawnEmber, 100 + Math.random() * 200);
      }
    };
    
    spawnEmber();

    const animate = () => {
      if (!this.isRunning) return;
      
      this.ctx.clearRect(0, 0, this.w, this.h);
      
      this.particles = this.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.005;
        
        if (p.life > 0 && p.y > -10) {
          this.ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.life})`;
          this.ctx.fillRect(p.x, p.y, p.size, p.size * 2);
          return true;
        }
        return false;
      });
      
      this.frameId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  hulk() {
    this.isRunning = true;
    const cx = this.w / 2;
    const cy = this.h / 2;
    let radius = 30;
    let opacity = 0.8;

    const animate = () => {
      if (!this.isRunning) return;
      
      this.ctx.clearRect(0, 0, this.w, this.h);
      
      // Зелёная энергетическая волна
      this.ctx.strokeStyle = `rgba(130, 243, 120, ${opacity})`;
      this.ctx.lineWidth = 4;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = '#81f376';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
      
      radius += 15;
      opacity -= 0.025;
      
      if (opacity > 0) {
        this.frameId = requestAnimationFrame(animate);
      } else {
        this.stop();
      }
    };
    
    animate();
  }

  ironman() {
    this.isRunning = true;
    const cx = this.w / 2;
    const cy = this.h * 0.55;
    let frame = 0;
    const maxFrames = 60;

    const animate = () => {
      if (!this.isRunning) return;
      
      this.ctx.clearRect(0, 0, this.w, this.h);
      
      const progress = frame / maxFrames;
      const radius = 40 + progress * 80;
      const opacity = 1 - progress;
      
      // Репульсорное свечение
      const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(80, 200, 255, ${opacity * 0.6})`);
      gradient.addColorStop(0.5, `rgba(80, 200, 255, ${opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(80, 200, 255, 0)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      
      frame++;
      if (frame < maxFrames) {
        this.frameId = requestAnimationFrame(animate);
      } else {
        this.stop();
      }
    };
    
    animate();
  }

  magic() {
    // Магия рисуется CSS, но можем добавить искры
    this.isRunning = true;
    const particleCount = this.devicePower === 'low' ? 15 : 25;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const dist = 100 + Math.random() * 50;
      this.particles.push({
        x: this.w / 2 + Math.cos(angle) * dist,
        y: this.h * 0.35 + Math.sin(angle) * dist,
        angle: angle,
        dist: dist,
        speed: 0.02 + Math.random() * 0.02,
        life: 1
      });
    }

    const animate = () => {
      if (!this.isRunning) return;
      
      this.ctx.clearRect(0, 0, this.w, this.h);
      
      this.particles = this.particles.filter(p => {
        p.angle += p.speed;
        p.life -= 0.005;
        
        if (p.life > 0) {
          p.x = this.w / 2 + Math.cos(p.angle) * p.dist;
          p.y = this.h * 0.35 + Math.sin(p.angle) * p.dist;
          
          this.ctx.fillStyle = `rgba(255, 162, 82, ${p.life})`;
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = '#ffa252';
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
          return true;
        }
        return false;
      });
      
      if (this.particles.length > 0) {
        this.frameId = requestAnimationFrame(animate);
      } else {
        this.stop();
      }
    };
    
    animate();
  }
}

// Экспортируем для использования в app.js
window.EffectsEngine = EffectsEngine;
