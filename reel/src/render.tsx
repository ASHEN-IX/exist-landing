/**
 * EXIST — frame renderer.
 *
 * Given a composition and a frame number, produce a complete SVG document.
 * This is the only bridge between React and the video: everything upstream is
 * pure composition, everything downstream is ffmpeg.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FrameProvider } from "./lib/composition";

const SVG_NS = "http://www.w3.org/2000/svg";

export type SceneComponent = React.FC<{ publicDir: string }>;

/**
 * Wrap a scene in the SVG root and provide the absolute frame.
 *
 * The root is what carries the canvas size and the viewBox; scenes draw their
 * own background, so a scene can be letterboxed, full-bleed or black without
 * special-casing here.
 */
export const frameToSvg = (
  scene: SceneComponent,
  frame: number,
  publicDir: string,
  width = 1080,
  height = 1920,
): string => {
  // JSX requires a capitalised binding, so the scene is aliased first.
  const Scene = scene;
  const body = renderToStaticMarkup(
    <FrameProvider frame={frame}>
      <Scene publicDir={publicDir} />
    </FrameProvider>,
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="${SVG_NS}" xmlns:xlink="http://www.w3.org/1999/xlink"`,
    ` width="${width}" height="${height}"`,
    ` viewBox="0 0 ${width} ${height}"`,
    ` preserveAspectRatio="xMidYMid slice" data-frame="${frame}">`,
    body,
    `</svg>`,
  ].join("");
};
