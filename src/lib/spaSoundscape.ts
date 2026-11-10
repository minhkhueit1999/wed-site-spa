// Bộ tổng hợp thanh âm không gian Sả Spa bằng Web Audio API thuần (432Hz & Tiếng nước thiền định)
class SpaSoundscapeManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: NodeJS.Timeout | null = null;
  private waterSource: AudioBufferSourceNode | null = null;
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tiếng chuông xoay Tây Tạng tần số thiền định 432Hz
  private playTibetanBowl(freq = 432) {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Bồi âm hài hòa (harmonic)
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2.76, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.6); // Tiếng gõ êm ái
    gain.gain.exponentialRampToValueAtTime(0.001, now + 5.5); // Ngân vang kéo dài 5.5s

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 6.0);
    oscHarmonic.stop(now + 6.0);
  }

  // Tiếng suối nước róc rách nhẹ nhàng bằng Brownian Noise lọc dải thông
  private startWaterStream() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      const sample = (lastOut + 0.02 * white) / 1.02;
      lastOut = sample;
      data[i] = sample * 3.5; // Tăng biên độ brown noise
    }

    this.waterSource = this.ctx.createBufferSource();
    this.waterSource.buffer = buffer;
    this.waterSource.loop = true;

    // Lọc dải thông mô phỏng tiếng nước chảy
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const waterGain = this.ctx.createGain();
    waterGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    this.waterSource.connect(filter);
    filter.connect(waterGain);
    waterGain.connect(this.masterGain);

    this.waterSource.start();
  }

  public start() {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.startWaterStream();

    // Rung chuông 432Hz ban đầu, sau đó lặp lại ngẫu nhiên mỗi 8-12 giây
    this.playTibetanBowl(432);
    this.intervalId = setInterval(() => {
      if (this.isPlaying) {
        // Luân phiên các nốt ngũ cung thiền: 432Hz (Gốc), 324Hz, 540Hz
        const notes = [432, 324, 432, 540, 288];
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        this.playTibetanBowl(randomNote);
      }
    }, 9000);
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.waterSource) {
      try {
        this.waterSource.stop();
        this.waterSource.disconnect();
      } catch {
        // Bỏ qua lỗi ngắt nguồn
      }
      this.waterSource = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const spaSoundscape = new SpaSoundscapeManager();
