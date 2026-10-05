import React from 'react';

interface HeaderProps {
  referenceDate?: string;
  activeTab: 'overview' | 'regional' | 'participation';
  onTabChange: (tab: 'overview' | 'regional' | 'participation') => void;
}

const formatDateText = (dateStr?: string) => {
  if (!dateStr) return '2026년 9월 18일 기준';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일 기준`;
  }
  return `${dateStr} 기준`;
};

const formatShortDateText = (dateStr?: string) => {
  if (!dateStr) return '9.18 기준';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parseInt(parts[1], 10)}.${parseInt(parts[2], 10)} 기준`;
  }
  return `${dateStr} 기준`;
};

export const Header: React.FC<HeaderProps> = ({
  referenceDate,
  activeTab,
  onTabChange
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-stretch md:justify-between">
          {/* Logo & Title (모바일 슬림화: 로고 축소, 한 줄 정렬) */}
          <div className="flex items-center justify-center md:justify-start space-x-2 sm:space-x-3 py-2 md:py-0 md:h-16">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 rounded-md sm:rounded-lg md:rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <span className="text-xs sm:text-sm md:text-lg font-black text-white tracking-wider">D</span>
            </div>
            <div className="flex items-baseline justify-center md:justify-start gap-1.5 sm:gap-2 md:gap-2.5">
              <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-white leading-tight">
                2026 디비전리그 대시보드
              </h1>
              <span className="text-[11px] sm:text-xs text-slate-400 font-normal whitespace-nowrap">
                <span className="hidden sm:inline">{formatDateText(referenceDate)}</span>
                <span className="sm:hidden text-slate-400">· {formatShortDateText(referenceDate)}</span>
              </span>
            </div>
          </div>

          {/* Navigation Tabs (모바일 슬림화: 균등 3분할, 패딩 축소, 얇은 인디케이터) */}
          <nav className="grid grid-cols-3 md:flex md:justify-end text-xs sm:text-sm font-medium -mb-px w-full md:w-auto border-t border-slate-800/80 md:border-t-0">
            <button
              onClick={() => onTabChange('overview')}
              className={`py-2 px-2 sm:px-4 md:py-0 md:h-16 border-b-2 md:border-b-[3px] transition-all whitespace-nowrap flex items-center justify-center ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-400 font-semibold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/20'
              }`}
            >
              <span>전체 현황</span>
            </button>

            <button
              onClick={() => onTabChange('regional')}
              className={`py-2 px-2 sm:px-4 md:py-0 md:h-16 border-b-2 md:border-b-[3px] transition-all whitespace-nowrap flex items-center justify-center ${
                activeTab === 'regional'
                  ? 'border-blue-500 text-blue-400 font-semibold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/20'
              }`}
            >
              <span>지역별 현황</span>
            </button>

            <button
              onClick={() => onTabChange('participation')}
              className={`py-2 px-2 sm:px-4 md:py-0 md:h-16 border-b-2 md:border-b-[3px] transition-all whitespace-nowrap flex items-center justify-center ${
                activeTab === 'participation'
                  ? 'border-blue-500 text-blue-400 font-semibold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/20'
              }`}
            >
              <span>참가 현황</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};


