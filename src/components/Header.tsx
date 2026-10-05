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

export const Header: React.FC<HeaderProps> = ({
  referenceDate,
  activeTab,
  onTabChange
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-stretch md:justify-between">
          {/* Logo & Title */}
          <div className="flex items-center justify-center md:justify-start space-x-3 py-3 md:py-0 md:h-16">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <span className="text-lg font-black text-white tracking-wider">D</span>
            </div>
            <div className="flex flex-wrap items-baseline justify-center md:justify-start gap-2 sm:gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                2026 디비전리그 대시보드
              </h1>
              <span className="text-xs text-slate-400 font-normal whitespace-nowrap">
                {formatDateText(referenceDate)}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap md:flex-nowrap justify-center md:justify-end space-x-1 sm:space-x-2 text-sm font-medium -mb-px w-full md:w-auto">
            <button
              onClick={() => onTabChange('overview')}
              className={`px-4 py-3 md:py-0 md:h-16 border-b-[3px] transition-all whitespace-nowrap flex items-center justify-center ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-400 font-semibold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/20'
              }`}
            >
              <span>전체 현황</span>
            </button>

            <button
              onClick={() => onTabChange('regional')}
              className={`px-4 py-3 md:py-0 md:h-16 border-b-[3px] transition-all whitespace-nowrap flex items-center justify-center ${
                activeTab === 'regional'
                  ? 'border-blue-500 text-blue-400 font-semibold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/20'
              }`}
            >
              <span>지역별 현황</span>
            </button>

            <button
              onClick={() => onTabChange('participation')}
              className={`px-4 py-3 md:py-0 md:h-16 border-b-[3px] transition-all whitespace-nowrap flex items-center justify-center ${
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

