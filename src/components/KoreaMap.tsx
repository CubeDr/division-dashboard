import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import koreaMapData from '../data/koreaMapData.json';

export interface SidoComparisonItem {
  sido: string;
  groupTeams?: number;
  individualTeams?: number;
  totalTeams?: number;
  단체전?: number;
  개인전?: number;
  합계?: number;
}

interface KoreaMapProps {
  selectedSido: string | null;
  onSelectSido: (sido: string | null) => void;
  sidoTeamCounts: Record<string, { total: number; group: number; individual: number }>;
  nationalOverview: {
    totalTeams: number;
    groupTeams: number;
    individualTeams: number;
    sidoCount: number;
  };
  sidoDetail: {
    sido: string;
    totalTeams: number;
    groupTeams: number;
    individualTeams: number;
    sggCount: number;
    sggList: {
      sgg: string;
      groupTeams: number;
      individualTeams: number;
      totalTeams: number;
    }[];
  } | null;
  allSidoComparison: SidoComparisonItem[];
}

export const KoreaMap: React.FC<KoreaMapProps> = ({
  selectedSido,
  onSelectSido,
  sidoTeamCounts,
  nationalOverview,
  sidoDetail,
  allSidoComparison
}) => {
  const [hoveredSido, setHoveredSido] = useState<string | null>(null);

  // 단체전 / 개인전 필터 토글 상태
  const [showGroup, setShowGroup] = useState<boolean>(true);
  const [showIndividual, setShowIndividual] = useState<boolean>(true);

  const toggleGroup = () => {
    if (showGroup && !showIndividual) return; // 최소 1개는 활성 유지
    setShowGroup((prev) => !prev);
  };

  const toggleIndividual = () => {
    if (showIndividual && !showGroup) return; // 최소 1개는 활성 유지
    setShowIndividual((prev) => !prev);
  };

  // 블루 톤 팔레트 (0팀은 연한 회색)
  const getFillColor = (sido: string, isSelected: boolean, isHovered: boolean, count: number) => {
    if (count === 0) return '#f1f5f9'; // 0팀: 비활성 회색
    if (isSelected) return '#1d4ed8'; // 선택 하이라이트
    if (isHovered) return '#38bdf8'; // 마우스 오버

    if (count >= 70) return '#0284c7';
    if (count >= 40) return '#38bdf8';
    if (count >= 20) return '#7dd3fc';
    return '#bae6fd';
  };

  const activeSido = hoveredSido || selectedSido;
  const activeData = activeSido ? sidoTeamCounts[activeSido] : null;

  // 전국 17개 시·도 기본 데이터 매핑
  const nationalChartData = useMemo(() => {
    if (allSidoComparison && allSidoComparison.length > 0) {
      return allSidoComparison.map((item) => ({
        sido: item.sido,
        groupTeams: item.groupTeams ?? item.단체전 ?? 0,
        individualTeams: item.individualTeams ?? item.개인전 ?? 0,
        totalTeams: item.totalTeams ?? item.합계 ?? 0
      }));
    }
    const sidoList = [
      '강원', '경기', '경남', '경북', '광주', '대구', '대전', '부산',
      '서울', '세종', '울산', '인천', '전남', '전북', '제주', '충남', '충북'
    ];
    return sidoList.map((sido) => {
      const stat = sidoTeamCounts[sido] || { group: 0, individual: 0, total: 0 };
      return {
        sido,
        groupTeams: stat.group,
        individualTeams: stat.individual,
        totalTeams: stat.total
      };
    });
  }, [allSidoComparison, sidoTeamCounts]);

  // 선택된 종목(단체전/개인전)에 따른 전국 정렬 데이터
  const sortedNationalData = useMemo(() => {
    return nationalChartData
      .map((item) => {
        const displayTotal =
          (showGroup ? item.groupTeams : 0) +
          (showIndividual ? item.individualTeams : 0);
        return {
          ...item,
          displayTotal
        };
      })
      .sort((a, b) => {
        if (b.displayTotal !== a.displayTotal) {
          return b.displayTotal - a.displayTotal;
        }
        if (b.totalTeams !== a.totalTeams) {
          return b.totalTeams - a.totalTeams;
        }
        return a.sido.localeCompare(b.sido, 'ko');
      });
  }, [nationalChartData, showGroup, showIndividual]);

  // 선택된 종목(단체전/개인전)에 따른 시·군·구 정렬 데이터
  const sortedSggList = useMemo(() => {
    if (!sidoDetail || !sidoDetail.sggList) return [];
    return sidoDetail.sggList
      .map((item) => {
        const displayTotal =
          (showGroup ? item.groupTeams : 0) +
          (showIndividual ? item.individualTeams : 0);
        return {
          ...item,
          displayTotal
        };
      })
      .sort((a, b) => {
        if (b.displayTotal !== a.displayTotal) {
          return b.displayTotal - a.displayTotal;
        }
        if (b.totalTeams !== a.totalTeams) {
          return b.totalTeams - a.totalTeams;
        }
        return a.sgg.localeCompare(b.sgg, 'ko');
      });
  }, [sidoDetail, showGroup, showIndividual]);

  // 시·군·구 차트의 X축 최댓값 계산 (가장 긴 막대가 전국 그래프처럼 100% 꽉 차도록 보장)
  const maxSggVal = useMemo(() => {
    if (!sortedSggList || sortedSggList.length === 0) return 1;
    return Math.max(...sortedSggList.map((d) => d.displayTotal || 0), 1);
  }, [sortedSggList]);

  // 단체전 바 내부 팀 수 라벨 (너비 12px 이상일 때만 표시)
  const renderInsideGroupLabel = (dataList: any[]) => (props: any) => {
    const { x, y, width, height, index, value } = props;
    const item = dataList && dataList[index];
    const val = item ? item.groupTeams : (typeof value === 'number' ? value : parseInt(value, 10));
    if (!val || val <= 0 || width < 12) return null;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2 + 1}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight={700}
        style={{ pointerEvents: 'none' }}
      >
        {val}
      </text>
    );
  };

  // 개인전 바 내부 팀 수 라벨 (너비 12px 이상일 때만 표시)
  const renderInsideIndividualLabel = (dataList: any[]) => (props: any) => {
    const { x, y, width, height, index, value } = props;
    const item = dataList && dataList[index];
    const val = item ? item.individualTeams : (typeof value === 'number' ? value : parseInt(value, 10));
    if (!val || val <= 0 || width < 12) return null;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2 + 1}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight={700}
        style={{ pointerEvents: 'none' }}
      >
        {val}
      </text>
    );
  };

  // 막대 오른쪽 바깥에 총 팀 수 라벨 표시
  const renderTotalLabel = (dataList: any[]) => (props: any) => {
    const { x, y, width, height, index, value } = props;
    const item = dataList && dataList[index];
    if (!item) return null;
    const total = item.displayTotal ?? item.totalTeams ?? (typeof value === 'number' ? value : parseInt(value, 10) || 0);
    if (total <= 0) return null;
    return (
      <text
        x={x + width + 6}
        y={y + height / 2 + 1}
        fill="#0f172a"
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={800}
        style={{ pointerEvents: 'none' }}
      >
        {total}팀
      </text>
    );
  };

  // 그래프 툴팁 커스텀 렌더러 (어두운 배경에서도 수치와 텍스트가 선명하게 보이도록 고대비 처리)
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-slate-900/95 backdrop-blur-xs border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs select-none min-w-[125px]">
        <p className="font-bold text-white text-xs mb-2 pb-1 border-b border-slate-700/80">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, idx: number) => {
            const isGroup = entry.dataKey === 'groupTeams';
            const dotColor = isGroup ? '#60a5fa' : '#2dd4bf';
            return (
              <div key={`tt-item-${idx}`} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span>{entry.name}</span>
                </span>
                <strong className="text-white font-bold text-xs ml-2">
                  {entry.value}팀
                </strong>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 xl:gap-6 items-start lg:items-stretch">
      {/* 1. 지도 영역 (독립 카드) */}
      <div className="relative w-full lg:w-[460px] xl:w-[480px] flex flex-col items-center justify-center bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
          {/* 지도 오른쪽 상단 세로형 범례 오버레이 */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 text-xs text-slate-600 bg-white/95 backdrop-blur-xs px-2.5 py-2 rounded-xl border border-slate-200 shadow-2xs z-10 select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0284c7] shrink-0"></span>
              <span className="font-bold text-slate-800">70+</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#38bdf8] shrink-0"></span>
              <span className="font-medium text-slate-700">40~69</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#7dd3fc] shrink-0"></span>
              <span className="font-medium text-slate-700">20~39</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#bae6fd] shrink-0"></span>
              <span className="font-medium text-slate-700">1~19</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#f1f5f9] border border-slate-300 shrink-0"></span>
              <span className="text-slate-400 font-medium">0</span>
            </div>
          </div>

          <svg
            viewBox={koreaMapData.viewBox}
            className="w-full h-auto drop-shadow-sm select-none"
            style={{ maxHeight: '740px' }}
          >
            {/* 1. 각 시도 경계선 패스 */}
            {koreaMapData.locations.map((loc: any) => {
              const krName = loc.krName;
              const count = sidoTeamCounts[krName]?.total || 0;
              const isSelected = selectedSido === krName && count > 0;
              const isHovered = hoveredSido === krName && count > 0;
              const fill = getFillColor(krName, isSelected, isHovered, count);

              return (
                <path
                  key={loc.id}
                  id={loc.id}
                  d={loc.path}
                  fill={fill}
                  stroke={isSelected ? '#f59e0b' : isHovered ? '#1e3a8a' : '#ffffff'}
                  strokeWidth={isSelected ? 4 : isHovered ? 2.5 : 1.3}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  onClick={count > 0 ? () => onSelectSido(isSelected ? null : krName) : undefined}
                  onMouseEnter={count > 0 ? () => setHoveredSido(krName) : undefined}
                  onMouseLeave={count > 0 ? () => setHoveredSido(null) : undefined}
                  className={`transition-colors duration-150 ${count > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 2px 8px rgba(37,99,235,0.5))' : undefined
                  }}
                />
              );
            })}

            {/* 2. 각 시도 정밀 중심점 명칭 및 팀 수 라벨 */}
            {koreaMapData.locations.map((loc: any) => {
              const krName = loc.krName;
              const count = sidoTeamCounts[krName]?.total || 0;
              const isSelected = selectedSido === krName && count > 0;
              const isHovered = hoveredSido === krName && count > 0;
              const pos = loc.labelPos || { x: 200, y: 200 };

              const isMetro = ['서울', '세종', '대전', '광주', '대구', '울산', '부산', '인천'].includes(krName);
              const nameFontSize = isMetro ? 14 : 16.5;
              const countFontSize = isMetro ? 11.5 : 13;

              return (
                <g
                  key={`label-${loc.id}`}
                  className="pointer-events-none select-none transition-transform duration-150"
                  style={{
                    transformOrigin: `${pos.x}px ${pos.y}px`,
                    transform: isHovered || isSelected ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {/* 시도명 라벨 (0팀은 회색 텍스트로 처리) */}
                  <text
                    x={pos.x}
                    y={pos.y - 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={count === 0 ? '#94a3b8' : isSelected ? '#1e3a8a' : '#0f172a'}
                    stroke={count === 0 ? '#f8fafc' : '#ffffff'}
                    strokeWidth={count === 0 ? 2 : 4}
                    strokeLinejoin="round"
                    style={{ paintOrder: 'stroke fill' }}
                    fontSize={nameFontSize}
                    fontWeight={count === 0 ? '600' : '800'}
                  >
                    {krName}
                  </text>

                  {/* 참가팀 수 (0팀인 경우 표기 생략) */}
                  {count > 0 && (
                    <text
                      x={pos.x}
                      y={pos.y + 14}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isSelected ? '#1e40af' : '#1e293b'}
                      stroke="#ffffff"
                      strokeWidth={3.4}
                      strokeLinejoin="round"
                      style={{ paintOrder: 'stroke fill' }}
                      fontSize={countFontSize}
                      fontWeight="700"
                    >
                      {count}팀
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* 우측: 개요 및 그래프 영역 */}
        <div className="flex-1 w-full min-w-0 flex flex-col space-y-3.5">
          {/* 2. 개요 영역 (독립 카드) */}
          {selectedSido && activeData && activeData.total > 0 ? (
            /* 선택된 시도 요약 */
            <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <span>참가 요약</span>
                  <span className="text-slate-300 font-normal">|</span>
                  <div className="flex items-center gap-1.5 font-normal">
                    <button
                      type="button"
                      onClick={() => onSelectSido(null)}
                      className="underline text-slate-600 hover:text-blue-600 cursor-pointer font-medium transition-colors"
                      title="전국 단위로 이동"
                    >
                      전국
                    </button>
                    <span className="text-slate-400">&gt;</span>
                    <span className="text-slate-900 font-bold">{selectedSido}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white py-2 px-2 rounded-lg border border-sky-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">총 참가팀</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                    <strong className="text-base font-black text-slate-900">{activeData.total}</strong>
                    <span className="text-[10px] text-slate-500">팀</span>
                  </div>
                </div>

                <div className="bg-white py-2 px-2 rounded-lg border border-sky-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">관할 시·군·구</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                    <strong className="text-base font-black text-slate-900">
                      {sidoDetail ? sidoDetail.sggCount : '-'}
                    </strong>
                    <span className="text-[10px] text-slate-500">개</span>
                  </div>
                </div>

                <div className="bg-white py-2 px-2 rounded-lg border border-sky-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">단체전</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                    <strong className="text-base font-black text-blue-700">{activeData.group}</strong>
                    <span className="text-[10px] text-slate-500">팀</span>
                  </div>
                </div>

                <div className="bg-white py-2 px-2 rounded-lg border border-sky-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">개인전</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                    <strong className="text-base font-black text-teal-700">{activeData.individual}</strong>
                    <span className="text-[10px] text-slate-500">팀</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 전국 전체 요약 */
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <span>참가 요약</span>
                  <span className="text-slate-300 font-normal">|</span>
                  <span className="text-slate-700 font-medium">전국</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white py-2 px-2 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">총 참가팀</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                    <strong className="text-base font-black text-slate-900">
                      {nationalOverview.totalTeams.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-500">팀</span>
                  </div>
                </div>

                <div className="bg-white py-2 px-2 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">시·도 수</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                    <strong className="text-base font-black text-slate-900">
                      {nationalOverview.sidoCount}
                    </strong>
                    <span className="text-[10px] text-slate-500">개</span>
                  </div>
                </div>

                <div className="bg-white py-2 px-2 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">단체전</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                    <strong className="text-base font-black text-blue-700">
                      {nationalOverview.groupTeams.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-500">팀</span>
                  </div>
                </div>

                <div className="bg-white py-2 px-2 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">개인전</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                    <strong className="text-base font-black text-teal-700">
                      {nationalOverview.individualTeams.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-500">팀</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. 그래프 영역 (독립 카드: 세로 나열 막대 그래프) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span>참가 현황</span>
                  <span className="text-slate-300 font-normal">|</span>
                  {selectedSido ? (
                    <div className="flex items-center gap-1.5 font-normal">
                      <button
                        type="button"
                        onClick={() => onSelectSido(null)}
                        className="underline text-slate-600 hover:text-blue-600 cursor-pointer font-medium transition-colors"
                        title="전국 단위로 이동"
                      >
                        전국
                      </button>
                      <span className="text-slate-400">&gt;</span>
                      <span className="text-slate-900 font-bold">{selectedSido}</span>
                    </div>
                  ) : (
                    <span className="text-slate-700 font-medium">전국</span>
                  )}
                </div>
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={toggleGroup}
                  title={showGroup && !showIndividual ? '최소 1개 종목은 선택되어야 합니다' : '단체전 필터 전환'}
                  className={`flex items-center gap-1.5 cursor-pointer select-none transition-colors ${
                    showGroup
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded transition-colors ${
                      showGroup ? 'bg-[#1e3a8a]' : 'bg-slate-300'
                    }`}
                  />
                  <span className="font-medium">단체전</span>
                </button>

                <button
                  type="button"
                  onClick={toggleIndividual}
                  title={showIndividual && !showGroup ? '최소 1개 종목은 선택되어야 합니다' : '개인전 필터 전환'}
                  className={`flex items-center gap-1.5 cursor-pointer select-none transition-colors ${
                    showIndividual
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded transition-colors ${
                      showIndividual ? 'bg-[#0d9488]' : 'bg-slate-300'
                    }`}
                  />
                  <span className="font-medium">개인전</span>
                </button>
              </div>
            </div>

            {selectedSido && sidoDetail ? (
              /* 특정 시도 시·군·구별 막대 그래프 */
              sortedSggList.length === 0 || sortedSggList.every((item) => item.displayTotal === 0) ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-12">
                  선택한 종목에 참가팀 데이터가 없습니다.
                </div>
              ) : (
                <div
                  className="w-full flex-1 overflow-y-auto pr-1"
                  style={{ maxHeight: '580px' }}
                >
                  <div className="w-full" style={{ height: `${Math.max(sortedSggList.length * 32 + 30, 240)}px` }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={sortedSggList}
                        margin={{ top: 5, right: 38, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis
                          type="number"
                          domain={[0, maxSggVal]}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="sgg"
                          tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                          width={48}
                        />
                        <Tooltip content={renderCustomTooltip} />
                        {showGroup && (
                          <Bar
                            dataKey="groupTeams"
                            name="단체전"
                            stackId="a"
                            fill="#1e3a8a"
                            radius={showIndividual ? [0, 0, 0, 0] : [0, 4, 4, 0]}
                            barSize={16}
                            isAnimationActive={true}
                          >
                            {sortedSggList.map((entry, index) => {
                              const isEnd = !showIndividual || !entry.individualTeams || entry.individualTeams <= 0;
                              return (
                                <Cell
                                  key={`cell-sgg-group-${entry.sgg}-${index}`}
                                  fill="#1e3a8a"
                                  radius={(isEnd ? [0, 4, 4, 0] : [0, 0, 0, 0]) as any}
                                />
                              );
                            })}
                            <LabelList dataKey="groupTeams" content={renderInsideGroupLabel(sortedSggList)} />
                            {!showIndividual && (
                              <LabelList dataKey="displayTotal" content={renderTotalLabel(sortedSggList)} />
                            )}
                          </Bar>
                        )}
                        {showIndividual && (
                          <Bar
                            dataKey="individualTeams"
                            name="개인전"
                            stackId="a"
                            fill="#0d9488"
                            radius={[0, 4, 4, 0]}
                            barSize={16}
                            isAnimationActive={true}
                          >
                            <LabelList dataKey="individualTeams" content={renderInsideIndividualLabel(sortedSggList)} />
                            <LabelList dataKey="displayTotal" content={renderTotalLabel(sortedSggList)} />
                          </Bar>
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            ) : (
              /* 전국 17개 시·도별 막대 그래프 (세로 나열) */
              <div
                className="w-full flex-1 overflow-y-auto pr-1"
                style={{ maxHeight: '580px' }}
              >
                <div className="w-full" style={{ height: '560px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={sortedNationalData}
                      margin={{ top: 5, right: 38, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        domain={[0, 'dataMax']}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="sido"
                        tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                        width={30}
                      />
                      <Tooltip content={renderCustomTooltip} />
                      {showGroup && (
                        <Bar
                          dataKey="groupTeams"
                          name="단체전"
                          stackId="a"
                          fill="#1e3a8a"
                          radius={showIndividual ? [0, 0, 0, 0] : [0, 4, 4, 0]}
                          barSize={16}
                          cursor="pointer"
                          isAnimationActive={true}
                          onClick={(data: any) => {
                            if (data && (data.displayTotal > 0 || data.totalTeams > 0)) {
                              onSelectSido(selectedSido === data.sido ? null : data.sido);
                            }
                          }}
                        >
                          {sortedNationalData.map((entry, index) => {
                            const isEnd = !showIndividual || !entry.individualTeams || entry.individualTeams <= 0;
                            return (
                              <Cell
                                key={`cell-nat-group-${entry.sido}-${index}`}
                                fill="#1e3a8a"
                                radius={(isEnd ? [0, 4, 4, 0] : [0, 0, 0, 0]) as any}
                              />
                            );
                          })}
                          <LabelList dataKey="groupTeams" content={renderInsideGroupLabel(sortedNationalData)} />
                          {!showIndividual && (
                            <LabelList dataKey="displayTotal" content={renderTotalLabel(sortedNationalData)} />
                          )}
                        </Bar>
                      )}
                      {showIndividual && (
                        <Bar
                          dataKey="individualTeams"
                          name="개인전"
                          stackId="a"
                          fill="#0d9488"
                          radius={[0, 4, 4, 0]}
                          barSize={16}
                          cursor="pointer"
                          isAnimationActive={true}
                          onClick={(data: any) => {
                            if (data && (data.displayTotal > 0 || data.totalTeams > 0)) {
                              onSelectSido(selectedSido === data.sido ? null : data.sido);
                            }
                          }}
                        >
                          <LabelList dataKey="individualTeams" content={renderInsideIndividualLabel(sortedNationalData)} />
                          <LabelList dataKey="displayTotal" content={renderTotalLabel(sortedNationalData)} />
                        </Bar>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};
