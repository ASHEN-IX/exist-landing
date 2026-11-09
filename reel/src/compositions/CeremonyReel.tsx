/**
 * EXIST — Ceremony Reel compositions.
 *
 * Two deliverables share one scene set and one timeline config:
 *
 *   master   25 s / 750 frames — the full cut.
 *   cutdown  15 s / 450 frames — a deliberate re-edit (different scene
 *            durations *and* different copy), not a truncation.
 *
 * Scene order, transitions and copy all come from config/, so retiming either
 * reel never touches a scene file.
 */
import React from "react";
import { CAMPAIGN, CUTDOWN_COPY, MASTER_COPY } from "../config/copy";
import {
  CUTDOWN,
  CUTDOWN_FRAMES,
  FPS,
  HEIGHT,
  MASTER,
  MASTER_FRAMES,
  Scene,
  WIDTH,
  f,
} from "../config/timeline";
import { Sequence } from "../lib/composition";
import { BrandOutro } from "../scenes/BrandOutro";
import { Details } from "../scenes/Details";
import { Invitation } from "../scenes/Invitation";
import { Reveal } from "../scenes/Reveal";
import { Transformation } from "../scenes/Transformation";

export type ReelProps = { publicDir: string };

export type ReelDefinition = {
  id: "master" | "cutdown";
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  scenes: readonly Scene[];
  component: React.FC<ReelProps>;
};

/**
 * A scene's absolute start, in frames, taken from the timeline rather than
 * from a hand-written offset — so a duration change propagates everywhere.
 */
const at = (scene: Scene): number => f(scene.from);

const lengths = (scenes: readonly Scene[]): number[] =>
  scenes.map((s) => f(s.duration));

/**
 * The master cut.
 *
 * The cuts are hard — this is a fashion film, and a dissolve between a macro
 * and a garment would read as a template. What joins the scenes instead is
 * the match: each section ends on darkness or on a full-bleed fabric surface,
 * and the next opens on the same value.
 */
const MasterReel: React.FC<ReelProps> = ({ publicDir }) => {
  const [inv, det, tr, rv, br] = MASTER;
  const len = lengths(MASTER);

  return (
    <g>
      <Sequence from={at(inv)} durationInFrames={len[0]}>
        <Invitation publicDir={publicDir} line1={MASTER_COPY.invitation.line1} line2={MASTER_COPY.invitation.line2} />
      </Sequence>

      <Sequence from={at(det)} durationInFrames={len[1]}>
        <Details publicDir={publicDir} caption={MASTER_COPY.details.line1} caption2={MASTER_COPY.details.line2} />
      </Sequence>

      <Sequence from={at(tr)} durationInFrames={len[2]}>
        <Transformation publicDir={publicDir} line1={MASTER_COPY.transformation.line1} line2={MASTER_COPY.transformation.line2} />
      </Sequence>

      <Sequence from={at(rv)} durationInFrames={len[3]}>
        <Reveal publicDir={publicDir} line1={MASTER_COPY.reveal.line1} line2={MASTER_COPY.reveal.line2} />
      </Sequence>

      <Sequence from={at(br)} durationInFrames={len[4]}>
        <BrandOutro
          publicDir={publicDir}
          message1={MASTER_COPY.brand.line1}
          message2={MASTER_COPY.brand.line2}
          cta={MASTER_COPY.brand.cta}
          url={CAMPAIGN.url}
          footnote={CAMPAIGN.disclaimer}
          durationInFrames={len[4]}
        />
      </Sequence>
    </g>
  );
};

/**
 * The 15 s cutdown.
 *
 * Every section is shorter for a reason the edit can defend:
 *  - the hook is one 2 s push instead of a 4 s hold, because a Reel viewer
 *    decides in the first second;
 *  - details drop to a single 3 s beat with one line, not two;
 *  - the transformation cuts in sooner but keeps its full impact;
 *  - the reveal is the *longest* section proportionally — it is the payoff;
 *  - the outro loses the long build but keeps logo, message and CTA intact.
 */
const CutdownReel: React.FC<ReelProps> = ({ publicDir }) => {
  const [inv, det, tr, rv, br] = CUTDOWN;
  const len = lengths(CUTDOWN);

  return (
    <g>
      <Sequence from={at(inv)} durationInFrames={len[0]}>
        <Invitation publicDir={publicDir} line1={CUTDOWN_COPY.invitation.line1} line2={CUTDOWN_COPY.invitation.line2} />
      </Sequence>

      <Sequence from={at(det)} durationInFrames={len[1]}>
        <Details publicDir={publicDir} caption={CUTDOWN_COPY.details.caption ?? ""} caption2={undefined} />
      </Sequence>

      <Sequence from={at(tr)} durationInFrames={len[2]}>
        <Transformation publicDir={publicDir} line1={CUTDOWN_COPY.transformation.line1} line2={CUTDOWN_COPY.transformation.line2} />
      </Sequence>

      <Sequence from={at(rv)} durationInFrames={len[3]}>
        <Reveal publicDir={publicDir} line1={CUTDOWN_COPY.reveal.line1} line2={CUTDOWN_COPY.reveal.line2} />
      </Sequence>

      <Sequence from={at(br)} durationInFrames={len[4]}>
        <BrandOutro
          publicDir={publicDir}
          message1={CUTDOWN_COPY.brand.line1}
          message2={CUTDOWN_COPY.brand.line2}
          cta={CUTDOWN_COPY.brand.cta}
          url={CAMPAIGN.url}
          footnote={CAMPAIGN.disclaimer}
          durationInFrames={len[4]}
        />
      </Sequence>
    </g>
  );
};

export const REELS: Record<"master" | "cutdown", ReelDefinition> = {
  master: {
    id: "master",
    width: WIDTH,
    height: HEIGHT,
    fps: FPS,
    durationInFrames: MASTER_FRAMES,
    scenes: MASTER,
    component: MasterReel,
  },
  cutdown: {
    id: "cutdown",
    width: WIDTH,
    height: HEIGHT,
    fps: FPS,
    durationInFrames: CUTDOWN_FRAMES,
    scenes: CUTDOWN,
    component: CutdownReel,
  },
};
