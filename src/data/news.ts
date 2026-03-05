export interface Article {
  id: number;
  title: string;
  summary: string;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
  isHeadline?: boolean;
}

export const categories = [
  "정치",
  "경제",
  "사회",
  "국제",
  "문화",
  "IT/과학",
  "스포츠",
  "오피니언",
];

export const articles: Article[] = [
  {
    id: 1,
    title: "정부, 2026년 경제성장률 전망 2.8%로 상향 조정",
    summary:
      "기획재정부는 올해 경제성장률 전망치를 기존 2.5%에서 2.8%로 상향 조정했다. 반도체 수출 호조와 내수 회복세가 주요 요인으로 분석된다. 정부는 하반기 추가 경기 부양책도 검토 중이라고 밝혔다.",
    category: "경제",
    author: "김경제",
    date: "2026-03-05",
    imageUrl: "",
    isHeadline: true,
  },
  {
    id: 2,
    title: "여야, 국회 본회의서 민생법안 30건 일괄 처리",
    summary:
      "여야가 국회 본회의에서 민생 관련 법안 30건을 일괄 처리했다. 주거 안정, 소상공인 지원, 청년 일자리 관련 법안이 포함됐다.",
    category: "정치",
    author: "박정치",
    date: "2026-03-05",
    imageUrl: "",
    isHeadline: true,
  },
  {
    id: 3,
    title: "AI 반도체 수출 역대 최고… 무역수지 3개월 연속 흑자",
    summary:
      "산업통상자원부에 따르면 2월 수출액이 전년 동기 대비 15.2% 증가한 580억 달러를 기록했다. AI 반도체가 수출을 견인하며 무역수지는 3개월 연속 흑자를 달성했다.",
    category: "경제",
    author: "이무역",
    date: "2026-03-05",
    imageUrl: "",
  },
  {
    id: 4,
    title: "서울 지하철 2호선, 자율주행 시스템 시범 운행 시작",
    summary:
      "서울교통공사가 지하철 2호선에 자율주행 시스템 시범 운행을 시작했다. 2027년 전면 도입을 목표로 안전성 테스트를 진행한다.",
    category: "사회",
    author: "최교통",
    date: "2026-03-05",
    imageUrl: "",
  },
  {
    id: 5,
    title: "한국 영화 '달빛 아래서' 베를린 영화제 대상 수상",
    summary:
      "김감독의 신작 '달빛 아래서'가 제76회 베를린 국제영화제에서 황금곰상을 수상했다. 한국 영화 역사상 두 번째 수상이다.",
    category: "문화",
    author: "정문화",
    date: "2026-03-04",
    imageUrl: "",
  },
  {
    id: 6,
    title: "국내 연구진, 상온 초전도체 재현 실험 성공 발표",
    summary:
      "KAIST 연구팀이 상온 초전도체 재현 실험에 성공했다고 발표했다. 국제 학술지에 논문이 게재되며 전 세계 과학계의 주목을 받고 있다.",
    category: "IT/과학",
    author: "한과학",
    date: "2026-03-04",
    imageUrl: "",
  },
  {
    id: 7,
    title: "프로야구 개막전 앞두고 각 팀 전력 분석",
    summary:
      "2026 KBO 리그 개막이 일주일 앞으로 다가왔다. 올 시즌 우승 후보로 꼽히는 팀들의 전력을 분석해 본다.",
    category: "스포츠",
    author: "강스포츠",
    date: "2026-03-04",
    imageUrl: "",
  },
  {
    id: 8,
    title: "우크라이나 평화 협상, 주요 7개국 합의안 도출",
    summary:
      "G7 정상들이 우크라이나 평화 협상에 대한 공동 합의안을 도출했다. 즉각적인 휴전과 단계적 철군 방안이 포함됐다.",
    category: "국제",
    author: "윤국제",
    date: "2026-03-04",
    imageUrl: "",
  },
  {
    id: 9,
    title: "[사설] 경제 성장의 과실이 국민에게 돌아가야",
    summary:
      "경제 지표가 개선되고 있지만 체감 경기와의 괴리가 여전하다. 성장의 혜택이 골고루 분배되는 정책이 필요한 시점이다.",
    category: "오피니언",
    author: "논설위원실",
    date: "2026-03-05",
    imageUrl: "",
  },
  {
    id: 10,
    title: "전국 초미세먼지 '나쁨'… 주말까지 이어질 듯",
    summary:
      "수도권을 포함한 전국 대부분 지역에 초미세먼지 농도가 '나쁨' 수준을 보이고 있다. 기상청은 주말까지 이 상태가 이어질 것으로 예보했다.",
    category: "사회",
    author: "송기상",
    date: "2026-03-05",
    imageUrl: "",
  },
  {
    id: 11,
    title: "삼성전자, 차세대 폴더블 스마트폰 공개 예고",
    summary:
      "삼성전자가 하반기 출시 예정인 차세대 폴더블 스마트폰의 티저를 공개했다. 3단 폴딩 기술을 적용할 것으로 알려졌다.",
    category: "IT/과학",
    author: "임테크",
    date: "2026-03-05",
    imageUrl: "",
  },
  {
    id: 12,
    title: "손흥민, 프리미어리그 시즌 20호 골 달성",
    summary:
      "토트넘 홋스퍼의 손흥민이 프리미어리그에서 시즌 20호 골을 기록했다. 아시아 선수 최다 골 기록도 경신했다.",
    category: "스포츠",
    author: "강스포츠",
    date: "2026-03-05",
    imageUrl: "",
  },
];

export const breakingNews = [
  "속보: 정부, 2026년 경제성장률 전망 2.8%로 상향 조정",
  "속보: 여야 민생법안 30건 국회 본회의 통과",
  "속보: AI 반도체 수출 역대 최고 기록",
  "속보: 한국 영화 베를린 영화제 대상 수상",
];
