import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  LabelList
} from 'recharts';
import {
  Trophy,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  Tournament,
  PlayerRank,
  LeagueName,
  TournamentDetailInfo
} from '../types/dashboard';
import {
  getLeagueStats,
  getMonthlyStats,
  getUncompletedTournaments,
  getCompletedTournaments
} from '../utils/dashboardLogic';

interface LeagueOverviewProps {
  tournaments: Tournament[];
  players: PlayerRank[];
  referenceDate: string;
  selectedLeague: LeagueName;
  onSelectLeague: (league: LeagueName) => void;
  onSelectTournamentModal?: (tournament: TournamentDetailInfo) => void;
}

export const LeagueOverview: React.FC<LeagueOverviewProps> = ({
  tournaments,
  players,
  referenceDate,
  selectedLeague,
  onSelectLeague,
  onSelectTournamentModal
}) => {
  // 기준일 기준 가장 최신 월을 기본 선택
  const latestMonth = referenceDate ? parseInt(referenceDate.substring(5, 7), 10) : 9;
  const [selectedMonth, setSelectedMonth] = useState<number | null>(latestMonth);
  const [activeSubTab, setActiveSubTab] = useState<'completed' | 'uncompleted'>('uncompleted');
  const [expandedTournament, setExpandedTournament] = useState<string | null>(null);

  const leagueStats = getLeagueStats(tournaments, players);
  const monthlyData = getMonthlyStats(tournaments, players, selectedLeague, referenceDate);

  // 해당 월 완료 대회 목록
  const completedList = selectedMonth !== null
    ? getCompletedTournaments(tournaments, players, selectedLeague, selectedMonth, referenceDate)
    : [];

  // 특정 월까지 누적 미완료 대회 목록
  const uncompletedList = selectedMonth !== null
    ? getUncompletedTournaments(tournaments, players, selectedLeague, selectedMonth, referenceDate)
    : [];

  const currentList = activeSubTab === 'completed' ? completedList : uncompletedList;

  const leagues: { name: LeagueName; icon: any; color: string; desc: string }[] = [
    {
      name: '성인부리그',
      icon: Users,
      color: 'from-blue-600 to-indigo-700',
      desc: '일반 성인 동호인 대상 디비전 4~6 리그'
    },
    {
      name: '유청소년리그',
      icon: Trophy,
      color: 'from-teal-600 to-emerald-700',
      desc: '초·중·고 유청소년 육성 및 참여 리그'
    },
    {
      name: '시니어리그',
      icon: Award,
      color: 'from-amber-600 to-orange-700',
      desc: '어르신·시니어 건강 증진 배드민턴 리그'
    }
  ];

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const monthObj = data.activePayload[0].payload;
      setSelectedMonth((prev) => (prev === monthObj.month ? null : monthObj.month));
    }
  };



  return (
    <div>
      {/* 1. 상단 리그 선택 일체형 탭 (모바일에서도 3열 유지하여 줄바꿈 방지) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 relative z-10 -mb-px">
        {leagues.map(({ name, icon: Icon }) => {
          const stat = leagueStats[name] || { total: 0, completed: 0, uncompleted: 0, rate: 0 };
          const isSelected = selectedLeague === name;

          return (
            <button
              type="button"
              key={name}
              onClick={() => onSelectLeague(name)}
              className={`rounded-t-xl sm:rounded-t-2xl p-2 sm:p-3.5 md:p-4 transition-all duration-200 ${
                isSelected
                  ? 'bg-white border-x border-t border-slate-300 border-b-2 border-b-white border-t-[3px] border-t-blue-600 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.05)] pb-2 sm:pb-3 md:pb-3.5 relative z-20'
                  : 'bg-slate-100/75 hover:bg-slate-50/90 border border-slate-200/80 text-slate-500 hover:text-slate-700 pb-2 sm:pb-3 md:pb-3.5 relative z-10'
              }`}

            >
              {/* 모바일 화면 (< sm): 슬림 2줄 레이아웃 (1행: 리그명 + 미완료 뱃지 / 2행: 진행도 + 모수) */}
              <div className="sm:hidden flex flex-col items-center justify-center w-full py-0.5">
                {/* 1행: 리그명 + 미완료 알림 뱃지 */}
                <div className="flex items-center justify-center gap-1.5 w-full whitespace-nowrap">
                  <span className={`font-bold text-xs leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                    {name.replace('리그', '')}
                  </span>
                  <span
                    title={`미완료 ${stat.uncompleted}건`}
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0 ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {stat.uncompleted}
                  </span>
                </div>

                {/* 2행: 진행도 + (완료 / 전체) 통합 표기 */}
                <div className="flex items-baseline justify-center gap-1 mt-1 w-full whitespace-nowrap">
                  <span className={`text-xs font-extrabold tracking-tight ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                    {stat.rate}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ({stat.completed}/{stat.total})
                  </span>
                </div>
              </div>


              {/* 넓은 화면 (>= sm): 기존 분리 레이아웃 유지 (진행률 분리 + 프로그레스바 + 완료/전체/미완료 가로 정렬, 여백 슬림화 적용) */}
              <div className="hidden sm:block w-full text-left">
                {/* 상단: 아이콘 + 리그명 */}
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/60 text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className={`font-bold text-sm md:text-base leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                    {name}
                  </h3>
                </div>

                {/* 중단: 진행도 */}
                <div className="flex items-baseline space-x-2 my-1.5">
                  <span className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                    {stat.rate}%
                  </span>
                  <span className="text-xs text-slate-500 font-medium">진행률</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200/60 rounded-full h-1.5 my-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isSelected ? 'bg-blue-600' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.min(stat.rate, 100)}%` }}
                  />
                </div>

                {/* 하단: 통계 (완료 / 전체 · 미완료, 슬림 여백) */}
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1 border-t border-slate-100">
                  <span>완료 <strong className="text-slate-900">{stat.completed}</strong></span>
                  <span className="text-slate-300">/</span>
                  <span>전체 <strong className="text-slate-900">{stat.total}</strong></span>
                  <span className="text-slate-300">·</span>
                  <span className={isSelected ? 'text-orange-600 font-semibold' : 'text-slate-500'}>
                    미완료 {stat.uncompleted}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2 & 3. 통합 메인 컨테이너 (차트 + 하위 미완료 대회 서랍) */}
      <div className="bg-white rounded-t-none rounded-b-2xl border border-slate-300 shadow-sm overflow-hidden relative z-0">
        {/* 2. 월별 진행상황 차트 영역 (모바일 여백 슬림화 및 높이 축소) */}
        <div className="py-3 px-3.5 sm:p-6">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 sm:gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              월별 진행상황
            </h3>

            <div className="flex items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-emerald-600"></span>
                <span className="text-slate-700">완료(해당 월)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-orange-500"></span>
                <span className="text-slate-700">미완료(누적)</span>
              </div>
            </div>
          </div>

          <div className="h-52 sm:h-64 md:h-72 w-full mt-2.5 sm:mt-4 cursor-pointer [&_.recharts-surface]:cursor-pointer [&_.recharts-tooltip-cursor]:cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                onClick={handleBarClick}
                margin={{ top: 24, right: 12, left: -18, bottom: 2 }}
              >

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                {selectedMonth !== null && (
                  <ReferenceArea
                    x1={`${selectedMonth}월`}
                    x2={`${selectedMonth}월`}
                    fill="#3b82f6"
                    fillOpacity={0.08}
                    stroke="#93c5fd"
                    strokeOpacity={0.6}
                    strokeDasharray="3 3"
                  />
                )}
                <XAxis
                  dataKey="monthLabel"
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tick={({ x, y, payload }) => {
                    const monthNum = parseInt(payload.value, 10);
                    const isSelected = selectedMonth === monthNum;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={14}
                          textAnchor="middle"
                          fill={isSelected ? '#2563eb' : '#64748b'}
                          fontWeight={isSelected ? 700 : 500}
                          fontSize={isSelected ? 13 : 12}
                        >
                          {payload.value}
                        </text>
                        {isSelected && (
                          <circle cx={0} cy={22} r={2.5} fill="#2563eb" />
                        )}
                      </g>
                    );
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip
                  content={() => null}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.14)', radius: 6, style: { cursor: 'pointer' } }}
                />
                <Bar
                  dataKey="completed"
                  name="완료(해당 월)"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  isAnimationActive={false}
                  onClick={(entry: any) => {
                    if (entry && entry.month) {
                      setSelectedMonth(entry.month);
                      setActiveSubTab('completed');
                      setExpandedTournament(null);
                    }
                  }}
                >
                  <LabelList
                    dataKey="completed"
                    position="top"
                    fill="#047857"
                    stroke="none"
                    strokeWidth={0}
                    fontSize={11}
                    fontWeight={700}
                    formatter={(val: any) => (Number(val) > 0 ? `${val}` : '')}
                  />
                  {monthlyData.map((entry) => {
                    const isSelected = selectedMonth === entry.month;
                    return (
                      <Cell
                        key={`cell-completed-${entry.month}`}
                        fill="#059669"
                        stroke={isSelected ? '#065f46' : 'none'}
                        strokeWidth={isSelected ? 2.5 : 0}
                      />
                    );
                  })}
                </Bar>
                <Bar
                  dataKey="uncompletedCumulative"
                  name="미완료(누적)"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  isAnimationActive={false}
                  onClick={(entry: any) => {
                    if (entry && entry.month) {
                      setSelectedMonth(entry.month);
                      setActiveSubTab('uncompleted');
                      setExpandedTournament(null);
                    }
                  }}
                >
                  <LabelList
                    dataKey="uncompletedCumulative"
                    position="top"
                    fill="#c2410c"
                    stroke="none"
                    strokeWidth={0}
                    fontSize={11}
                    fontWeight={700}
                    formatter={(val: any) => (Number(val) > 0 ? `${val}` : '')}
                  />
                  {monthlyData.map((entry) => {
                    const isSelected = selectedMonth === entry.month;
                    return (
                      <Cell
                        key={`cell-uncompleted-${entry.month}`}
                        fill="#ea580c"
                        stroke={isSelected ? '#9a3412' : 'none'}
                        strokeWidth={isSelected ? 2.5 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. 특정 월 기준 대회 목록 (완료/미완료 서브 탭 + 인라인 아코디언 카드) */}
        {selectedMonth !== null && (
          <div className="border-t border-slate-200 bg-slate-50/70 p-4 sm:p-6 transition-all">
            {/* 서브 탭 & 카운트 요약 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    activeSubTab === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-orange-500 animate-pulse'
                  }`}
                />
                <h3 className="font-bold text-slate-900 text-base">
                  2026년 {selectedMonth}월 {activeSubTab === 'completed' ? '완료' : '미완료'} 대회
                  <span
                    className={`ml-1.5 font-bold ${
                      activeSubTab === 'completed' ? 'text-emerald-600' : 'text-orange-600'
                    }`}
                  >
                    ({activeSubTab === 'completed' ? `해당 월 ${completedList.length}건` : `누적 ${uncompletedList.length}건`})
                  </span>
                </h3>
              </div>

              {/* 완료 / 미완료 탭 토글 캡슐 */}
              <div className="flex items-center bg-slate-200/80 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab('completed');
                    setExpandedTournament(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                    activeSubTab === 'completed'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>완료 ({completedList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab('uncompleted');
                    setExpandedTournament(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                    activeSubTab === 'uncompleted'
                      ? 'bg-white text-orange-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>미완료 ({uncompletedList.length})</span>
                </button>
              </div>
            </div>

            {/* 대회 목록 아코디언 카드 리스트 */}
            <div className="space-y-3">
              {currentList.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                  {activeSubTab === 'completed' ? (
                    <>
                      <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      2026년 {selectedMonth}월에 완료된 대회가 없습니다.
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      2026년 {selectedMonth}월까지 누적된 미완료 대회가 없습니다.
                    </>
                  )}
                </div>
              ) : (
                currentList.map((item) => {
                  const isExpanded = expandedTournament === item.tournament.대회명;

                  return (
                    <div
                      key={item.tournament.대회명}
                      className={`border rounded-xl transition duration-150 overflow-hidden ${
                        isExpanded
                          ? 'border-blue-500 shadow-md bg-white'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {/* 대회 헤더 행 (클릭하여 아코디언 토글 - 모바일 깨짐 방지 레이아웃) */}
                      <div
                        onClick={() =>
                          setExpandedTournament(isExpanded ? null : item.tournament.대회명)
                        }
                        className="p-3 sm:p-4 cursor-pointer select-none hover:bg-slate-50 transition"
                      >
                        {/* 1행: [라운드 뱃지] + [대회명] ──── [상태 뱃지] + [펼치기 아이콘] */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-1.5 sm:gap-2 flex-1 min-w-0">
                            <span className="text-[11px] sm:text-xs font-bold text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded shrink-0 whitespace-nowrap mt-0.5">
                              {item.tournament.라운드}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug break-keep">
                              {item.tournament.대회명}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            {item.isCompleted ? (
                              <span className="bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs px-2 py-0.5 rounded-full font-bold border border-emerald-200 whitespace-nowrap">
                                완료
                              </span>
                            ) : item.needCheck ? (
                              <span className="bg-orange-100 text-orange-800 text-[11px] sm:text-xs px-2 py-0.5 rounded-full font-bold border border-orange-200 whitespace-nowrap">
                                확인 필요
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 text-[11px] sm:text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                                미완료
                              </span>
                            )}

                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* 2행: [지역 · 리그 · 일정] ──── [종료일] */}
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] sm:text-xs text-slate-400 mt-2 pt-1.5 border-t border-slate-100 sm:border-t-0 sm:pt-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                            <span className="text-slate-600 font-medium">
                              {item.tournament.시도} {item.tournament.시군구 && `/ ${item.tournament.시군구}`}
                            </span>
                            <span>·</span>
                            <span>{item.tournament.리그}</span>
                            <span className="hidden xs:inline">·</span>
                            <span className="hidden xs:inline">{item.tournament.시작일} ~ {item.tournament.종료일}</span>
                          </div>

                          <span className="text-slate-500 font-mono text-[11px] shrink-0">
                            종료: {item.tournament.종료일}
                          </span>
                        </div>
                      </div>


                      {/* 아코디언 확장 영역 (대회 상세 정보 & 입상자) */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs">
                          {/* 상세 그리드 메타데이터 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                            <div className="space-y-2">
                              <div>
                                <span className="text-slate-400 block font-medium">대회명</span>
                                <span className="font-bold text-slate-900 text-sm">
                                  {item.tournament.대회명}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">개최일정</span>
                                <span className="font-semibold text-slate-800">
                                  {item.tournament.시작일} ~ {item.tournament.종료일}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">개인전/단체전 구분</span>
                                <span className="font-semibold text-slate-800">
                                  {item.groupTeams > 0 && item.individualTeams > 0
                                    ? '단체전 / 개인전 병행'
                                    : item.groupTeams > 0
                                    ? '단체전'
                                    : item.individualTeams > 0
                                    ? '개인전'
                                    : '미확인'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <span className="text-slate-400 block font-medium">리그 유형</span>
                                <span className="font-semibold text-slate-800">
                                  {item.tournament.리그}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">결과 입력 여부</span>
                                <span className={`font-bold ${item.isCompleted ? 'text-blue-600' : 'text-orange-600'}`}>
                                  {item.isCompleted ? '입력됨' : '미입력'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">관리/진행 상태</span>
                                <span className={`font-bold ${item.needCheck ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {item.isCompleted ? '완료' : item.needCheck ? '확인 필요' : '예정 (정상)'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <span className="text-slate-400 block font-medium">개최 지역</span>
                                <span className="font-semibold text-slate-800">
                                  {item.tournament.시도} / {item.tournament.시군구 || `${item.tournament.시도} (시군구 미기재, 시도명으로 표시)`}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">참가팀 수</span>
                                <span className="font-bold text-slate-900">
                                  {item.totalTeams > 0
                                    ? `총 ${item.totalTeams}팀 (단체 ${item.groupTeams}팀, 개인 ${item.individualTeams}팀)`
                                    : '미입력 (데이터 없음)'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">취소 여부</span>
                                <span className="text-slate-400 font-medium">데이터 없음</span>
                              </div>
                            </div>
                          </div>

                          {/* 입상팀 / 입상자 정보 테이블 */}
                          <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span>입상팀 / 입상자 명단</span>
                              </h5>
                              <span className="text-slate-400">
                                총 {item.rankings.length}건 등록
                              </span>
                            </div>

                            {item.rankings.length === 0 ? (
                              <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-lg">
                                결과 데이터가 등록되지 않았습니다.
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                      <th className="py-2 px-3">순위</th>
                                      <th className="py-2 px-3">종목</th>
                                      <th className="py-2 px-3">연령/급수</th>
                                      <th className="py-2 px-3">참가팀수</th>
                                      <th className="py-2 px-3">소속 1 (선수 1)</th>
                                      <th className="py-2 px-3">소속 2 (선수 2)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {item.rankings.map((r, i) => (
                                      <tr key={i} className="hover:bg-slate-50/80">
                                        <td className="py-2.5 px-3">
                                          <span className={`px-2 py-0.5 rounded font-bold ${
                                            r.순위.includes('1')
                                              ? 'bg-amber-100 text-amber-800'
                                              : r.순위.includes('2')
                                              ? 'bg-slate-200 text-slate-800'
                                              : 'bg-orange-100 text-orange-800'
                                          }`}>
                                            {r.순위}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                                          {r.종목}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600">
                                          {r.연령} {r.급수}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-500">
                                          {r.참가팀수}팀
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-700">
                                          <span className="font-medium text-slate-900">{r.소속1 || '-'}</span>
                                          {r.성명1 && <span className="text-slate-500 ml-1">({r.성명1})</span>}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-700">
                                          <span className="font-medium text-slate-900">{r.소속2 || '-'}</span>
                                          {r.성명2 && <span className="text-slate-500 ml-1">({r.성명2})</span>}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

