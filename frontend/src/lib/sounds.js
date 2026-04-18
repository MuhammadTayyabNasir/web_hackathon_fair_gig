// Simple sound effects system
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

export function playSound(type = 'click') {
  if (!audioContext) return;
  
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  switch (type) {
    case 'click':
      // Short, bright click
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
      
    case 'success':
      // Happy chime
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
      
    case 'hover':
      // Subtle hover sound
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
      
    case 'error':
      // Warning buzz
      osc.frequency.setValueAtTime(300, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
  }
}
