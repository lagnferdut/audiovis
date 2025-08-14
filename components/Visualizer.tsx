import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyserNode: AnalyserNode;
}

// Funkcja pomocnicza do interpolacji liniowej (płynne przejścia)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

class Particle {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  angle: number;
  color: string;
  energy: number;

  constructor(index: number, total: number, centerX: number, centerY: number) {
    this.angle = (index / total) * Math.PI * 2;
    this.baseRadius = Math.min(centerX, centerY) * 0.4;
    this.radius = this.baseRadius;
    this.x = centerX + Math.cos(this.angle) * this.radius;
    this.y = centerY + Math.sin(this.angle) * this.radius;
    this.color = `hsl(${(index / total) * 360}, 100%, 50%)`;
    this.energy = 0;
  }

  update(audioValue: number, centerX: number, centerY: number) {
    this.energy = audioValue / 255;
    
    // Docelowy promień jest wypychany na zewnątrz przez energię dźwięku
    const targetRadius = this.baseRadius + this.energy * (Math.min(centerX, centerY) * 0.5);

    // Płynnie przechodź do docelowego promienia
    this.radius = lerp(this.radius, targetRadius, 0.1);

    this.x = centerX + Math.cos(this.angle) * this.radius;
    this.y = centerY + Math.sin(this.angle) * this.radius;
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, 1 + this.energy * 5, 0, Math.PI * 2);
    // Zwiększaj jasność wraz z energią
    context.fillStyle = this.color.replace('50%)', `${50 + this.energy * 50}%)`);
    context.fill();
  }
}

export const Visualizer: React.FC<VisualizerProps> = ({ analyserNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        context.scale(dpr, dpr);
        
        // Ponownie zainicjuj cząsteczki po zmianie rozmiaru
        const { width, height } = canvas.getBoundingClientRect();
        const centerX = width / 2;
        const centerY = height / 2;
        const numParticles = 256;
        particlesRef.current = Array.from({ length: numParticles }, (_, i) => new Particle(i, numParticles, centerX, centerY));
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let rotation = 0;

    const renderFrame = () => {
      animationFrameId.current = requestAnimationFrame(renderFrame);
      analyserNode.getByteFrequencyData(dataArray);

      const { width, height } = canvas.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;

      // Zanikające tło dla efektu smużenia
      context.fillStyle = 'rgba(0, 0, 0, 0.15)';
      context.fillRect(0, 0, width, height);
      
      context.save();
      context.translate(centerX, centerY);
      context.rotate(rotation);
      context.translate(-centerX, -centerY);

      // Zaktualizuj i narysuj cząsteczki
      const particles = particlesRef.current;
      particles.forEach((particle, i) => {
        const dataIndex = Math.floor(i * (bufferLength / particles.length));
        const audioValue = dataArray[dataIndex];
        particle.update(audioValue, centerX, centerY);
        particle.draw(context);
      });

      // Narysuj połączenia
      context.beginPath();
      context.moveTo(particles[0].x, particles[0].y);
      for (let i = 1; i < particles.length; i++) {
        const p1 = particles[i - 1];
        const p2 = particles[i];
        const xc = (p1.x + p2.x) / 2;
        const yc = (p1.y + p2.y) / 2;
        context.quadraticCurveTo(p1.x, p1.y, xc, yc);
        
        // Dodaj linie "pajęczyny" w reakcji na bas
        const bassEnergy = (dataArray[0] + dataArray[1] + dataArray[2]) / 3 / 255;
        if (bassEnergy > 0.6 && i % 8 === 0) {
            context.moveTo(centerX, centerY);
            context.lineTo(p1.x, p1.y);
        }
      }
      context.quadraticCurveTo(particles[particles.length - 1].x, particles[particles.length - 1].y, (particles[0].x + particles[particles.length - 1].x) / 2, (particles[0].y + particles[particles.length - 1].y) / 2);
      
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(255, 0, 255, 0.5)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0.5)');
      context.strokeStyle = gradient;
      context.lineWidth = 1.5;
      context.stroke();
      
      context.restore();

      rotation += 0.0005; // Powolna rotacja
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyserNode]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
