import React, { useEffect, useRef, useState } from 'react';
import {
  GeometryTelemetry,
  Language,
  LayerVisibility,
  SimulationParams,
} from '../types/physics';

interface HuygensCanvasProps {
  params: SimulationParams;
  layers: LayerVisibility;
  language: Language;
  onSelectSource: (index: number | null) => void;
  onAngleChange: (angleDeg: number) => void;
  onTelemetryUpdate?: (telemetry: GeometryTelemetry) => void;
}

interface Point {
  x: number;
  y: number;
}

const PROGRESS_A_HITS = 0.185; // s = 0
const PROGRESS_B_HITS = 0.71;  // s = 1

export function progressToS(progress: number): number {
  if (progress <= PROGRESS_A_HITS) {
    return -0.35 + (progress / PROGRESS_A_HITS) * 0.35;
  }
  if (progress <= PROGRESS_B_HITS) {
    return (progress - PROGRESS_A_HITS) / (PROGRESS_B_HITS - PROGRESS_A_HITS);
  }
  return 1 + ((progress - PROGRESS_B_HITS) / (1 - PROGRESS_B_HITS)) * 0.55;
}

export function sToProgress(s: number): number {
  if (s <= 0) {
    return Math.max(0, ((s + 0.35) / 0.35) * PROGRESS_A_HITS);
  }
  if (s <= 1) {
    return PROGRESS_A_HITS + s * (PROGRESS_B_HITS - PROGRESS_A_HITS);
  }
  return Math.min(1, PROGRESS_B_HITS + ((s - 1) / 0.55) * (1 - PROGRESS_B_HITS));
}

