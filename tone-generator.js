class ToneGenerator extends HTMLElement {
  static get observedAttributes() {
    return ['frequency', 'playing'];
  }

  constructor() {
    super();
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
    this._isPlaying = false;

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
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
      </style>
      <button>Start</button>
    `;

    this._button = this.shadowRoot.querySelector('button');
    this._button.addEventListener('click', () => this.toggle());
  }

  _updateButton() {
    if (this._button) {
      this._button.textContent = this._isPlaying ? 'Stop' : 'Start';
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
    if (name === 'frequency' && this.oscillator) {
      this.oscillator.frequency.setValueAtTime(
        this.frequency,
        this.audioContext.currentTime
      );
    }
    if (name === 'playing') {
      if (newValue !== null) {
        this.start();
      } else {
        this.stop();
      }
    }
  }

  get frequency() {
    return parseFloat(this.getAttribute('frequency')) || 440;
  }

  set frequency(value) {
    this.setAttribute('frequency', value);
  }

  get playing() {
    return this._isPlaying;
  }

  start() {
    if (this._isPlaying) return;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);
    this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.oscillator.start();
    this._isPlaying = true;
    this._updateButton();

    this.dispatchEvent(new CustomEvent('tone-start', { detail: { frequency: this.frequency } }));
  }

  stop() {
    if (!this._isPlaying) return;

    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this._isPlaying = false;
    this._updateButton();
    this.dispatchEvent(new CustomEvent('tone-stop'));
  }

  toggle() {
    if (this._isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }
}

customElements.define('tone-generator', ToneGenerator);
