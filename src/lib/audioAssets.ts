/**
 * Bundled audio masters (WAV placeholders until composer AAC ships).
 * Naming: {category}_{name}.wav — see assets/audio/README.md
 */

export const SOUND_SOURCES = {
  ui_tap: require("../../assets/audio/ui/ui_tap.wav"),
  ui_nav: require("../../assets/audio/ui/ui_nav.wav"),
  ui_toggle: require("../../assets/audio/ui/ui_toggle.wav"),
  ui_back: require("../../assets/audio/ui/ui_back.wav"),
  ui_confirm: require("../../assets/audio/ui/ui_confirm.wav"),
  ui_error: require("../../assets/audio/ui/ui_error.wav"),
  ui_locked: require("../../assets/audio/ui/ui_locked.wav"),
  ui_type: require("../../assets/audio/ui/ui_type.wav"),
  ui_sheet_open: require("../../assets/audio/ui/ui_sheet_open.wav"),
  ui_sheet_close: require("../../assets/audio/ui/ui_sheet_close.wav"),
  ui_fuel_tick: require("../../assets/audio/ui/ui_fuel_tick.wav"),
  ui_countdown_tick: require("../../assets/audio/ui/ui_countdown_tick.wav"),
  signal_transmit: require("../../assets/audio/ui/signal_transmit.wav"),
  signal_receive: require("../../assets/audio/ui/signal_receive.wav"),

  sig_fuel_earned: require("../../assets/audio/signature/sig_fuel_earned.wav"),
  sig_milestone: require("../../assets/audio/signature/sig_milestone.wav"),
  sig_signal_ready: require("../../assets/audio/signature/sig_signal_ready.wav"),
  sig_launch_day: require("../../assets/audio/signature/sig_launch_day.wav"),
  sig_launch_chime: require("../../assets/audio/signature/sig_launch_chime.wav"),
  sig_blueprint_complete: require("../../assets/audio/signature/sig_blueprint_complete.wav"),
  sig_cargo_saved: require("../../assets/audio/signature/sig_cargo_saved.wav"),
  sig_plan_unlock: require("../../assets/audio/signature/sig_plan_unlock.wav"),

  brand_stinger_launchdeck: require("../../assets/audio/brand/brand_stinger_launchdeck.wav"),

  ambient_deck_loop: require("../../assets/audio/ambient/ambient_deck_loop.wav"),
  ambient_foundry_loop: require("../../assets/audio/ambient/ambient_foundry_loop.wav"),
  ambient_launch_eve: require("../../assets/audio/ambient/ambient_launch_eve.wav"),
} as const;

export type SoundId = keyof typeof SOUND_SOURCES;

export type SignatureId =
  | "fuel_earned"
  | "milestone"
  | "signal_ready"
  | "launch_day"
  | "launch_chime"
  | "blueprint_complete"
  | "cargo_saved"
  | "plan_unlock";

export const SIGNATURE_SOUND: Record<SignatureId, SoundId> = {
  fuel_earned: "sig_fuel_earned",
  milestone: "sig_milestone",
  signal_ready: "sig_signal_ready",
  launch_day: "sig_launch_day",
  launch_chime: "sig_launch_chime",
  blueprint_complete: "sig_blueprint_complete",
  cargo_saved: "sig_cargo_saved",
  plan_unlock: "sig_plan_unlock",
};

export type AmbientTrack = "deck" | "foundry" | "launch_eve";

export const AMBIENT_SOUND: Record<AmbientTrack, SoundId> = {
  deck: "ambient_deck_loop",
  foundry: "ambient_foundry_loop",
  launch_eve: "ambient_launch_eve",
};
