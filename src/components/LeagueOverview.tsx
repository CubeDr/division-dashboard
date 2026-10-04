import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Trophy,
  Users,
  Award,
  ChevronRight,
  X,
  AlertTriangle,
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
  const [selectedMonth, setSelectedMonth] = useState<number | null>(7); // Default to July like PDF, or user can click
  const [detailModalItem, setDetailModalItem] = useState<TournamentDetailInfo | null>(null);

  const leagueStats = getLeagueStats(tournaments, players);
  const monthlyData = getMonthlyStats(tournaments, players, selectedLeague);

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
      setSelectedMonth(monthObj.month);
    }
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs">
          <div className="font-bold text-sm text-slate-100 mb-1.5 border-b border-slate-700 pb-1">
            2026년 {label}
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-400 py-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              완료 (해당 월)
            </span>
            <span className="font-bold text-sm">{p.completed}건</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-orange-400 py-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              미완료 (누적)
            </span>
            <span className="font-bold text-sm">{p.uncompletedCumulative}건</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 border-t border-slate-800 pt-1">
            클릭 시 해당 월 미완료 대회 목록을 조회합니다.
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. 리그 유형별 진행률 카드 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>리그 유형별 진행률</span>
            </h2>
            <p className="text-xs text-slate-500">
              비공개 대회 제외 · 카드를 클릭하면 아래 영역이 해당 리그로 필터링됩니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leagues.map(({ name, icon: Icon, desc }) => {
            const stat = leagueStats[name] || { total: 0, completed: 0, uncompleted: 0, rate: 0 };
            const isSelected = selectedLeague === name;

            return (
              <div
                key={name}
                onClick={() => onSelectLeague(name)}
                className={`relative rounded-xl p-5 cursor-pointer transition-all duration-200 border text-left shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-blue-50'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    선택됨
                  </div>
                )}

                <div className="flex items-center space-x-2 text-slate-600 mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{name}</h3>
                </div>

                <div className="flex items-baseline space-x-2 my-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {stat.rate}%
                  </span>
                  <span className="text-xs text-slate-500 font-medium">진행률</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 my-3 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isSelected ? 'bg-blue-600' : 'bg-slate-500'
                    }`}
                    style={{ width: `${Math.min(stat.rate, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1 border-t border-slate-100">
                  <span>완료 <strong className="text-slate-900">{stat.completed}</strong></span>
                  <span className="text-slate-300">/</span>
                  <span>전체 <strong className="text-slate-900">{stat.total}</strong></span>
                  <span className="text-slate-300">·</span>
                  <span className="text-orange-600 font-semibold">미완료 {stat.uncompleted}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between px-1">
          <span className="text-blue-700 font-medium">
            현재 아래 영역은 <strong className="font-bold text-blue-900 underline decoration-blue-300">{selectedLeague}</strong> 기준으로 표시되고 있습니다.
          </span>
          <span className="text-slate-400">
            (유의: 다른 리그 카드를 누르면 즉시 전환됩니다)
          </span>
        </div>
      </div>

      {/* 2. 월별 진행상황 차트 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>월별 진행상황</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-normal">
                {selectedLeague}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              미완료는 완료되지 않은 대회가 다음 달로 이월되는 누적 기준입니다. 막대를 클릭하면 해당 월의 미완료 대회를 확인합니다.
            </p>
          </div>

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

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              onClick={handleBarClick}
              margin={{ top: 20, right: 20, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="completed"
                name="완료(해당 월)"
                fill="#059669"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
              <Bar
                dataKey="uncompletedCumulative"
                name="미완료(누적)"
                fill="#ea580c"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 text-center text-xs text-slate-400">
          * 그래프의 특정 월 막대를 클릭하면 아래의 미완료 대회 목록이 갱신됩니다.
        </div>
      </div>

      {/* 3. 특정 월 기준 미완료 대회 목록 패널 (PDF 3페이지 Spec) */}
      {selectedMonth !== null && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></div>
              <h3 className="font-bold text-slate-900 text-base">
                2026년 {selectedMonth}월 기준 미완료 대회
                <span className="text-orange-600 ml-1.5 font-bold">
                  (누적 {uncompletedList.length}건)
                </span>
              </h3>
              <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {selectedLeague}
              </span>
            </div>

            <button
              onClick={() => setSelectedMonth(null)}
              className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
              <span>닫기</span>
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900">유의사항:</strong> 해당 월을 선택하면 이전 월에서 이월된 미완료 대회를 포함하여, 기준일({referenceDate}) 현재 완료되지 않은 대회 목록을 확인할 수 있습니다.
            </div>
          </div>

          <div className="mt-4 space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {uncompletedList.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border border-slate-200 text-slate-500 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                2026년 {selectedMonth}월까지 누적된 미완료 대회가 없습니다.
              </div>
            ) : (
              uncompletedList.map((item, idx) => (
                <div
                  key={`${item.tournament.대회명}-${idx}`}
                  className="bg-white border border-slate-200 hover:border-blue-400 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition shadow-sm"
                >
                  <div className="space-y-1">
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

                    <h4 className="font-bold text-slate-900 text-sm">
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

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDetailModalItem(item)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition flex items-center gap-1"
                    >
                      <span>상세 정보</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
