import type { DefaultLayoutTranslations } from "@vidstack/react/player/layouts/default";
import type { Locale } from "../paraglide/runtime.js";

const ENGLISH: Partial<DefaultLayoutTranslations> = { Captions: "Subtitles" };

const FRENCH: Partial<DefaultLayoutTranslations> = {
  Accessibility: "Accessibilité",
  Announcements: "Annonces",
  Audio: "Audio",
  Auto: "Auto",
  Boost: "Amplifier",
  Captions: "Sous-titres",
  "Caption Styles": "Style des sous-titres",
  Chapters: "Chapitres",
  "Closed-Captions Off": "Sous-titres désactivés",
  "Closed-Captions On": "Sous-titres activés",
  Continue: "Continuer",
  Default: "Par défaut",
  Disabled: "Désactivé",
  Download: "Télécharger",
  "Enter Fullscreen": "Passer en plein écran",
  "Enter PiP": "Activer l'image dans l'image",
  "Exit Fullscreen": "Quitter le plein écran",
  "Exit PiP": "Quitter l'image dans l'image",
  Fullscreen: "Plein écran",
  "Keyboard Animations": "Animations au clavier",
  Loop: "Boucle",
  Mute: "Couper le son",
  Normal: "Normale",
  Off: "Désactivé",
  Pause: "Pause",
  Play: "Lecture",
  Playback: "Lecture",
  Quality: "Qualité",
  Replay: "Rejouer",
  Reset: "Réinitialiser",
  Seek: "Navigation",
  "Seek Backward": "Reculer",
  "Seek Forward": "Avancer",
  Settings: "Réglages",
  "Skip To Live": "Revenir au direct",
  Speed: "Vitesse",
  Track: "Piste",
  Unmute: "Rétablir le son",
  Volume: "Volume",
};

export function playerLayoutTranslations(locale: Locale): Partial<DefaultLayoutTranslations> {
  return locale === "fr" ? FRENCH : ENGLISH;
}
