class Metronome extends HTMLElement {
  static get observedAttributes() {
    return ['bpm', 'playing'];
  }

  constructor() {
    super();
    this.audioContext = null;
    this._isPlaying = false;
    this._intervalId = null;
    this._nextTickTime = 0;
    this._schedulerTimer = null;

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        .container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        button {
          background: #00d9ff;
          color: #1a1a2e;
          border: none;
          padding: 12px 24px;
          font-size: 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: #00b8d4;
        }
        button:active {
          transform: scale(0.98);
        }
        .bpm-display {
          font-family: monospace;
          font-size: 16px;
          color: #00d9ff;
        }
        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #333;
          transition: background 0.05s;
        }
        .indicator.flash {
          background: #00d9ff;
        }
      </style>
      <div class="container">
        <button>Start</button>
        <span class="bpm-display"></span>
        <div class="indicator"></div>
      </div>
    `;

    this._button = this.shadowRoot.querySelector('button');
    this._bpmDisplay = this.shadowRoot.querySelector('.bpm-display');
    this._indicator = this.shadowRoot.querySelector('.indicator');
    this._button.addEventListener('click', () => this.toggle());
    this._updateDisplay();
  }

  _updateButton() {
    if (this._button) {
      this._button.textContent = this._isPlaying ? 'Stop' : 'Start';
    }
  }

  _updateDisplay() {
    if (this._bpmDisplay) {
      this._bpmDisplay.textContent = `${this.bpm} BPM`;
    }
  }

  connectedCallback() {
    if (this.hasAttribute('playing')) {
      this.start();
    }
  }

  disconnectedCallback() {
    this.stop();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'bpm') {
      this._updateDisplay();
    }
    if (name === 'playing') {
      if (newValue !== null) {
        this.start();
      } else {
        this.stop();
      }
    }
  }

  get bpm() {
    return parseFloat(this.getAttribute('bpm')) || 120;
  }

  set bpm(value) {
    this.setAttribute('bpm', value);
  }

  get playing() {
    return this._isPlaying;
  }

  _playClick(time) {
    // Create a nice sounding click using a short sine wave burst with quick decay
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Use a higher frequency for a crisp click sound
    osc.frequency.setValueAtTime(1000, time);
    osc.type = 'sine';

    // Quick attack and decay for a percussive click
    gainNode.gain.setValueAtTime(0.5, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.05);

    // Flash the indicator
    const flashDelay = (time - this.audioContext.currentTime) * 1000;
    setTimeout(() => {
      this._indicator.classList.add('flash');
      setTimeout(() => this._indicator.classList.remove('flash'), 100);
      this.dispatchEvent(new CustomEvent('tick', { detail: { bpm: this.bpm } }));
    }, Math.max(0, flashDelay));
  }

  _scheduler() {
    // Schedule clicks ahead of time for precise timing
    const scheduleAheadTime = 0.1; // seconds to look ahead
    const intervalMs = (60 / this.bpm) * 1000;

    while (this._nextTickTime < this.audioContext.currentTime + scheduleAheadTime) {
      this._playClick(this._nextTickTime);
      this._nextTickTime += 60 / this.bpm;
    }

    this._schedulerTimer = setTimeout(() => this._scheduler(), 25);
  }

  start() {
    if (this._isPlaying) return;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this._nextTickTime = this.audioContext.currentTime;
    this._isPlaying = true;
    this._updateButton();
    this._scheduler();

    this.dispatchEvent(new CustomEvent('metronome-start', { detail: { bpm: this.bpm } }));
  }

  stop() {
    if (!this._isPlaying) return;

    if (this._schedulerTimer) {
      clearTimeout(this._schedulerTimer);
      this._schedulerTimer = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this._isPlaying = false;
    this._updateButton();
    this._indicator.classList.remove('flash');
    this.dispatchEvent(new CustomEvent('metronome-stop'));
  }

  toggle() {
    if (this._isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }
}

customElements.define('metro-nome', Metronome);
