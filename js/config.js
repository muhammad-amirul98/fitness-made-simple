// Paste the Web App URL from your Apps Script deployment here (see README).
// Leave as-is until deployed — the form will fall back to a friendly message.
const CONTACT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzLD23XbnHfqKMlLKaSAF9kfaR62t5dAcfnYEzQJXp-fiK_GRzxPHgGaZSMU4QfgXzijQ/exec";

// Set to true to show a coach photo (assets/coach-gym.jpg) in the "About your
// coach" section. Leave false to keep the site text-only, no layout change.
const SHOW_COACH_PHOTO = true;

// Which offerings are currently bookable — toggle these to match reality
// (e.g. turn online coaching off while it hasn't started yet).
// Each flag hides its pricing card, "what's included" block, and package
// dropdown option everywhere on the site.
var SHOW_ONLINE_COACHING = true;
var SHOW_EXTERNAL_TRAINING = true;
var SHOW_STUDIO_TRAINING = false;

// The welcome offers shown on referred.html (the page existing clients share
// with friends). Edit these to change the offer everywhere it's used.
const REFERRAL_OFFER_ONLINE = "half price for your first month";
const REFERRAL_OFFER_EXTERNAL = "one extra session free with any package";
const REFERRAL_OFFER_STUDIO = "one extra session free with any package";
