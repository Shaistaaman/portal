/**
 * Shared gallery image pool.
 *
 * The original Next.js app referenced 13 paths under `/src/assets/images/...`
 * which never existed in `public/` — they rendered as broken images in both
 * the property and experience data. Each former reference is remapped here
 * onto a real file in `public/images`, so there is a single place to swap in
 * the final photography later.
 */
export const IMG = {
  // somuch/* — genuinely present in the original app
  go: "/images/somuch/go.png",
  great: "/images/somuch/great.png",
  rome: "/images/somuch/rome.png",
  final: "/images/somuch/final.png",

  // remapped from the former /src/assets/images/* references
  romePenthouse: "/images/exp/1.jpg", // discover_rome_penthouse
  romeRoof: "/images/exp/2.jpg", // insta_rome_roof
  curatedInterior: "/images/exp/3.jpg", // discover_curated_interior
  palazzoBath: "/images/exp/4.jpg", // discover_palazzo_bath
  italyProperty: "/images/exp/5.jpg", // cta_italy_property
  coastalTown: "/images/exp/6.jpg", // discover_coastal_town
  nightWaterfront: "/images/exp/7.jpg", // discover_night_waterfront
  florenceSuite: "/images/exp/8.jpg", // discover_florence_suite
  tuscanDining: "/images/exp/9.jpg", // discover_tuscan_dining
  lakeComo: "/images/exp/10.jpg", // discover_lake_como
  florenceSkyline: "/images/guestsPO.jpg", // florence_sunset_skyline
  aboutSky: "/images/somuch/rome.png", // insta_about_sky
  tuscany: "/images/somuch/great.png", // insta_tuscany
} as const;
