import React, { useState } from 'react';
import initialData from './data/divisionData.json';
import { Header } from './components/Header';
import { LeagueOverview } from './components/LeagueOverview';
import { RegionalStatus } from './components/RegionalStatus';
import { ParticipationStatus } from './components/ParticipationStatus';
import { Tournament, PlayerRank, LeagueName } from './types/dashboard';

export default function App() {
  const [tournaments] = useState<Tournament[]>(initialData.tournaments as Tournament[]);
  const [players] = useState<PlayerRank[]>(initialData.players as PlayerRank[]);
  const referenceDate = '2026-09-18';
  const [selectedLeague, setSelectedLeague] = useState<LeagueName>('성인부리그');
  const [activeTab, setActiveTab] = useState<'overview' | 'regional' | 'participation'>('overview');

  // 비공개 대회 수 계산 (PDF 기준 29건)
  const privateCount = tournaments.filter((t) => t.상태 === '비공개').length;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      {/* 헤더 네비게이션 */}
      <Header
        referenceDate={referenceDate}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <LeagueOverview
            tournaments={tournaments}
            players={players}
            referenceDate={referenceDate}
            selectedLeague={selectedLeague}
            onSelectLeague={setSelectedLeague}
          />
        )}

        {activeTab === 'regional' && (
          <RegionalStatus
            tournaments={tournaments}
            players={players}
            referenceDate={referenceDate}
            selectedLeague={selectedLeague}
            onSelectLeague={setSelectedLeague}
          />
        )}

        {activeTab === 'participation' && (
          <ParticipationStatus
            tournaments={tournaments}
            players={players}
            selectedLeague={selectedLeague}
            onSelectLeague={setSelectedLeague}
          />
        )}
      </main>


      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-700">2026 디비전리그 운영 대시보드</span>
            <span className="mx-2 text-slate-300">|</span>
            <span>전국 배드민턴 디비전리그 운영 현황 통합 관리 시스템</span>
          </div>
          <div className="text-slate-400">
            기준일: {referenceDate} &nbsp;•&nbsp; 공개 대회: {tournaments.length - privateCount}건 &nbsp;•&nbsp; 비공개 대회: {privateCount}건 &nbsp;•&nbsp; 취소 여부 데이터 없음
          </div>
        </div>
      </footer>
    </div>
  );
}
