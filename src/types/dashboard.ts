export type LeagueName = '성인부리그' | '유청소년리그' | '시니어리그';

export interface Tournament {
  번호: number | string;
  대회명: string;
  리그: LeagueName | string;
  라운드: string;
  시도: string;
  시군구: string;
  시작일: string;
  종료일: string;
  상태: '공개' | '비공개' | string;
}

export interface PlayerRank {
  대회명: string;
  리그: string;
  라운드: string;
  시작일: string;
  종료일: string;
  종목: string;
  연령: string;
  급수: string;
  참가팀수: number;
  순위: string;
  소속1: string;
  성명1: string;
  소속2: string;
  성명2: string;
}

export interface LeagueStats {
  name: LeagueName;
  total: number;
  completed: number;
  uncompleted: number;
  rate: number; // percentage (e.g. 81.2)
}

export interface MonthData {
  month: number;
  monthLabel: string;
  completed: number; // 당월 완료
  uncompletedCumulative: number; // 누적 미완료
  totalThisMonth: number;
}

export interface SidoStat {
  sido: string;
  total: number;
  completed: number;
  uncompleted: number;
  rate: number;
  status: '정상 진행' | '확인 필요';
  needCheckCount: number;
}

export interface SggStat {
  sgg: string;
  total: number;
  completed: number;
  uncompleted: number;
  rate: number;
  status: '정상 진행' | '확인 필요';
  needCheckCount: number;
}

export interface TournamentDetailInfo {
  tournament: Tournament;
  isCompleted: boolean;
  needCheck: boolean;
  groupTeams: number;
  individualTeams: number;
  totalTeams: number;
  rankings: PlayerRank[];
}

export interface SggParticipation {
  sgg: string;
  groupTeams: number;
  individualTeams: number;
  totalTeams: number;
}

export interface SidoParticipationSummary {
  sido: string;
  totalTeams: number;
  groupTeams: number;
  individualTeams: number;
  sggCount: number;
  sggList: SggParticipation[];
}
