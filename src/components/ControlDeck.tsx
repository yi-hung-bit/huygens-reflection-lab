import React from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
} from 'lucide-react';
import { STAGES } from '../data/curriculum';
import {
  Language,
  LayerVisibility,
  LearningStage,
  SimulationParams,
} from '../types/physics';
import { progressToS } from './HuygensCanvas';

interface ControlDeckProps {
  params: SimulationParams;
  layers: LayerVisibility;
  language: Language;
  onUpdateParams: (patch: Partial<SimulationParams>) => void;
  onSelectStage: (stage: LearningStage) => void;
  onToggleLayer: (key: keyof LayerVisibility) => void;
  onReset: () => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  params,
  layers,
  language,
  onUpdateParams,
  onSelectStage,
  onToggleLayer,
  onReset,
}) => {
  const currentStageInfo =
    STAGES.find((st) => st.stage === params.stage) ?? STAGES[0];
  const s = progressToS(params.progress);

  const stepProgress = (delta: number) => {
    const next = Math.max(0, Math.min(1, params.progress + delta));
    onUpdateParams({ progress: next, isPlaying: false });
  };

  return (
    <aside className="flex flex-col gap-5 bg-white rounded-xl border border-slate-200 p-5">
      {/* Guided Stage Progression */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            {language === 'zh-TW' ? '循序導引階段' : 'Guided Learning Stages'}
          </h2>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {language === 'zh-TW' ? `階段 ${params.stage} / 4` : `Stage ${params.stage} / 4`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {STAGES.map((st) => {
            const active = params.stage === st.stage;
            return (
              <button
                key={st.stage}
                type="button"
                onClick={() => onSelectStage(st.stage)}
                className={`min-h-[40px] px-3 py-2 text-left text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  active
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="block truncate">{st.shortTitle[language]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Conceptual Callout */}
        <div className="mt-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
            {currentStageInfo.title[language]}
          </h3>
          <p className="text-xs leading-relaxed text-slate-600">
            {currentStageInfo.summary[language]}
          </p>
          <p className="mt-2 pt-2 border-t border-slate-200 text-xs font-medium text-sky-700">
            {currentStageInfo.keyTakeaway[language]}
          </p>
        </div>
      </div>

      {/* Playback & Timeline Scrubber */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="timeline-scrubber"
            className="text-xs font-semibold text-slate-800"
          >
            {language === 'zh-TW' ? '波前推進時間軸' : 'Wavefront Timeline'}
          </label>
          <span className="text-xs font-mono tabular-nums text-slate-600">
            {s < 0
              ? language === 'zh-TW'
                ? '入射前'
                : 'Approaching'
              : s <= 1
                ? `t / Δt = ${s.toFixed(2)}`
                : language === 'zh-TW'
                  ? '反射前進中'
                  : 'Propagating'}
          </span>
        </div>

        <input
          id="timeline-scrubber"
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={params.progress}
          onChange={(e) =>
            onUpdateParams({
              progress: parseFloat(e.target.value),
              isPlaying: false,
            })
          }
          className="w-full physics-slider mb-3"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onUpdateParams({
                isPlaying: !params.isPlaying,
              })
            }
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {params.isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{language === 'zh-TW' ? '暫停模擬' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{language === 'zh-TW' ? '播放動畫' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => stepProgress(-0.06)}
            aria-label={language === 'zh-TW' ? '後退一步' : 'Step backward'}
            className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <SkipBack className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => stepProgress(0.06)}
            aria-label={language === 'zh-TW' ? '前進一步' : 'Step forward'}
            className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onReset}
            aria-label={language === 'zh-TW' ? '重設參數' : 'Reset'}
            className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Physical Parameter Sliders */}
      <div className="pt-4 border-t border-slate-200 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{language === 'zh-TW' ? '物理參數控制' : 'Physical Parameters'}</span>
        </div>

        {/* Incident Angle */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label htmlFor="angle-slider" className="font-medium text-slate-700">
              {language === 'zh-TW' ? '入射角 θᵢ' : 'Incident Angle θᵢ'}
            </label>
            <span className="font-mono tabular-nums font-semibold text-sky-700">
              {params.incidentAngleDeg}°
            </span>
          </div>
          <input
            id="angle-slider"
            type="range"
            min={15}
            max={70}
            step={1}
            value={params.incidentAngleDeg}
            onChange={(e) =>
              onUpdateParams({ incidentAngleDeg: parseInt(e.target.value, 10) })
            }
            className="w-full physics-slider"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
            <span>15°</span>
            <span>45°</span>
            <span>70°</span>
          </div>
        </div>

        {/* Huygens Wavelet Count */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label htmlFor="wavelet-slider" className="font-medium text-slate-700">
              {language === 'zh-TW' ? '次波源取樣數 N' : 'Secondary Wavelets N'}
            </label>
            <span className="font-mono tabular-nums font-semibold text-amber-700">
              {params.waveletCount} {language === 'zh-TW' ? '點' : 'pts'}
            </span>
          </div>
          <input
            id="wavelet-slider"
            type="range"
            min={3}
            max={15}
            step={1}
            value={params.waveletCount}
            onChange={(e) =>
              onUpdateParams({
                waveletCount: parseInt(e.target.value, 10),
                selectedSourceIndex: null,
              })
            }
            className="w-full physics-slider"
          />
        </div>

        {/* Speed Ratio What-If Experiment */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label htmlFor="speed-ratio-slider" className="font-medium text-slate-700">
              {language === 'zh-TW'
                ? '反思實驗：波速比 vᵣ / vᵢ'
                : 'What-If Speed Ratio vᵣ / vᵢ'}
            </label>
            <div className="flex items-center gap-2">
              {Math.abs(params.speedRatio - 1) > 0.001 && (
                <button
                  type="button"
                  onClick={() => onUpdateParams({ speedRatio: 1.0 })}
                  className="text-[11px] font-medium text-sky-700 hover:underline cursor-pointer"
                >
                  {language === 'zh-TW' ? '還原同介質 1.00×' : 'Restore 1.00×'}
                </button>
              )}
              <span
                className={`font-mono tabular-nums font-semibold ${
                  Math.abs(params.speedRatio - 1) < 0.001
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {params.speedRatio.toFixed(2)}×
              </span>
            </div>
          </div>
          <input
            id="speed-ratio-slider"
            type="range"
            min={0.55}
            max={1.05}
            step={0.05}
            value={params.speedRatio}
            onChange={(e) =>
              onUpdateParams({ speedRatio: parseFloat(e.target.value) })
            }
            className="w-full physics-slider"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            {language === 'zh-TW'
              ? '同介質反射時 vᵣ / vᵢ = 1.00；調降數值可觀察次波變慢如何使包絡面角度改變。'
              : 'In the same medium, vᵣ / vᵢ = 1.00. Adjust to see why speed equality is required for θᵢ = θᵣ.'}
          </p>
        </div>
      </div>

      {/* Geometric Layer Toggles */}
      <div className="pt-4 border-t border-slate-200">
        <span className="block text-xs font-semibold text-slate-800 mb-2.5">
          {language === 'zh-TW' ? '圖層顯示切換' : 'Diagram Layers'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                key: 'showRaysAndNormals',
                label: { 'zh-TW': '光線與法線', en: 'Rays & Normals' },
              },
              {
                key: 'showWavelets',
                label: { 'zh-TW': '惠更斯次波圓', en: 'Wavelet Arcs' },
              },
              {
                key: 'showTriangles',
                label: { 'zh-TW': '全等直角三角形', en: 'Right Triangles' },
              },
              {
                key: 'showMultipleWavefronts',
                label: { 'zh-TW': '連續平面波列', en: 'Wave Train' },
              },
            ] as const
          ).map((item) => {
            const active = layers[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onToggleLayer(item.key)}
                aria-pressed={active}
                className={`min-h-[38px] px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors text-left truncate cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {item.label[language]}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
