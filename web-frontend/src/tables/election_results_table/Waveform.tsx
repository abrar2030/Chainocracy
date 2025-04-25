import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps {
  url: string;
}

const Waveform: React.FC<WaveformProps> = ({ url }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (waveformRef.current) {
      const waveSurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        height: 100,
        cursorWidth: 1,
        cursorColor: 'lightgray',
        barWidth: 2,
        barGap: 1,
        responsive: true,
      });

      waveSurfer.load(url);
      
      waveSurfer.on('ready', () => {
        waveSurferRef.current = waveSurfer;
      });

      waveSurfer.on('play', () => {
        setIsPlaying(true);
      });

      waveSurfer.on('pause', () => {
        setIsPlaying(false);
      });

      return () => {
        waveSurfer.destroy();
      };
    }
  }, [url]);

  const handlePlayPause = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
    }
  };

  return (
    <div>
      <div ref={waveformRef} />
      <button onClick={handlePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default Waveform;
