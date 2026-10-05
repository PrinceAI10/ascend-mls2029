// avatarConstants.js
// ------------------------------------------------------------
// Small, shared constants from the avatar system, extracted
// here so both App.js (which defines the avatar picker) and
// VitroView.jsx (which draws the student's avatar on the
// donning bench) can read the same source of truth without
// importing from each other and creating a circular import.
//
// If a new skin tone or hair colour is ever added, add it
// here — App.js and VITRO both pick it up automatically.
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