import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Trophy,
  ArrowLeft,
  Users
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

  return (
    <div className="space-y-6">
      {/* 상단 컨트롤 및 안내 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>지역별 운영 현황</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            전국 17개 시·도에서 시·군·구, 개별 대회까지 3단계 드릴다운으로 운영 실적과 확인필요 대회를 점검합니다.
          </p>
        </div>

        {/* 리그 선택 탭 */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto">
          {(['성인부리그', '유청소년리그', '시니어리그'] as LeagueName[]).map((l) => (
            <button
              key={l}
              onClick={() => handleLeagueChange(l)}
              className={`px-3 py-1.5 rounded-md transition ${
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

      {/* 브레드크럼 네비게이션 (전국 -> 시·도 -> 시·군·구) */}
      <div className="flex items-center space-x-2 text-xs font-medium bg-slate-100/80 px-4 py-2.5 rounded-lg border border-slate-200">
        <button
          onClick={() => {
            setSelectedSido(null);
            setSelectedSgg(null);
            setExpandedTournament(null);
          }}
          className={`hover:underline flex items-center gap-1 ${
            !selectedSido ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>전국 전체 시·도</span>
        </button>

        {selectedSido && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => {
                setSelectedSgg(null);
                setExpandedTournament(null);
              }}
              className={`hover:underline ${
                !selectedSgg ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {selectedSido}
            </button>
          </>
        )}

        {selectedSgg && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-700 font-bold">{selectedSgg} (대회 상세)</span>
          </>
        )}
      </div>

      {/* 1단계: 시·도 목록 화면 */}
      {!selectedSido && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                전국 17개 시·도 운영 현황
              </h3>
              <span className="text-xs text-slate-500">
                {selectedLeague} 기준 · {sidoStats.length}개 시·도 (행을 클릭하면 시·군·구 목록으로 이동합니다)
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                정상 진행
              </span>
              <span className="flex items-center gap-1 text-orange-700 font-medium bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                확인 필요 (종료일 경과 미입력)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">시·도</th>
                  <th className="py-3 px-3 text-center">전체</th>
                  <th className="py-3 px-3 text-center">완료</th>
                  <th className="py-3 px-3 text-center">미완료</th>
                  <th className="py-3 px-4 min-w-[200px]">진행률</th>
                  <th className="py-3 px-4 text-center">상태</th>
                  <th className="py-3 px-3 text-center">이동</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sidoStats.map((item) => (
                  <tr
                    key={item.sido}
                    onClick={() => setSelectedSido(item.sido)}
                    className="hover:bg-blue-50/60 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      <span>{item.sido}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                      {item.total}
                    </td>
                    <td className="py-3.5 px-3 text-center text-emerald-700 font-bold">
                      {item.completed}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-500 font-medium">
                      {item.uncompleted}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
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
                        <span className="text-xs font-bold text-slate-700 w-12 text-right">
                          {item.rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === '확인 필요' ? (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-orange-200 shadow-xs">
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                          확인 필요
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          정상 진행
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-400">
                      <ChevronRight className="w-4 h-4 mx-auto text-slate-400 group-hover:text-blue-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 유의사항 배너 (PDF 4페이지 Spec) */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">유의사항:</strong> 일정상 미완료 대회가 있을 수 있으며, 미완료가 있다고 해서 모두 확인이 필요한 것은 아닙니다. 대회 일정, 결과 입력 시점 및 대시보드 기준일({referenceDate})로 종료되었으나 대회가 완료되지 않을 경우 <strong>'확인필요'</strong>로 표시합니다.
            </div>
          </div>
        </div>
      )}

      {/* 2단계: 시·군·구 목록 화면 */}
      {selectedSido && !selectedSgg && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSido(null)}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition"
                  title="전국 시·도 목록으로 돌아가기"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedSido} 시·군·구별 운영 현황
                </h3>
              </div>
              <span className="text-xs text-slate-500 ml-6">
                {selectedSido} · {selectedLeague} 기준 · {sggStats.length}개 시·군·구 (시·군·구를 클릭하면 대회 목록으로 이동합니다)
              </span>
            </div>

            <button
              onClick={() => setSelectedSido(null)}
              className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              전체 시·도로 복귀
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">시·군·구</th>
                  <th className="py-3 px-3 text-center">전체</th>
                  <th className="py-3 px-3 text-center">완료</th>
                  <th className="py-3 px-3 text-center">미완료</th>
                  <th className="py-3 px-4 min-w-[200px]">진행률</th>
                  <th className="py-3 px-4 text-center">상태</th>
                  <th className="py-3 px-3 text-center">이동</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sggStats.map((item) => (
                  <tr
                    key={item.sgg}
                    onClick={() => setSelectedSgg(item.sgg)}
                    className="hover:bg-blue-50/60 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.sgg}
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                      {item.total}
                    </td>
                    <td className="py-3.5 px-3 text-center text-emerald-700 font-bold">
                      {item.completed}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-500 font-medium">
                      {item.uncompleted}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
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
                        <span className="text-xs font-bold text-slate-700 w-12 text-right">
                          {item.rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === '확인 필요' ? (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-orange-200">
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                          확인 필요
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          정상 진행
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-400">
                      <ChevronRight className="w-4 h-4 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3단계: 개별 대회 상세 목록 & 아코디언 확장 화면 (PDF 6페이지 Spec) */}
      {selectedSido && selectedSgg && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSgg(null)}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition"
                  title="시·군·구 목록으로 돌아가기"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedSido} {selectedSgg} 대회 목록
                </h3>
              </div>
              <span className="text-xs text-slate-500 ml-6">
                총 {tournamentList.length}건 · 행을 클릭하면 대회의 참가팀 및 입상 상세 정보가 펼쳐집니다.
              </span>
            </div>

            <button
              onClick={() => setSelectedSgg(null)}
              className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              시·군·구 목록으로 복귀
            </button>
          </div>

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
                  {/* 대회 헤더 행 (클릭하여 토글) */}
                  <div
                    onClick={() =>
                      setExpandedTournament(isExpanded ? null : item.tournament.대회명)
                    }
                    className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none hover:bg-slate-50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {item.tournament.라운드}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {item.tournament.대회명}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{item.tournament.리그}</span>
                        <span>·</span>
                        <span>{item.tournament.시작일} ~ {item.tournament.종료일}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-xs text-slate-500 font-medium">
                        {item.tournament.종료일}
                      </span>

                      {item.isCompleted ? (
                        <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                          완료
                        </span>
                      ) : item.needCheck ? (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-orange-200">
                          확인 필요
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                          미완료
                        </span>
                      )}

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
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
        </div>
      )}
    </div>
  );
};
