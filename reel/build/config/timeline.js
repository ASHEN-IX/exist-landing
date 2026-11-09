"use strict";
/**
 * EXIST — Collection Cérémonie · timeline.
 *
 * Scene durations, on-screen copy and the audio cue sheet live here so the edit
 * can be retimed without touching a scene component.
 *
 * All times are in seconds. Frames are derived from FPS at module load, which
 * keeps the 25 s master and the re-cut 15 s cutdown in sync with one source.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUES = exports.CUTDOWN_FRAMES = exports.MASTER_FRAMES = exports.totalFrames = exports.CUTDOWN = exports.MASTER = exports.f = exports.HEIGHT = exports.WIDTH = exports.FPS = void 0;
exports.FPS = 30;
exports.WIDTH = 1080;
exports.HEIGHT = 1920;
/** Seconds → whole frames. Rounds so a 4 s scene is exactly 120 frames. */
const f = (seconds) => Math.round(seconds * exports.FPS);
exports.f = f;
/**
 * MASTER — 25 seconds / 750 frames.
 *
 * The beats are sized to the soundtrack: a slow ambient open, a rhythmic
 * detail section, a hard impact at the transformation, the hero reveal
 * carrying the longest hold, and a resolved brand outro.
 */
exports.MASTER = [
    {
        id: "invitation",
        label: "01 · THE INVITATION",
        from: 0,
        duration: 4,
        copy: "Certains moments",
        subcopy: "changent tout.",
    },
    {
        id: "details",
        label: "02 · THE DETAILS",
        from: 4,
        duration: 5,
        copy: "Chaque détail",
        subcopy: "compte.",
    },
    {
        id: "transformation",
        label: "03 · THE TRANSFORMATION",
        from: 9,
        duration: 5,
        copy: "Une allure.",
        subcopy: "Une présence.",
    },
    {
        id: "reveal",
        label: "04 · THE REVEAL",
        from: 14,
        duration: 6,
        copy: "Soyez",
        subcopy: "le protagoniste.",
    },
    {
        id: "brand",
        label: "05 · THE BRAND",
        from: 20,
        duration: 5,
        copy: "Votre événement mérite",
        subcopy: "une allure exceptionnelle.",
    },
];
/**
 * CUTDOWN — 15 seconds / 450 frames.
 *
 * This is a deliberate re-edit, not a truncation:
 *  - the invitation is compressed to a single 2 s hook (the strongest frame,
 *    pushed in hard, with one line instead of two);
 *  - the detail section loses two of its four macros and plays as a 3 s
 *    triplet on the beat;
 *  - the transformation keeps its impact but cuts in faster;
 *  - the reveal gains a second of hold — it is the emotional payoff;
 *  - the outro keeps the logo and CTA but drops the long build.
 *
 * Copy changes too: the cutdown says less per card so each card can be read
 * by a thumb-scrolling viewer in under two seconds.
 */
exports.CUTDOWN = [
    {
        id: "invitation",
        label: "01 · THE INVITATION",
        from: 0,
        duration: 2,
        copy: "Certains moments",
        subcopy: "changent tout.",
    },
    {
        id: "details",
        label: "02 · THE DETAILS",
        from: 2,
        duration: 3,
        copy: "Chaque détail compte.",
    },
    {
        id: "transformation",
        label: "03 · THE TRANSFORMATION",
        from: 5,
        duration: 3.5,
        copy: "Une allure.",
        subcopy: "Une présence.",
    },
    {
        id: "reveal",
        label: "04 · THE REVEAL",
        from: 8.5,
        duration: 4,
        copy: "Soyez",
        subcopy: "le protagoniste.",
    },
    {
        id: "brand",
        label: "05 · THE BRAND",
        from: 12.5,
        duration: 2.5,
        copy: "Votre événement mérite",
        subcopy: "une allure exceptionnelle.",
    },
];
const totalFrames = (scenes) => (0, exports.f)(scenes[scenes.length - 1].from + scenes[scenes.length - 1].duration);
exports.totalFrames = totalFrames;
exports.MASTER_FRAMES = (0, exports.totalFrames)(exports.MASTER); // 750
exports.CUTDOWN_FRAMES = (0, exports.totalFrames)(exports.CUTDOWN); // 450
/**
 * AUDIO CUE SHEET.
 *
 * The bed is generated procedurally (see tools/build-audio.mjs) because no
 * licensed track is available offline. Each cue is a musical event the scene
 * choreography must land on; the scene components read these same numbers, so
 * a retime moves picture and sound together.
 */
exports.CUES = {
    /** First frame of the ambient pad and the ticking clock. */
    ambientIn: 0,
    /** Pulse enters — the detail section starts cutting on these hits. */
    pulseIn: 4,
    /** The hard impact under the jacket fill / match cut. */
    impact: 11.35,
    /** The reveal begins on the downbeat after impact. */
    reveal: 14,
    /** Everything drops to a sustained chord for the brand card. */
    resolve: 20,
    /** Logo sting plus the final red rule. */
    sting: 21.2,
    /** Tail fade — the bed is silent from here. */
    out: 24.6,
};
