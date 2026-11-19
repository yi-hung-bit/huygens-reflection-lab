import React from 'react';
import { ArrowUpRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Language, SimulationParams } from '../types/physics';

interface GeometricProofSectionProps {
  params: SimulationParams;
  language: Language;
  onJumpToProofSnapshot: () => void;
}

export const GeometricProofSection: React.FC<GeometricProofSectionProps> = ({
  params,
  language,
  onJumpToProofSnapshot,
}) => {
  const thetaIRad = (params.incidentAngleDeg * Math.PI) / 180;
  const sinThetaI = Math.sin(thetaIRad);
  const sinThetaR = Math.min(0.97, params.speedRatio * sinThetaI);
  const thetaRDeg = (Math.asin(sinThetaR) * 180) / Math.PI;

  const lengthAC = 10.0; // Normalized reference mirror segment length (10.00 cm)
  const lengthBC = lengthAC * sinThetaI;
  const lengthAD = lengthAC * sinThetaR;
  const isSameMedium = Math.abs(params.speedRatio - 1.0) < 0.001;

  const proofSteps = [
    {
      index: '01.',
      title: {
        'zh-TW': '垂直性質（光線 ⊥ 波前）',
        en: 'Perpendicularity (Rays ⊥ Wavefronts)',
      },
      formula: '∠ABC = ∠ADC = 90°',
      detail: {
        'zh-TW':
          '入射波前 AB 垂直於入射線 BC，而包絡面切線（反射波前）CD 也必定垂直於次波半徑 AD，故兩者皆為直角三角形。',
        en:
          'Incident wavefront AB is perpendicular to ray BC, and the tangent envelope CD is perpendicular to radius AD, forming two right triangles.',
      },
    },
    {
      index: '02.',
      title: {
        'zh-TW': '共用斜邊（鏡面線段）',
        en: 'Shared Hypotenuse (Mirror Segment)',
      },
      formula: `AC = AC = ${lengthAC.toFixed(2)} cm`,
      detail: {
        'zh-TW':
          '△ABC 與 △ADC 共用鏡面上從最早接觸點 A 到最晚接觸點 C 的同一段斜邊 AC。',
        en:
          'Right triangles △ABC and △ADC share the exact same mirror segment AC as their common hypotenuse.',
      },
    },
    {
      index: '03.',
      title: {
        'zh-TW': '等時距對稱（同介質波速相等）',
        en: 'Equal Travel Distance in Δt',
      },
      formula: `BC = ${lengthBC.toFixed(2)} cm   ${isSameMedium ? '=' : '≠'}   AD = ${lengthAD.toFixed(2)} cm`,
      detail: {
        'zh-TW': isSameMedium
          ? '在 B 點移動至 C 點的相同時間 Δt 內，入射波速 vᵢ 等於次波波速 vᵣ，因此兩段距離 BC = vᵢΔt 與 AD = vᵣΔt 完全相等。'
          : `目前正在進行跨波速實驗（vᵣ / vᵢ = ${params.speedRatio.toFixed(2)}）：次波半徑 AD 與 BC 不再相等，這相當於折射或介質變化時的角度偏折原理！`,
        en: isSameMedium
          ? 'During interval Δt as B travels to C, incident speed vᵢ equals wavelet speed vᵣ, making BC = vᵢΔt equal to AD = vᵣΔt.'
          : `In this speed-ratio experiment (vᵣ / vᵢ = ${params.speedRatio.toFixed(2)}), AD ≠ BC, illustrating why unequal speeds bend the angle (like refraction)!`,
      },
    },
    {
      index: '04.',
      title: {
        'zh-TW': '全等與結論（RHS 全等定理）',
        en: 'RHS Congruence Conclusion',
      },
      formula: isSameMedium
        ? `△ABC ≅ △ADC (RHS)  ⇒  θᵢ (${params.incidentAngleDeg}°) = θᵣ (${thetaRDeg.toFixed(1).replace(/\.0$/, '')}°)`
        : `sin(θᵣ) = (vᵣ / vᵢ) sin(θᵢ)  ⇒  θᵣ = ${thetaRDeg.toFixed(1)}°`,
      detail: {
        'zh-TW': isSameMedium
          ? '由 RHS 全等可知對應角 ∠BAC = ∠ACD，分別即為入射角 θᵢ 與反射角 θᵣ，嚴格證明「入射角等於反射角」。'
          : '當波速比不為 1 時，兩個直角三角形不再全等，θᵣ 也不等於 θᵢ；唯有恢復同介質 vᵣ = vᵢ 才能維持反射定律。',
        en: isSameMedium
          ? 'By RHS congruence, corresponding angles ∠BAC = ∠ACD, proving that angle of incidence θᵢ equals angle of reflection θᵣ.'
          : 'When vᵣ ≠ vᵢ, the right triangles are no longer congruent and θᵣ ≠ θᵢ—demonstrating why uniform medium speed is essential.',
      },
    },
  ];

  return (
    <section
      id="geometric-proof"
      className="py-12 border-t border-slate-200"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-sky-700 mb-1.5">
            {language === 'zh-TW' ? '即時幾何推導與量測' : 'Live Geometric Derivation'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {language === 'zh-TW'
              ? '從次波包絡面到 RHS 全等證明'
              : 'From Wavelet Envelope to RHS Congruence'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onJumpToProofSnapshot}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>
            {language === 'zh-TW'
              ? '在畫布對齊 t = Δt 全等時刻'
              : 'Align Canvas at t = Δt'}
          </span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Live Tabular Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">
            {language === 'zh-TW' ? '入射角 θᵢ' : 'Incident Angle θᵢ'}
          </div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-sky-700">
            {params.incidentAngleDeg.toFixed(1).replace(/\.0$/, '')}°
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-500 mt-1">
            sin θᵢ = {sinThetaI.toFixed(3)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">
            {language === 'zh-TW' ? '反射角 θᵣ（由包絡面測得）' : 'Reflected Angle θᵣ'}
          </div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-emerald-700">
            {thetaRDeg.toFixed(1).replace(/\.0$/, '')}°
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-500 mt-1">
            sin θᵣ = {sinThetaR.toFixed(3)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">
            {language === 'zh-TW' ? '波前行進距離 BC' : 'Wavefront Path BC'}
          </div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-slate-900">
            {lengthBC.toFixed(2)} <span className="text-sm font-normal text-slate-500">cm</span>
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-500 mt-1">
            AC · sin θᵢ (AC = 10.0 cm)
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">
            {language === 'zh-TW' ? 'A 點次波半徑 AD' : 'Wavelet Radius AD'}
          </div>
          <div className="text-2xl font-mono tabular-nums font-semibold text-amber-700">
            {lengthAD.toFixed(2)} <span className="text-sm font-normal text-slate-500">cm</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium">
            {isSameMedium ? (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                {language === 'zh-TW' ? 'AD = BC（全等成立）' : 'AD = BC (Congruent)'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                {language === 'zh-TW' ? 'AD ≠ BC（波速不同）' : 'AD ≠ BC (Speed altered)'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4-Step Deductive Proof Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {proofSteps.map((step) => (
          <div
            key={step.index}
            className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-sm font-mono font-semibold text-sky-700">
                  {step.index}
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {step.title[language]}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 mb-4">
                {step.detail[language]}
              </p>
            </div>
            <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono tabular-nums text-xs sm:text-sm font-medium text-slate-900">
              {step.formula}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
