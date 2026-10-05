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
  ChevronRight,
  X,
  Calendar,
  MapPin,
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
  getUncompletedTournaments
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
  const [detailModalItem, setDetailModalItem] = useState<TournamentDetailInfo | null>(null);

  const leagueStats = getLeagueStats(tournaments, players);
  const monthlyData = getMonthlyStats(tournaments, players, selectedLeague, referenceDate);

  // 미완료 대회 목록
  const uncompletedList = selectedMonth !== null
    ? getUncompletedTournaments(tournaments, players, selectedLeague, selectedMonth, referenceDate)
    : [];

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
              className={`rounded-t-xl sm:rounded-t-2xl p-2.5 sm:p-3.5 md:p-4 transition-all duration-200 ${
                isSelected
                  ? 'bg-white border-x border-t border-slate-300 border-b-2 border-b-white border-t-[3px] border-t-blue-600 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.05)] pb-2.5 sm:pb-3 md:pb-3.5 relative z-20'
                  : 'bg-slate-100/75 hover:bg-slate-50/90 border border-slate-200/80 text-slate-500 hover:text-slate-700 pb-2.5 sm:pb-3 md:pb-3.5 relative z-10'
              }`}
            >
              {/* 모바일 화면 (< sm): 컴팩트 3줄 중앙 정렬 (진행도 + 수치 통합 표기) */}
              <div className="sm:hidden flex flex-col items-center justify-between w-full">
                {/* 상단: 아이콘 + 리그명 */}
                <div className="flex items-center justify-center space-x-1.5 w-full">
                  <div className={`p-1 rounded-md ${isSelected ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/60 text-slate-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className={`font-bold text-xs leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                    {name}
                  </h3>
                </div>

                {/* 중단: 진행도 + (완료 / 전체) 통합 표기 */}
                <div className="flex flex-wrap items-baseline justify-center gap-1 my-0.5 w-full">
                  <span className={`text-sm font-bold tracking-tight ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                    {stat.rate}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    ({stat.completed} / {stat.total})
                  </span>
                </div>

                {/* 하단: 미완료 수치 */}
                <div className="text-[10px] text-center w-full">
                  <span className={isSelected ? 'text-orange-600 font-semibold' : 'text-slate-500'}>
                    미완료 {stat.uncompleted}
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
        {/* 2. 월별 진행상황 차트 영역 */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              월별 진행상황
            </h3>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600"></span>
                <span className="text-slate-700">완료(해당 월)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-500"></span>
                <span className="text-slate-700">미완료(누적)</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full mt-4 cursor-pointer [&_.recharts-surface]:cursor-pointer [&_.recharts-tooltip-cursor]:cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                onClick={handleBarClick}
                margin={{ top: 28, right: 20, left: -15, bottom: 5 }}
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

        {/* 3. 특정 월 기준 미완료 대회 목록 (차트 카드 내부 서랍 형태로 내포) */}
        {selectedMonth !== null && (
          <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></div>
              <h3 className="font-bold text-slate-900 text-base">
                2026년 {selectedMonth}월 기준 미완료 대회
                <span className="text-orange-600 ml-1.5 font-bold">
                  (누적 {uncompletedList.length}건)
                </span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {uncompletedList.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg border border-slate-200 text-slate-500 text-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  2026년 {selectedMonth}월까지 누적된 미완료 대회가 없습니다.
                </div>
              ) : (
                uncompletedList.map((item, idx) => (
                  <button
                    type="button"
                    key={`${item.tournament.대회명}-${idx}`}
                    onClick={() => setDetailModalItem(item)}
                    className="w-full text-left bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm hover:bg-slate-50/50 rounded-lg p-3.5 flex items-center justify-between gap-3 transition cursor-pointer group"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">
                          {item.tournament.시도} {item.tournament.시군구 && `/ ${item.tournament.시군구}`}
                        </span>
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">
                          {item.tournament.라운드}
                        </span>
                        <span className="text-xs text-slate-400">
                          종료일: {item.tournament.종료일}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {item.tournament.대회명}
                      </h4>

                      <div className="text-xs text-orange-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          상태: 결과 미입력
                          {item.needCheck && (
                            <strong className="ml-1 text-red-600 font-semibold">
                              (기준일 경과 후 결과 미입력 - 확인 필요)
                            </strong>
                          )}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 대회 상세 모달 */}
      {detailModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {detailModalItem.tournament.리그}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {detailModalItem.tournament.라운드}
                </span>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4">
              <h3 className="text-lg font-bold text-slate-900">
                {detailModalItem.tournament.대회명}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {detailModalItem.tournament.시도} {detailModalItem.tournament.시군구}
                </span>
                <span>·</span>
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {detailModalItem.tournament.시작일} ~ {detailModalItem.tournament.종료일}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">진행 상태</span>
                <strong className={detailModalItem.isCompleted ? 'text-emerald-600' : 'text-orange-600'}>
                  {detailModalItem.isCompleted ? '완료' : '미완료'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">결과 입력 여부</span>
                <strong className={detailModalItem.isCompleted ? 'text-blue-600' : 'text-slate-600'}>
                  {detailModalItem.isCompleted ? '입력됨' : '미입력'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">관리 상태</span>
                <strong className={detailModalItem.needCheck ? 'text-red-600 font-bold' : 'text-emerald-600 font-medium'}>
                  {detailModalItem.needCheck ? '확인 필요' : '정상 진행'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">총 참가팀</span>
                <strong className="text-slate-900">
                  {detailModalItem.totalTeams > 0 ? `${detailModalItem.totalTeams}팀` : '데이터 없음'}
                </strong>
              </div>
            </div>

            {/* 입상 정보 */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">입상팀 / 순위 정보</h4>
              {detailModalItem.rankings.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg text-slate-400 text-xs">
                  등록된 결과 데이터(선수 순위)가 없습니다.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                  {detailModalItem.rankings.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          r.순위.includes('1') ? 'bg-amber-100 text-amber-800' :
                          r.순위.includes('2') ? 'bg-slate-200 text-slate-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {r.순위}
                        </span>
                        <span className="font-medium text-slate-800">{r.소속1 || '무소속'}</span>
                        <span className="text-slate-500 font-normal">({r.성명1 || '선수명 없음'})</span>
                      </div>
                      <div className="text-slate-400 text-right">
                        <span>{r.종목}</span> · <span>{r.연령}</span> · <span>{r.급수}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
