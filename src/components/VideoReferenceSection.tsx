import React, { useState } from 'react';
import { ExternalLink, PlayCircle } from 'lucide-react';
import { Language } from '../types/physics';

interface VideoReferenceSectionProps {
  language: Language;
}

const YOUTUBE_VIDEO_ID = '5xtA1zA_C0A';
const YOUTUBE_URL = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`;

export const VideoReferenceSection: React.FC<VideoReferenceSectionProps> = ({
  language,
}) => {
  const [embedLoaded, setEmbedLoaded] = useState(false);

  return (
    <section id="video-reference" className="py-12 border-t border-slate-200">
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-medium text-slate-500">
            <span>STAG LAB</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>{language === 'zh-TW' ? '高中物理教學影片' : 'High School Physics Video'}</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {language === 'zh-TW'
              ? '為何惠更斯原理可以解釋反射定律？'
              : 'Why Can Huygens’ Principle Explain the Law of Reflection?'}
          </h2>

          <p className="text-sm leading-relaxed text-slate-600">
            {language === 'zh-TW'
              ? '本互動實驗室依據 STAG LAB 原創物理教學影片的核心脈絡設計，將平面波斜向入射時的波前推進、各點次波擴散半徑與公切線包絡面視覺化，幫助同學把影片中的幾何圖解轉化為可自行調整角度與時間軸的動態直覺。'
              : 'Inspired by STAG LAB’s high school physics lesson, this interactive lab turns oblique wavefront motion, secondary wavelets, and common tangent envelopes into a manipulable geometric simulation.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEmbedLoaded((prev) => !prev)}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" aria-hidden="true" />
              <span>
                {embedLoaded
                  ? language === 'zh-TW'
                    ? '收合內嵌播放器'
                    : 'Hide Embedded Player'
                  : language === 'zh-TW'
                    ? '載入 YouTube 教學影片'
                    : 'Load YouTube Player'}
              </span>
            </button>

            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <span>
                {language === 'zh-TW' ? '前往 YouTube 觀看' : 'Watch on YouTube'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">
          {embedLoaded ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0`}
                title="為何惠更斯原理可以解釋反射定律？ #高中物理 - STAG LAB"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative w-full aspect-video rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <svg
                viewBox="0 0 360 160"
                className="w-64 h-28 mb-4"
                aria-hidden="true"
              >
                <line
                  x1="30"
                  y1="130"
                  x2="330"
                  y2="130"
                  stroke="#0F172A"
                  strokeWidth="2.5"
                />
                <circle
                  cx="100"
                  cy="130"
                  r="64"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="1.75"
                  strokeDasharray="4 3"
                />
                <circle
                  cx="145"
                  cy="130"
                  r="42"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                />
                <circle
                  cx="190"
                  cy="130"
                  r="20"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="1.5"
                  strokeOpacity="0.45"
                />
                <line
                  x1="100"
                  y1="130"
                  x2="136"
                  y2="77"
                  stroke="#0284C7"
                  strokeWidth="2"
                />
                <line
                  x1="136"
                  y1="77"
                  x2="230"
                  y2="130"
                  stroke="#059669"
                  strokeWidth="2.5"
                />
              </svg>
              <p className="text-sm font-semibold text-slate-900 mb-1">
                STAG LAB · {YOUTUBE_VIDEO_ID}
              </p>
              <p className="text-xs text-slate-500 max-w-md">
                {language === 'zh-TW'
                  ? '點擊左側「載入 YouTube 教學影片」即可於頁內播放，或直接於 YouTube 開啟原片。'
                  : 'Click “Load YouTube Player” to play inline, or open directly on YouTube.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
