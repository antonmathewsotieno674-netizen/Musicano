import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  color: string;
  isPlaying: boolean;
  progress: number; // 0 to 1
}

export const Waveform: React.FC<WaveformProps> = ({ color, isPlaying, progress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mock waveform data generation (since we don't scan the whole file in this demo)
    // In a real app, this would come from an AudioBuffer analysis
    const bars = 100;
    const data = new Array(bars).fill(0).map((_, i) => Math.sin(i * 0.2) * 0.5 + Math.random() * 0.5);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw background center line
      ctx.beginPath();
      ctx.strokeStyle = '#334155';
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const barWidth = width / bars;
      
      data.forEach((val, i) => {
        const x = i * barWidth;
        const h = val * (height * 0.8);
        const y = (height - h) / 2;

        // Played portion logic
        const isPlayed = (i / bars) < progress;
        
        ctx.fillStyle = isPlayed ? color : '#475569';
        
        // Add a "playhead" effect
        if (isPlaying && Math.abs((i / bars) - progress) < 0.01) {
            ctx.fillStyle = '#ffffff';
        }

        ctx.fillRect(x, y, barWidth - 1, h);
      });
    };

    draw();
  }, [color, progress, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={100} 
      className="w-full h-24 bg-slate-900 rounded-md shadow-inner cursor-pointer" 
    />
  );
};
