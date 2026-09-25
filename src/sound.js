let audioCtx = null;

function getContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

export function playClickSound() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(920, now);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

export function playSwipeSound() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}
export function playNotificationSound() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const notes = [
    { frequency: 784, start: 0, duration: 0.14 },
    { frequency: 988, start: 0.12, duration: 0.22 },
  ];

  notes.forEach(({ frequency, start, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(
      frequency,
      now + start
    );

    gain.gain.setValueAtTime(
      0.0001,
      now + start
    );

    gain.gain.exponentialRampToValueAtTime(
      0.16,
      now + start + 0.015
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + start + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + start);
    osc.stop(now + start + duration + 0.02);
  });
}

export function playOrderStatusSound() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const notes = [
    { frequency: 659.25, start: 0, duration: 0.13 },
    { frequency: 783.99, start: 0.11, duration: 0.13 },
    { frequency: 987.77, start: 0.22, duration: 0.23 },
  ];

  notes.forEach(({ frequency, start, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(
      frequency,
      now + start
    );

    gain.gain.setValueAtTime(
      0.0001,
      now + start
    );

    gain.gain.exponentialRampToValueAtTime(
      0.14,
      now + start + 0.015
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + start + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + start);
    osc.stop(now + start + duration + 0.02);
  });
}

export function playPointsSound() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const notes = [
    { frequency: 1046.5, start: 0, duration: 0.10 },
    { frequency: 1318.51, start: 0.09, duration: 0.12 },
    { frequency: 1567.98, start: 0.20, duration: 0.20 },
  ];

  notes.forEach(({ frequency, start, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(
      frequency,
      now + start
    );

    gain.gain.setValueAtTime(
      0.0001,
      now + start
    );

    gain.gain.exponentialRampToValueAtTime(
      0.11,
      now + start + 0.012
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + start + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + start);
    osc.stop(now + start + duration + 0.02);
  });
}

export function playSuccessSound() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";

  osc.frequency.setValueAtTime(
    520,
    now
  );

  osc.frequency.exponentialRampToValueAtTime(
    820,
    now + 0.16
  );

  gain.gain.setValueAtTime(
    0.0001,
    now
  );

  gain.gain.exponentialRampToValueAtTime(
    0.12,
    now + 0.015
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.20
  );

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}
