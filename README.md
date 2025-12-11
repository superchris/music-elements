# music-elements

Web components for music: a tone generator and metronome.

## Installation

```bash
npm install music-elements
```

## Usage

### Via npm/bundler

```js
// Import both components
import 'music-elements';

// Or import individually
import 'music-elements/tone-generator';
import 'music-elements/metronome';
```

### Via script tag

```html
<script type="module" src="https://unpkg.com/music-elements"></script>
```

## Components

### `<tone-generator>`

Generates a continuous sine wave tone at a specified frequency.

```html
<!-- Default 440 Hz (concert pitch A4) -->
<tone-generator></tone-generator>

<!-- Custom frequency -->
<tone-generator frequency="523.25"></tone-generator>

<!-- Auto-play on load -->
<tone-generator playing></tone-generator>
```

#### Attributes

| Attribute   | Type    | Default | Description                    |
|-------------|---------|---------|--------------------------------|
| `frequency` | number  | 440     | Frequency in Hz                |
| `playing`   | boolean | false   | Auto-start when connected      |

#### Properties

| Property    | Type    | Description                    |
|-------------|---------|--------------------------------|
| `frequency` | number  | Get/set frequency in Hz        |
| `playing`   | boolean | Whether tone is currently playing |

#### Methods

| Method     | Description              |
|------------|--------------------------|
| `start()`  | Start playing the tone   |
| `stop()`   | Stop playing the tone    |
| `toggle()` | Toggle play/stop         |

#### Events

| Event        | Detail        | Description           |
|--------------|---------------|-----------------------|
| `tone-start` | `{ frequency }` | Fired when tone starts |
| `tone-stop`  | -             | Fired when tone stops  |

### `<metro-nome>`

A metronome that emits clicks at a configurable BPM.

```html
<!-- Default 120 BPM -->
<metro-nome></metro-nome>

<!-- Custom BPM -->
<metro-nome bpm="90"></metro-nome>

<!-- Auto-start -->
<metro-nome bpm="140" playing></metro-nome>
```

#### Attributes

| Attribute | Type    | Default | Description                    |
|-----------|---------|---------|--------------------------------|
| `bpm`     | number  | 120     | Beats per minute               |
| `playing` | boolean | false   | Auto-start when connected      |

#### Properties

| Property  | Type    | Description                        |
|-----------|---------|------------------------------------|
| `bpm`     | number  | Get/set beats per minute           |
| `playing` | boolean | Whether metronome is currently running |

#### Methods

| Method     | Description                  |
|------------|------------------------------|
| `start()`  | Start the metronome          |
| `stop()`   | Stop the metronome           |
| `toggle()` | Toggle start/stop            |

#### Events

| Event             | Detail    | Description                |
|-------------------|-----------|----------------------------|
| `tick`            | `{ bpm }` | Fired on each beat         |
| `metronome-start` | `{ bpm }` | Fired when metronome starts |
| `metronome-stop`  | -         | Fired when metronome stops  |

## Examples

### JavaScript control

```js
const tone = document.querySelector('tone-generator');
const metronome = document.querySelector('metro-nome');

// Control tone
tone.start();
tone.frequency = 880; // Change to A5
tone.stop();

// Control metronome
metronome.start();
metronome.bpm = 100;
metronome.stop();

// Listen to events
tone.addEventListener('tone-start', (e) => {
  console.log(`Playing ${e.detail.frequency} Hz`);
});

metronome.addEventListener('tick', (e) => {
  console.log(`Tick at ${e.detail.bpm} BPM`);
});
```

### Dynamic BPM slider

```html
<metro-nome id="met"></metro-nome>
<input type="range" min="40" max="220" value="120"
       oninput="document.getElementById('met').bpm = this.value">
```

## License

MIT
