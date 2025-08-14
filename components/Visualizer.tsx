
import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyserNode: AnalyserNode;
}

export const Visualizer: React.FC<VisualizerProps> = ({ analyserNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);

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
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    let hue = 0;

    const renderFrame = () => {
      animationFrameId.current = requestAnimationFrame(renderFrame);
      analyserNode.getByteFrequencyData(dataArray);

      const { width, height } = canvas.getBoundingClientRect();
      context.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fading effect
      context.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.15;
      const barWidth = 2;
      const numBars = Math.floor(analyserNode.frequencyBinCount * 0.6); // Use a portion of the data

      // Bass pulse effect
      const bass = (dataArray[0] + dataArray[1] + dataArray[2]) / 3;
      const pulseRadius = (bass / 255) * (Math.min(width, height) * 0.05);
      
      context.beginPath();
      context.arc(centerX, centerY, radius + pulseRadius, 0, 2 * Math.PI);
      context.strokeStyle = `hsla(${hue}, 100%, 60%, 0.5)`;
      context.lineWidth = 1;
      context.stroke();

      for (let i = 0; i < numBars; i++) {
        const barHeight = Math.pow(dataArray[i] / 255, 2.5) * (height * 0.4);
        
        const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;

        const x1 = centerX + Math.cos(angle) * (radius + pulseRadius);
        const y1 = centerY + Math.sin(angle) * (radius + pulseRadius);
        const x2 = centerX + Math.cos(angle) * (radius + pulseRadius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + pulseRadius + barHeight);
        
        const barHue = (hue + i * 0.5) % 360;
        const lightness = 50 + (dataArray[i] / 255) * 25;

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = `hsl(${barHue}, 100%, ${lightness}%)`;
        context.lineWidth = barWidth;
        context.stroke();
      }
      
      hue = (hue + 0.2) % 360; // Slowly cycle through colors
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyserNode]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