export const HuygensCanvas: React.FC<HuygensCanvasProps> = ({
  params,
  layers,
  language,
  onSelectSource,
  onAngleChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredSource, setHoveredSource] = useState<number | null>(null);
  const [isDraggingAngle, setIsDraggingAngle] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width: Math.round(width), height: Math.round(height) });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Store hit-test geometry in ref for smooth pointer interaction
  const hitGeometryRef = useRef<{
    sources: Point[];
    centerA: Point;
    mirrorY: number;
    handlePos: Point | null;
  }>({
    sources: [],
    centerA: { x: 0, y: 0 },
    mirrorY: 0,
    handlePos: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const width = Math.max(320, rect.width);
    const height = Math.max(420, rect.height);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Background & Subtle Scientific Coordinate Grid
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const gridSize = 28;
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = gridSize; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 2. Geometry Setup
    const thetaIRad = (params.incidentAngleDeg * Math.PI) / 180;
    const sinThetaR = Math.min(0.97, params.speedRatio * Math.sin(thetaIRad));
    const thetaRRad = Math.asin(sinThetaR);
    const thetaRDeg = (thetaRRad * 180) / Math.PI;

    const mirrorY = Math.round(height * 0.74);
    const acLength = Math.min(width * 0.44, 340);
    const xA = Math.round(width * 0.5 - acLength * 0.5);
    const xC = xA + acLength;

    const A: Point = { x: xA, y: mirrorY };
    const C: Point = { x: xC, y: mirrorY };

    // Incident ray unit vector u_i (down-right) and wavefront unit vector w_i (up-right)
    const ui: Point = { x: Math.sin(thetaIRad), y: Math.cos(thetaIRad) };
    const wi: Point = { x: Math.cos(thetaIRad), y: -Math.sin(thetaIRad) };

    // Reflected ray unit vector u_r (up-right)
    const ur: Point = { x: Math.sin(thetaRRad), y: -Math.cos(thetaRRad) };

    // Exact triangle vertices B and D
    const lengthAB = acLength * Math.cos(thetaIRad);
    const lengthBC = acLength * Math.sin(thetaIRad);
    const lengthAD = acLength * sinThetaR; // = speedRatio * lengthBC

    const B: Point = {
      x: A.x + lengthAB * wi.x,
      y: A.y + lengthAB * wi.y,
    };

    const D: Point = {
      x: A.x + lengthAD * ur.x,
      y: A.y + lengthAD * ur.y,
    };

    const s = progressToS(params.progress);

    // 3. Draw Mirror Substrate (reflective boundary)
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, mirrorY, width, height - mirrorY);

    // Mirror hatching lines underneath
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let hx = 12; hx < width + 24; hx += 14) {
      ctx.moveTo(hx, mirrorY);
      ctx.lineTo(hx - 12, mirrorY + 14);
    }
    ctx.stroke();

    // Mirror top surface line
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(28, mirrorY);
    ctx.lineTo(width - 28, mirrorY);
    ctx.stroke();

    // Mirror label
    ctx.fillStyle = '#475569';
    ctx.font = '500 12px "Plus Jakarta Sans", "Noto Sans TC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      language === 'zh-TW' ? '平面反射鏡介面' : 'Plane Reflective Mirror',
      32,
      mirrorY + 32
    );

    // 4. Congruent Right Triangles Overlay (Stage 4 or Layer Enabled)
    const showProofGeometry = layers.showTriangles || params.stage === 4;
    if (showProofGeometry) {
      // Triangle ABC (Incident Side)
      ctx.save();
      ctx.fillStyle = 'rgba(2, 132, 199, 0.09)';
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.lineTo(C.x, C.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(2, 132, 199, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.restore();

      // Triangle ADC (Reflected Side - shown clearly once s >= 0.7 or in Stage 4)
      ctx.save();
      ctx.fillStyle = 'rgba(5, 150, 105, 0.09)';
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(D.x, D.y);
      ctx.lineTo(C.x, C.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(5, 150, 105, 0.72)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.restore();

      // Right-angle square marker at B
      drawRightAngleMarker(ctx, B, { x: -wi.x, y: -wi.y }, ui, 11, '#0284C7');
      // Right-angle square marker at D
      const cdUnit = normalize({ x: C.x - D.x, y: C.y - D.y });
      drawRightAngleMarker(ctx, D, { x: -ur.x, y: -ur.y }, cdUnit, 11, '#059669');
    }

    // 5. Rays & Normals
    if (layers.showRaysAndNormals) {
      // Normal line at A
      drawDashedLine(ctx, { x: A.x, y: mirrorY - 190 }, { x: A.x, y: mirrorY + 28 }, '#94A3B8', [4, 4], 1.25);
      // Normal line at C
      drawDashedLine(ctx, { x: C.x, y: mirrorY - 190 }, { x: C.x, y: mirrorY + 28 }, '#94A3B8', [4, 4], 1.25);

      ctx.fillStyle = '#64748B';
      ctx.font = '500 11px "IBM Plex Mono", "Noto Sans TC", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(language === 'zh-TW' ? '法線 N₁' : 'Normal N₁', A.x, mirrorY - 198);
      ctx.fillText(language === 'zh-TW' ? '法線 N₂' : 'Normal N₂', C.x, mirrorY - 198);

      // Incident Ray through A
      const rayStartA: Point = {
        x: A.x - ui.x * 235,
        y: A.y - ui.y * 235,
      };
      drawRayWithArrow(ctx, rayStartA, A, '#0284C7', 2, 0.55);

      // Incident Ray through B -> C
      const rayStartB: Point = {
        x: C.x - ui.x * 235,
        y: C.y - ui.y * 235,
      };
      drawRayWithArrow(ctx, rayStartB, C, '#0284C7', 2, 0.45);

      // Reflected Ray from A through D
      if (s > 0 || showProofGeometry) {
        const rayEndA: Point = {
          x: A.x + ur.x * 235,
          y: A.y + ur.y * 235,
        };
        drawRayWithArrow(ctx, A, rayEndA, '#059669', 2, 0.65);
      }

      // Reflected Ray from C
      if (s >= 0.99 || showProofGeometry) {
        const rayEndC: Point = {
          x: C.x + ur.x * 215,
          y: C.y + ur.y * 215,
        };
        drawRayWithArrow(ctx, C, rayEndC, '#059669', 2, 0.65);
      }

      // Angle arcs at A: theta_i and theta_r
      drawAngleArc(
        ctx,
        A,
        42,
        -Math.PI / 2 - thetaIRad,
        -Math.PI / 2,
        '#0284C7',
        `θᵢ ${params.incidentAngleDeg.toFixed(0)}°`,
        -26,
        -48
      );

      if (s > 0.1 || showProofGeometry) {
        drawAngleArc(
          ctx,
          A,
          50,
          -Math.PI / 2,
          -Math.PI / 2 + thetaRRad,
          '#059669',
          `θᵣ ${thetaRDeg.toFixed(1).replace(/\.0$/, '')}°`,
          30,
          -56
        );
      }

      // Draggable angle handle on the incident ray at A
      const handleDist = 155;
      const handlePos: Point = {
        x: A.x - ui.x * handleDist,
        y: A.y - ui.y * handleDist,
      };
      hitGeometryRef.current.handlePos = handlePos;

      ctx.save();
      ctx.fillStyle = isDraggingAngle ? '#0369A1' : '#FFFFFF';
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(handlePos.x, handlePos.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0284C7';
      ctx.font = '500 11px "Plus Jakarta Sans", "Noto Sans TC", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        language === 'zh-TW' ? '拖曳調整入射角' : 'Drag θᵢ',
        handlePos.x - 12,
        handlePos.y + 4
      );
      ctx.restore();
    } else {
      hitGeometryRef.current.handlePos = null;
    }

    // 6. Incident Plane Wavefronts (primary + optional trailing parallel fronts)
    const drawWavefrontAtS = (sVal: number, isPrimary: boolean) => {
      // Point on the wavefront that aligns with A's ray at parameter sVal
      // At sVal = 0, A_front = A. At sVal = 1, A_front has passed mirror by BC along ui.
      const offsetAlongRay = (sVal - 0) * lengthBC;
      const pLeft: Point = {
        x: A.x + ui.x * offsetAlongRay,
        y: A.y + ui.y * offsetAlongRay,
      };
      const pRight: Point = {
        x: pLeft.x + lengthAB * wi.x,
        y: pLeft.y + lengthAB * wi.y,
      };

      // Clip incident wavefront to region above mirror (y <= mirrorY)
      const clipped = clipSegmentAboveY(pLeft, pRight, mirrorY);
      if (!clipped) return;

      ctx.save();
      ctx.strokeStyle = isPrimary ? '#0284C7' : 'rgba(2, 132, 199, 0.28)';
      ctx.lineWidth = isPrimary ? 3 : 1.75;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(clipped[0].x, clipped[0].y);
      ctx.lineTo(clipped[1].x, clipped[1].y);
      ctx.stroke();
      ctx.restore();
    };

    if (layers.showMultipleWavefronts) {
      const spacing = 0.55;
      for (let m = -3; m <= 2; m++) {
        if (m === 0) continue;
        drawWavefrontAtS(s + m * spacing, false);
      }
    }
    // Primary tracked incident wavefront AB
    drawWavefrontAtS(s, true);

    // 7. Huygens Secondary Wavelets from Mirror Points P_k
    const N = params.waveletCount;
    const sources: Point[] = [];
    for (let k = 0; k < N; k++) {
      const alpha = N === 1 ? 0 : k / (N - 1);
      sources.push({
        x: A.x + alpha * acLength,
        y: mirrorY,
      });
    }
    hitGeometryRef.current.sources = sources;
    hitGeometryRef.current.centerA = A;
    hitGeometryRef.current.mirrorY = mirrorY;

    const activeSourceIdx = hoveredSource ?? params.selectedSourceIndex;

    if (layers.showWavelets) {
      for (let k = 0; k < N; k++) {
        const alpha = N === 1 ? 0 : k / (N - 1);
        const pk = sources[k];
        const elapsedS = s - alpha;

        if (elapsedS > 0) {
          const radius = params.speedRatio * elapsedS * lengthBC;
          const isFocused = activeSourceIdx === k;

          ctx.save();
          // Semicircle in upper half-plane (from angle PI to 2*PI)
          ctx.beginPath();
          ctx.arc(pk.x, pk.y, radius, Math.PI, Math.PI * 2, false);
          ctx.strokeStyle = isFocused
            ? '#B45309'
            : k === 0
              ? 'rgba(217, 119, 6, 0.92)'
              : 'rgba(217, 119, 6, 0.42)';
          ctx.lineWidth = isFocused ? 2.6 : k === 0 ? 2 : 1.25;
          ctx.stroke();

          if (isFocused) {
            ctx.fillStyle = 'rgba(217, 119, 6, 0.08)';
            ctx.fill();
            // Draw radius vector from pk to tangent point on this wavelet
            const tk: Point = {
              x: pk.x + radius * ur.x,
              y: pk.y + radius * ur.y,
            };
            ctx.strokeStyle = '#B45309';
            ctx.lineWidth = 1.75;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(pk.x, pk.y);
            ctx.lineTo(tk.x, tk.y);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#B45309';
            ctx.beginPath();
            ctx.arc(tk.x, tk.y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }
    }

    // Draw point-source dots along AC (always crisp and clickable)
    for (let k = 0; k < N; k++) {
      const alpha = N === 1 ? 0 : k / (N - 1);
      const pk = sources[k];
      const hasEmitted = s >= alpha;
      const isFocused = activeSourceIdx === k;

      ctx.save();
      ctx.beginPath();
      ctx.arc(pk.x, pk.y, isFocused ? 5.5 : k === 0 || k === N - 1 ? 4.5 : 3.2, 0, Math.PI * 2);
      ctx.fillStyle = isFocused
        ? '#B45309'
        : hasEmitted
          ? '#D97706'
          : '#CBD5E1';
      ctx.fill();
      if (isFocused || k === 0 || k === N - 1) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 8. Reflected Wavefront (Envelope Tangent Line)
    if (s > 0.02) {
      // Envelope connects tangent point on A's wavelet (at s) to the mirror contact point (if s<=1) or C's wavelet tangent point (if s>1)
      const rA = params.speedRatio * s * lengthBC;
      const pEnvLeft: Point = {
        x: A.x + rA * ur.x,
        y: A.y + rA * ur.y,
      };
      const pEnvRight: Point =
        s <= 1
          ? { x: A.x + s * acLength, y: mirrorY }
          : {
              x: C.x + params.speedRatio * (s - 1) * lengthBC * ur.x,
              y: C.y + params.speedRatio * (s - 1) * lengthBC * ur.y,
            };

      ctx.save();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pEnvLeft.x, pEnvLeft.y);
      ctx.lineTo(pEnvRight.x, pEnvRight.y);
      ctx.stroke();

      // Highlight tangent contact point D on A's wavelet
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(pEnvLeft.x, pEnvLeft.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 9. Reference Geometric Points A, B, C, D & Callouts
    if (layers.showMeasurements || showProofGeometry) {
      drawPointLabel(ctx, A, 'A', -14, 18, '#0F172A');
      drawPointLabel(ctx, C, 'C', 14, 18, '#0F172A');
      drawPointLabel(ctx, B, 'B', 10, -10, '#0284C7');
      if (s >= 0.65 || showProofGeometry) {
        drawPointLabel(ctx, D, 'D', -12, -10, '#059669');
      }
    }

    // 10. Top-Left On-Canvas Legend & Focused Wavelet Readout
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    roundRect(ctx, 16, 16, 260, activeSourceIdx !== null ? 96 : 74, 10);
    ctx.fill();
    ctx.stroke();

    const legendItems = [
      {
        color: '#0284C7',
        label: language === 'zh-TW' ? '入射波前 AB / 入射線' : 'Incident Wavefront / Ray',
      },
      {
        color: '#D97706',
        label: language === 'zh-TW' ? '惠更斯次波圓弧' : 'Huygens Secondary Wavelets',
      },
      {
        color: '#059669',
        label: language === 'zh-TW' ? '包絡面（反射波前 CD）' : 'Envelope (Reflected Wavefront)',
      },
    ];

    legendItems.forEach((item, idx) => {
      const ly = 34 + idx * 19;
      ctx.fillStyle = item.color;
      ctx.fillRect(28, ly - 5, 14, 3);
      ctx.fillStyle = '#334155';
      ctx.font = '500 12px "Plus Jakarta Sans", "Noto Sans TC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, 50, ly);
    });

    if (activeSourceIdx !== null && activeSourceIdx < N) {
      const alpha = N === 1 ? 0 : activeSourceIdx / (N - 1);
      const elapsedS = Math.max(0, s - alpha);
      const rScaled = (params.speedRatio * elapsedS * Math.sin(thetaIRad) * 10).toFixed(2);
      ctx.fillStyle = '#B45309';
      ctx.font = '600 11.5px "IBM Plex Mono", monospace';
      ctx.fillText(
        language === 'zh-TW'
          ? `探測 P${activeSourceIdx + 1}: 半徑 r = ${rScaled} cm`
          : `Probe P${activeSourceIdx + 1}: radius r = ${rScaled} cm`,
        28,
        98
      );
    }
    ctx.restore();

    ctx.restore();
  }, [params, layers, language, hoveredSource, isDraggingAngle, containerSize]);

  // Pointer interaction: hover/click wavelet source OR drag angle handle
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getCanvasPoint(e);
    const { handlePos, sources } = hitGeometryRef.current;

    if (handlePos && dist(pt, handlePos) <= 18) {
      setIsDraggingAngle(true);
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    // Check if clicking one of the wavelet point sources on the mirror
    let closestIdx: number | null = null;
    let minD = 16;
    sources.forEach((src, idx) => {
      const d = dist(pt, src);
      if (d < minD) {
        minD = d;
        closestIdx = idx;
      }
    });

    if (closestIdx !== null) {
      onSelectSource(params.selectedSourceIndex === closestIdx ? null : closestIdx);
    } else if (params.selectedSourceIndex !== null) {
      onSelectSource(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getCanvasPoint(e);
    const { centerA, handlePos, sources } = hitGeometryRef.current;

    if (isDraggingAngle) {
      const dx = centerA.x - pt.x;
      const dy = centerA.y - pt.y;
      if (dy > 10) {
        const rawAngle = (Math.atan2(dx, dy) * 180) / Math.PI;
        const clamped = Math.max(15, Math.min(70, Math.round(rawAngle)));
        onAngleChange(clamped);
      }
      return;
    }

    if (handlePos && dist(pt, handlePos) <= 18) {
      e.currentTarget.style.cursor = 'grab';
      setHoveredSource(null);
      return;
    }

    let closestIdx: number | null = null;
    let minD = 15;
    sources.forEach((src, idx) => {
      const d = dist(pt, src);
      if (d < minD) {
        minD = d;
        closestIdx = idx;
      }
    });

    e.currentTarget.style.cursor = closestIdx !== null ? 'pointer' : 'default';
    setHoveredSource(closestIdx);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingAngle) {
      setIsDraggingAngle(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480px] sm:h-[540px] lg:h-[600px] bg-white rounded-xl border border-slate-200 overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setHoveredSource(null);
        }}
        className="block w-full h-full touch-none"
        aria-label={
          language === 'zh-TW'
            ? '惠更斯原理與反射定律互動幾何畫布'
            : 'Interactive Huygens principle reflection simulation canvas'
        }
      />
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 pointer-events-none">
        {language === 'zh-TW'
          ? '提示：點擊鏡面上的橘色次波源可鎖定測量半徑，或拖曳藍色圓點改變入射角'
          : 'Tip: Click any orange point source on the mirror to inspect its wavelet, or drag the blue handle'}
      </div>
    </div>
  );
};

// --- Helper Geometry Drawing Functions ---

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(v: Point): Point {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

function clipSegmentAboveY(p1: Point, p2: Point, maxY: number): [Point, Point] | null {
  if (p1.y > maxY && p2.y > maxY) return null;
  if (p1.y <= maxY && p2.y <= maxY) return [p1, p2];
  const t = (maxY - p1.y) / (p2.y - p1.y);
  const intersection: Point = {
    x: p1.x + t * (p2.x - p1.x),
    y: maxY,
  };
  return p1.y <= maxY ? [p1, intersection] : [intersection, p2];
}

function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  dash: number[],
  width: number
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function drawRayWithArrow(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  width: number,
  arrowPosRatio = 0.5
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  const ax = from.x + (to.x - from.x) * arrowPosRatio;
  const ay = from.y + (to.y - from.y) * arrowPosRatio;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const headLen = 9;

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(
    ax - headLen * Math.cos(angle - Math.PI / 6),
    ay - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    ax - headLen * Math.cos(angle + Math.PI / 6),
    ay - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRightAngleMarker(
  ctx: CanvasRenderingContext2D,
  vertex: Point,
  u1: Point,
  u2: Point,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  const p1 = { x: vertex.x + u1.x * size, y: vertex.y + u1.y * size };
  const p2 = {
    x: vertex.x + u1.x * size + u2.x * size,
    y: vertex.y + u1.y * size + u2.y * size,
  };
  const p3 = { x: vertex.x + u2.x * size, y: vertex.y + u2.y * size };
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.stroke();
  ctx.restore();
}

function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  label: string,
  labelOffsetX: number,
  labelOffsetY: number
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, startAngle, endAngle, false);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = '600 12px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, center.x + labelOffsetX, center.y + labelOffsetY);
  ctx.restore();
}

function drawPointLabel(
  ctx: CanvasRenderingContext2D,
  pt: Point,
  label: string,
  dx: number,
  dy: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, pt.x + dx, pt.y + dy);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
