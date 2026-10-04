import React, { useState, useMemo } from 'react';
import { Search, CheckCircle, Clock, AlertTriangle, EyeOff } from 'lucide-react';
import { Tournament, PlayerRank } from '../types/dashboard';
import { getCompletedTournamentNames } from '../utils/dashboardLogic';

interface RawTournamentsProps {
  tournaments: Tournament[];
  players: PlayerRank[];
  referenceDate: string;
}

export const RawTournaments: React.FC<RawTournamentsProps> = ({
  tournaments,
  players,
  referenceDate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leagueFilter, setLeagueFilter] = useState<string>('전체');
  const [statusFilter, setStatusFilter] = useState<string>('전체');

  const completedNames = useMemo(() => getCompletedTournamentNames(players), [players]);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // 텍스트 검색
      if (searchTerm) {
        const text = `${t.대회명} ${t.시도} ${t.시군구} ${t.리그} ${t.라운드}`.toLowerCase();
        if (!text.includes(searchTerm.toLowerCase())) return false;
      }

      // 리그 필터
      if (leagueFilter !== '전체' && t.리그 !== leagueFilter) {
        return false;
      }

      // 상태 필터
      const isCompleted = completedNames.has(t.대회명.trim());
      const isPast = Boolean(t.종료일 && t.종료일 <= referenceDate);
      const needCheck = !isCompleted && isPast && t.상태 === '공개';

      if (statusFilter === '공개' && t.상태 !== '공개') return false;
      if (statusFilter === '비공개' && t.상태 !== '비공개') return false;
      if (statusFilter === '완료' && (!isCompleted || t.상태 !== '공개')) return false;
      if (statusFilter === '확인필요' && !needCheck) return false;
      if (statusFilter === '미완료' && (isCompleted || t.상태 !== '공개')) return false;

      return true;
    });
  }, [tournaments, searchTerm, leagueFilter, statusFilter, completedNames, referenceDate]);

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-185px)] min-h-[650px]">
      {/* 상단 검색 & 필터 바 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0">
        {/* 검색 인풋 */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="대회명, 시·도, 시·군·구, 라운드로 검색..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          />
        </div>

        {/* 필터 셀렉터 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">리그:</span>
            <select
              value={leagueFilter}
              onChange={(e) => setLeagueFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="전체">전체 리그</option>
              <option value="성인부리그">성인부리그</option>
              <option value="유청소년리그">유청소년리그</option>
              <option value="시니어리그">시니어리그</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">상태:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="전체">전체 상태</option>
              <option value="완료">완료 (결과 등록)</option>
              <option value="확인필요">확인 필요 (종료 후 미입력)</option>
              <option value="미완료">미완료</option>
              <option value="공개">공개 대회</option>
              <option value="비공개">비공개 대회</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 ml-1 font-medium bg-slate-100 px-2.5 py-1.5 rounded-lg">
            검색 결과: <strong className="text-blue-700 font-bold">{filteredTournaments.length}</strong> / {tournaments.length}건
          </span>
        </div>
      </div>

      {/* 테이블: 화면 높이에 꽉 차게 확장 및 컬럼 비율 고정 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200 sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-3 px-3 text-center w-14 shrink-0 whitespace-nowrap">번호</th>
                <th className="py-3 px-3 w-28 shrink-0 whitespace-nowrap">리그</th>
                <th className="py-3 px-3 w-32 shrink-0 whitespace-nowrap">지역</th>
                <th className="py-3 px-4 min-w-[280px]">대회명</th>
                <th className="py-3 px-3 w-24 shrink-0 whitespace-nowrap text-center">라운드</th>
                <th className="py-3 px-3 w-44 shrink-0 whitespace-nowrap">일정</th>
                <th className="py-3 px-3 text-center w-24 shrink-0 whitespace-nowrap">공개여부</th>
                <th className="py-3 px-3 text-center w-36 shrink-0 whitespace-nowrap">진행/관리상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTournaments.map((t, idx) => {
                const isCompleted = completedNames.has(t.대회명.trim());
                const isPast = Boolean(t.종료일 && t.종료일 <= referenceDate);
                const needCheck = !isCompleted && isPast && t.상태 === '공개';

                return (
                  <tr key={`${t.대회명}-${idx}`} className="hover:bg-blue-50/50 transition">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono w-14 whitespace-nowrap">
                      {t.번호 || idx + 1}
                    </td>
                    <td className="py-2.5 px-3 w-28 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px] inline-block">
                        {t.리그}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 w-32 whitespace-nowrap">
                      {t.시도} {t.시군구 && `· ${t.시군구}`}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 leading-snug">
                      {t.대회명}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 w-24 whitespace-nowrap text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {t.라운드}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap w-44 font-mono text-[11px]">
                      {t.시작일 === t.종료일 ? t.시작일 : `${t.시작일} ~ ${t.종료일}`}
                    </td>
                    <td className="py-2.5 px-3 text-center w-24 whitespace-nowrap">
                      {t.상태 === '비공개' ? (
                        <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <EyeOff className="w-3 h-3" />
                          비공개
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-medium">공개</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center w-36 whitespace-nowrap">
                      {t.상태 === '비공개' ? (
                        <span className="text-slate-400 text-[11px]">-</span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          완료
                        </span>
                      ) : needCheck ? (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-orange-200">
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                          확인 필요
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          미완료(예정)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
