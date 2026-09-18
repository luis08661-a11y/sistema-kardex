// Sonido al agregar un producto al carrito del POS.
// Usa Web Audio API (sin assets) y respeta la política de autoplay: el contexto
// se crea/desbloquea con el primer gesto del usuario (clic o teclado).
let contexto: AudioContext | null = null;

function obtenerContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!contexto) contexto = new AudioCtx();
  if (contexto.state === "suspended") void contexto.resume();
  return contexto;
}

export function reproducirSonidoAgregarCarrito(): void {
  const audio = obtenerContexto();
  if (!audio) return;

  const ahora = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ahora);
  osc.frequency.exponentialRampToValueAtTime(1568, ahora + 0.05);

  gain.gain.setValueAtTime(0.0001, ahora);
  gain.gain.exponentialRampToValueAtTime(0.14, ahora + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.16);

  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(ahora);
  osc.stop(ahora + 0.18);
}