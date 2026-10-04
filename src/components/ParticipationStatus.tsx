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
  Users,
  Shield,
  UserCheck,
  Building2,
  Info,
  CheckCircle2,
  BarChart3,
  Layers
} from 'lucide-react';
import {
  Tournament,
  PlayerRank,
  LeagueName
} from '../types/dashboard';
import {
  getParticipationOverview,
  getSidoParticipation
} from '../utils/dashboardLogic';

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

  // 전체 시도별 참가팀 수 비교 차트 데이터 (전체보기일 때)
  const allSidoComparison = sidoList
    .filter((s) => s !== '전체보기')
    .map((sido) => {
      const stat = getSidoParticipation(tournaments, players, selectedLeague, sido);
      return {
        sido,
        단체전: stat.groupTeams,
        개인전: stat.individualTeams,
        합계: stat.totalTeams
      };
    })
    .sort((a, b) => b.합계 - a.합계);

  return (
    <div className="space-y-6">
      {/* 상단 헤더 & 리그 필터 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>참가 현황</span>
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-normal">
              완료(결과 입력) 대회 기준 근사치
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            전국 및 시·도별 단체전·개인전 참가 규모를 비교하고 시·군·구별 운영 기반을 분석합니다.
          </p>
        </div>

        {/* 리그 선택 탭 */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto">
          {(['성인부리그', '유청소년리그', '시니어리그'] as LeagueName[]).map((l) => (
            <button
              key={l}
              onClick={() => onSelectLeague(l)}
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

      {/* 시·도 선택 탭 바 (PDF 7, 8페이지 상단 레이아웃 완벽 구현) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
          <span className="font-semibold text-slate-700">시·도 선택</span>
          <span>시·도를 선택하면 시·군·구별 참가현황을 확인할 수 있습니다.</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {sidoList.map((sido) => {
            const isSelected =
              sido === '전체보기' ? !selectedSido || selectedSido === '전체보기' : selectedSido === sido;

            return (
              <button
                key={sido}
                onClick={() => setSelectedSido(sido === '전체보기' ? null : sido)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {sido}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. 전국 요약 뷰 (선택된 시도가 없거나 '전체보기'인 경우) */}
      {(!selectedSido || selectedSido === '전체보기') && (
        <div className="space-y-6">
          {/* KPI 4종 카드 (PDF 7페이지) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                전국 총 참가팀 수
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  {nationalOverview.totalTeams.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-600">팀</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                단체전 참가팀 수
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-blue-700">
                  {nationalOverview.groupTeams.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-600">팀</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                개인전 참가팀 수
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-teal-600">
                  {nationalOverview.individualTeams.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-600">팀</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                데이터가 있는 시·도 수
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  {nationalOverview.sidoCount}
                </span>
                <span className="text-sm font-semibold text-slate-600">개</span>
              </div>
            </div>
          </div>

          {/* 안내 배너 (PDF 7페이지 설명 원문 수록) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p>
                참가팀 수는 결과(단체전/개인전) 대회인 전수 순위 데이터에서 종목별 참가팀 수를 환산한 수치입니다.
                원본의 팀 고유 식별자가 없어 동일 팀이 여러 종목에 참가한 경우 중복 집계될 수 있습니다.
              </p>
              <p className="text-slate-500">
                • <strong>단체전:</strong> 통합·단체 종목 기준 &nbsp;|&nbsp; • <strong>개인전:</strong> 남복·여복·혼복(복식) 종목 기준 &nbsp;|&nbsp; • 참가선수(인원) 수는 원본에 출전 명단이 없어 팀 수 기준으로 표시합니다.
              </p>
            </div>
          </div>

          {/* 전국 17개 시도별 참가 규모 비교 막대 차트 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>전국 17개 시·도별 참가팀 규모 비교</span>
              </h3>
              <span className="text-xs text-slate-400">참가팀 많은 순</span>
            </div>

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={allSidoComparison}
                  margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="sido"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any, name: string) => [`${val}팀`, name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="단체전" stackId="a" fill="#1e3a8a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="개인전" stackId="a" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. 시·도 상세 뷰 (특정 시도가 선택된 경우 - PDF 8페이지) */}
      {sidoDetail && (
        <div className="space-y-6">
          {/* 시도별 4종 KPI 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                {sidoDetail.sido} 참가팀 수
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  {sidoDetail.totalTeams}
                </span>
                <span className="text-sm font-semibold text-slate-600">팀</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                단체전 참가팀 수
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-blue-700">
                  {sidoDetail.groupTeams}
                </span>
                <span className="text-sm font-semibold text-slate-600">팀</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                개인전 참가팀 수
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-teal-600">
                  {sidoDetail.individualTeams}
                </span>
                <span className="text-sm font-semibold text-slate-600">팀</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                관할 시·군·구 수
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  {sidoDetail.sggCount}
                </span>
                <span className="text-sm font-semibold text-slate-600">개</span>
              </div>
            </div>
          </div>

          {/* 시·군·구별 참가현황 가로 막대 그래프 (PDF 8페이지) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {sidoDetail.sido} 시·군·구별 참가현황
                </h3>
                <span className="text-xs text-slate-500">
                  참가팀 수 많은 순 정렬
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-900"></span>
                  <span className="text-slate-700">단체전</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-teal-600"></span>
                  <span className="text-slate-700">개인전</span>
                </div>
              </div>
            </div>

            {sidoDetail.sggList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                등록된 참가팀 데이터가 없습니다.
              </div>
            ) : (
              <div
                className="w-full mt-4"
                style={{ height: `${Math.max(sidoDetail.sggList.length * 52 + 50, 200)}px` }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={sidoDetail.sggList}
                    margin={{ top: 10, right: 60, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="sgg"
                      tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 600 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      width={80}
                    />
                    <Tooltip
                      formatter={(val: any, name: string) => [`${val}팀`, name]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="groupTeams" name="단체전" stackId="a" fill="#1e3a8a" barSize={20} />
                    <Bar dataKey="individualTeams" name="개인전" stackId="a" fill="#0d9488" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 상세 표 (PDF 8페이지 하단) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">
                {sidoDetail.sido} 상세 참가팀 통계표
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">시·군·구</th>
                    <th className="py-3 px-4 text-center">단체전</th>
                    <th className="py-3 px-4 text-center">개인전</th>
                    <th className="py-3 px-4 text-center font-bold">합계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sidoDetail.sggList.map((row) => (
                    <tr key={row.sgg} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {row.sgg}
                      </td>
                      <td className="py-3 px-4 text-center text-blue-900 font-semibold">
                        {row.groupTeams}팀
                      </td>
                      <td className="py-3 px-4 text-center text-teal-700 font-semibold">
                        {row.individualTeams}팀
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900 bg-slate-50/50">
                        {row.totalTeams}팀
                      </td>
                    </tr>
                  ))}
                  {/* 합계 행 */}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td className="py-3 px-4 text-slate-900">전체 합계</td>
                    <td className="py-3 px-4 text-center text-blue-900">
                      {sidoDetail.groupTeams}팀
                    </td>
                    <td className="py-3 px-4 text-center text-teal-700">
                      {sidoDetail.individualTeams}팀
                    </td>
                    <td className="py-3 px-4 text-center text-slate-900 font-black">
                      {sidoDetail.totalTeams}팀
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
