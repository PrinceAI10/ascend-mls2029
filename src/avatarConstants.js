// avatarConstants.js
// ------------------------------------------------------------
// Small, shared constants from the student avatar system,
// extracted here so App.js (which defines the avatar picker)
// can read them without a circular import.
//
// Note: VITRO no longer reads from this file. The two VITRO
// scientists are fixed identities with their own palette,
// defined inside VitroScientistSvg in VitroView.jsx. That
// palette is deliberately not tied to the student's avatar.
//
// If a new skin tone or hair colour is ever added, add it
// here — App.js picks it up automatically.
// ------------------------------------------------------------

export const AVATAR_SKIN_TONES = ["#F5D0B0", "#C68642", "#6B4226"];
export const AVATAR_HAIR_COLORS = ["#1B1210", "#6B4226", "#D9A441"];

// Only the colours below are used by VITRO (as the outfit base
// colour under the gown). The full outfit shape (hoodie collar,
// blouse trim, etc.) stays in App.js's AVATAR_OUTFITS — VITRO
// does not try to reproduce those shapes, only the flat colour
// the student's outfit would show at the collar and sleeves.
//
// Source of truth: these hex values must match the armColor
// fields in AVATAR_OUTFITS inside App.js. Kept in sync by hand
// because outfits are more than colour (they have shapes too),
// and only the colour travels to the donning figure.
export const AVATAR_OUTFIT_COLORS = {
  labcoat: "#F4F6FA",
  hoodie: "#3B4A63",
  blouse: "#D85A7A",
  scrubs: "#4C6B5A",
};