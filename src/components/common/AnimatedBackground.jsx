import React, { useEffect, useRef } from 'react';

export const AnimatedBackground = ({ variant = 'battlefield' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle definitions based on variant
    const particleCount = variant === 'tactical' ? 35 : 45;
    const particles = [];

    const colors = variant === 'tactical'
      ? ['rgba(0, 240, 255, 0.6)', 'rgba(0, 240, 255, 0.3)', 'rgba(255, 184, 0, 0.4)', 'rgba(16, 185, 129, 0.4)']
      : ['rgba(255, 77, 0, 0.7)', 'rgba(255, 107, 26, 0.6)', 'rgba(255, 184, 0, 0.65)', 'rgba(255, 213, 79, 0.5)'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (variant === 'tactical' ? 2 : 3) + 1,
        speedY: (Math.random() * 0.8 + 0.3) * (variant === 'tactical' ? -0.4 : -1),
        speedX: (Math.random() - 0.5) * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseVal: Math.random() * Math.PI,
      });
    }

    let scanY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render tactical scanner line if tactical variant
      if (variant === 'tactical') {
        scanY += 1.2;
        if (scanY > height) scanY = -50;

        const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
        scanGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        scanGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.04)');
        scanGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 30, width, 60);
      }

      // Render floating embers / tactical nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulseVal += p.pulseSpeed;
        const currentAlpha = p.alpha + Math.sin(p.pulseVal) * 0.2;

        p.y += p.speedY;
        p.x += p.speedX;

        // Reset particle when it floats off screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));

        // Draw particle glow
        const glowRadius = p.size * (variant === 'tactical' ? 2.5 : 3.5);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core bright point
        ctx.fillStyle = variant === 'tactical' ? '#00F0FF' : '#FFF275';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [variant]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-flame-500/10 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-amber-gold/8 rounded-full blur-[130px] pointer-events-none" />
      {variant === 'tactical' && (
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
      )}

      {/* Cyber Grid Texture Overlay */}
      <div 
        className={`absolute inset-0 opacity-40 ${
          variant === 'tactical' ? 'claw-scratch-bg' : 'bg-panther-grid'
        }`} 
      />

      {/* Canvas Layer for Floating Fire Embers & Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};
