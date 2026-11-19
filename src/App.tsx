import { useCallback, useEffect, useRef, useState } from 'react';
import { ConceptCheckSection } from './components/ConceptCheckSection';
import { ControlDeck } from './components/ControlDeck';
import { GeometricProofSection } from './components/GeometricProofSection';
import { HuygensCanvas, progressToS } from './components/HuygensCanvas';
import { VideoReferenceSection } from './components/VideoReferenceSection';
import { STAGES, UI_COPY } from './data/curriculum';
import {
  Language,
  LayerVisibility,
  LearningStage,
  SimulationParams,
} from './types/physics';

const DEFAULT_PARAMS: SimulationParams = {
  incidentAngleDeg: 38,
  speedMultiplier: 1.0,
  waveletCount: 9,
  speedRatio: 1.0,
  progress: 0.71, // Start at the key proof instant t = Δt (s = 1.0) so users see the full envelope & wavelets immediately!
  isPlaying: false,
  stage: 3,
  selectedSourceIndex: null,
};

const DEFAULT_LAYERS: LayerVisibility = {
  showRaysAndNormals: true,
  showWavelets: true,
  showTriangles: true,
  showMeasurements: true,
  showMultipleWavefronts: true,
};

export default function App() {
  const [language, setLanguage] = useState<Language>('zh-TW');
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const updateParams = useCallback((patch: Partial<SimulationParams>) => {
    setParams((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSelectStage = useCallback((stage: LearningStage) => {
    const info = STAGES.find((st) => st.stage === stage);
    setParams((prev) => ({
      ...prev,
      stage,
      isPlaying: false,
      progress: info ? info.targetProgress : prev.progress,
    }));
    if (stage === 4) {
      setLayers((prev) => ({ ...prev, showTriangles: true, showRaysAndNormals: true }));
    } else if (stage === 2 || stage === 3) {
      setLayers((prev) => ({ ...prev, showWavelets: true }));
    }
  }, []);

  const handleToggleLayer = useCallback((key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS, isPlaying: true, progress: 0.0 });
    setLayers(DEFAULT_LAYERS);
  }, []);

  const handleJumpToProofSnapshot = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      stage: 4,
      progress: 0.71,
      isPlaying: false,
    }));
    setLayers((prev) => ({
      ...prev,
      showTriangles: true,
      showRaysAndNormals: true,
      showWavelets: true,
      showMeasurements: true,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Animation loop when playing
  useEffect(() => {
    if (!params.isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dtSec = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const rate = prefersReducedMotion ? 0.06 : 0.14 * params.speedMultiplier;

      setParams((prev) => {
        if (!prev.isPlaying) return prev;
        let nextProgress = prev.progress + dtSec * rate;
        if (nextProgress >= 1) {
          nextProgress = 0;
        }
        // Automatically update active stage indicator based on timeline s
        const s = progressToS(nextProgress);
        let autoStage: LearningStage = prev.stage;
        if (s < 0.15) autoStage = 1;
        else if (s < 0.85) autoStage = 2;
        else if (s <= 1.15) autoStage = 3;
        else autoStage = 4;

        return {
          ...prev,
          progress: nextProgress,
          stage: autoStage,
        };
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [params.isPlaying, params.speedMultiplier]);

  const thetaIRad = (params.incidentAngleDeg * Math.PI) / 180;
  const sinThetaR = Math.min(0.97, params.speedRatio * Math.sin(thetaIRad));
  const thetaRDeg = (Math.asin(sinThetaR) * 180) / Math.PI;
  const isSameMedium = Math.abs(params.speedRatio - 1) < 0.001;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Three-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#simulation-stage"
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            {UI_COPY.brandTitle[language]}
          </a>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <a
              href="#simulation-stage"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {UI_COPY.navSimulation[language]}
            </a>
            <a
              href="#geometric-proof"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {UI_COPY.navProof[language]}
            </a>
            <a
              href="#concept-check"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {UI_COPY.navQuiz[language]}
            </a>
            <a
              href="#video-reference"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {UI_COPY.navVideo[language]}
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {UI_COPY.resetButton[language]}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8">
        {/* Hero Header + Workspace Language Switch */}
        <section id="simulation-stage" className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div className="max-w-3xl">
              <div className="text-xs font-medium text-slate-500 mb-2">
                <span>{language === 'zh-TW' ? '高中物理光學' : 'High School Wave Optics'}</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span>{language === 'zh-TW' ? '惠更斯原理與反射定律' : 'Huygens’ Principle & Law of Reflection'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 text-balance">
                {UI_COPY.heroTitle[language]}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                {UI_COPY.heroSubtitle[language]}
              </p>
            </div>

            {/* Workspace Toolbar: Language Segmented Toggle & Quick Angle Readout */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div
                role="group"
                aria-label="Language switch"
                className="inline-flex items-center p-1 bg-slate-200/70 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => setLanguage('zh-TW')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    language === 'zh-TW'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  繁體中文
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    language === 'en'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          {/* Two-Zone Educational Sandbox: 65% Stage Left / 35% Control Deck Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-3">
              <HuygensCanvas
                params={params}
                layers={layers}
                language={language}
                onSelectSource={(idx) => updateParams({ selectedSourceIndex: idx })}
                onAngleChange={(deg) => updateParams({ incidentAngleDeg: deg })}
              />

              {/* Compact Synchronized Law Verification Strip */}
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums">
                  <span>
                    <span className="text-slate-500 mr-1.5">θᵢ =</span>
                    <strong className="text-sky-700">
                      {params.incidentAngleDeg}°
                    </strong>
                  </span>
                  <span className="text-slate-300" aria-hidden="true">|</span>
                  <span>
                    <span className="text-slate-500 mr-1.5">θᵣ =</span>
                    <strong className="text-emerald-700">
                      {thetaRDeg.toFixed(1).replace(/\.0$/, '')}°
                    </strong>
                  </span>
                  <span className="text-slate-300" aria-hidden="true">|</span>
                  <span>
                    <span className="text-slate-500 mr-1.5">vᵣ / vᵢ =</span>
                    <strong className="text-slate-900">
                      {params.speedRatio.toFixed(2)}
                    </strong>
                  </span>
                </div>

                <div className="text-xs font-medium">
                  {isSameMedium ? (
                    <span className="text-emerald-700">
                      {language === 'zh-TW'
                        ? '狀態：同介質對稱（θᵢ = θᵣ 反射定律成立）'
                        : 'Status: Same medium (θᵢ = θᵣ holds)'}
                    </span>
                  ) : (
                    <span className="text-amber-700">
                      {language === 'zh-TW'
                        ? '狀態：波速不等實驗（次波半徑改變導致 θᵣ ≠ θᵢ）'
                        : 'Status: Unequal speed experiment (θᵣ ≠ θᵢ)'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <ControlDeck
                params={params}
                layers={layers}
                language={language}
                onUpdateParams={updateParams}
                onSelectStage={handleSelectStage}
                onToggleLayer={handleToggleLayer}
                onReset={handleReset}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Geometric Derivation & Live Telemetry */}
        <GeometricProofSection
          params={params}
          language={language}
          onJumpToProofSnapshot={handleJumpToProofSnapshot}
        />

        {/* Section 3: Interactive Concept Check */}
        <ConceptCheckSection
          language={language}
          onJumpToStage={handleSelectStage}
        />

        {/* Section 4: Original Video Reference */}
        <VideoReferenceSection language={language} />
      </main>

      {/* Quiet Clean Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            {language === 'zh-TW'
              ? '惠更斯光學實驗室 · 高中物理波動光學視覺化教學工具'
              : 'Huygens Optics Lab · Interactive Wave Optics Visualization'}
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#simulation-stage"
              className="hover:text-slate-800 transition-colors"
            >
              {UI_COPY.navSimulation[language]}
            </a>
            <a
              href="#geometric-proof"
              className="hover:text-slate-800 transition-colors"
            >
              {UI_COPY.navProof[language]}
            </a>
            <a
              href="#concept-check"
              className="hover:text-slate-800 transition-colors"
            >
              {UI_COPY.navQuiz[language]}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
