import React from 'react';
import { Calendar, FileSpreadsheet, AlertCircle, Info } from 'lucide-react';

interface HeaderProps {
  referenceDate: string;
  privateCount: number;
  activeTab: 'overview' | 'regional' | 'participation' | 'raw';
  onTabChange: (tab: 'overview' | 'regional' | 'participation' | 'raw') => void;
}

export const Header: React.FC<HeaderProps> = ({
  referenceDate,
  privateCount,
  activeTab,
  onTabChange
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-xl font-black text-white tracking-wider">D</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  2026 디비전리그 운영관리 대시보드
                </h1>
                <span className="bg-blue-600/30 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-medium border border-blue-500/30">
                  전국 통합
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                전국 디비전리그 대회 진행률 점검, 미완료 대회 추적 및 시·도 드릴다운 현황
              </p>
            </div>
          </div>

          {/* Right Status Meta info (PDF Header Spec) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 기준일 (고정 표기) */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-blue-400 mr-1.5" />
              <span>기준일 <strong className="text-white font-semibold">{referenceDate}</strong></span>
            </div>

            {/* 비공개 제외 뱃지 */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300">
              <Info className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
              <span>비공개 제외 <strong className="text-white font-semibold">{privateCount}건</strong></span>
            </div>

            {/* 취소 여부 뱃지 */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
              <span>취소 여부 데이터 없음</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-4 pt-2 -mb-px overflow-x-auto text-sm font-medium">
          <button
            onClick={() => onTabChange('overview')}
            className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>1. 전체 진행 현황</span>
          </button>

          <button
            onClick={() => onTabChange('regional')}
            className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'regional'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>2. 지역별 운영 현황 (드릴다운)</span>
          </button>

          <button
            onClick={() => onTabChange('participation')}
            className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'participation'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>3. 참가 현황 (전국/시·도)</span>
          </button>

          <button
            onClick={() => onTabChange('raw')}
            className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'raw'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>대회 전체 검색</span>
          </button>
        </div>
      </div>
    </header>
  );
};
