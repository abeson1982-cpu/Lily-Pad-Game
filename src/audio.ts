// High-Quality Upbeat Synthesizer & Music Engine for Frog Pond Game
class AudioManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private musicAudio: HTMLAudioElement | null = null;
  private isMusicPlaying: boolean = false;
  private sfxGainNode: GainNode | null = null;

  constructor() {
    // Generate the upbeat looping soundtrack immediately
    if (typeof window !== 'undefined') {
      try {
        const wavUrl = this.generateUpbeatTrackWavUrl();
        this.musicAudio = new Audio(wavUrl);
        this.musicAudio.loop = true;
        this.musicAudio.volume = 0.55;
      } catch (err) {
        console.warn('Failed to generate upbeat WAV music:', err);
      }

      // Automatically unlock audio on first user interaction anywhere
      const unlock = () => {
        this.init();
        if (this.musicAudio && !this.isMuted && this.isMusicPlaying) {
          this.musicAudio.play().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };

      window.addEventListener('pointerdown', unlock);
      window.addEventListener('keydown', unlock);
      window.addEventListener('touchstart', unlock);
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.65, this.ctx.currentTime);
      this.sfxGainNode.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Generate an upbeat, energetic 132 BPM pop/ska frog pond track in 16-bit PCM WAV
  private generateUpbeatTrackWavUrl(): string {
    const sampleRate = 22050;
    const bpm = 132;
    const beatSec = 60 / bpm; // ~0.4545s per beat
    const numBeats = 16; // 4 measures of 4/4
    const totalSec = numBeats * beatSec; // ~7.2727 seconds
    const totalSamples = Math.floor(sampleRate * totalSec);
    const buffer = new Float32Array(totalSamples);

    // Note frequency map (in Hz)
    const N: { [key: string]: number } = {
      C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, A5: 880.00, B5: 987.77,
      C6: 1046.50
    };

    // Helper: Add sound to buffer with bounds check
    const mix = (startSample: number, durationSample: number, fn: (t: number, i: number) => number) => {
      const end = Math.min(totalSamples, startSample + durationSample);
      for (let i = startSample; i < end; i++) {
        const t = (i - startSample) / sampleRate;
        buffer[i] += fn(t, i - startSample);
      }
    };

    // 1. DRUMS & PERCUSSION
    for (let beat = 0; beat < numBeats; beat++) {
      const beatStart = Math.floor(beat * beatSec * sampleRate);

      // Punchy Kick Drum on every beat (4-on-the-floor energy)
      mix(beatStart, Math.floor(sampleRate * 0.14), (t) => {
        const freq = 45 + 120 * Math.exp(-t * 40);
        const env = Math.exp(-t * 26);
        return Math.sin(2 * Math.PI * freq * t) * env * 0.42;
      });

      // Snare / Clap on beats 2 & 4 of each bar (beats 1, 3, 5, 7, 9, 11, 13, 15)
      if (beat % 2 === 1) {
        mix(beatStart, Math.floor(sampleRate * 0.16), (t) => {
          const noise = (Math.random() * 2 - 1) * Math.exp(-t * 24);
          const tone = Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 30);
          return (noise * 0.28 + tone * 0.14);
        });
      }

      // Crisp Hi-Hat / Shaker (16th notes: 4 ticks per beat)
      for (let step = 0; step < 4; step++) {
        const hatStart = beatStart + Math.floor(step * (beatSec / 4) * sampleRate);
        const isOpen = step === 2; // Open hat on offbeat
        const dur = isOpen ? 0.08 : 0.035;
        const vol = isOpen ? 0.14 : 0.07;
        mix(hatStart, Math.floor(sampleRate * dur), (t) => {
          const noise = (Math.random() * 2 - 1);
          return noise * Math.exp(-t * (isOpen ? 35 : 85)) * vol;
        });
      }
    }

    // 2. UPBEAT OFFBEAT CHORDS (Bouncy Ska / Tropical Caribbean Piano)
    // Chords on steps 1 and 3 of each beat (the offbeats)
    const chordProgressions: Array<number[]> = [
      [N.C4, N.E4, N.G4], // Bar 1: C Major
      [N.G3, N.B3, N.D4], // Bar 2: G Major
      [N.A3, N.C4, N.E4], // Bar 3: A Minor
      [N.F3, N.A3, N.C4], // Bar 4: F Major
    ];

    for (let bar = 0; bar < 4; bar++) {
      const chord = chordProgressions[bar];
      for (let beatInBar = 0; beatInBar < 4; beatInBar++) {
        const beatNum = bar * 4 + beatInBar;
        // Offbeat 8th note: halfway through each beat
        const offbeatStart = Math.floor((beatNum + 0.5) * beatSec * sampleRate);
        chord.forEach((freq) => {
          mix(offbeatStart, Math.floor(sampleRate * 0.13), (t) => {
            const osc1 = Math.sin(2 * Math.PI * freq * t);
            const osc2 = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq * t));
            const env = Math.exp(-t * 18);
            return (osc1 * 0.6 + osc2 * 0.4) * env * 0.09;
          });
        });
      }
    }

    // 3. BOUNCY FUNKY BASSLINE (Octave-jumping, energetic groove)
    const bassRiffs: Array<Array<{ beat: number; note: number; dur: number }>> = [
      // Bar 1 - C
      [
        { beat: 0, note: N.C2, dur: 0.22 }, { beat: 0.75, note: N.C3, dur: 0.18 },
        { beat: 1.5, note: N.C2, dur: 0.2 }, { beat: 2, note: N.E2, dur: 0.2 },
        { beat: 2.75, note: N.G2, dur: 0.18 }, { beat: 3.5, note: N.B2, dur: 0.18 },
      ],
      // Bar 2 - G
      [
        { beat: 0, note: N.G2, dur: 0.22 }, { beat: 0.75, note: N.G3, dur: 0.18 },
        { beat: 1.5, note: N.G2, dur: 0.2 }, { beat: 2, note: N.B2, dur: 0.2 },
        { beat: 2.75, note: N.D3, dur: 0.18 }, { beat: 3.5, note: N.G2, dur: 0.18 },
      ],
      // Bar 3 - Am
      [
        { beat: 0, note: N.A2, dur: 0.22 }, { beat: 0.75, note: N.A3, dur: 0.18 },
        { beat: 1.5, note: N.A2, dur: 0.2 }, { beat: 2, note: N.C3, dur: 0.2 },
        { beat: 2.75, note: N.E3, dur: 0.18 }, { beat: 3.5, note: N.G2, dur: 0.18 },
      ],
      // Bar 4 - F (leading back to C)
      [
        { beat: 0, note: N.F2, dur: 0.22 }, { beat: 0.75, note: N.F3, dur: 0.18 },
        { beat: 1.5, note: N.F2, dur: 0.2 }, { beat: 2, note: N.A2, dur: 0.2 },
        { beat: 2.75, note: N.C3, dur: 0.18 }, { beat: 3.5, note: N.D3, dur: 0.18 },
      ],
    ];

    bassRiffs.forEach((barRiff, barIndex) => {
      barRiff.forEach(({ beat, note, dur }) => {
        const start = Math.floor((barIndex * 4 + beat) * beatSec * sampleRate);
        mix(start, Math.floor(sampleRate * dur), (t) => {
          // Bouncy pitch glide on attack
          const f = note * (1 + 0.3 * Math.exp(-t * 60));
          const osc = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * f * t));
          const sub = Math.sin(2 * Math.PI * note * t);
          const env = Math.exp(-t * (1 / dur * 2.5));
          return (osc * 0.18 + sub * 0.14) * env;
        });
      });
    });

    // 4. CATCHY UPBEAT LEAD MELODY (Joyful Marimba & Whistle Lead)
    const leadNotes: Array<{ bar: number; beat: number; note: number; dur: number }> = [
      // Bar 1 - C (Catchy upbeat leap)
      { bar: 0, beat: 0, note: N.E5, dur: 0.24 },
      { bar: 0, beat: 0.75, note: N.G5, dur: 0.24 },
      { bar: 0, beat: 1.5, note: N.E5, dur: 0.2 },
      { bar: 0, beat: 2, note: N.D5, dur: 0.2 },
      { bar: 0, beat: 2.5, note: N.C5, dur: 0.2 },
      { bar: 0, beat: 3, note: N.D5, dur: 0.2 },
      { bar: 0, beat: 3.5, note: N.E5, dur: 0.24 },

      // Bar 2 - G
      { bar: 1, beat: 0, note: N.D5, dur: 0.24 },
      { bar: 1, beat: 0.75, note: N.G5, dur: 0.24 },
      { bar: 1, beat: 1.5, note: N.Fs5, dur: 0.2 },
      { bar: 1, beat: 2, note: N.D5, dur: 0.2 },
      { bar: 1, beat: 2.5, note: N.B4, dur: 0.2 },
      { bar: 1, beat: 3, note: N.C5, dur: 0.2 },
      { bar: 1, beat: 3.5, note: N.D5, dur: 0.24 },

      // Bar 3 - Am
      { bar: 2, beat: 0, note: N.C5, dur: 0.24 },
      { bar: 2, beat: 0.75, note: N.E5, dur: 0.24 },
      { bar: 2, beat: 1.5, note: N.A5, dur: 0.28 },
      { bar: 2, beat: 2.25, note: N.G5, dur: 0.2 },
      { bar: 2, beat: 2.75, note: N.E5, dur: 0.2 },
      { bar: 2, beat: 3.25, note: N.D5, dur: 0.2 },
      { bar: 2, beat: 3.5, note: N.C5, dur: 0.2 },

      // Bar 4 - F (Exciting ascending resolution)
      { bar: 3, beat: 0, note: N.D5, dur: 0.2 },
      { bar: 3, beat: 0.5, note: N.E5, dur: 0.2 },
      { bar: 3, beat: 1, note: N.F5, dur: 0.2 },
      { bar: 3, beat: 1.5, note: N.G5, dur: 0.2 },
      { bar: 3, beat: 2, note: N.A5, dur: 0.2 },
      { bar: 3, beat: 2.5, note: N.B5, dur: 0.2 },
      { bar: 3, beat: 3, note: N.C6, dur: 0.35 },
      { bar: 3, beat: 3.5, note: N.G5, dur: 0.24 },
    ];

    leadNotes.forEach(({ bar, beat, note, dur }) => {
      const start = Math.floor((bar * 4 + beat) * beatSec * sampleRate);
      mix(start, Math.floor(sampleRate * dur), (t) => {
        // Vibrato on sustained lead notes
        const vibrato = 1 + 0.015 * Math.sin(2 * Math.PI * 6.5 * t);
        const f = note * vibrato;
        // Mallet fundamental + wooden harmonic overtone (ratio 3.9)
        const fundamental = Math.sin(2 * Math.PI * f * t);
        const overtone = Math.sin(2 * Math.PI * f * 3.9 * t) * Math.exp(-t * 40);
        const env = Math.exp(-t * (1 / dur * 2.8));
        return (fundamental * 0.16 + overtone * 0.06) * env;
      });
    });

    // 5. MASTERING: Soft Clipper & Limiter to keep it loud, warm, and distortion-free
    for (let i = 0; i < totalSamples; i++) {
      // Soft saturation curve (tanh)
      buffer[i] = Math.tanh(buffer[i] * 1.5) * 0.88;
    }

    // 6. ENCODE INTO 16-BIT PCM WAV
    const bytesPerSample = 2;
    const dataSize = totalSamples * bytesPerSample;
    const wavBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(wavBuffer);

    // Write RIFF header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // ChunkSize
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * bytesPerSample, true); // ByteRate
    view.setUint16(32, bytesPerSample, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, dataSize, true); // Subchunk2Size

    // Write 16-bit PCM samples
    let offset = 44;
    for (let i = 0; i < totalSamples; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      const intVal = s < 0 ? s * 0x8000 : s * 0x7FFF;
      view.setInt16(offset, intVal, true);
      offset += 2;
    }

    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // --- AUDIO CONTROLS ---

  playMusic() {
    this.isMusicPlaying = true;
    this.init();
    if (this.musicAudio && !this.isMuted) {
      this.musicAudio.currentTime = this.musicAudio.currentTime || 0;
      this.musicAudio.play().catch((err) => {
        // Autoplay policy: will resume on user gesture
        console.log('Audio autoplay waiting for user interaction:', err);
      });
    }
  }

  pauseMusic() {
    this.isMusicPlaying = false;
    if (this.musicAudio) {
      this.musicAudio.pause();
    }
  }

  stopMusic() {
    this.pauseMusic();
    if (this.musicAudio) {
      this.musicAudio.currentTime = 0;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.init();

    if (this.musicAudio) {
      this.musicAudio.muted = this.isMuted;
      if (!this.isMuted && this.isMusicPlaying) {
        this.musicAudio.play().catch(() => {});
      }
    }

    if (this.ctx && this.sfxGainNode) {
      this.sfxGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.65, this.ctx.currentTime);
    }

    return this.isMuted;
  }

  // --- SOUND EFFECTS ---

  playJump(characterType: 'crocodile' | 'frog' | 'duck' = 'frog') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (characterType === 'duck') {
        // Playful duckling quack-hop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.07);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.16);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.linearRampToValueAtTime(0.36, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      } else if (characterType === 'crocodile') {
        // Deep snappy crocodile spring
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.06);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.15);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.linearRampToValueAtTime(0.32, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      } else {
        // Buoyant classic frog hop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(290, now + 0.16);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.38, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      }

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }

  playFish() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    try {
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(980, now + 0.1);
      gain1.gain.setValueAtTime(0.32, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain1);
      gain1.connect(this.sfxGainNode);
      osc1.start(now);
      osc1.stop(now + 0.14);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1046.5, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.18);
      gain2.gain.setValueAtTime(0.25, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.sfxGainNode);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.28);
    } catch {
      // Ignore
    }
  }

  playGameOver() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    try {
      const now = this.ctx.currentTime;
      
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, now);
      filter.frequency.exponentialRampToValueAtTime(160, now + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGainNode);

      noise.start(now);
      noise.stop(now + 0.45);

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.35);
      oscGain.gain.setValueAtTime(0.25, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(oscGain);
      oscGain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignore
    }
  }
}

export const audioManager = new AudioManager();
