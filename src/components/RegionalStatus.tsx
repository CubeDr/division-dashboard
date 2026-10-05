import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Users,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import {
  Tournament,
  PlayerRank,
  LeagueName,
  TournamentDetailInfo
} from '../types/dashboard';
import {
  getSidoStats,
  getSggStats,
  getTournamentDetailInfo
} from '../utils/dashboardLogic';

interface RegionalStatusProps {
  tournaments: Tournament[];
  players: PlayerRank[];
  referenceDate: string;
  selectedLeague: LeagueName;
  onSelectLeague: (league: LeagueName) => void;
}

export const RegionalStatus: React.FC<RegionalStatusProps> = ({
  tournaments,
  players,
  referenceDate,
  selectedLeague,
  onSelectLeague
}) => {
  // 드릴다운 단계: 'sido' | 'sgg' | 'tournament'
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [selectedSgg, setSelectedSgg] = useState<string | null>(null);
  const [expandedTournament, setExpandedTournament] = useState<string | null>(null);

  // 1. 시도 목록 데이터
  const sidoStats = getSidoStats(tournaments, players, selectedLeague, referenceDate);

  // 2. 시군구 목록 데이터
  const sggStats = selectedSido
    ? getSggStats(tournaments, players, selectedLeague, selectedSido, referenceDate)
    : [];

  // 3. 특정 시군구의 대회 목록 데이터
  const tournamentList: TournamentDetailInfo[] = (selectedSido && selectedSgg)
    ? tournaments
        .filter((t) => {
          if (t.상태 !== '공개') return false;
          if (t.리그 !== selectedLeague) return false;
          if (t.시도?.trim() !== selectedSido.trim()) return false;
          const sggMatch = (t.시군구 ? t.시군구.trim() : selectedSido.trim()) === selectedSgg.trim();
          return sggMatch;
        })
        .map((t) => getTournamentDetailInfo(t, players, referenceDate))
    : [];

  // 리그 전환 시 드릴다운 초기화 또는 유지
  const handleLeagueChange = (league: LeagueName) => {
    onSelectLeague(league);
    // 리그 바꾸면 대회 구조가 달라지므로 최상위로 리셋하거나 유지
  };

  // 정렬 상태 관리
  type SortKey = 'name' | 'total' | 'completed' | 'uncompleted' | 'rate' | 'status';
  type SortDirection = 'asc' | 'desc';

  const [sortKey, setSortKey] = useState<SortKey>('rate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection(key === 'name' ? 'asc' : 'desc');
    }
  };

  const sortedSidoStats = useMemo(() => {
    return [...sidoStats].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        cmp = a.sido.localeCompare(b.sido, 'ko');
      } else if (sortKey === 'status') {
        cmp = a.status.localeCompare(b.status, 'ko');
      } else {
        cmp = (a[sortKey] ?? 0) - (b[sortKey] ?? 0);
      }
      if (cmp === 0) {
        cmp = a.sido.localeCompare(b.sido, 'ko');
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [sidoStats, sortKey, sortDirection]);

  const sortedSggStats = useMemo(() => {
    return [...sggStats].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        cmp = a.sgg.localeCompare(b.sgg, 'ko');
      } else if (sortKey === 'status') {
        cmp = a.status.localeCompare(b.status, 'ko');
      } else {
        cmp = (a[sortKey] ?? 0) - (b[sortKey] ?? 0);
      }
      if (cmp === 0) {
        cmp = a.sgg.localeCompare(b.sgg, 'ko');
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [sggStats, sortKey, sortDirection]);

  const renderSortableHeader = (
    label: string,
    key: SortKey,
    align: 'left' | 'center' | 'right' = 'left',
    extraClass: string = ''
  ) => {
    const isActive = sortKey === key;
    return (
      <th
        onClick={() => handleSort(key)}
        className={`py-2.5 sm:py-3 ${
          align === 'center'
            ? 'px-1 sm:px-3 text-center'
            : align === 'right'
            ? 'px-1 sm:px-4 text-right sm:text-left'
            : 'px-2 sm:px-4 text-left'
        } ${extraClass} cursor-pointer select-none hover:bg-slate-100 transition-colors group whitespace-nowrap`}
      >
        <div
          className={`inline-flex items-center gap-0.5 sm:gap-1.5 ${
            align === 'center'
              ? 'justify-center'
              : align === 'right'
              ? 'justify-end sm:justify-start'
              : ''
          }`}
        >
          <span className={isActive ? 'text-blue-600 font-bold' : 'group-hover:text-slate-900'}>
            {label}
          </span>
          <span className="inline-flex">
            {isActive ? (
              sortDirection === 'asc' ? (
                <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
              ) : (
                <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
              )
            ) : (
              <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-2.5 sm:space-y-4 md:space-y-6">
      {/* 리그 선택 (가운데 정렬) */}
      <div className="flex justify-center">
        <div className="flex bg-slate-200/80 p-1 rounded-lg text-xs font-semibold">
          {(['성인부리그', '유청소년리그', '시니어리그'] as LeagueName[]).map((l) => (
            <button
              key={l}
              onClick={() => handleLeagueChange(l)}
              className={`px-3.5 py-1.5 rounded-md transition ${
                selectedLeague === l
                  ? 'bg-white text-blue-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 표 컨테이너 (선택 hierarchy가 표의 제목) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* 표 제목: 선택 hierarchy 네비게이션 (모바일 글자 크기 및 위아래 여백 축소) */}
        <div className="py-2.5 px-3.5 sm:py-3.5 sm:px-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold">
            <button
              type="button"
              onClick={() => {
                setSelectedSido(null);
                setSelectedSgg(null);
                setExpandedTournament(null);
              }}
              className={`transition ${
                !selectedSido
                  ? 'text-slate-900 cursor-default'
                  : 'text-slate-400 hover:text-blue-600 cursor-pointer'
              }`}
            >
              전국
            </button>

            {selectedSido && (
              <>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSgg(null);
                    setExpandedTournament(null);
                  }}
                  className={`transition ${
                    !selectedSgg
                      ? 'text-slate-900 cursor-default'
                      : 'text-slate-400 hover:text-blue-600 cursor-pointer'
                  }`}
                >
                  {selectedSido}
                </button>
              </>
            )}

            {selectedSgg && (
              <>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
                <span className="text-slate-900">{selectedSgg}</span>
              </>
            )}
          </div>
        </div>


        {/* 1단계: 시·도 목록 화면 */}
        {!selectedSido && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  {renderSortableHeader('시·도', 'name', 'left', 'pl-3.5 sm:pl-4')}
                  {renderSortableHeader('전체', 'total', 'center')}
                  {renderSortableHeader('완료', 'completed', 'center')}
                  {renderSortableHeader('미완료', 'uncompleted', 'center')}
                  {renderSortableHeader('진행률', 'rate', 'right', 'sm:min-w-[180px]')}
                  {renderSortableHeader('상태', 'status', 'center', 'pr-3 sm:pr-4')}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedSidoStats.map((item) => (
                  <tr
                    key={item.sido}
                    onClick={() => setSelectedSido(item.sido)}
                    className="hover:bg-blue-50/60 cursor-pointer transition"
                  >
                    <td className="py-3 sm:py-3.5 pl-3.5 pr-2 sm:px-4 font-bold text-slate-900 whitespace-nowrap">
                      {item.sido}
                    </td>
                    <td className="py-3 sm:py-3.5 px-1 sm:px-3 text-center font-semibold text-slate-700 whitespace-nowrap">
                      {item.total}
                    </td>
                    <td className="py-3 sm:py-3.5 px-1 sm:px-3 text-center text-emerald-700 font-bold whitespace-nowrap">
                      {item.completed}
                    </td>
                    <td className="py-3 sm:py-3.5 px-1 sm:px-3 text-center text-slate-500 font-medium whitespace-nowrap">
                      {item.uncompleted}
                    </td>
                    <td className="py-3 sm:py-3.5 px-1 sm:px-4 text-right sm:text-left whitespace-nowrap">
                      <div className="flex items-center justify-end sm:justify-start gap-2">
                        <div className="hidden sm:block flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              item.rate === 100
                                ? 'bg-emerald-500'
                                : item.rate >= 70
                                ? 'bg-blue-600'
                                : 'bg-orange-500'
                            }`}
                            style={{ width: `${item.rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 sm:w-12 text-right">
                          {item.rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-3.5 pl-1 pr-3 sm:px-4 text-center whitespace-nowrap">
                      {item.status === '확인 필요' ? (
                        <span
                          title="확인 필요 (종료일 경과 미입력)"
                          className="inline-flex items-center justify-center gap-1 bg-orange-100 text-orange-800 text-[11px] sm:text-xs p-1 sm:px-2.5 sm:py-0.5 rounded-full font-bold border border-orange-200"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-orange-600 shrink-0" />
                          <span className="hidden sm:inline">확인 필요</span>
                        </span>
                      ) : (
                        <span
                          title="정상 진행"
                          className="inline-flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs p-1 sm:px-2.5 sm:py-0.5 rounded-full font-medium border border-emerald-200"
                        >
                          <CheckCircle className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0" />
                          <span className="hidden sm:inline">정상 진행</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* 2단계: 시·군·구 목록 화면 */}
      {selectedSido && !selectedSgg && (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  {renderSortableHeader('시·군·구', 'name', 'left', 'pl-3.5 sm:pl-4')}
                  {renderSortableHeader('전체', 'total', 'center')}
                  {renderSortableHeader('완료', 'completed', 'center')}
                  {renderSortableHeader('미완료', 'uncompleted', 'center')}
                  {renderSortableHeader('진행률', 'rate', 'right', 'sm:min-w-[180px]')}
                  {renderSortableHeader('상태', 'status', 'center', 'pr-3 sm:pr-4')}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedSggStats.map((item) => (
                  <tr
                    key={item.sgg}
                    onClick={() => setSelectedSgg(item.sgg)}
                    className="hover:bg-blue-50/60 cursor-pointer transition"
                  >
                    <td className="py-3 sm:py-3.5 pl-3.5 pr-2 sm:px-4 font-bold text-slate-900 whitespace-nowrap">
                      {item.sgg}
                    </td>
                    <td className="py-3 sm:py-3.5 px-1 sm:px-3 text-center font-semibold text-slate-700 whitespace-nowrap">
                      {item.total}
                    </td>
                    <td className="py-3 sm:py-3.5 px-1 sm:px-3 text-center text-emerald-700 font-bold whitespace-nowrap">
                      {item.completed}
                    </td>
                    <td className="py-3 sm:py-3.5 px-1 sm:px-3 text-center text-slate-500 font-medium whitespace-nowrap">
                      {item.uncompleted}
                    </td>
                    <td className="py-3 sm:py-3.5 px-1 sm:px-4 text-right sm:text-left whitespace-nowrap">
                      <div className="flex items-center justify-end sm:justify-start gap-2">
                        <div className="hidden sm:block flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              item.rate === 100
                                ? 'bg-emerald-500'
                                : item.rate >= 70
                                ? 'bg-blue-600'
                                : 'bg-orange-500'
                            }`}
                            style={{ width: `${item.rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 sm:w-12 text-right">
                          {item.rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-3.5 pl-1 pr-3 sm:px-4 text-center whitespace-nowrap">
                      {item.status === '확인 필요' ? (
                        <span
                          title="확인 필요 (종료일 경과 미입력)"
                          className="inline-flex items-center justify-center gap-1 bg-orange-100 text-orange-800 text-[11px] sm:text-xs p-1 sm:px-2.5 sm:py-0.5 rounded-full font-bold border border-orange-200"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-orange-600 shrink-0" />
                          <span className="hidden sm:inline">확인 필요</span>
                        </span>
                      ) : (
                        <span
                          title="정상 진행"
                          className="inline-flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs p-1 sm:px-2.5 sm:py-0.5 rounded-full font-medium border border-emerald-200"
                        >
                          <CheckCircle className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0" />
                          <span className="hidden sm:inline">정상 진행</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3단계: 개별 대회 상세 목록 & 아코디언 확장 화면 (PDF 6페이지 Spec) */}
        {selectedSido && selectedSgg && (
          <div className="p-4 space-y-3">
            {tournamentList.map((item) => {
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
                    <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs">
                      {/* 상세 그리드 메타데이터 (PDF 6페이지와 동일 레이아웃) */}
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
                            <table className="w-full text-left text-xs">
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
                                      {r.연령} / {r.급수}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-700">
                                      {r.참가팀수}팀
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span className="font-semibold text-slate-900">{r.소속1 || '-'}</span>
                                      {r.성명1 && <span className="text-slate-500 ml-1">({r.성명1})</span>}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600">
                                      {r.소속2 ? (
                                        <>
                                          <span className="font-semibold text-slate-900">{r.소속2}</span>
                                          {r.성명2 && <span className="text-slate-500 ml-1">({r.성명2})</span>}
                                        </>
                                      ) : (
                                        '-'
                                      )}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};
