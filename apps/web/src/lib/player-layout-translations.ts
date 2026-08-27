import type { DefaultLayoutTranslations } from "@vidstack/react/player/layouts/default";
import { m } from "../paraglide/messages.js";
import type { Locale } from "../paraglide/runtime.js";

export function playerLayoutTranslations(locale: Locale): Partial<DefaultLayoutTranslations> {
  const options = { locale } as const;
  return {
    Accessibility: m.player_accessibility({}, options),
    Announcements: m.player_announcements({}, options),
    Audio: m.player_audio({}, options),
    Auto: m.player_auto({}, options),
    Boost: m.player_boost({}, options),
    Captions: m.settings_subtitle_default_label({}, options),
    "Caption Styles": m.player_caption_styles({}, options),
    Chapters: m.player_chapters({}, options),
    "Closed-Captions Off": m.player_closed_captions_off({}, options),
    "Closed-Captions On": m.player_closed_captions_on({}, options),
    Continue: m.player_continue({}, options),
    Default: m.player_default({}, options),
    Disabled: m.player_disabled({}, options),
    Download: m.watch_download({}, options),
    "Enter Fullscreen": m.player_enter_fullscreen({}, options),
    "Enter PiP": m.player_enter_pip({}, options),
    "Exit Fullscreen": m.player_exit_fullscreen({}, options),
    "Exit PiP": m.player_exit_pip({}, options),
    Fullscreen: m.player_fullscreen({}, options),
    "Keyboard Animations": m.player_keyboard_animations({}, options),
    Loop: m.player_loop({}, options),
    Mute: m.player_mute({}, options),
    Normal: m.player_normal({}, options),
    Off: m.player_off({}, options),
    Pause: m.player_pause({}, options),
    Play: m.player_play({}, options),
    Playback: m.player_playback({}, options),
    Quality: m.player_quality({}, options),
    Replay: m.player_replay({}, options),
    Reset: m.player_reset({}, options),
    Seek: m.player_seek({}, options),
    "Seek Backward": m.player_seek_backward({}, options),
    "Seek Forward": m.player_seek_forward({}, options),
    Settings: m.player_settings({}, options),
    "Skip To Live": m.player_skip_to_live({}, options),
    Speed: m.player_speed({}, options),
    Track: m.player_track({}, options),
    Unmute: m.player_unmute({}, options),
    Volume: m.player_volume({}, options),
  };
}
