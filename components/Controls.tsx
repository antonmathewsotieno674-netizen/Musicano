import React, { useState, useEffect, useRef } from 'react';

// --- Types ---
interface KnobProps {
  value: number; // typically -1 to 1 or 0 to 1
  min?: number;
  max?: number;
  label?: string;
  onChange: (val: number) => void;
  color?: string;
  size?: number;
}

interface FaderProps {
  value: number;
  min?: number;
  max?: number;
  vertical?: boolean;
  label?: string;
  onChange: (val: number) => void;
  className?: string;
}

// --- Knob Component ---
export const Knob: React.FC<KnobProps> = ({ 
  value, 
  min = 0, 
  max = 1, 
  label, 
  onChange,
  color = '#38bdf8',
  size = 64
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number>(0);
  const startVal = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startVal.current = value;
    document.body.style.cursor = 'ns-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startY.current - e.clientY;
      const range = max - min;
      const sensitiveRange = 200; // pixels to full rotate
      const change = (deltaY / sensitiveRange) * range;
      
      let newVal = startVal.current + change;
      newVal = Math.max(min, Math.min(max, newVal));
      onChange(newVal);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, max, min, onChange, value]);

  // Calculate rotation
  // Map value (min to max) to rotation (-135deg to 135deg)
  const percent = (value - min) / (max - min);
  const rotation = -135 + (percent * 270);

  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className="knob-container relative cursor-ns-resize group"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
      >
        {/* Background Ring */}
        <svg width={size} height={size} className="overflow-visible">
           <circle 
            cx={size/2} cy={size/2} r={size/2 - 4} 
            stroke="#1e293b" strokeWidth="6" fill="transparent"
            strokeDasharray={`${Math.PI * (size-8) * 0.75} ${Math.PI * (size-8)}`}
            transform={`rotate(135 ${size/2} ${size/2})`}
           />
           {/* Active Ring */}
           <circle 
            cx={size/2} cy={size/2} r={size/2 - 4} 
            stroke={color} strokeWidth="6" fill="transparent"
            strokeDasharray={`${Math.PI * (size-8) * 0.75 * percent} ${Math.PI * (size-8)}`}
            transform={`rotate(135 ${size/2} ${size/2})`}
            className="opacity-80 group-hover:opacity-100 transition-opacity"
           />
        </svg>
        {/* The Knob Cap */}
        <div 
            className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-slate-700 bg-slate-800 flex items-center justify-center shadow-lg"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <div className="w-1 h-3 bg-white absolute top-1 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
        </div>
      </div>
      {label && <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{label}</span>}
    </div>
  );
};

// --- Fader Component ---
export const Fader: React.FC<FaderProps> = ({
  value,
  min = 0,
  max = 1,
  vertical = true,
  label,
  onChange,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = (clientX: number, clientY: number) => {
    if (!containerRef.current) return value;
    const rect = containerRef.current.getBoundingClientRect();
    let percent = 0;

    if (vertical) {
      const relativeY = clientY - rect.top;
      percent = 1 - (relativeY / rect.height); // bottom is 0
    } else {
      const relativeX = clientX - rect.left;
      percent = relativeX / rect.width; // left is 0
    }

    percent = Math.max(0, Math.min(1, percent));
    return min + percent * (max - min);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    onChange(calculateValue(e.clientX, e.clientY));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      onChange(calculateValue(e.clientX, e.clientY));
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const percent = (value - min) / (max - min);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        ref={containerRef}
        className={`relative bg-slate-800 rounded-lg cursor-pointer border border-slate-700 shadow-inner
          ${vertical ? 'w-10 h-48' : 'h-12 w-full'}
        `}
        onMouseDown={handleMouseDown}
      >
        {/* Track Line */}
        <div className={`absolute bg-slate-900 rounded opacity-50
            ${vertical 
              ? 'w-1 h-[90%] left-1/2 -translate-x-1/2 top-[5%]' 
              : 'h-1 w-[90%] top-1/2 -translate-y-1/2 left-[5%]'
            }
        `} />

        {/* Thumb */}
        <div 
          className="absolute bg-slate-300 border-2 border-slate-500 rounded shadow-xl hover:bg-white transition-colors"
          style={vertical ? {
            bottom: `${percent * 90 + 5}%`,
            left: '50%',
            transform: 'translate(-50%, 50%)',
            width: '80%',
            height: '24px'
          } : {
            left: `${percent * 90 + 5}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            height: '80%',
            width: '24px'
          }}
        >
          {/* Groove */}
          <div className={`absolute bg-slate-400
             ${vertical ? 'w-full h-[1px] top-1/2' : 'h-full w-[1px] left-1/2'}
          `} />
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-mono text-slate-400 uppercase">{label}</span>}
    </div>
  );
};
