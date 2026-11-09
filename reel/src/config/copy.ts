/**
 * EXIST — all on-screen copy, in one place.
 *
 * French is the campaign language. Every line is short enough to be read in
 * under two seconds at the type sizes used, and no line makes a claim the
 * brand has not made: no price, no stock, no promotion, no delivery promise.
 *
 * `MASTER_COPY` and `CUTDOWN_COPY` differ deliberately — the cutdown is a
 * re-edit, so it says less per card, not the same thing faster.
 */

export const CAMPAIGN = {
  brand: "EXIST",
  collection: "Collection Cérémonie",
  filmTitle: "THE MOMENT IS YOURS",
  /** Official site. Used because no dedicated landing page is configured. */
  url: "www.exist.com.tn",
  /** Verified official category on the brand's site. */
  productUrl: "www.exist.com.tn/221-costumes-blazers",
  /** Required, honest label for an academic concept. */
  disclaimer: "Concept académique — non affilié à EXIST",
} as const;

export type SceneCopy = {
  invitation: { line1: string; line2?: string };
  details: { line1: string; line2?: string; caption?: string; caption2?: string };
  transformation: { line1: string; line2?: string };
  reveal: { line1: string; line2?: string };
  brand: { line1: string; line2: string; cta: string };
};

export const MASTER_COPY: SceneCopy = {
  invitation: { line1: "Certains moments", line2: "changent tout." },
  details: { line1: "Chaque détail", line2: "compte." },
  transformation: { line1: "Une allure.", line2: "Une présence." },
  reveal: { line1: "Soyez", line2: "le protagoniste." },
  brand: {
    line1: "Votre événement mérite",
    line2: "une allure exceptionnelle.",
    cta: "Découvrez la Collection Cérémonie",
  },
};

/**
 * The cutdown keeps the same lines for the two scenes that must survive a
 * silent, two-second attention window (the hook and the payoff) and drops the
 * second line where the section is shorter.
 */
export const CUTDOWN_COPY: SceneCopy = {
  invitation: { line1: "Certains moments", line2: "changent tout." },
  details: { line1: "Chaque détail", caption: "Chaque détail compte." },
  transformation: { line1: "Une allure.", line2: "Une présence." },
  reveal: { line1: "Soyez", line2: "le protagoniste." },
  brand: {
    line1: "Votre événement mérite",
    line2: "une allure exceptionnelle.",
    cta: "Découvrez la Collection Cérémonie",
  },
};

/**
 * Caption timing for the SRT delivered alongside the video.
 *
 * Times are absolute seconds and correspond exactly to the scene windows in
 * config/timeline.ts. Burned-in captions are the primary reading mechanism;
 * the SRT is for platforms and accessibility, so it mirrors the cards rather
 * than transcribing anything off-screen.
 */
export const MASTER_CAPTIONS: readonly { start: number; end: number; text: string }[] = [
  { start: 0.45, end: 3.75, text: "Certains moments changent tout." },
  { start: 4.55, end: 8.6, text: "Chaque détail compte." },
  { start: 9.6, end: 13.7, text: "Une allure. Une présence." },
  { start: 14.6, end: 19.6, text: "Soyez le protagoniste." },
  { start: 20.4, end: 24.8, text: "Votre événement mérite une allure exceptionnelle." },
  { start: 21.4, end: 24.8, text: "Découvrez la Collection Cérémonie — www.exist.com.tn" },
] as const;

export const CUTDOWN_CAPTIONS: readonly { start: number; end: number; text: string }[] = [
  { start: 0.15, end: 1.9, text: "Certains moments changent tout." },
  { start: 2.2, end: 4.8, text: "Chaque détail compte." },
  { start: 5.3, end: 8.3, text: "Une allure. Une présence." },
  { start: 8.8, end: 12.3, text: "Soyez le protagoniste." },
  { start: 12.8, end: 14.9, text: "Votre événement mérite une allure exceptionnelle." },
  { start: 13.3, end: 14.9, text: "Découvrez la Collection Cérémonie — www.exist.com.tn" },
] as const;
