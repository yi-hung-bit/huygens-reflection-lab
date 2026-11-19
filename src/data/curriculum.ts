import { Language, LearningStage, QuizQuestion } from '../types/physics';

export interface StageInfo {
  stage: LearningStage;
  targetProgress: number;
  shortTitle: Record<Language, string>;
  title: Record<Language, string>;
  summary: Record<Language, string>;
  keyTakeaway: Record<Language, string>;
}

export const STAGES: StageInfo[] = [
  {
    stage: 1,
    targetProgress: 0.22,
    shortTitle: {
      'zh-TW': '01. 斜向波前觸及介面',
      en: '01. Oblique Wavefront Hits Mirror',
    },
    title: {
      'zh-TW': '階段一：平面波斜向接近反射面',
      en: 'Stage 1: Plane Wavefront Approaches Obliquely',
    },
    summary: {
      'zh-TW':
        '當一列平面波以入射角 θᵢ 斜向射向光滑鏡面時，波前 AB 上的各點並不會同時抵達鏡面。左端點 A 率先接觸到鏡面，而此時右端點 B 距離鏡面 C 點仍有一段垂直於波前的距離 BC。',
      en:
        'When a plane wavefront AB approaches a mirror at angle θᵢ, points along the wavefront do not arrive simultaneously. Point A touches the mirror first while point B still has distance BC to travel.',
    },
    keyTakeaway: {
      'zh-TW': '關鍵：波前兩端「不同時」到達介面，造成時間差 Δt。',
      en: 'Key: Different arrival times across the wavefront create an interval Δt.',
    },
  },
  {
    stage: 2,
    targetProgress: 0.48,
    shortTitle: {
      'zh-TW': '02. 介面各點產生次波',
      en: '02. Secondary Wavelets Radiate',
    },
    title: {
      'zh-TW': '階段二：惠更斯次波源接力擴散',
      en: 'Stage 2: Huygens Wavelets Expand From Contact Points',
    },
    summary: {
      'zh-TW':
        '依據惠更斯原理，波前每接觸到鏡面的一點，該點就立刻成為新的「次波源」，以原波速 v 向介質上方發出半圓形次波。在 B 點趕往 C 點的過程中，A 點的次波半徑不斷擴大，其餘中間各點也依序接力發出次波。',
      en:
        'By Huygens’ Principle, each point on the mirror becomes a secondary point source the instant the wavefront strikes it, emitting a circular wavelet at speed v. While B travels toward C, A’s wavelet grows steadily.',
    },
    keyTakeaway: {
      'zh-TW': '關鍵：越早觸及鏡面的點，次波擴散的時間越長、半徑越大。',
      en: 'Key: Earlier contact points expand longer, producing larger wavelet radii.',
    },
  },
  {
    stage: 3,
    targetProgress: 0.68,
    shortTitle: {
      'zh-TW': '03. 次波包絡面形成反射波',
      en: '03. Envelope Forms Reflected Wavefront',
    },
    title: {
      'zh-TW': '階段三：共同切線（包絡面）即新波前',
      en: 'Stage 3: Common Tangent Envelope Defines Reflected Wave',
    },
    summary: {
      'zh-TW':
        '經過時間 Δt 後，B 點終於抵達鏡面的 C 點；同一時刻，A 點發出的次波半徑剛好成長至 AD = v·Δt。將 C 點與所有次波的公切線（包絡面）CD 連起來，這條切線就是全新的「反射波前」。',
      en:
        'After interval Δt, point B reaches C on the mirror while A’s wavelet reaches radius AD = v·Δt. The common tangent line CD from C across all expanding wavelets forms the new reflected wavefront.',
    },
    keyTakeaway: {
      'zh-TW': '關鍵：反射光線永遠垂直於新的包絡面波前 CD。',
      en: 'Key: Reflected rays are always perpendicular to the envelope wavefront CD.',
    },
  },
  {
    stage: 4,
    targetProgress: 0.68,
    shortTitle: {
      'zh-TW': '04. 全等直角三角形證明',
      en: '04. Congruent Right-Triangle Proof',
    },
    title: {
      'zh-TW': '階段四：幾何全等推導 θᵢ = θᵣ',
      en: 'Stage 4: RHS Congruence Proves θᵢ = θᵣ',
    },
    summary: {
      'zh-TW':
        '觀察直角三角形 △ABC 與 △ADC：兩者共用斜邊 AC，且 ∠ABC = ∠ADC = 90°（波線垂直於波前）。因為反射波仍在同一介質中傳播，波速相等，故 BC = AD = v·Δt。由 RHS 全等性質可知 △ABC ≅ △ADC，因此入射角 θᵢ 必等於反射角 θᵣ！',
      en:
        'Compare right triangles △ABC and △ADC: they share hypotenuse AC, both have right angles (∠B = ∠D = 90°), and equal legs BC = AD = v·Δt in the same medium. By RHS congruence, △ABC ≅ △ADC, so θᵢ = θᵣ.',
    },
    keyTakeaway: {
      'zh-TW': '結論：同介質波速相同 (vᵢ = vᵣ) 是「入射角等於反射角」的物理根源。',
      en: 'Conclusion: Equal speed in the same medium (vᵢ = vᵣ) guarantees θᵢ = θᵣ.',
    },
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: {
      'zh-TW': '1. 平面波斜向射向平面鏡時，為什麼波前上的 A 點與 B 點會先後產生反射行為？',
      en: '1. Why do points A and B on an oblique plane wavefront reflect at different instants?',
    },
    options: [
      {
        id: 'a',
        label: {
          'zh-TW': '因為波前兩端與鏡面的距離不同，A 點先抵達鏡面而 B 點較晚抵達',
          en: 'Because A is closer to the mirror and arrives before B along the propagation path',
        },
      },
      {
        id: 'b',
        label: {
          'zh-TW': '因為平面波左側的波速比右側的波速更快',
          en: 'Because the left side of the wavefront travels faster than the right side',
        },
      },
      {
        id: 'c',
        label: {
          'zh-TW': '因為鏡面會吸引較靠近法線的光線加速前進',
          en: 'Because the mirror accelerates rays closer to the normal line',
        },
      },
    ],
    correctOptionId: 'a',
    explanation: {
      'zh-TW':
        '同一介質中平面波各處波速相同，但因波前斜向入射（θᵢ > 0°），左端 A 點先接觸鏡面成為次波源，右端 B 點還需額外行進距離 BC = v·Δt 才會抵達 C 點。',
      en:
        'Wave speed is uniform in one medium, but because the wavefront is tilted (θᵢ > 0°), point A strikes the mirror first while point B must still travel distance BC = v·Δt to reach C.',
    },
    relatedStage: 1,
  },
  {
    id: 'q2',
    question: {
      'zh-TW': '2. 當 B 點花費時間 Δt 抵達鏡面 C 點時，A 點產生的次波半徑 AD 與距離 BC 滿足什麼關係？',
      en: '2. When point B arrives at C after interval Δt, how does wavelet radius AD compare to distance BC?',
    },
    options: [
      {
        id: 'a',
        label: {
          'zh-TW': 'AD > BC，因為次波向外擴散會自動加速',
          en: 'AD > BC because secondary wavelets accelerate outward',
        },
      },
      {
        id: 'b',
        label: {
          'zh-TW': 'AD = BC = v·Δt，因為入射波與反射波在同一介質中波速相同',
          en: 'AD = BC = v·Δt because incident and reflected waves share the same medium speed',
        },
      },
      {
        id: 'c',
        label: {
          'zh-TW': 'AD < BC，因為反射過程必然損失一半的波速',
          en: 'AD < BC because reflection halves the wave propagation speed',
        },
      },
    ],
    correctOptionId: 'b',
    explanation: {
      'zh-TW':
        '反射發生在同一個介質內，因此次波擴散的速率 vᵣ 等於原入射波速 vᵢ。經過相同的時間 Δt，兩者走過的距離必然相等：AD = BC = v·Δt。你可以在上方「假設反射波速改變」實驗滑桿測試打破這條條件時會發生什麼事！',
      en:
        'Reflection keeps the wave in the same medium, so wavelet speed equals incident speed (vᵣ = vᵢ). Over the same Δt, AD = BC = v·Δt. Try shifting the speed ratio slider above to see how changing vᵣ breaks θᵢ = θᵣ!',
    },
    relatedStage: 3,
  },
  {
    id: 'q3',
    question: {
      'zh-TW': '3. 在幾何證明 △ABC ≅ △ADC 中，我們是利用哪一組三角形全等性質推得入射角等於反射角？',
      en: '3. Which triangle congruence criterion proves △ABC ≅ △ADC and therefore θᵢ = θᵣ?',
    },
    options: [
      {
        id: 'a',
        label: {
          'zh-TW': 'AAA（三個內角對應相等）',
          en: 'AAA (Three equal angles)',
        },
      },
      {
        id: 'b',
        label: {
          'zh-TW': 'RHS（直角、共用斜邊 AC、以及一股 BC = AD 相等）',
          en: 'RHS (Right angles at B and D, shared hypotenuse AC, and equal legs BC = AD)',
        },
      },
      {
        id: 'c',
        label: {
          'zh-TW': 'SSA（任意兩邊與一非夾角相等）',
          en: 'SSA (Two sides and a non-included angle)',
        },
      },
    ],
    correctOptionId: 'b',
    explanation: {
      'zh-TW':
        '由於光線（波傳播方向）必垂直於波前（與包絡面切線），因此 ∠ABC = 90° 且 ∠ADC = 90°。兩直角三角形共用斜邊 AC，且 BC = AD = v·Δt，完全符合 RHS 全等條件，進而證得 ∠BAC = ∠DCA（即 θᵢ = θᵣ）。',
      en:
        'Rays are perpendicular to wavefronts and tangent envelopes, making ∠ABC = ∠ADC = 90°. With shared hypotenuse AC and equal legs BC = AD = v·Δt, RHS congruence guarantees ∠BAC = ∠DCA, meaning θᵢ = θᵣ.',
    },
    relatedStage: 4,
  },
];

export const UI_COPY = {
  brandTitle: {
    'zh-TW': '惠更斯光學實驗室',
    en: 'Huygens Optics Lab',
  },
  navSimulation: {
    'zh-TW': '原理模擬',
    en: 'Simulation',
  },
  navProof: {
    'zh-TW': '幾何證明',
    en: 'Geometric Proof',
  },
  navQuiz: {
    'zh-TW': '觀念檢核',
    en: 'Concept Check',
  },
  navVideo: {
    'zh-TW': '教學影片',
    en: 'Video Reference',
  },
  resetButton: {
    'zh-TW': '重置模擬',
    en: 'Reset Lab',
  },
  heroTitle: {
    'zh-TW': '為什麼惠更斯原理可以解釋反射定律？',
    en: 'Why Does Huygens’ Principle Explain the Law of Reflection?',
  },
  heroSubtitle: {
    'zh-TW':
      '透過微觀「次波源」擴散與「包絡面」切線幾何，親手操作波前推進與入射角，見證時間對稱如何造就 θᵢ = θᵣ。',
    en:
      'Manipulate oblique wavefronts, secondary wavelets, and tangent envelopes to see how equal propagation speed in one medium produces θᵢ = θᵣ.',
  },
};
