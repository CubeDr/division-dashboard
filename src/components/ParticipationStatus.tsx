import React, { useState, useMemo } from 'react';
import {
  Tournament,
  PlayerRank,
  LeagueName
} from '../types/dashboard';
import {
  getParticipationOverview,
  getSidoParticipation
} from '../utils/dashboardLogic';
import { KoreaMap } from './KoreaMap';

interface ParticipationStatusProps {
  tournaments: Tournament[];
  players: PlayerRank[];
  selectedLeague: LeagueName;
  onSelectLeague: (league: LeagueName) => void;
}

export const ParticipationStatus: React.FC<ParticipationStatusProps> = ({
  tournaments,
  players,
  selectedLeague,
  onSelectLeague
}) => {
  const [selectedSido, setSelectedSido] = useState<string | null>(null);

  const sidoList = [
    '전체보기',
    '강원',
    '경기',
    '경남',
    '경북',
    '광주',
    '대구',
    '대전',
    '부산',
    '서울',
    '세종',
    '울산',
    '인천',
    '전남',
    '전북',
    '제주',
    '충남',
    '충북'
  ];

  // 전국 요약 데이터
  const nationalOverview = getParticipationOverview(tournaments, players, selectedLeague);

  // 시·도 상세 데이터 (선택된 경우)
  const sidoDetail = selectedSido && selectedSido !== '전체보기'
    ? getSidoParticipation(tournaments, players, selectedLeague, selectedSido)
    : null;

  // 시도별 참가팀 수 집계 (지도 히트맵용)
  const sidoTeamCounts = useMemo(() => {
    const counts: Record<string, { total: number; group: number; individual: number }> = {};
    for (const sido of sidoList.filter((s) => s !== '전체보기')) {
      const stat = getSidoParticipation(tournaments, players, selectedLeague, sido);
      counts[sido] = {
        total: stat.totalTeams,
        group: stat.groupTeams,
        individual: stat.individualTeams
      };
    }
    return counts;
  }, [tournaments, players, selectedLeague]);

  // 전체 시도별 참가팀 수 비교 차트 데이터 (전체보기일 때)
  const allSidoComparison = useMemo(() => {
    return sidoList
      .filter((s) => s !== '전체보기')
      .map((sido) => {
        const stat = sidoTeamCounts[sido] || { group: 0, individual: 0, total: 0 };
        return {
          sido,
          groupTeams: stat.group,
          individualTeams: stat.individual,
          totalTeams: stat.total,
          단체전: stat.group,
          개인전: stat.individual,
          합계: stat.total
        };
      })
      .sort((a, b) => b.totalTeams - a.totalTeams);
  }, [sidoTeamCounts]);

  return (
    <div className="space-y-6">
      {/* 리그 선택만 깔끔하게 유지 (가운데 정렬) */}
      <div className="flex justify-center">
        <div className="flex bg-slate-200/80 p-1 rounded-lg text-xs font-semibold">
          {(['성인부리그', '유청소년리그', '시니어리그'] as LeagueName[]).map((l) => (
            <button
              key={l}
              onClick={() => onSelectLeague(l)}
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

      {/* 대한민국 17개 시·도 인터랙티브 지도 & 개요 영역 (상단 압축 요약 + 메인 세로 막대 그래프) */}
      <KoreaMap
        selectedSido={selectedSido}
        onSelectSido={setSelectedSido}
        sidoTeamCounts={sidoTeamCounts}
        nationalOverview={nationalOverview}
        sidoDetail={sidoDetail}
        allSidoComparison={allSidoComparison}
      />
    </div>
  );
};
