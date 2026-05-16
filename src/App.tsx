import { useState, useRef, useEffect } from "react";

// ── 거리 계산 (Haversine) ──
function calcDist(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function fmtDist(km) {
  if (km < 1) return Math.round(km * 1000) + "m";
  return km.toFixed(1) + "km";
}

const MOCK_USERS = [
  { id: 1, email: "user1@test.com", password: "1234", nickname: "서울러버", region: "서울 마포구", isAdmin: false, avatar: "서", suspended: false, bio: "소분 고수 🛒 마포구 활동중" },
  { id: 2, email: "admin@test.com", password: "1234", nickname: "관리자", region: "서울 강남구", isAdmin: true, avatar: "관", suspended: false, bio: "소분톡 운영팀입니다" },
  { id: 3, email: "user2@test.com", password: "1234", nickname: "혼자사는법", region: "서울 성동구", isAdmin: false, avatar: "혼", suspended: false, bio: "1인 가구 절약 생활 중 💪" },
];

const INITIAL_POSTS = [
  { id: 1, type: "같이사요", title: "코스트코 통닭 4마리 같이 사실 분 🍗", item: "코스트코 훈제치킨 세트", author: { id: 3, nickname: "혼자사는법", region: "서울 성동구" }, maxParticipants: 4, participants: [3, 1], totalPrice: 28000, pricePerPerson: 7000, location: "성동구 왕십리역 2번 출구", coords: { lat: 37.5613, lng: 127.0374 }, meetDate: "2026-05-15", meetTime: "18:00", deadline: "2026-05-14", status: "모집중", description: "코스트코 훈제치킨 4마리 세트 구매 후 1마리씩 나눠드립니다. 아이스팩 포장해서 드려요!", comments: [{ id: 1, userId: 1, nickname: "서울러버", text: "저도 참여하고 싶어요! 자리 있나요?", createdAt: "2026.05.11 10:00" }], chat: [], reviews: [], createdAt: "2026-05-11", reported: false },
  { id: 2, type: "나눠봐요", title: "올리브유 5L 소분 나눕니다 (500ml씩) 🫙", item: "코스트코 올리브오일 5L", author: { id: 1, nickname: "서울러버", region: "서울 마포구" }, maxParticipants: 8, participants: [1, 3], totalPrice: 35000, pricePerPerson: 4500, location: "마포구 홍대입구역 6번 출구", coords: { lat: 37.5574, lng: 126.9244 }, meetDate: "2026-05-13", meetTime: "19:00", deadline: "2026-05-12", status: "모집중", description: "코스트코에서 올리브유 5L 구매했어요. 500ml씩 소분해서 나눕니다. 유리병에 담아드려요.", comments: [], chat: [], reviews: [], createdAt: "2026-05-10", reported: false },
  { id: 3, type: "같이사요", title: "락앤락 밀폐용기 24P 공동구매 🥡", item: "락앤락 밀폐용기 24P 세트", author: { id: 1, nickname: "서울러버", region: "서울 마포구" }, maxParticipants: 3, participants: [1, 3, 2], totalPrice: 45000, pricePerPerson: 15000, location: "마포구 공덕역 4번 출구", coords: { lat: 37.5442, lng: 126.9511 }, meetDate: "2026-05-20", meetTime: "12:00", deadline: "2026-05-18", status: "완료", description: "락앤락 밀폐용기 24P 세트 공동구매합니다. 8개씩 나눠가져요.", comments: [], chat: [], reviews: [{ id: 1, fromUserId: 3, fromNickname: "혼자사는법", rating: 5, text: "시간 약속 잘 지키시고 포장도 깔끔했어요!", createdAt: "2026-05-21" }], createdAt: "2026-05-09", reported: false },
  { id: 4, type: "나눠봐요", title: "트레이더스 아보카도오일 소분 🥑", item: "트레이더스 아보카도오일 2L", author: { id: 3, nickname: "혼자사는법", region: "서울 성동구" }, maxParticipants: 4, participants: [3], totalPrice: 24000, pricePerPerson: 6000, location: "성동구 성수역 1번 출구", coords: { lat: 37.5449, lng: 127.0558 }, meetDate: "2026-05-18", meetTime: "20:00", deadline: "2026-05-17", status: "모집중", description: "아보카도오일 2L 구매했는데 혼자 쓰기엔 너무 많아서 소분합니다. 500ml씩 나눠요.", comments: [], chat: [], reviews: [], createdAt: "2026-05-10", reported: false },
  { id: 5, type: "같이사요", title: "코스트코 두루마리 화장지 묶음 공구 🧻", item: "코스트코 화장지 30롤", author: { id: 1, nickname: "서울러버", region: "서울 마포구" }, maxParticipants: 3, participants: [1], totalPrice: 18000, pricePerPerson: 6000, location: "마포구 합정역 7번 출구", coords: { lat: 37.5493, lng: 126.9143 }, meetDate: "2026-05-22", meetTime: "14:00", deadline: "2026-05-20", status: "모집중", description: "코스트코 화장지 30롤 묶음 구매 후 10롤씩 나눠요.", comments: [], chat: [], reviews: [], createdAt: "2026-05-11", reported: false },
  { id: 6, type: "나눠봐요", title: "냉동 블루베리 1kg 소분합니다 🫐", item: "코스트코 냉동 블루베리 1kg", author: { id: 2, nickname: "관리자", region: "서울 강남구" }, maxParticipants: 4, participants: [2, 1], totalPrice: 16000, pricePerPerson: 4000, location: "강남구 선릉역 3번 출구", coords: { lat: 37.5047, lng: 127.0491 }, meetDate: "2026-05-14", meetTime: "19:30", deadline: "2026-05-13", status: "모집중", description: "냉동 블루베리 250g씩 나눕니다. 아이스박스 지참해주세요!", comments: [], chat: [], reviews: [], createdAt: "2026-05-10", reported: false },
  { id: 7, type: "나눠봐요", title: "제주 한라봉 소분 완료 🍊 ← 여기서 후기 써보세요!", item: "제주 한라봉 5kg", author: { id: 3, nickname: "혼자사는법", region: "서울 성동구" }, maxParticipants: 3, participants: [3, 1, 2], totalPrice: 30000, pricePerPerson: 10000, location: "성동구 성수역 1번 출구", coords: { lat: 37.5449, lng: 127.0558 }, meetDate: "2026-05-01", meetTime: "18:00", deadline: "2026-04-30", status: "완료", description: "한라봉 나눔 완료됐어요. 참여해주신 분들 감사해요!", comments: [], chat: [], reviews: [], createdAt: "2026-04-28", reported: false },
];

const SIDO_GU = {
  "서울특별시": ["마포구","성동구","강남구","서초구","송파구","강동구","광진구","중랑구","노원구","도봉구","강북구","성북구","동대문구","종로구","중구","용산구","서대문구","은평구","관악구","동작구","영등포구","금천구","구로구","강서구","양천구"],
  "경기도": ["수원시","성남시","부천시","안양시","의정부시","고양시","용인시","화성시","남양주시","광주시","평택시","시흥시","안산시","군포시","하남시","오산시","이천시","파주시","양주시","구리시","김포시"],
  "인천광역시": ["남동구","부평구","미추홀구","연수구","서구","계양구","동구","중구"],
  "부산광역시": ["해운대구","부산진구","동래구","금정구","남구","북구","사하구","영도구","연제구","수영구"],
  "대구광역시": ["달서구","수성구","북구","동구","중구","서구","남구"],
  "광주광역시": ["북구","서구","남구","동구","광산구"],
  "대전광역시": ["서구","유성구","중구","동구","대덕구"],
  "울산광역시": ["남구","북구","중구","동구","울주군"],
  "세종특별자치시": ["세종시"],
  "강원도": ["춘천시","원주시","강릉시","동해시","태백시","속초시","삼척시"],
  "충청북도": ["청주시","충주시","제천시","음성군","진천군"],
  "충청남도": ["천안시","공주시","보령시","아산시","서산시","논산시","당진시"],
  "전라북도": ["전주시","익산시","군산시","정읍시","남원시","김제시","완주군"],
  "전라남도": ["목포시","여수시","순천시","나주시","광양시","담양군"],
  "경상북도": ["포항시","경주시","김천시","안동시","구미시","영주시","영천시","상주시"],
  "경상남도": ["창원시","진주시","통영시","사천시","김해시","밀양시","거제시","양산시"],
  "제주특별자치도": ["제주시","서귀포시"],
};
const SORT_OPTIONS = [
  { key: "latest", label: "최신순", icon: "ti-clock" },
  { key: "deadline", label: "마감임박순", icon: "ti-alarm" },
  { key: "price_asc", label: "가격↑낮은순", icon: "ti-coin" },
  { key: "price_desc", label: "가격↓높은순", icon: "ti-coin" },
  { key: "distance", label: "거리순", icon: "ti-map-pin" },
];

// 지역 검색용 좌표 데이터 — 역 + 구 + 동
const LOCATION_DATA = [
  // 서울 주요 역
  { name: "홍대입구역", region: "서울 마포구", lat: 37.5574, lng: 126.9244 },
  { name: "합정역", region: "서울 마포구", lat: 37.5493, lng: 126.9143 },
  { name: "공덕역", region: "서울 마포구", lat: 37.5442, lng: 126.9511 },
  { name: "마포역", region: "서울 마포구", lat: 37.5383, lng: 126.9517 },
  { name: "상수역", region: "서울 마포구", lat: 37.5479, lng: 126.9237 },
  { name: "망원역", region: "서울 마포구", lat: 37.5558, lng: 126.9100 },
  { name: "왕십리역", region: "서울 성동구", lat: 37.5613, lng: 127.0374 },
  { name: "성수역", region: "서울 성동구", lat: 37.5449, lng: 127.0558 },
  { name: "뚝섬역", region: "서울 성동구", lat: 37.5478, lng: 127.0447 },
  { name: "한양대역", region: "서울 성동구", lat: 37.5558, lng: 127.0447 },
  { name: "강남역", region: "서울 강남구", lat: 37.4979, lng: 127.0276 },
  { name: "선릉역", region: "서울 강남구", lat: 37.5047, lng: 127.0491 },
  { name: "삼성역", region: "서울 강남구", lat: 37.5088, lng: 127.0633 },
  { name: "역삼역", region: "서울 강남구", lat: 37.5007, lng: 127.0362 },
  { name: "논현역", region: "서울 강남구", lat: 37.5115, lng: 127.0222 },
  { name: "신논현역", region: "서울 강남구", lat: 37.5049, lng: 127.0248 },
  { name: "압구정역", region: "서울 강남구", lat: 37.5270, lng: 127.0284 },
  { name: "청담역", region: "서울 강남구", lat: 37.5204, lng: 127.0538 },
  { name: "신촌역", region: "서울 서대문구", lat: 37.5551, lng: 126.9368 },
  { name: "이대역", region: "서울 서대문구", lat: 37.5562, lng: 126.9464 },
  { name: "아현역", region: "서울 서대문구", lat: 37.5553, lng: 126.9570 },
  { name: "건대입구역", region: "서울 광진구", lat: 37.5403, lng: 127.0694 },
  { name: "구의역", region: "서울 광진구", lat: 37.5377, lng: 127.0934 },
  { name: "잠실역", region: "서울 송파구", lat: 37.5133, lng: 127.1001 },
  { name: "잠실나루역", region: "서울 송파구", lat: 37.5148, lng: 127.0836 },
  { name: "석촌역", region: "서울 송파구", lat: 37.5036, lng: 127.1038 },
  { name: "강동역", region: "서울 강동구", lat: 37.5301, lng: 127.1239 },
  { name: "천호역", region: "서울 강동구", lat: 37.5383, lng: 127.1238 },
  { name: "노원역", region: "서울 노원구", lat: 37.6558, lng: 127.0563 },
  { name: "중계역", region: "서울 노원구", lat: 37.6394, lng: 127.0737 },
  { name: "수유역", region: "서울 강북구", lat: 37.6388, lng: 127.0253 },
  { name: "미아사거리역", region: "서울 강북구", lat: 37.6138, lng: 127.0305 },
  { name: "신림역", region: "서울 관악구", lat: 37.4845, lng: 126.9297 },
  { name: "서울대입구역", region: "서울 관악구", lat: 37.4811, lng: 126.9527 },
  { name: "봉천역", region: "서울 관악구", lat: 37.4899, lng: 126.9591 },
  { name: "사당역", region: "서울 동작구", lat: 37.4760, lng: 126.9815 },
  { name: "이수역", region: "서울 동작구", lat: 37.4868, lng: 126.9821 },
  { name: "영등포역", region: "서울 영등포구", lat: 37.5159, lng: 126.9069 },
  { name: "여의도역", region: "서울 영등포구", lat: 37.5216, lng: 126.9244 },
  { name: "영등포구청역", region: "서울 영등포구", lat: 37.5259, lng: 126.8960 },
  { name: "가산디지털단지역", region: "서울 금천구", lat: 37.4810, lng: 126.8826 },
  { name: "독산역", region: "서울 금천구", lat: 37.4751, lng: 126.8946 },
  { name: "구로역", region: "서울 구로구", lat: 37.5024, lng: 126.8823 },
  { name: "신도림역", region: "서울 구로구", lat: 37.5086, lng: 126.8913 },
  { name: "발산역", region: "서울 강서구", lat: 37.5589, lng: 126.8382 },
  { name: "마곡역", region: "서울 강서구", lat: 37.5591, lng: 126.8303 },
  { name: "김포공항역", region: "서울 강서구", lat: 37.5622, lng: 126.8010 },
  { name: "종로3가역", region: "서울 종로구", lat: 37.5715, lng: 126.9918 },
  { name: "안국역", region: "서울 종로구", lat: 37.5764, lng: 126.9851 },
  { name: "경복궁역", region: "서울 종로구", lat: 37.5762, lng: 126.9724 },
  { name: "동대문역", region: "서울 종로구", lat: 37.5715, lng: 127.0099 },
  { name: "충무로역", region: "서울 중구", lat: 37.5612, lng: 126.9946 },
  { name: "명동역", region: "서울 중구", lat: 37.5601, lng: 126.9849 },
  { name: "시청역", region: "서울 중구", lat: 37.5652, lng: 126.9774 },
  { name: "을지로입구역", region: "서울 중구", lat: 37.5661, lng: 126.9827 },
  { name: "동대문역사문화공원역", region: "서울 중구", lat: 37.5647, lng: 127.0079 },
  { name: "서울역", region: "서울 용산구", lat: 37.5550, lng: 126.9707 },
  { name: "삼각지역", region: "서울 용산구", lat: 37.5392, lng: 126.9728 },
  { name: "이촌역", region: "서울 용산구", lat: 37.5209, lng: 126.9615 },
  { name: "성신여대입구역", region: "서울 성북구", lat: 37.5926, lng: 127.0163 },
  { name: "길음역", region: "서울 성북구", lat: 37.6032, lng: 127.0254 },
  { name: "혜화역", region: "서울 종로구", lat: 37.5822, lng: 127.0020 },
  // 서울 구(區) 단위
  { name: "마포구", region: "서울 마포구", lat: 37.5570, lng: 126.9088 },
  { name: "성동구", region: "서울 성동구", lat: 37.5635, lng: 127.0365 },
  { name: "강남구", region: "서울 강남구", lat: 37.5172, lng: 127.0473 },
  { name: "서초구", region: "서울 서초구", lat: 37.4837, lng: 127.0327 },
  { name: "송파구", region: "서울 송파구", lat: 37.5145, lng: 127.1059 },
  { name: "강동구", region: "서울 강동구", lat: 37.5301, lng: 127.1238 },
  { name: "광진구", region: "서울 광진구", lat: 37.5385, lng: 127.0823 },
  { name: "중랑구", region: "서울 중랑구", lat: 37.6063, lng: 127.0927 },
  { name: "노원구", region: "서울 노원구", lat: 37.6542, lng: 127.0568 },
  { name: "도봉구", region: "서울 도봉구", lat: 37.6688, lng: 127.0471 },
  { name: "강북구", region: "서울 강북구", lat: 37.6396, lng: 127.0257 },
  { name: "성북구", region: "서울 성북구", lat: 37.5894, lng: 127.0167 },
  { name: "동대문구", region: "서울 동대문구", lat: 37.5838, lng: 127.0507 },
  { name: "종로구", region: "서울 종로구", lat: 37.5730, lng: 126.9794 },
  { name: "중구", region: "서울 중구", lat: 37.5641, lng: 126.9979 },
  { name: "용산구", region: "서울 용산구", lat: 37.5324, lng: 126.9907 },
  { name: "서대문구", region: "서울 서대문구", lat: 37.5791, lng: 126.9368 },
  { name: "은평구", region: "서울 은평구", lat: 37.6027, lng: 126.9291 },
  { name: "관악구", region: "서울 관악구", lat: 37.4784, lng: 126.9516 },
  { name: "동작구", region: "서울 동작구", lat: 37.5124, lng: 126.9393 },
  { name: "영등포구", region: "서울 영등포구", lat: 37.5264, lng: 126.8963 },
  { name: "금천구", region: "서울 금천구", lat: 37.4600, lng: 126.9003 },
  { name: "구로구", region: "서울 구로구", lat: 37.4954, lng: 126.8874 },
  { name: "강서구", region: "서울 강서구", lat: 37.5509, lng: 126.8495 },
  { name: "양천구", region: "서울 양천구", lat: 37.5170, lng: 126.8665 },
  // 서울 주요 동(洞)
  { name: "연남동", region: "서울 마포구", lat: 37.5617, lng: 126.9236 },
  { name: "상암동", region: "서울 마포구", lat: 37.5790, lng: 126.8896 },
  { name: "합정동", region: "서울 마포구", lat: 37.5493, lng: 126.9143 },
  { name: "서교동", region: "서울 마포구", lat: 37.5544, lng: 126.9208 },
  { name: "성수동", region: "서울 성동구", lat: 37.5445, lng: 127.0568 },
  { name: "금호동", region: "서울 성동구", lat: 37.5534, lng: 127.0178 },
  { name: "행당동", region: "서울 성동구", lat: 37.5574, lng: 127.0295 },
  { name: "삼성동", region: "서울 강남구", lat: 37.5140, lng: 127.0567 },
  { name: "역삼동", region: "서울 강남구", lat: 37.5007, lng: 127.0362 },
  { name: "논현동", region: "서울 강남구", lat: 37.5115, lng: 127.0222 },
  { name: "압구정동", region: "서울 강남구", lat: 37.5270, lng: 127.0284 },
  { name: "청담동", region: "서울 강남구", lat: 37.5204, lng: 127.0538 },
  { name: "대치동", region: "서울 강남구", lat: 37.4942, lng: 127.0640 },
  { name: "반포동", region: "서울 서초구", lat: 37.5040, lng: 127.0050 },
  { name: "방배동", region: "서울 서초구", lat: 37.4847, lng: 126.9959 },
  { name: "잠실동", region: "서울 송파구", lat: 37.5133, lng: 127.1001 },
  { name: "신천동", region: "서울 송파구", lat: 37.5174, lng: 127.1028 },
  { name: "이태원동", region: "서울 용산구", lat: 37.5347, lng: 126.9947 },
  { name: "한남동", region: "서울 용산구", lat: 37.5350, lng: 127.0044 },
  { name: "신당동", region: "서울 중구", lat: 37.5593, lng: 127.0125 },
  { name: "혜화동", region: "서울 종로구", lat: 37.5822, lng: 127.0020 },
  { name: "북가좌동", region: "서울 서대문구", lat: 37.5747, lng: 126.9157 },
  { name: "응암동", region: "서울 은평구", lat: 37.5977, lng: 126.9195 },
  { name: "신정동", region: "서울 양천구", lat: 37.5239, lng: 126.8685 },
  { name: "목동", region: "서울 양천구", lat: 37.5270, lng: 126.8745 },
  { name: "화곡동", region: "서울 강서구", lat: 37.5471, lng: 126.8507 },
  { name: "봉천동", region: "서울 관악구", lat: 37.4877, lng: 126.9542 },
  { name: "신림동", region: "서울 관악구", lat: 37.4845, lng: 126.9297 },
  { name: "사당동", region: "서울 동작구", lat: 37.4760, lng: 126.9815 },
  { name: "당산동", region: "서울 영등포구", lat: 37.5331, lng: 126.9012 },
  { name: "여의도동", region: "서울 영등포구", lat: 37.5216, lng: 126.9244 },
  { name: "독산동", region: "서울 금천구", lat: 37.4751, lng: 126.8946 },
  { name: "구로동", region: "서울 구로구", lat: 37.5024, lng: 126.8823 },
  { name: "중계동", region: "서울 노원구", lat: 37.6394, lng: 127.0737 },
  { name: "상계동", region: "서울 노원구", lat: 37.6558, lng: 127.0563 },
  { name: "창동", region: "서울 도봉구", lat: 37.6536, lng: 127.0472 },
  { name: "수유동", region: "서울 강북구", lat: 37.6388, lng: 127.0253 },
  // 경기도 주요 지역
  { name: "수원역", region: "경기 수원시", lat: 37.2662, lng: 127.0009 },
  { name: "수원 인계동", region: "경기 수원시", lat: 37.2636, lng: 127.0286 },
  { name: "수원 영통동", region: "경기 수원시", lat: 37.2538, lng: 127.0593 },
  { name: "판교역", region: "경기 성남시", lat: 37.3952, lng: 127.1108 },
  { name: "분당 서현역", region: "경기 성남시", lat: 37.3839, lng: 127.1219 },
  { name: "정자역", region: "경기 성남시", lat: 37.3596, lng: 127.1117 },
  { name: "야탑역", region: "경기 성남시", lat: 37.4113, lng: 127.1281 },
  { name: "부천역", region: "경기 부천시", lat: 37.4997, lng: 126.7836 },
  { name: "소사역", region: "경기 부천시", lat: 37.4839, lng: 126.8003 },
  { name: "안양역", region: "경기 안양시", lat: 37.3967, lng: 126.9561 },
  { name: "평촌역", region: "경기 안양시", lat: 37.3892, lng: 126.9527 },
  { name: "의정부역", region: "경기 의정부시", lat: 37.7381, lng: 127.0442 },
  { name: "일산 마두역", region: "경기 고양시", lat: 37.6568, lng: 126.7698 },
  { name: "일산 정발산역", region: "경기 고양시", lat: 37.6654, lng: 126.7729 },
  { name: "화정역", region: "경기 고양시", lat: 37.6295, lng: 126.8328 },
  { name: "인천시청역", region: "인천 남동구", lat: 37.4563, lng: 126.7052 },
  { name: "부평역", region: "인천 부평구", lat: 37.4896, lng: 126.7221 },
  { name: "주안역", region: "인천 미추홀구", lat: 37.4740, lng: 126.6944 },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#FFF8E1;min-height:100vh}
  .app{
    font-family:'Nunito','Apple SD Gothic Neo','Noto Sans KR',-apple-system,sans-serif;
    max-width:430px;margin:0 auto;min-height:100vh;
    background:linear-gradient(160deg,#FFF4CC 0%,#FFFDF5 40%,#FFF8E1 70%,#FFF5CC 100%);
    position:relative;
  }
  .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);
    background:rgba(40,20,0,0.85);backdrop-filter:blur(16px);
    color:#FFE08A;padding:11px 24px;border-radius:30px;font-size:13px;font-weight:700;
    z-index:9999;white-space:nowrap;animation:sd 0.25s ease;
    box-shadow:0 8px 24px rgba(0,0,0,0.2);border:1px solid rgba(255,220,100,0.2)}
  @keyframes sd{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes fp{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
  @keyframes glow{0%,100%{box-shadow:0 0 12px rgba(232,150,12,0.3)}50%{box-shadow:0 0 24px rgba(232,150,12,0.6)}}
  .fpanel{animation:fp 0.2s ease}

  /* Liquid Glass 모달 */
  .modal-bg{position:fixed;inset:0;background:rgba(50,25,0,0.4);backdrop-filter:blur(8px);
    z-index:500;display:flex;align-items:flex-end;animation:fadeIn 0.2s}
  .modal-sheet{
    background:rgba(255,255,255,0.92);backdrop-filter:blur(24px);
    border-radius:28px 28px 0 0;width:100%;max-width:430px;margin:0 auto;
    max-height:88vh;overflow-y:auto;padding:0 0 32px;
    border-top:1px solid rgba(255,220,100,0.3);
    box-shadow:0 -8px 40px rgba(180,130,0,0.15)}

  /* 하이라이트 */
  .highlight{background:#FFD700;border-radius:4px;padding:0 2px;color:#5A3A00}

  /* Glass 칩 */
  .chip{display:inline-flex;align-items:center;padding:7px 15px;border-radius:24px;
    font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid;
    transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);white-space:nowrap;background:none}
  .con{background:rgba(255,255,255,0.7);border-color:rgba(220,180,80,0.4);color:#A07830;
    backdrop-filter:blur(8px)}
  .cact{background:linear-gradient(135deg,#FFB800,#E8960C);border-color:transparent;color:#fff;
    box-shadow:0 4px 16px rgba(232,150,12,0.4);transform:translateY(-1px)}

  /* 별점 */
  .star{font-size:22px;cursor:pointer;transition:transform 0.15s cubic-bezier(0.34,1.56,0.64,1)}
  .star:hover{transform:scale(1.3)}

  input,textarea,select,button{font-family:inherit}
  input,textarea{outline:none}
  button{cursor:pointer}
  .scrollable{overflow-y:auto;-webkit-overflow-scrolling:touch}

  /* 알림 뱃지 */
  .notif-badge{position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:9px;
    background:linear-gradient(135deg,#FF6B6B,#E74C3C);color:#fff;font-size:10px;font-weight:800;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 6px rgba(231,76,60,0.4);border:2px solid #fff}

  /* 탭 */
  .tab-active{border-bottom:3px solid #E8960C;color:#C47F00;font-weight:800;
    background:linear-gradient(to bottom,transparent,rgba(255,200,50,0.06))}
  .tab-inactive{border-bottom:3px solid transparent;color:#C4B090;font-weight:500}

  /* 플로팅 하단 네비 */
  .float-nav{
    position:fixed;bottom:16px;left:50%;transform:translateX(-50%);
    width:calc(100% - 32px);max-width:398px;
    background:rgba(255,255,255,0.88);backdrop-filter:blur(20px);
    border-radius:28px;display:flex;z-index:40;
    border:1px solid rgba(255,220,100,0.35);
    box-shadow:0 8px 32px rgba(180,130,0,0.18),0 2px 8px rgba(0,0,0,0.06),
               inset 0 1px 0 rgba(255,255,255,0.8);
    padding:4px}
  .nav-btn{flex:1;padding:10px 0 8px;display:flex;flex-direction:column;align-items:center;
    gap:3px;background:none;border:none;cursor:pointer;
    color:#C4B090;font-size:10px;font-weight:600;border-radius:24px;transition:all 0.2s}
  .nav-btn.active{color:#C47F00;background:rgba(255,200,50,0.15)}
  .nav-plus{
    width:46px;height:46px;border-radius:23px;margin-top:-20px;border:none;cursor:pointer;
    background:linear-gradient(135deg,#FFB800,#E8960C);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 6px 20px rgba(232,150,12,0.5),0 2px 8px rgba(0,0,0,0.1),
               inset 0 1px 0 rgba(255,255,255,0.3);
    animation:glow 3s ease-in-out infinite;transition:transform 0.2s}
  .nav-plus:active{transform:scale(0.9)}

  /* Glass 카드 */
  .glass-card{
    background:rgba(255,255,255,0.78);backdrop-filter:blur(12px);
    border-radius:22px;border:1px solid rgba(255,215,80,0.25);
    box-shadow:0 4px 20px rgba(180,130,0,0.1),0 1px 4px rgba(255,200,50,0.08),
               inset 0 1px 0 rgba(255,255,255,0.9);
    transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.2s}
  .glass-card:active{transform:scale(0.97);
    box-shadow:0 2px 10px rgba(180,130,0,0.08)}

  /* Progressive Blur — 헤더 아래 그라데이션 블러 */
  .prog-blur{
    position:sticky;top:56px;z-index:19;height:20px;
    background:linear-gradient(to bottom,rgba(255,248,225,0.9),transparent);
    pointer-events:none}

  /* Glass 입력창 */
  .glass-inp{
    background:rgba(255,255,255,0.7);backdrop-filter:blur(8px);
    border:1.5px solid rgba(220,180,80,0.35);border-radius:14px;
    padding:13px 16px;font-size:14px;width:100%;
    color:#3D2800;transition:border-color 0.2s,box-shadow 0.2s;
    box-shadow:inset 0 2px 4px rgba(180,130,0,0.06)}
  .glass-inp:focus{border-color:#E8960C;box-shadow:0 0 0 3px rgba(232,150,12,0.12),inset 0 2px 4px rgba(180,130,0,0.04)}
  .glass-inp::placeholder{color:#C4A870}

  /* 헤더 Liquid Glass */
  .glass-hdr{
    background:rgba(255,252,235,0.88);backdrop-filter:blur(24px);
    border-bottom:1px solid rgba(255,215,80,0.2);
    box-shadow:0 4px 24px rgba(180,130,0,0.08),inset 0 -1px 0 rgba(255,215,80,0.15)}

  /* 프라이머리 버튼 */
  .btn-primary{
    background:linear-gradient(135deg,#FFB800 0%,#E8960C 100%);
    border:none;border-radius:16px;color:#fff;font-weight:800;
    font-size:15px;width:100%;padding:15px;cursor:pointer;
    box-shadow:0 6px 20px rgba(232,150,12,0.4),0 2px 6px rgba(0,0,0,0.08),
               inset 0 1px 0 rgba(255,255,255,0.25);
    transition:transform 0.15s,box-shadow 0.15s;position:relative;overflow:hidden}
  .btn-primary::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);
    animation:shimmer 3s infinite}
  @keyframes shimmer{0%{left:-100%}100%{left:100%}}
  .btn-primary:active{transform:scale(0.97);box-shadow:0 3px 12px rgba(232,150,12,0.35)}

  /* 세컨더리 버튼 */
  .btn-secondary{
    background:rgba(255,255,255,0.7);backdrop-filter:blur(8px);
    border:1.5px solid rgba(220,180,80,0.4);border-radius:14px;
    color:#7A5200;font-weight:700;font-size:14px;width:100%;padding:13px;cursor:pointer;
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.8);
    transition:all 0.15s}
  .btn-secondary:active{background:rgba(255,240,180,0.6);transform:scale(0.98)}

  /* 위험 버튼 */
  .btn-danger{background:linear-gradient(135deg,#FF6B6B,#E74C3C);border:none;
    border-radius:14px;color:#fff;font-weight:700;font-size:14px;
    padding:9px 16px;cursor:pointer;
    box-shadow:0 4px 12px rgba(231,76,60,0.3),inset 0 1px 0 rgba(255,255,255,0.2)}

  /* Modern Skeuomorphism — 깊이감 있는 섹션 */
  .neumorphic{
    background:linear-gradient(145deg,#FFFAE8,#FFF5D0);
    box-shadow:4px 4px 12px rgba(200,160,0,0.12),-2px -2px 8px rgba(255,255,255,0.9),
               inset 0 1px 0 rgba(255,255,255,0.8);
    border-radius:16px}

  /* 카드 진입 애니메이션 */
  @keyframes cardIn{from{opacity:0;transform:translateY(16px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
  .card-anim{animation:cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both}
`;



function Highlight({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return <span>{text}</span>;
  return <span>{text.slice(0, i)}<mark className="highlight">{text.slice(i, i + query.length)}</mark>{text.slice(i + query.length)}</span>;
}

function StarDisplay({ rating, size = 16 }) {
  return <span style={{ fontSize: size }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(rating) ? "#FFB800" : "#e0d8d0" }}>★</span>)}</span>;
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} className="star" style={{ color: s <= (hover || value) ? "#FFB800" : "#e0d8d0" }}
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => onChange(s)}>★</span>
      ))}
    </div>
  );
}

// ── 위치 설정 모달 (App 바깥 독립 컴포넌트 — IME 깨짐 방지) ──
function LocationModal({ onClose, onSelectPlace, onGPS, locLoading, userLocation, userLocationName }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  // Claude API로 주소 검색
  const searchAddress = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setSearching(true); setSearchError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: "한국 주소 검색어: \"" + q + "\"\n" +
              "검색어와 관련된 한국 행정구역(동·읍·면·리·구·시 등) 결과를 최대 8개 JSON 배열로만 반환해주세요.\n" +
              "형식: [{\"name\":\"동네이름\",\"region\":\"시도 시군구\",\"lat\":위도숫자,\"lng\":경도숫자}]\n" +
              "- 실제 존재하는 정확한 한국 행정구역 좌표 사용\n" +
              "- JSON만 반환, 다른 텍스트 없음\n" +
              "- 마크다운 코드블록 없음"
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(c => c.type === "text")?.text || "[]";
      const clean = text.replace(new RegExp("\`\`\`json|\`\`\`", "g"), "").trim();
      const parsed = JSON.parse(clean);
      setResults(Array.isArray(parsed) ? parsed : []);
      setSearched(true);
    } catch (e) {
      setSearchError("검색에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSearching(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setSearched(false); return; }
    debounceRef.current = setTimeout(() => searchAddress(val), 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      clearTimeout(debounceRef.current);
      searchAddress(query);
    }
  };

  // 목록에 없을 때 직접 설정
  const handleDirectSet = () => {
    if (!query.trim()) return;
    const guMatch = LOCATION_DATA.find(p => p.name.endsWith("구") && query.includes(p.name.replace("구", "")));
    onSelectPlace({
      name: query.trim(),
      region: guMatch ? guMatch.region : "직접 입력",
      lat: guMatch ? guMatch.lat : 37.5665,
      lng: guMatch ? guMatch.lng : 126.9780,
    });
  };

  const trimmed = query.trim();

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 20px 24px" }}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: "#e0d8d0", margin: "0 auto 14px" }} />
          <div style={{ fontSize: 17, fontWeight: 900, color: "#1a1210", marginBottom: 4 }}>📍 내 위치 설정</div>
          <div style={{ fontSize: 12, color: "#bbb", marginBottom: 14 }}>전국 동·읍·면·리 실시간 검색 지원</div>

          {/* GPS 버튼 */}
          <button onClick={onGPS} style={{ width: "100%", padding: "13px", borderRadius: 13, border: "2px solid #E8960C", background: "#FFF9E8", color: "#E8960C", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {locLoading
              ? <><i className="ti ti-loader" style={{ fontSize: 17 }} />위치 감지 중...</>
              : <><i className="ti ti-current-location" style={{ fontSize: 17 }} />GPS로 자동 감지</>}
          </button>

          {/* 카카오 지도 보기 */}
          <a href={"https://map.kakao.com/?q=" + encodeURIComponent(query || "서울")} target="_blank" rel="noopener noreferrer"
            style={{ width: "100%", padding: "11px", borderRadius: 13, border: "1.5px solid #e8ddd8", background: "#fff", color: "#555", fontWeight: 700, fontSize: 14, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, textDecoration: "none", boxSizing: "border-box" }}>
            <i className="ti ti-map" style={{ fontSize: 17, color: "#E8960C" }} />카카오 지도에서 위치 확인
            <i className="ti ti-external-link" style={{ fontSize: 13, color: "#bbb" }} />
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: "#EEE0B0" }} />
            <span style={{ fontSize: 12, color: "#ccc", fontWeight: 600 }}>또는 주소 검색</span>
            <div style={{ flex: 1, height: 1, background: "#EEE0B0" }} />
          </div>

          {/* 검색 입력창 */}
          <div style={{ position: "relative", marginBottom: 8 }}>
            <i className="ti ti-search" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: searching ? "#E8960C" : "#c0b8b4", pointerEvents: "none" }} />
            <input
              ref={inputRef}
              type="text"
              style={{ width: "100%", padding: "13px 44px 13px 40px", borderRadius: 12, border: (searching ? "1.5px solid #E8960C" : "1.5px solid #e8ddd8"), fontSize: 15, fontFamily: "'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',-apple-system,sans-serif", outline: "none", boxSizing: "border-box", color: "#1a1210", background: "#fff", transition: "border-color 0.15s" }}
              placeholder="시흥동, 수지읍, 해운대구, 제주 애월읍..."
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            {searching && (
              <div style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: "#E8960C", animation: "pulse 0.8s infinite" }} />
                <div style={{ width: 6, height: 6, borderRadius: 3, background: "#E8960C", animation: "pulse 0.8s 0.2s infinite" }} />
                <div style={{ width: 6, height: 6, borderRadius: 3, background: "#E8960C", animation: "pulse 0.8s 0.4s infinite" }} />
              </div>
            )}
            {!searching && query && (
              <button onMouseDown={e => { e.preventDefault(); setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "#ddd", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <i className="ti ti-x" style={{ fontSize: 12, color: "#777" }} />
              </button>
            )}
          </div>

          {/* 검색 힌트 */}
          {!trimmed && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#bbb", fontWeight: 700, marginBottom: 8 }}>💡 이렇게 검색해보세요</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["시흥동", "수지읍", "해운대구", "애월읍", "세종시", "판교동", "망원동"].map(ex => (
                  <button key={ex} onClick={() => { setQuery(ex); clearTimeout(debounceRef.current); searchAddress(ex); }}
                    style={{ padding: "5px 12px", borderRadius: 16, border: "1.5px solid #e8ddd8", background: "#fff", color: "#888", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 오류 */}
          {searchError && (
            <div style={{ padding: "10px 14px", background: "#FFF0F0", borderRadius: 10, color: "#E74C3C", fontSize: 13, marginBottom: 8 }}>
              {searchError}
            </div>
          )}

          {/* 검색 결과 */}
          {searched && !searching && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#bbb", fontWeight: 700, marginBottom: 7 }}>
                {results.length > 0 ? `검색 결과 ${results.length}개` : "검색 결과 없음"}
              </div>
              <div style={{ maxHeight: 240, overflowY: "auto" }}>
                {results.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 16px", color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                    결과가 없어요<br />
                    <button onClick={handleDirectSet}
                      style={{ marginTop: 10, padding: "8px 16px", borderRadius: 20, border: "1.5px dashed #E8960C", background: "#FFFCF2", color: "#E8960C", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      &ldquo;{trimmed}&rdquo; 으로 그냥 설정
                    </button>
                  </div>
                ) : results.map((place, idx) => {
                  const isSelected = userLocationName === place.name;
                  return (
                    <div key={idx} onClick={() => onSelectPlace(place)}
                      style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "11px 8px", borderRadius: 12, marginBottom: 3, cursor: "pointer", background: isSelected ? "#FFF9E8" : "transparent", border: `1.5px solid ${isSelected ? "#E8960C" : "transparent"}` }}>
                      <div style={{ width: 34, height: 34, borderRadius: 17, background: isSelected ? "#E8960C" : "#FFF9E8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <i className="ti ti-map-pin" style={{ fontSize: 15, color: isSelected ? "#fff" : "#E8960C" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? "#E8960C" : "#1a1210" }}>{place.name}</div>
                        <div style={{ fontSize: 11, color: "#bbb", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{place.region}</div>
                        <div style={{ fontSize: 11, color: "#d0c8c4", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{place.fullAddress?.split(",").slice(0, 3).join(",")}</div>
                      </div>
                      {isSelected && <i className="ti ti-check" style={{ fontSize: 17, color: "#E8960C", flexShrink: 0, marginTop: 6 }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 현재 설정 */}
          {userLocation && (
            <div style={{ padding: "10px 14px", background: "#EBFFF5", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 4 }}>
              <i className="ti ti-check" style={{ color: "#1AAF6B", fontSize: 16 }} />
              <span style={{ fontSize: 13, color: "#1AAF6B", fontWeight: 700 }}>현재 설정: {userLocationName}</span>
            </div>
          )}

          <button onClick={onClose} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#FFF9E8", color: "#4a3830", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [authTab, setAuthTab] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [users, setUsers] = useState(MOCK_USERS);
  const [nextPostId, setNextPostId] = useState(8);
  const [nextUserId, setNextUserId] = useState(4);
  // 검색/필터
  const [category, setCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterSido, setFilterSido] = useState("");
  const [filterGu, setFilterGu] = useState("");
  const [filterStatus, setFilterStatus] = useState("전체");
  const [filterMaxPrice, setFilterMaxPrice] = useState(50000);
  const [sortKey, setSortKey] = useState("latest");
  const [recentSearches, setRecentSearches] = useState(["올리브유", "코스트코", "화장지"]);
  const [filterNearby, setFilterNearby] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(3);
  // GPS
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const [showLocModal, setShowLocModal] = useState(false);
  // 프로필 모달
  const [profileUserId, setProfileUserId] = useState(null);
  // 알림
  const [notifications, setNotifications] = useState([
    { id: 1, type: "join", postId: 1, text: "혼자사는법님의 '코스트코 통닭' 게시글에 서울러버님이 참여했어요!", read: false, createdAt: "방금" },
    { id: 2, type: "deadline", postId: 4, text: "'트레이더스 아보카도오일' 모집 마감이 내일이에요! 서두르세요 🔔", read: false, createdAt: "1시간 전" },
    { id: 3, type: "complete", postId: 3, text: "'락앤락 밀폐용기' 모임이 완료됐어요. 후기를 남겨보세요! ⭐", read: true, createdAt: "2일 전" },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  // 폼
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", nickname: "", region: "" });
  const [newPost, setNewPost] = useState({ type: "같이사요", title: "", item: "", description: "", maxParticipants: "2", totalPrice: "", pricePerPerson: "", location: "", meetDate: "", meetTime: "", deadline: "" });
  const [newComment, setNewComment] = useState("");
  const [newChat, setNewChat] = useState("");
  const [detailTab, setDetailTab] = useState("info");
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [adminTab, setAdminTab] = useState("users");
  const [reports, setReports] = useState([]);
  const [myTab, setMyTab] = useState("written");
  const [reviewForm, setReviewForm] = useState({ rating: 0, text: "" });
  const searchRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotif = (notif) => setNotifications(prev => [{ id: Date.now(), ...notif, read: false, createdAt: "방금" }, ...prev]);

  // GPS
  const requestLocation = () => {
    setLocLoading(true); setLocError("");
    if (!navigator.geolocation) { setLocError("이 브라우저는 위치 서비스를 지원하지 않아요"); setLocLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        // 가장 가까운 지역명 찾기
        const nearest = LOCATION_DATA.reduce((a, b) => calcDist(loc.lat, loc.lng, a.lat, a.lng) < calcDist(loc.lat, loc.lng, b.lat, b.lng) ? a : b);
        setUserLocationName(nearest.name + " 근처");
        setLocLoading(false); setShowLocModal(false);
        showToast("📍 위치가 설정됐어요!");
      },
      () => {
        setUserLocation({ lat: 37.5574, lng: 126.9244 });
        setUserLocationName("홍대입구역 근처");
        setLocLoading(false); setShowLocModal(false);
        showToast("📍 위치 시뮬레이션: 홍대입구역 기준으로 설정됐어요");
      }
    );
  };

  const setLocationByPlace = (place) => {
    setUserLocation({ lat: place.lat, lng: place.lng });
    setUserLocationName(place.name);
    setShowLocModal(false); setLocSearchQuery("");
    showToast(`📍 ${place.name}(${place.region})으로 설정됐어요!`);
  };

  const getPostDist = (post) => {
    if (!userLocation || !post.coords) return null;
    return calcDist(userLocation.lat, userLocation.lng, post.coords.lat, post.coords.lng);
  };

  // 필터/정렬
  const applyAll = (list) => {
    let r = [...list];
    if (category !== "전체") r = r.filter(p => p.type === category);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      r = r.filter(p => [p.title, p.item, p.description, p.location, p.author.nickname].some(t => t.toLowerCase().includes(q)));
    }
    if (filterGu) r = r.filter(p => p.author.region.includes(filterGu) || p.location.includes(filterGu));
    else if (filterSido) r = r.filter(p => p.author.region.includes(filterSido.replace("특별시","").replace("광역시","").replace("특별자치시","").replace("특별자치도","").replace("도","").slice(0,2)) || p.location.includes(filterSido.slice(0,2)));
    if (filterStatus === "모집중만") r = r.filter(p => p.status === "모집중");
    r = r.filter(p => p.pricePerPerson <= filterMaxPrice);
    if (filterNearby && userLocation) r = r.filter(p => { const d = getPostDist(p); return d !== null && d <= nearbyRadius; });
    switch (sortKey) {
      case "distance": if (userLocation) r.sort((a, b) => (getPostDist(a) ?? 999) - (getPostDist(b) ?? 999)); break;
      case "deadline": r.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)); break;
      case "price_asc": r.sort((a, b) => a.pricePerPerson - b.pricePerPerson); break;
      case "price_desc": r.sort((a, b) => b.pricePerPerson - a.pricePerPerson); break;
      default: r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return r;
  };

  const filteredPosts = applyAll(posts);
  const activeFilterCount = [!!filterSido, filterStatus !== "전체", filterMaxPrice < 50000, sortKey !== "latest", filterNearby].filter(Boolean).length;
  const submitSearch = (q) => {
    if (!q.trim()) return;
    setRecentSearches(prev => [q.trim(), ...prev.filter(s => s !== q.trim())].slice(0, 6));
    setSearchFocused(false); searchRef.current?.blur();
  };
  const clearAll = () => { setFilterSido(""); setFilterGu(""); setFilterStatus("전체"); setFilterMaxPrice(50000); setSortKey("latest"); setCategory("전체"); setFilterNearby(false); showToast("필터가 초기화됐어요"); };

  // 유저 평점
  const getUserRating = (userId) => {
    const allReviews = posts.flatMap(p => (p.reviews || []).filter(r => r.toUserId === userId || p.author.id === userId));
    const relevant = posts.flatMap(p => p.author.id === userId ? (p.reviews || []) : []);
    if (relevant.length === 0) return null;
    return { avg: relevant.reduce((a, r) => a + r.rating, 0) / relevant.length, count: relevant.length };
  };

  const getUserPosts = (userId) => posts.filter(p => p.author.id === userId);

  // 핸들러
  const handleLogin = () => {
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (!user) { setError("이메일 또는 비밀번호가 올바르지 않아요"); return; }
    if (user.suspended) { setError("정지된 계정이에요"); return; }
    setCurrentUser(user); setScreen("home"); setError("");
  };
  const handleSignup = () => {
    if (!signupForm.email || !signupForm.password || !signupForm.nickname || !signupForm.region) { setError("모든 항목을 입력해주세요"); return; }
    if (users.find(u => u.email === signupForm.email)) { setError("이미 사용 중인 이메일이에요"); return; }
    const u = { id: nextUserId, ...signupForm, isAdmin: false, avatar: signupForm.nickname[0], suspended: false, bio: "" };
    setUsers([...users, u]); setNextUserId(nextUserId + 1); setCurrentUser(u); setScreen("home"); setError("");
  };
  const handleCreatePost = () => {
    if (!newPost.title || !newPost.item || !newPost.location || !newPost.meetDate || !newPost.deadline) { setError("필수 항목을 모두 입력해주세요"); return; }
    const p = { id: nextPostId, ...newPost, author: { id: currentUser.id, nickname: currentUser.nickname, region: currentUser.region }, participants: [currentUser.id], status: "모집중", comments: [], chat: [], reviews: [], coords: userLocation || { lat: 37.5574, lng: 126.9244 }, createdAt: new Date().toISOString().split("T")[0], reported: false, totalPrice: Number(newPost.totalPrice), pricePerPerson: Number(newPost.pricePerPerson), maxParticipants: Number(newPost.maxParticipants) };
    setPosts([p, ...posts]); setNextPostId(nextPostId + 1);
    setNewPost({ type: "같이사요", title: "", item: "", description: "", maxParticipants: "2", totalPrice: "", pricePerPerson: "", location: "", meetDate: "", meetTime: "", deadline: "" });
    setScreen("home"); showToast("게시글이 등록됐어요! 🎉"); setError("");
  };
  const handleJoin = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      if (p.participants.includes(currentUser.id)) { showToast("참여를 취소했어요"); return { ...p, participants: p.participants.filter(id => id !== currentUser.id), status: "모집중" }; }
      if (p.participants.length >= p.maxParticipants) { showToast("이미 마감됐어요"); return p; }
      const upd = { ...p, participants: [...p.participants, currentUser.id] };
      if (upd.participants.length >= upd.maxParticipants) upd.status = "마감";
      addNotif({ type: "join", postId, text: `"${p.title}" 게시글에 ${currentUser.nickname}님이 참여했어요!` });
      showToast("참여 신청됐어요! 🙌"); return upd;
    }));
  };
  const handleComment = (postId) => {
    if (!newComment.trim()) return;
    const c = { id: Date.now(), userId: currentUser.id, nickname: currentUser.nickname, text: newComment.trim(), createdAt: new Date().toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, c] } : p));
    setNewComment("");
  };
  const handleChat = (postId) => {
    if (!newChat.trim()) return;
    const c = { id: Date.now(), userId: currentUser.id, nickname: currentUser.nickname, text: newChat.trim(), createdAt: new Date().toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, chat: [...(p.chat || []), c] } : p));
    setNewChat("");
  };
  const handleReport = (postId) => {
    setReports(r => [...r, { id: Date.now(), postId, reportedBy: currentUser.id, reason: "부적절한 게시글", status: "대기중", date: new Date().toLocaleDateString("ko-KR") }]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reported: true } : p));
    showToast("신고가 접수됐어요");
  };
  const handleDeletePost = (postId) => { setPosts(prev => prev.filter(p => p.id !== postId)); showToast("삭제됐어요"); if (screen === "detail") setScreen("home"); };
  const handleClosePost = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "완료" } : p));
    addNotif({ type: "complete", postId, text: `참여하신 모임이 완료됐어요. 후기를 남겨주세요! ⭐` });
    showToast("모집 완료 처리됐어요 ✓");
  };
  const handleReview = (postId, authorId) => {
    if (!reviewForm.rating) { showToast("별점을 선택해주세요"); return; }
    const r = { id: Date.now(), fromUserId: currentUser.id, fromNickname: currentUser.nickname, toUserId: authorId, rating: reviewForm.rating, text: reviewForm.text, createdAt: new Date().toISOString().split("T")[0] };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reviews: [...(p.reviews || []), r] } : p));
    setReviewForm({ rating: 0, text: "" });
    showToast("후기가 등록됐어요 ⭐");
  };

  const selectedPost = posts.find(p => p.id === selectedPostId);
  const myPosts = posts.filter(p => p.author.id === currentUser?.id);
  const myJoined = posts.filter(p => currentUser && p.participants.includes(currentUser.id) && p.author.id !== currentUser.id);
  const goToPost = (id) => { setSelectedPostId(id); setScreen("detail"); setNewComment(""); setSearchFocused(false); setShowFilter(false); setDetailTab("info"); };

  const S = {
    hdr: { padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 },
    logo: { color: "#C47F00", fontSize: 22, fontWeight: 900, letterSpacing: -0.5 },
    av: () => ({ width: 36, height: 36, borderRadius: 18, background: "linear-gradient(135deg,#FFD060,#E8960C)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, boxShadow: "0 3px 10px rgba(232,150,12,0.35)" }),
    bnav: {},
    nb: (a) => ({ flex: 1, padding: "10px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: a ? "#C47F00" : "#c0b8b4", fontSize: 10, fontWeight: a ? 700 : 400 }),
    card: { borderRadius: 22, marginBottom: 12, padding: "16px", cursor: "pointer" },
    tb: (t) => ({ display: "inline-flex", alignItems: "center", padding: "4px 11px", borderRadius: 24, fontSize: 11, fontWeight: 800, background: t === "같이사요" ? "rgba(255,215,80,0.25)" : "rgba(50,200,130,0.15)", color: t === "같이사요" ? "#B07000" : "#148A55", border: t === "같이사요" ? "1px solid rgba(220,170,0,0.3)" : "1px solid rgba(30,180,100,0.25)" }),
    sb: (s) => ({ display: "inline-block", padding: "4px 11px", borderRadius: 24, fontSize: 11, fontWeight: 800, background: s === "모집중" ? "rgba(44,123,229,0.12)" : s === "마감" ? "rgba(224,123,44,0.12)" : s === "완료" ? "rgba(26,175,107,0.12)" : "rgba(0,0,0,0.06)", color: s === "모집중" ? "#1A5FBE" : s === "마감" ? "#C06010" : s === "완료" ? "#0F8A50" : "#888", border: s === "모집중" ? "1px solid rgba(44,123,229,0.2)" : s === "마감" ? "1px solid rgba(224,123,44,0.2)" : s === "완료" ? "1px solid rgba(26,175,107,0.2)" : "none" }),
    btn: (v = "primary") => {
      if (v === "primary") return { padding: "14px 20px", borderRadius: 16, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 15, width: "100%", background: "linear-gradient(135deg,#FFB800,#E8960C)", color: "#fff", boxShadow: "0 6px 20px rgba(232,150,12,0.4)" };
      if (v === "danger") return { padding: "9px 16px", borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, width: "auto", background: "linear-gradient(135deg,#FF6B6B,#E74C3C)", color: "#fff", boxShadow: "0 4px 12px rgba(231,76,60,0.3)" };
      if (v === "ghost") return { padding: "9px 16px", borderRadius: 14, border: "1.5px dashed #E8960C", cursor: "pointer", fontWeight: 700, fontSize: 13, width: "100%", background: "transparent", color: "#C47F00" };
      return { padding: "12px 16px", borderRadius: 14, border: "1.5px solid rgba(220,180,80,0.4)", cursor: "pointer", fontWeight: 700, fontSize: 14, width: "auto", background: "rgba(255,255,255,0.7)", color: "#7A5200" };
    },
    inp: { width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid rgba(220,180,80,0.35)", fontSize: 14, background: "rgba(255,255,255,0.7)", fontFamily: "inherit", color: "#3D2800" },
    lbl: { fontSize: 12, color: "#A07830", marginBottom: 6, display: "block", fontWeight: 800, letterSpacing: 0.3 },
  };

  const PBar = ({ cur, max }) => { const p = Math.round((cur / max) * 100); return <div style={{ height: 5, borderRadius: 3, background: "#EEE0B0", overflow: "hidden" }}><div style={{ height: "100%", width: Math.min(p, 100) + "%", background: p >= 100 ? "#E74C3C" : p >= 75 ? "#E07B2C" : "#1AAF6B", borderRadius: 3 }} /></div>; };

  const BNav = () => (
    <nav className="float-nav">
      {/* 홈 */}
      <button className={`nav-btn ${screen === "home" ? "active" : ""}`}
        onClick={() => { setScreen("home"); setSearchFocused(false); }}>
        <i className="ti ti-home" style={{ fontSize: 21 }} />
        <span>홈</span>
      </button>

      {/* 글쓰기 — 가운데, 라벨 포함 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 4 }}>
        <button className="nav-plus" onClick={() => setScreen("create")}
          style={{ width: 52, height: 52, borderRadius: 26, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#FFB800,#E8960C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginTop: -26,
            boxShadow: "0 6px 20px rgba(232,150,12,0.5), 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
          <i className="ti ti-pencil-plus" style={{ fontSize: 22, color: "#fff" }} />
        </button>
        <span style={{ fontSize: 10, fontWeight: 800, marginTop: 3,
          color: screen === "create" ? "#C47F00" : "#C4B090",
          letterSpacing: 0.3 }}>글쓰기</span>
      </div>

      {/* 마이 */}
      <button className={`nav-btn ${screen === "mypage" ? "active" : ""}`}
        onClick={() => { setScreen("mypage"); setProfileEdit(false); }}>
        <i className="ti ti-user" style={{ fontSize: 21 }} />
        <span>마이</span>
      </button>

      {/* 관리자 (admin 계정만) */}
      {currentUser?.isAdmin && (
        <button className={`nav-btn ${screen === "admin" ? "active" : ""}`}
          onClick={() => setScreen("admin")}>
          <i className="ti ti-shield-check" style={{ fontSize: 21 }} />
          <span>관리</span>
        </button>
      )}
    </nav>
  );

  // ── 프로필 모달 ──
  const ProfileModal = ({ userId, onClose }) => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    const userPosts = getUserPosts(userId);
    const rating = getUserRating(userId);
    const allReviews = posts.flatMap(p => p.author.id === userId ? (p.reviews || []) : []);
    return (
      <div className="modal-bg" onClick={onClose}>
        <div className="modal-sheet" onClick={e => e.stopPropagation()}>
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ width: 32, height: 4, borderRadius: 2, background: "#e0d8d0", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 30, background: "#E8960C", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 800 }}>{user.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#1a1210" }}>{user.nickname}</div>
                <div style={{ fontSize: 13, color: "#bbb" }}>{user.region}</div>
                {user.bio && <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{user.bio}</div>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
              {[{ l: "게시글", v: userPosts.length }, { l: "평균 평점", v: rating ? rating.avg.toFixed(1) + "★" : "없음" }, { l: "후기 수", v: allReviews.length }].map(s => (
                <div key={s.l} style={{ background: "#FFFCF2", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#1a1210" }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            {allReviews.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 10 }}>받은 후기</div>
                {allReviews.slice(0, 3).map(r => (
                  <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid #FFF9E8" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{r.fromNickname}</span>
                      <StarDisplay rating={r.rating} size={14} />
                    </div>
                    {r.text && <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{r.text}</p>}
                  </div>
                ))}
              </div>
            )}
            {userPosts.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 10 }}>작성한 글</div>
                {userPosts.slice(0, 3).map(p => (
                  <div key={p.id} style={{ padding: "8px 0", borderBottom: "1px solid #FFF9E8", cursor: "pointer" }} onClick={() => { onClose(); goToPost(p.id); }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 4 }}><span style={S.tb(p.type)}>{p.type}</span><span style={S.sb(p.status)}>{p.status}</span></div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{p.title}</div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={onClose} style={{ ...S.btn("secondary"), borderRadius: 14 }}>닫기</button>
          </div>
        </div>
      </div>
    );
  };

  // ── 알림 패널 ──
  const NotifPanel = () => (
    <div style={{ position: "fixed", top: 56, right: 0, left: "50%", transform: "translateX(-50%)", maxWidth: 430, width: "100%", background: "rgba(255,252,235,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,215,80,0.25)", zIndex: 200, maxHeight: 380, overflowY: "auto", animation: "fp 0.18s ease" }}>
      <div style={{ padding: "14px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1210" }}>알림</span>
        <button onClick={() => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }} style={{ fontSize: 12, color: "#E8960C", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>전체 읽음</button>
      </div>
      {notifications.length === 0 ? <div style={{ textAlign: "center", padding: "30px", color: "#ccc", fontSize: 14 }}>알림이 없어요</div> :
        notifications.map(n => (
          <div key={n.id} style={{ padding: "12px 16px", borderTop: "1px solid #FFF9E8", background: n.read ? "#fff" : "#FFFCF2", display: "flex", gap: 10, cursor: "pointer" }}
            onClick={() => { setNotifications(prev => prev.map(nf => nf.id === n.id ? { ...nf, read: true } : nf)); setShowNotifs(false); if (n.postId) goToPost(n.postId); }}>
            <div style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>
              {n.type === "join" ? "🙋" : n.type === "deadline" ? "⏰" : n.type === "complete" ? "✅" : "🔔"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: "#333", lineHeight: 1.5, fontWeight: n.read ? 400 : 600 }}>{n.text}</p>
              <span style={{ fontSize: 11, color: "#ccc" }}>{n.createdAt}</span>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: 4, background: "#E8960C", flexShrink: 0, marginTop: 5 }} />}
          </div>
        ))}
    </div>
  );

  // ── AUTH ──
  if (screen === "auth") return (
    <div className="app"><style>{css}</style>
      {toast && <div className="toast">{toast}</div>}
      <div style={{ padding: "64px 24px 32px", textAlign: "center" }}>
        <div style={{ width: 90, height: 90, borderRadius: 28, background: "linear-gradient(135deg,#FFD060,#E8960C)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 40, boxShadow: "0 12px 32px rgba(232,150,12,0.4), 0 4px 12px rgba(0,0,0,0.08)" }}>🛍️</div>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: "#C47F00", letterSpacing: -1.5, marginBottom: 6 }}>소분톡</h1>
        <p style={{ color: "#A07830", fontSize: 14, fontWeight: 600 }}>대량 구매, 이웃과 나눠요 🌻</p>
      </div>
      <div style={{ padding: "0 24px 40px" }}>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", borderRadius: 18, padding: 5, marginBottom: 24, border: "1px solid rgba(220,180,80,0.3)" }}>
          {[["login", "로그인"], ["signup", "회원가입"]].map(([t, l]) => (
            <button key={t} onClick={() => { setAuthTab(t); setError(""); }} style={{ flex: 1, padding: "11px", borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, background: authTab === t ? "linear-gradient(135deg,#FFB800,#E8960C)" : "transparent", color: authTab === t ? "#fff" : "#A07830", boxShadow: authTab === t ? "0 4px 12px rgba(232,150,12,0.3)" : "none", transition: "all 0.2s" }}>{l}</button>
          ))}
        </div>
        {error && <div style={{ background: "#FFF9E8", color: "#E8960C", padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13, textAlign: "center" }}>{error}</div>}
        {authTab === "login" ? (
          <div>
            {[{ k: "email", l: "이메일", t: "email", p: "이메일 입력" }, { k: "password", l: "비밀번호", t: "password", p: "비밀번호 입력" }].map(f => (
              <div key={f.k} style={{ marginBottom: 12 }}><label style={S.lbl}>{f.l}</label><input style={S.inp} type={f.t} placeholder={f.p} value={loginForm[f.k]} onChange={e => setLoginForm({ ...loginForm, [f.k]: e.target.value })} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
            ))}
            <div style={{ marginTop: 8 }}><button style={S.btn()} onClick={handleLogin}>로그인</button></div>
            <div style={{ marginTop: 16, padding: "12px 14px", background: "#FFFCF2", borderRadius: 10, fontSize: 12, color: "#bbb", lineHeight: 1.8, textAlign: "center" }}>일반: user1@test.com / 1234<br />관리자: admin@test.com / 1234</div>
          </div>
        ) : (
          <div>
            {[{ k: "email", l: "이메일", t: "email", p: "이메일 입력" }, { k: "password", l: "비밀번호", t: "password", p: "비밀번호 8자 이상" }, { k: "nickname", l: "닉네임", t: "text", p: "닉네임 (2~10자)" }, { k: "region", l: "활동 지역", t: "text", p: "예: 서울 마포구" }].map(f => (
              <div key={f.k} style={{ marginBottom: 12 }}><label style={S.lbl}>{f.l}</label><input style={S.inp} type={f.t} placeholder={f.p} value={signupForm[f.k]} onChange={e => setSignupForm({ ...signupForm, [f.k]: e.target.value })} /></div>
            ))}
            <div style={{ marginTop: 8 }}><button style={S.btn()} onClick={handleSignup}>회원가입</button></div>
          </div>
        )}
      </div>
    </div>
  );

  // ── HOME ──
  if (screen === "home") return (
    <div className="app"><style>{css}</style>
      {toast && <div className="toast">{toast}</div>}
      {showLocModal && (
        <LocationModal
          onClose={() => setShowLocModal(false)}
          onSelectPlace={setLocationByPlace}
          onGPS={requestLocation}
          locLoading={locLoading}
          userLocation={userLocation}
          userLocationName={userLocationName}
        />
      )}
      {profileUserId && <ProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />}
      {showNotifs && <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setShowNotifs(false)} />}
      {showNotifs && <NotifPanel />}

      <div className="glass-hdr" style={S.hdr}>
        <div>
          <div style={S.logo}>소분톡 🛍️</div>
          <div style={{ color: "#A07830", fontSize: 11, marginTop: 1 }}>📍 {userLocationName || currentUser?.region}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowLocModal(true)} style={{ display: "flex", alignItems: "center", gap: 5, background: "#FFF3D0", border: "1.5px solid #F0DFA0", borderRadius: 20, cursor: "pointer", padding: "6px 12px", color: "#C47F00", fontWeight: 700, fontSize: 12 }}>
            <i className="ti ti-map-pin" style={{ fontSize: 14 }} />
            {userLocation ? "위치변경" : "내 위치 설정"}
          </button>
          <button onClick={() => setShowNotifs(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#A07830", padding: 4, position: "relative" }}>
            <i className="ti ti-bell" style={{ fontSize: 22 }} />
            {unreadCount > 0 && <div className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</div>}
          </button>
          <div style={S.av()}>{currentUser?.avatar}</div>
        </div>
      </div>

      {/* GPS 안내 배너 — 위치 미설정 시 */}
      {!userLocation && (
        <div style={{ background: "linear-gradient(135deg,#FFF3D0,#FFE8A0)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F0DFA0" }}>
          <i className="ti ti-map-pin" style={{ color: "#C47F00", fontSize: 20, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 13, color: "#7A5200", fontWeight: 500 }}>📍 위치를 설정하면 내 주변 소분을 거리순으로 볼 수 있어요!</div>
          <button onClick={() => setShowLocModal(true)} style={{ background: "#E8960C", border: "none", borderRadius: 20, padding: "7px 14px", fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer", flexShrink: 0 }}>
            지금 설정
          </button>
        </div>
      )}

      {/* 검색바 */}
      <div style={{ background: "rgba(255,255,240,0.8)", backdropFilter: "blur(16px)", padding: "12px 14px 0", borderBottom: "1.5px solid #F5E8C0", position: "sticky", top: 56, zIndex: 20 }}>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 17, color: searchFocused ? "#E8960C" : "#c0b8b4", pointerEvents: "none" }} />
          <input ref={searchRef} style={{ ...S.inp, paddingLeft: 38, paddingRight: searchQuery ? 38 : 14, background: "#FFFCF2", borderColor: searchFocused ? "#E8960C" : "#e8ddd8", borderRadius: 12 }}
            placeholder="품목명, 지역, 키워드로 검색..." value={searchQuery}
            onFocus={() => setSearchFocused(true)} onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitSearch(searchQuery)} />
          {searchQuery && <button onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "#ddd", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-x" style={{ fontSize: 12, color: "#777" }} /></button>}
        </div>

        {!searchFocused && (
          <div style={{ display: "flex", gap: 6, paddingBottom: 10, overflowX: "auto", alignItems: "center" }}>
            {/* 카테고리 선택 시 뒤로가기 버튼 */}
            {category !== "전체" && (
              <button onClick={() => setCategory("전체")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 20, background: "#E8960C", border: "none", cursor: "pointer", flexShrink: 0, color: "#fff", fontWeight: 700, fontSize: 12 }}>
                <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />전체
              </button>
            )}
            {["전체", "같이사요", "나눠봐요"].map(c => <button key={c} onClick={() => setCategory(c)} className={`chip ${category === c ? "cact" : "con"}`}>{c}</button>)}
            <div style={{ width: 1, background: "#EEE0B0", margin: "4px 2px", flexShrink: 0 }} />
            {userLocation && (
              <button onClick={() => { setFilterNearby(v => !v); }} className={`chip ${filterNearby ? "cact" : "con"}`}>
                <i className="ti ti-map-pin" style={{ fontSize: 12, marginRight: 3 }} />{filterNearby ? `${nearbyRadius}km 이내` : "내 주변"}
              </button>
            )}
            <button onClick={() => setShowFilter(v => !v)} className={`chip ${showFilter || activeFilterCount > 0 ? "cact" : "con"}`}>
              <i className="ti ti-adjustments-horizontal" style={{ fontSize: 12, marginRight: 3 }} />필터{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>
        )}


        {searchFocused && (
          <div style={{ paddingBottom: 12 }}>
            {recentSearches.length > 0 && <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
                <span style={{ fontSize: 12, color: "#bbb", fontWeight: 700 }}>최근 검색어</span>
                <button onClick={() => setRecentSearches([])} style={{ fontSize: 12, color: "#d0c8c4", background: "none", border: "none", cursor: "pointer" }}>전체 삭제</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {recentSearches.map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, background: "#FFF9E8", borderRadius: 16, padding: "6px 12px" }}>
                    <i className="ti ti-history" style={{ fontSize: 13, color: "#c0b0aa" }} />
                    <span style={{ fontSize: 13, color: "#6a5550", cursor: "pointer", fontWeight: 500 }} onClick={() => { setSearchQuery(s); setSearchFocused(false); }}>{s}</span>
                    <button onClick={() => setRecentSearches(p => p.filter(r => r !== s))} style={{ background: "none", border: "none", cursor: "pointer", color: "#c0b0aa", padding: 0 }}><i className="ti ti-x" style={{ fontSize: 12 }} /></button>
                  </div>
                ))}
              </div>
            </>}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "#bbb", fontWeight: 700, marginBottom: 9 }}>🔥 인기 검색어</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["코스트코", "올리브유", "트레이더스", "화장지", "냉동과일", "밀폐용기"].map((s, i) => (
                  <button key={s} onClick={() => { setSearchQuery(s); setSearchFocused(false); }} className="chip con" style={{ fontSize: 12 }}>
                    <span style={{ color: i < 3 ? "#E8960C" : "#c0b8b4", fontWeight: 800, marginRight: 4, fontSize: 11 }}>{i + 1}</span>{s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setSearchFocused(false)} style={{ marginTop: 12, ...S.btn("ghost"), padding: "9px", fontSize: 13, borderRadius: 10, border: "1px solid #EEE0B0" }}>취소</button>
          </div>
        )}
      </div>{/* sticky 검색바 끝 */}

      {/* 결과 카운트 */}
      {!searchFocused && (
        <div style={{ padding: "8px 16px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#B89060", fontWeight: 600 }}>
            {searchQuery && <><span style={{ color: "#C47F00", fontWeight: 800 }}>"{searchQuery}"</span>{" "}</>}
            <span style={{ fontWeight: 800, color: "#7A5200" }}>{filteredPosts.length}개</span>의 소분
            {userLocation && filterNearby && <span style={{ color: "#E8960C" }}> · {nearbyRadius}km 이내</span>}
          </span>
          {(searchQuery || activeFilterCount > 0) && (
            <button onClick={() => { setSearchQuery(""); clearAll(); }} style={{ fontSize: 12, color: "#E8960C", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>초기화 ×</button>
          )}
        </div>
      )}

      {/* 필터 패널 — 페이지 스크롤로 자연스럽게 읽기 */}
      {showFilter && !searchFocused && (
        <div style={{ margin: "4px 14px 12px", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "18px 16px", border: "1px solid rgba(255,215,80,0.25)", boxShadow: "0 4px 16px rgba(180,130,0,0.08)" }}>

          {userLocation && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#3D2800", marginBottom: 8 }}>📍 주변 반경</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#A07830" }}>{filterNearby ? "적용 중" : "미적용"}</span>
                <span style={{ fontSize: 12, color: "#E8960C", fontWeight: 800 }}>{nearbyRadius}km 이내</span>
              </div>
              <input type="range" min={1} max={20} step={1} value={nearbyRadius}
                onChange={e => { setNearbyRadius(Number(e.target.value)); setFilterNearby(true); }}
                style={{ width: "100%", accentColor: "#E8960C" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#C4A870", marginTop: 3 }}><span>1km</span><span>20km</span></div>
              {filterNearby && <button onClick={() => setFilterNearby(false)} style={{ marginTop: 7, fontSize: 12, color: "#888", background: "rgba(255,255,255,0.7)", border: "1px solid #EEE0B0", borderRadius: 20, padding: "4px 12px", cursor: "pointer" }}>반경 해제</button>}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#3D2800", marginBottom: 8 }}>📍 지역 (시/도)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <button onClick={() => { setFilterSido(""); setFilterGu(""); }} className={`chip ${!filterSido ? "cact" : "con"}`} style={{ fontSize: 12 }}>전체</button>
              {Object.keys(SIDO_GU).map(sido => (
                <button key={sido} onClick={() => { setFilterSido(sido); setFilterGu(""); }}
                  className={`chip ${filterSido === sido ? "cact" : "con"}`} style={{ fontSize: 12 }}>
                  {sido.replace("특별시","").replace("광역시","").replace("특별자치시","").replace("특별자치도","").replace("도","").replace("특별","").slice(0,3)}
                </button>
              ))}
            </div>
            {filterSido && SIDO_GU[filterSido]?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: "#A07830", fontWeight: 700, marginBottom: 6 }}>구/시 선택</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <button onClick={() => setFilterGu("")} className={`chip ${!filterGu ? "cact" : "con"}`} style={{ fontSize: 11 }}>전체 구</button>
                  {SIDO_GU[filterSido].map(gu => (
                    <button key={gu} onClick={() => setFilterGu(gu)} className={`chip ${filterGu === gu ? "cact" : "con"}`} style={{ fontSize: 11 }}>{gu}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#3D2800", marginBottom: 8 }}>📋 모집 상태</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["전체", "모집중만"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`chip ${filterStatus === s ? "cact" : "con"}`} style={{ fontSize: 13, padding: "8px 18px" }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#3D2800" }}>💰 1인 최대 가격</div>
              <div style={{ fontSize: 13, color: "#E8960C", fontWeight: 800 }}>
                {filterMaxPrice >= 50000 ? "제한 없음" : filterMaxPrice.toLocaleString() + "원"}
              </div>
            </div>
            <input type="range" min={1000} max={50000} step={1000} value={filterMaxPrice}
              onChange={e => setFilterMaxPrice(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#E8960C" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#C4A870", marginTop: 3 }}>
              <span>1,000원</span><span>제한 없음</span>
            </div>
          </div>

          <div style={{ marginBottom: activeFilterCount > 0 ? 16 : 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#3D2800", marginBottom: 8 }}>🔀 정렬</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {SORT_OPTIONS.map(s => (
                <button key={s.key}
                  onClick={() => { setSortKey(s.key); if (s.key === "distance" && !userLocation) requestLocation(); }}
                  className={`chip ${sortKey === s.key ? "cact" : "con"}`} style={{ fontSize: 12 }}>
                  <i className={"ti " + s.icon} style={{ fontSize: 12, marginRight: 4 }} />{s.label}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button onClick={clearAll}
              style={{ fontSize: 13, color: "#E8960C", background: "none", border: "1.5px dashed #E8960C", borderRadius: 20, padding: "7px 18px", cursor: "pointer", fontWeight: 700 }}>
              <i className="ti ti-rotate" style={{ fontSize: 13, marginRight: 4 }} />필터 초기화
            </button>
          )}
        </div>
      )}

      {!searchFocused && (
        <div style={{ padding: "4px 14px 130px" }}>
          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#C4A870" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#B89040", marginBottom: 6 }}>검색 결과가 없어요</p>
              <p style={{ fontSize: 13, color: "#C4A870" }}>다른 키워드나 필터로 찾아보세요</p>
              {(searchQuery || activeFilterCount > 0) && (
                <button onClick={() => { setSearchQuery(""); clearAll(); }} className="btn-primary" style={{ marginTop: 16, width: "auto", padding: "11px 28px", borderRadius: 24, fontSize: 14 }}>필터 초기화</button>
              )}
            </div>
          ) : (
            // ── Bento Grid ──
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {filteredPosts.map((post, index) => {
                const isJoined = post.participants.includes(currentUser.id);
                const slotsLeft = post.maxParticipants - post.participants.length;
                const dist = getPostDist(post);
                const rating = getUserRating(post.author.id);
                const pct = Math.round((post.participants.length / post.maxParticipants) * 100);
                // Bento 패턴: 0,3,6... → featured(full), 나머지 → 작은 카드
                const isFeatured = index % 3 === 0;

                // ── Featured 카드 (full width) ──
                if (isFeatured) return (
                  <div key={post.id} className="glass-card" onClick={() => goToPost(post.id)}
                    style={{ gridColumn: "1 / -1", borderRadius: 24, overflow: "hidden", cursor: "pointer",
                      background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,215,80,0.25)",
                      boxShadow: "0 8px 32px rgba(180,130,0,0.12), 0 2px 8px rgba(255,200,50,0.08)",
                      animation: `slideUp 0.${Math.min(3 + index, 8)}s ease both` }}>
                    {/* 상단 컬러 배너 */}
                    <div style={{ height: 100, background: post.type === "같이사요"
                      ? "linear-gradient(135deg,#FFE0A0,#FFD060,#FFC030)"
                      : "linear-gradient(135deg,#A8F0D0,#60E0A8,#30D090)",
                      display: "flex", alignItems: "center", padding: "0 20px", gap: 14, position: "relative", overflow: "hidden" }}>
                      {/* 배경 원형 장식 */}
                      <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: 60, background: "rgba(255,255,255,0.15)" }} />
                      <div style={{ position: "absolute", right: 20, bottom: -30, width: 80, height: 80, borderRadius: 40, background: "rgba(255,255,255,0.1)" }} />
                      {post.images && post.images[0]
                        ? <img src={post.images[0]} alt="" style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", flexShrink: 0 }} />
                        : <div style={{ width: 72, height: 72, borderRadius: 16, background: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0, backdropFilter: "blur(8px)" }}>
                            {post.type === "같이사요" ? "🛒" : "📦"}
                          </div>}
                      <div>
                        <div style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                          <span style={{ ...S.tb(post.type), background: "rgba(255,255,255,0.5)", backdropFilter: "blur(4px)" }}>{post.type}</span>
                          <span style={S.sb(post.status)}>{post.status}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(60,30,0,0.6)", fontWeight: 700 }}>{post.author.nickname}</div>
                      </div>
                    </div>
                    {/* 하단 정보 */}
                    <div style={{ padding: "14px 16px" }}>
                      <h3 style={{ fontSize: 16, fontWeight: 900, color: "#2C1A0E", lineHeight: 1.35, marginBottom: 4 }}>
                        <Highlight text={post.title} query={searchQuery} />
                      </h3>
                      <p style={{ fontSize: 12, color: "#B89060", marginBottom: 10 }}><Highlight text={post.item} query={searchQuery} /></p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 900, color: "#C47F00", letterSpacing: -0.5 }}>{Number(post.pricePerPerson).toLocaleString()}<span style={{ fontSize: 12, fontWeight: 600, color: "#C4A870", marginLeft: 2 }}>원/인</span></div>
                          <div style={{ fontSize: 11, color: "#C4A870", marginTop: 2 }}>참여 {post.participants.length}/{post.maxParticipants}명 · {post.deadline} 마감</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          {dist !== null && <div style={{ fontSize: 11, color: "#E8960C", fontWeight: 800, marginBottom: 3 }}>📍 {fmtDist(dist)}</div>}
                          {rating && <div style={{ fontSize: 11, color: "#888" }}>⭐ {rating.avg.toFixed(1)}</div>}
                        </div>
                      </div>
                      {/* 진행 바 */}
                      <div style={{ height: 4, borderRadius: 2, background: "rgba(180,130,0,0.1)", marginTop: 10, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: Math.min(pct, 100) + "%", borderRadius: 2, transition: "width 0.5s ease",
                          background: pct >= 100 ? "linear-gradient(90deg,#FF6B6B,#E74C3C)" : pct >= 75 ? "linear-gradient(90deg,#FFB800,#E8960C)" : "linear-gradient(90deg,#30D090,#1AAF6B)" }} />
                      </div>
                      {slotsLeft === 1 && post.status === "모집중" && (
                        <div style={{ marginTop: 6, fontSize: 11, color: "#E8960C", fontWeight: 800 }}>🔥 마지막 1자리!</div>
                      )}
                      {isJoined && post.author.id !== currentUser.id && (
                        <div style={{ marginTop: 6, fontSize: 11, color: "#1AAF6B", fontWeight: 800 }}>✓ 참여 중</div>
                      )}
                    </div>
                  </div>
                );

                // ── Small 카드 (half width) ──
                return (
                  <div key={post.id} className="glass-card" onClick={() => goToPost(post.id)}
                    style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer",
                      background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,215,80,0.2)",
                      boxShadow: "0 4px 16px rgba(180,130,0,0.1)",
                      animation: `slideUp 0.${Math.min(3 + index, 8)}s ease both` }}>
                    {/* 미니 배너 */}
                    <div style={{ height: 68, background: post.type === "같이사요"
                      ? "linear-gradient(135deg,#FFF3C0,#FFE580)"
                      : "linear-gradient(135deg,#C0F0E0,#80E0C0)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, position: "relative" }}>
                      {post.images && post.images[0]
                        ? <img src={post.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span>{post.type === "같이사요" ? "🛒" : "📦"}</span>}
                      <div style={{ position: "absolute", top: 6, right: 6 }}>
                        <span style={S.sb(post.status)}>{post.status}</span>
                      </div>
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ marginBottom: 4 }}><span style={S.tb(post.type)}>{post.type}</span></div>
                      <h3 style={{ fontSize: 12, fontWeight: 800, color: "#2C1A0E", lineHeight: 1.3, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        <Highlight text={post.title} query={searchQuery} />
                      </h3>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#C47F00", marginBottom: 4 }}>{Number(post.pricePerPerson).toLocaleString()}<span style={{ fontSize: 10, fontWeight: 600, color: "#C4A870" }}>원</span></div>
                      <div style={{ fontSize: 10, color: "#C4A870", marginBottom: 6 }}>참여 {post.participants.length}/{post.maxParticipants}명</div>
                      <div style={{ height: 3, borderRadius: 2, background: "rgba(180,130,0,0.1)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: Math.min(pct, 100) + "%", borderRadius: 2,
                          background: pct >= 75 ? "linear-gradient(90deg,#FFB800,#E8960C)" : "linear-gradient(90deg,#30D090,#1AAF6B)" }} />
                      </div>
                      {dist !== null && <div style={{ fontSize: 10, color: "#E8960C", fontWeight: 700, marginTop: 5 }}>📍 {fmtDist(dist)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <BNav />
    </div>
  );

  // ── DETAIL ──
  if (screen === "detail" && selectedPost) {
    const post = posts.find(p => p.id === selectedPost.id) || selectedPost;
    const isJoined = post.participants.includes(currentUser.id);
    const isAuthor = post.author.id === currentUser.id;
    const canReview = post.status === "완료" && isJoined && !isAuthor && !(post.reviews || []).find(r => r.fromUserId === currentUser.id);
    const dist = getPostDist(post);
    const authorRating = getUserRating(post.author.id);

    return (
      <div className="app"><style>{css}</style>
        {toast && <div className="toast">{toast}</div>}
        {profileUserId && <ProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />}

        <div style={{ ...S.hdr, justifyContent: "flex-start", gap: 6 }}>
          <button onClick={() => setScreen("home")} style={{ background: "#FFF3D0", border: "1.5px solid #F0DFA0", borderRadius: 20, cursor: "pointer", color: "#C47F00", padding: "6px 14px", fontSize: 20, fontWeight: 300, lineHeight: 1, display: "flex", alignItems: "center" }}>
            ‹
          </button>
          <div style={S.logo}>게시글</div>
        </div>

        {/* 탭 */}
        <div style={{ background: "rgba(255,252,235,0.92)", backdropFilter: "blur(16px)", display: "flex", borderBottom: "1px solid rgba(255,215,80,0.2)", position: "sticky", top: 56, zIndex: 10 }}>
          {[["info", "정보"], ["participants", `참여자 ${post.participants.length}`], ["chat", `채팅 ${(post.chat || []).length}`], ["reviews", `후기 ${(post.reviews || []).length}`]].map(([t, l]) => (
            <button key={t} onClick={() => setDetailTab(t)} style={{ flex: 1, padding: "12px 4px", border: "none", background: "none", cursor: "pointer", fontSize: 13 }} className={detailTab === t ? "tab-active" : "tab-inactive"}>{l}</button>
          ))}
        </div>

        <div style={{ paddingBottom: 140 }}>
          {/* 정보 탭 */}
          {detailTab === "info" && (
            <div>
              {/* 이미지 영역 */}
          {post.images && post.images.length > 0 ? (
            <div style={{ display: "flex", overflowX: "auto", gap: 0 }}>
              {post.images.map((img, idx) => (
                <img key={idx} src={img} alt="" style={{ width: post.images.length === 1 ? "100%" : 280, height: 200, objectFit: "cover", flexShrink: 0 }} />
              ))}
            </div>
          ) : (
            <div style={{ height: 170, background: "linear-gradient(135deg,#FFF9E8,#FFF9F6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
              {post.type === "같이사요" ? "🛒" : "📦"}
              <span style={{ fontSize: 12, color: "#e0a898", marginTop: 4, fontWeight: 600 }}>{post.item}</span>
            </div>
          )}
              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={S.tb(post.type)}>{post.type}</span>
                  <span style={S.sb(post.status)}>{post.status}</span>
                  {dist !== null && <span style={{ fontSize: 11, background: "#FFF9E8", color: "#E8960C", padding: "3px 9px", borderRadius: 20, fontWeight: 700 }}>📍 {fmtDist(dist)}</span>}
                  {post.reported && <span style={{ fontSize: 11, background: "#FFF0F0", color: "#E74C3C", padding: "3px 9px", borderRadius: 20, fontWeight: 700 }}>🚩 신고됨</span>}
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 900, color: "#1a1210", lineHeight: 1.35, marginBottom: 8 }}>{post.title}</h2>
                {/* 작성자 */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", background: "#FFFCF2", borderRadius: 12, cursor: "pointer" }} onClick={() => setProfileUserId(post.author.id)}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: "#E8960C", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>{post.author.nickname[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>{post.author.nickname}</div>
                    <div style={{ fontSize: 12, color: "#bbb" }}>{post.author.region}{authorRating && <span style={{ marginLeft: 8 }}>⭐ {authorRating.avg.toFixed(1)} ({authorRating.count})</span>}</div>
                  </div>
                  <i className="ti ti-chevron-right" style={{ color: "#ccc", fontSize: 16 }} />
                </div>
                {/* 상세 정보 */}
                <div style={{ background: "#FFFCF2", borderRadius: 14, border: "1px solid #EEE0B0", marginBottom: 16, overflow: "hidden" }}>
                  {[{ ic: "ti-users", l: "모집 인원", v: `${post.participants.length}/${post.maxParticipants}명 참여 중` }, { ic: "ti-coin", l: "총 가격", v: `${Number(post.totalPrice).toLocaleString()}원` }, { ic: "ti-user", l: "1인 가격", v: `${Number(post.pricePerPerson).toLocaleString()}원` }, { ic: "ti-map-pin", l: "거래 장소", v: post.location }, { ic: "ti-calendar", l: "거래 일시", v: `${post.meetDate} ${post.meetTime}` }, { ic: "ti-clock", l: "모집 마감", v: post.deadline }].map((item, i) => (
                    <div key={item.l} style={{ display: "flex", alignItems: "flex-start", padding: "10px 14px", borderBottom: i < 5 ? "1px solid #EEE0B0" : "none" }}>
                      <i className={`ti ${item.ic}`} style={{ fontSize: 16, color: "#E8960C", marginRight: 12, marginTop: 2, flexShrink: 0 }} />
                      <div><div style={{ fontSize: 11, color: "#c0b0aa", marginBottom: 1 }}>{item.l}</div><div style={{ fontSize: 14, color: "#333", fontWeight: 600 }}>{item.v}</div></div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa", marginBottom: 6 }}><span>모집 현황</span><span style={{ fontWeight: 700, color: "#E8960C" }}>{post.participants.length}/{post.maxParticipants}명</span></div>
                  <PBar cur={post.participants.length} max={post.maxParticipants} />
                </div>
                {post.description && <div style={{ background: "#FFFCF2", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}><div style={{ fontSize: 11, color: "#c0b0aa", fontWeight: 700, marginBottom: 6 }}>추가 안내</div><p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>{post.description}</p></div>}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {!isAuthor && !post.reported && <button onClick={() => handleReport(post.id)} style={{ ...S.btn("secondary"), flex: "none", width: "auto", padding: "9px 14px", fontSize: 13 }}>🚩 신고</button>}
                  {isAuthor && post.status === "모집중" && <button onClick={() => handleClosePost(post.id)} style={{ ...S.btn("secondary"), flex: "none", width: "auto", padding: "9px 14px", fontSize: 13 }}>✓ 모집완료</button>}
                  {(isAuthor || currentUser?.isAdmin) && <button onClick={() => handleDeletePost(post.id)} style={{ ...S.btn("danger"), flex: "none", width: "auto", padding: "9px 14px", fontSize: 13 }}>🗑️ 삭제</button>}
                </div>
                {/* 댓글 */}
                <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10, color: "#1a1210" }}>댓글 {post.comments.length}개</h4>
                {post.comments.length === 0 && <p style={{ fontSize: 13, color: "#d0c8c4", marginBottom: 10 }}>첫 댓글을 남겨보세요!</p>}
                {post.comments.map(c => (
                  <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid #FFF9E8" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#333", cursor: "pointer" }} onClick={() => setProfileUserId(c.userId)}>{c.nickname}</span>
                      <span style={{ fontSize: 11, color: "#d0c8c4" }}>{c.createdAt}</span>
                    </div>
                    <p style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <input style={{ ...S.inp, flex: 1 }} placeholder="댓글 입력..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && handleComment(post.id)} />
                  <button onClick={() => handleComment(post.id)} style={{ ...S.btn(), width: 44, height: 44, padding: 0, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-send" style={{ fontSize: 17 }} /></button>
                </div>

                {/* 참여/취소 버튼 — 댓글 바로 아래 눈에 잘 보이게 */}
                {!isAuthor && post.status !== "완료" && (
                  <button onClick={() => handleJoin(post.id)}
                    style={{ ...S.btn(isJoined ? "secondary" : "primary"), marginTop: 14, borderRadius: 14, fontSize: 15, fontWeight: 800, border: isJoined ? "2px solid #e0d8d0" : "none" }}>
                    {isJoined ? "✕  참여 취소하기" : post.status === "마감" ? "마감된 모집이에요" : "🙋  참여 신청하기"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 참여자 탭 */}
          {detailTab === "participants" && (
            <div style={{ padding: "16px" }}>
              <div style={{ fontSize: 13, color: "#bbb", marginBottom: 14, fontWeight: 600 }}>총 {post.participants.length}명 참여 중</div>
              {post.participants.map((uid, idx) => {
                const u = users.find(u => u.id === uid);
                const isPostAuthor = uid === post.author.id;
                const uRating = getUserRating(uid);
                return (
                  <div key={uid} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #FFF9E8", cursor: "pointer" }} onClick={() => setProfileUserId(uid)}>
                    <div style={{ width: 44, height: 44, borderRadius: 22, background: isPostAuthor ? "#E8960C" : "#FFF9E8", display: "flex", alignItems: "center", justifyContent: "center", color: isPostAuthor ? "#fff" : "#E8960C", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                      {u ? u.avatar : "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1210" }}>{u ? u.nickname : "탈퇴한 유저"}</span>
                        {isPostAuthor && <span style={{ fontSize: 11, background: "#FFF9E8", color: "#E8960C", padding: "2px 7px", borderRadius: 8, fontWeight: 700 }}>작성자</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>
                        {u?.region}{uRating && <span style={{ marginLeft: 8 }}>⭐ {uRating.avg.toFixed(1)}</span>}
                      </div>
                    </div>
                    <i className="ti ti-chevron-right" style={{ color: "#d0c8c4", fontSize: 16 }} />
                  </div>
                );
              })}
              {post.participants.length < post.maxParticipants && post.status === "모집중" && (
                <div style={{ marginTop: 16, padding: "14px", background: "#FFFCF2", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#bbb" }}>아직 <span style={{ color: "#E8960C", fontWeight: 700 }}>{post.maxParticipants - post.participants.length}자리</span> 남았어요!</div>
                </div>
              )}
            </div>
          )}

          {/* 채팅 탭 */}
          {detailTab === "chat" && (
            <div style={{ padding: "16px" }}>
              {!isJoined && !isAuthor ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#ccc" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#bbb" }}>참여자 전용 채팅이에요</p>
                  <p style={{ fontSize: 13, color: "#ccc", marginTop: 4 }}>참여 신청 후 이용하실 수 있어요</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: "#bbb", fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
                    🔒 참여자 {post.participants.length}명 전용 채팅방
                  </div>
                  {(post.chat || []).length === 0 && <p style={{ fontSize: 13, color: "#d0c8c4", marginBottom: 12, textAlign: "center" }}>첫 메시지를 남겨보세요!</p>}
                  {(post.chat || []).map(c => {
                    const isMe = c.userId === currentUser.id;
                    return (
                      <div key={c.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 12, gap: 8 }}>
                        {!isMe && <div style={{ width: 32, height: 32, borderRadius: 16, background: "#FFF9E8", display: "flex", alignItems: "center", justifyContent: "center", color: "#E8960C", fontWeight: 800, fontSize: 13, flexShrink: 0, cursor: "pointer" }} onClick={() => setProfileUserId(c.userId)}>{c.nickname[0]}</div>}
                        <div style={{ maxWidth: "72%" }}>
                          {!isMe && <div style={{ fontSize: 11, color: "#bbb", marginBottom: 3, fontWeight: 600 }}>{c.nickname}</div>}
                          <div style={{ padding: "9px 13px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: isMe ? "#E8960C" : "#FFF9E8", fontSize: 14, color: isMe ? "#fff" : "#333", lineHeight: 1.5 }}>{c.text}</div>
                          <div style={{ fontSize: 10, color: "#ccc", marginTop: 3, textAlign: isMe ? "right" : "left" }}>{c.createdAt}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <input style={{ ...S.inp, flex: 1 }} placeholder="메시지 입력..." value={newChat} onChange={e => setNewChat(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChat(post.id)} />
                    <button onClick={() => handleChat(post.id)} style={{ ...S.btn(), width: 44, height: 44, padding: 0, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-send" style={{ fontSize: 17 }} /></button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 후기 탭 */}
          {detailTab === "reviews" && (
            <div style={{ padding: "16px" }}>
              {authorRating && (
                <div style={{ background: "#FFFCF2", borderRadius: 14, padding: "16px", marginBottom: 18, textAlign: "center", border: "1px solid #EEE0B0" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#1a1210" }}>{authorRating.avg.toFixed(1)}</div>
                  <StarDisplay rating={authorRating.avg} size={22} />
                  <div style={{ fontSize: 12, color: "#bbb", marginTop: 6 }}>후기 {authorRating.count}개</div>
                </div>
              )}
              {canReview && (
                <div style={{ background: "#FFF9E8", borderRadius: 14, padding: "16px", marginBottom: 18, border: "1px solid #F5D99A" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#E8960C", marginBottom: 10 }}>⭐ 후기 남기기</div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>별점을 선택해주세요</div>
                    <StarPicker value={reviewForm.rating} onChange={v => setReviewForm({ ...reviewForm, rating: v })} />
                  </div>
                  <textarea style={{ ...S.inp, minHeight: 70, resize: "vertical", lineHeight: 1.5 }} placeholder="거래 후기를 남겨주세요 (선택)" value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} />
                  <button onClick={() => handleReview(post.id, post.author.id)} style={{ ...S.btn(), marginTop: 10, borderRadius: 12 }}>후기 등록</button>
                </div>
              )}
              {(post.reviews || []).length === 0 && !canReview ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#d0c8c4" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>⭐</div>
                  <p style={{ fontSize: 14 }}>아직 후기가 없어요</p>
                </div>
              ) : (post.reviews || []).map(r => (
                <div key={r.id} style={{ padding: "14px 0", borderBottom: "1px solid #FFF9E8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", align: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#333", cursor: "pointer" }} onClick={() => setProfileUserId(r.fromUserId)}>{r.fromNickname}</span>
                      <StarDisplay rating={r.rating} size={14} />
                    </div>
                    <span style={{ fontSize: 11, color: "#d0c8c4" }}>{r.createdAt}</span>
                  </div>
                  {r.text && <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>{r.text}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <BNav />
      </div>
    );
  }

  // ── CREATE ──
  if (screen === "create") return (
    <div className="app" style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <style>{css}</style>
      {toast && <div className="toast">{toast}</div>}

      {/* 상단 헤더 — 항상 고정 */}
      <div className="glass-hdr" style={{ ...S.hdr, justifyContent: "space-between", flexShrink: 0 }}>
        <div style={S.logo}>✍️ 글쓰기</div>
        <button onClick={() => setScreen("home")} style={{ background: "#FFF3D0", border: "1.5px solid #F0DFA0", borderRadius: 20, padding: "6px 16px", color: "#C47F00", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>닫기 ×</button>
      </div>

      {/* 스크롤 콘텐츠 — 헤더 아래만 스크롤 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px", WebkitOverflowScrolling: "touch" }}>
        {error && <div style={{ background: "#FFF9E8", color: "#E8960C", padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13 }}>{error}</div>}
        <div style={{ marginBottom: 20 }}>
          <label style={{ ...S.lbl, fontSize: 13, fontWeight: 800, color: "#333", marginBottom: 8 }}>카테고리 *</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[["같이사요", "🛒", "아직 구매 전"], ["나눠봐요", "📦", "이미 구매함"]].map(([t, e, sub]) => (
              <button key={t} onClick={() => setNewPost({ ...newPost, type: t })} style={{ flex: 1, padding: "14px 12px", borderRadius: 14, border: `2px solid ${newPost.type === t ? "#E8960C" : "#e8ddd8"}`, background: newPost.type === t ? "#FFF9E8" : "#fff", color: newPost.type === t ? "#E8960C" : "#999", fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{e}</div><div>{t}</div><div style={{ fontSize: 11, color: newPost.type === t ? "#e08068" : "#ccc", marginTop: 2 }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 1, background: "#EEE0B0", margin: "0 0 18px" }} />

        {/* 상품 이미지 업로드 */}
        <div style={{ marginBottom: 18 }}>
          <label style={S.lbl}>상품 이미지</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(newPost.images || []).map((img, idx) => (
              <div key={idx} style={{ position: "relative", width: 80, height: 80 }}>
                <img src={img} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", border: "1px solid #EEE0B0" }} />
                <button onMouseDown={e => { e.preventDefault(); setNewPost(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) })); }}
                  style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, background: "#E74C3C", border: "none", cursor: "pointer", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>×</button>
              </div>
            ))}
            {(newPost.images || []).length < 5 && (
              <label style={{ width: 80, height: 80, borderRadius: 10, border: "2px dashed #e8ddd8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#FFFCF2", gap: 4 }}>
                <input type="file" accept="image/*" multiple style={{ display: "none" }}
                  onChange={e => {
                    const files = Array.from(e.target.files);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = ev => setNewPost(p => ({ ...p, images: [...(p.images || []), ev.target.result].slice(0, 5) }));
                      reader.readAsDataURL(file);
                    });
                    e.target.value = "";
                  }} />
                <i className="ti ti-camera" style={{ fontSize: 22, color: "#c0b8b4" }} />
                <span style={{ fontSize: 10, color: "#c0b8b4", fontWeight: 600 }}>{(newPost.images || []).length}/5</span>
              </label>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>최대 5장 · jpg, png, gif</div>
        </div>

        {[{ k: "title", l: "제목 *", p: "예: 코스트코 올리브유 같이 구매하실 분!" }, { k: "item", l: "소분 품목명 *", p: "예: 올리브오일 5L" }].map(f => (
          <div key={f.k} style={{ marginBottom: 14 }}><label style={S.lbl}>{f.l}</label><input style={S.inp} placeholder={f.p} value={newPost[f.k]} onChange={e => setNewPost({ ...newPost, [f.k]: e.target.value })} /></div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div><label style={S.lbl}>모집 인원 *</label><input style={S.inp} type="number" min={2} placeholder="2" value={newPost.maxParticipants} onChange={e => setNewPost({ ...newPost, maxParticipants: e.target.value })} /></div>
          <div><label style={S.lbl}>총 가격 (원) *</label><input style={S.inp} type="number" placeholder="30000" value={newPost.totalPrice} onChange={e => setNewPost({ ...newPost, totalPrice: e.target.value })} /></div>
        </div>
        <div style={{ marginBottom: 14 }}><label style={S.lbl}>1인 가격 (원) *</label><input style={S.inp} type="number" placeholder="7500" value={newPost.pricePerPerson} onChange={e => setNewPost({ ...newPost, pricePerPerson: e.target.value })} /></div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.lbl}>거래 장소 *</label>
          <input style={S.inp} placeholder="예: 마포구 홍대입구역 6번 출구" value={newPost.location} onChange={e => setNewPost({ ...newPost, location: e.target.value })} />
          {newPost.location.trim() && (
            <div style={{ marginTop: 8, borderRadius: 12, overflow: "hidden", border: "1px solid #EEE0B0" }}>
              <iframe
                src={`https://map.kakao.com/?q=${encodeURIComponent(newPost.location)}&map_type=TYPE_MAP`}
                width="100%" height="180" style={{ display: "block", border: "none" }}
                title="카카오 지도"
              />
              <a href={`https://map.kakao.com/?q=${encodeURIComponent(newPost.location)}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", background: "#FFFCF2", color: "#E8960C", fontWeight: 700, fontSize: 13, textDecoration: "none", borderTop: "1px solid #EEE0B0" }}>
                <i className="ti ti-external-link" style={{ fontSize: 14 }} />카카오 지도에서 크게 보기
              </a>
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div><label style={S.lbl}>거래 날짜 *</label><input style={S.inp} type="date" value={newPost.meetDate} onChange={e => setNewPost({ ...newPost, meetDate: e.target.value })} /></div>
          <div><label style={S.lbl}>거래 시간</label><input style={S.inp} type="time" value={newPost.meetTime} onChange={e => setNewPost({ ...newPost, meetTime: e.target.value })} /></div>
        </div>
        <div style={{ marginBottom: 14 }}><label style={S.lbl}>모집 마감일 *</label><input style={S.inp} type="date" value={newPost.deadline} onChange={e => setNewPost({ ...newPost, deadline: e.target.value })} /></div>
        <div style={{ marginBottom: 22 }}><label style={S.lbl}>추가 안내</label><textarea style={{ ...S.inp, resize: "vertical", minHeight: 80, lineHeight: 1.6 }} placeholder="소분 방법, 포장 방법, 주의사항 등" value={newPost.description} onChange={e => setNewPost({ ...newPost, description: e.target.value })} /></div>
        {userLocation ? (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "#EBFFF5", borderRadius: 10, fontSize: 13, color: "#1AAF6B", fontWeight: 600 }}>
            📍 현재 위치 기준으로 게시글이 등록됩니다
          </div>
        ) : (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "#FFFCF2", borderRadius: 10, fontSize: 13, color: "#bbb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>위치 설정 시 거리 검색에 표시돼요</span>
            <button onClick={requestLocation} style={{ fontSize: 12, color: "#E8960C", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>설정하기</button>
          </div>
        )}
        <button style={{ ...S.btn(), borderRadius: 14, fontSize: 16, padding: "15px 20px" }} onClick={handleCreatePost}>게시글 등록하기</button>
      </div>{/* 스크롤 콘텐츠 끝 */}
      <BNav />
    </div>
  );

  // ── MYPAGE ──
  if (screen === "mypage") return (
    <div className="app"><style>{css}</style>
      {toast && <div className="toast">{toast}</div>}
      {profileUserId && <ProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />}
      <div className="glass-hdr" style={S.hdr}><div style={S.logo}>마이페이지</div></div>
      <div style={{ padding: "18px 16px 130px" }}>
        {!profileEdit ? (
          <div style={{ background: "#fff", borderRadius: 18, padding: "20px", border: "1px solid #EEE0B0", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 58, height: 58, borderRadius: 29, background: "#E8960C", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800, flexShrink: 0 }}>{currentUser.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#1a1210" }}>{currentUser.nickname}</div>
              <div style={{ fontSize: 12, color: "#bbb" }}>{currentUser.region}</div>
              {(() => { const r = getUserRating(currentUser.id); return r ? <div style={{ marginTop: 3 }}><StarDisplay rating={r.avg} size={14} /><span style={{ fontSize: 12, color: "#888", marginLeft: 5 }}>{r.avg.toFixed(1)} ({r.count}개)</span></div> : null; })()}
            </div>
            <button onClick={() => { setProfileEdit(true); setProfileForm({ nickname: currentUser.nickname, region: currentUser.region, bio: currentUser.bio || "" }); }} style={{ ...S.btn("secondary"), width: "auto", padding: "8px 14px", fontSize: 13 }}>수정</button>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 18, padding: "20px", border: "1px solid #EEE0B0", marginBottom: 20 }}>
            <div style={{ marginBottom: 12 }}><label style={S.lbl}>닉네임</label><input style={S.inp} value={profileForm.nickname} onChange={e => setProfileForm({ ...profileForm, nickname: e.target.value })} /></div>
            <div style={{ marginBottom: 12 }}><label style={S.lbl}>지역</label><input style={S.inp} value={profileForm.region} onChange={e => setProfileForm({ ...profileForm, region: e.target.value })} /></div>
            <div style={{ marginBottom: 16 }}><label style={S.lbl}>한줄 소개</label><input style={S.inp} placeholder="예: 마포구 소분 고수" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} /></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn(), flex: 1 }} onClick={() => { const u = { ...currentUser, ...profileForm, avatar: profileForm.nickname[0] }; setCurrentUser(u); setUsers(users.map(us => us.id === currentUser.id ? u : us)); setProfileEdit(false); showToast("프로필 수정됐어요 ✓"); }}>저장</button>
              <button style={{ ...S.btn("secondary"), flex: 1 }} onClick={() => setProfileEdit(false)}>취소</button>
            </div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
          {[{ l: "내가 쓴 글", v: myPosts.length, ic: "ti-edit" }, { l: "참여한 소분", v: myJoined.length, ic: "ti-heart" }, { l: "총 절약", v: myJoined.reduce((a, p) => a + p.pricePerPerson, 0).toLocaleString() + "원", ic: "ti-coin", sm: true }].map(s => (
            <div key={s.l} style={{ background: "#fff", borderRadius: 14, padding: "14px 12px", border: "1px solid #EEE0B0", textAlign: "center" }}>
              <i className={`ti ${s.ic}`} style={{ fontSize: 20, color: "#E8960C", marginBottom: 6, display: "block" }} />
              <div style={{ fontSize: s.sm ? 13 : 22, fontWeight: 900, color: "#1a1210" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "#c0b8b4", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", background: "#FFF9E8", borderRadius: 12, padding: 4, marginBottom: 16 }}>
          {[["written", "내가 쓴 글"], ["joined", "참여한 소분"]].map(([t, l]) => (
            <button key={t} onClick={() => setMyTab(t)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: myTab === t ? "#fff" : "transparent", color: myTab === t ? "#E8960C" : "#c0afa6" }}>{l}</button>
          ))}
        </div>
        {(myTab === "written" ? myPosts : myJoined).length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#d0c8c4" }}><div style={{ fontSize: 36, marginBottom: 8 }}>📭</div><p style={{ fontSize: 14 }}>{myTab === "written" ? "아직 작성한 글이 없어요" : "참여한 소분이 없어요"}</p></div>
        ) : (myTab === "written" ? myPosts : myJoined).map(post => (
          <div key={post.id} style={{ ...S.card, marginBottom: 10 }} onClick={() => goToPost(post.id)}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}><span style={S.tb(post.type)}>{post.type}</span><span style={S.sb(post.status)}>{post.status}</span></div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1210" }}>{post.title}</div>
            <div style={{ fontSize: 12, color: "#ccc", marginTop: 4 }}>참여 {post.participants.length}/{post.maxParticipants}명 · {Number(post.pricePerPerson).toLocaleString()}원/인</div>
          </div>
        ))}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #EEE0B0" }}>
          <button style={{ ...S.btn("secondary"), color: "#E74C3C", fontWeight: 700 }} onClick={() => { setCurrentUser(null); setScreen("auth"); setLoginForm({ email: "", password: "" }); setSearchQuery(""); setCategory("전체"); setFilterSido(""); setFilterGu(""); setFilterStatus("전체"); setFilterMaxPrice(50000); setSortKey("latest"); setFilterNearby(false); setUserLocation(null); setUserLocationName(""); setShowNotifs(false); }}>로그아웃</button>
        </div>
      </div>
      <BNav />
    </div>
  );

  // ── ADMIN ──
  if (screen === "admin" && currentUser?.isAdmin) return (
    <div className="app"><style>{css}</style>
      {toast && <div className="toast">{toast}</div>}
      <div className="glass-hdr" style={S.hdr}><div style={S.logo}>🛡️ 관리자</div><div style={{ fontSize: 12, color: "#A07830" }}>회원 {users.length} · 게시글 {posts.length}</div></div>
      <div style={{ display: "flex", background: "#FFF9E8", margin: "12px 14px 0", borderRadius: 13, padding: 4 }}>
        {[["users", "👥 회원"], ["posts", "📋 게시글"], ["reports", `🚩 신고 ${reports.length}`]].map(([t, l]) => (
          <button key={t} onClick={() => setAdminTab(t)} style={{ flex: 1, padding: "9px 6px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: adminTab === t ? "#fff" : "transparent", color: adminTab === t ? "#E8960C" : "#c0afa6" }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: "12px 14px 130px" }}>
        {adminTab === "users" && users.map(u => (
          <div key={u.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 21, background: u.isAdmin ? "#E8960C" : "#FFF9E8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: u.isAdmin ? "#fff" : "#E8960C", fontSize: 16, flexShrink: 0 }}>{u.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", display: "flex", alignItems: "center", gap: 6 }}>
                {u.nickname}
                {u.isAdmin && <span style={{ fontSize: 10, background: "#E8960C", color: "#fff", padding: "2px 7px", borderRadius: 8 }}>관리자</span>}
                {u.suspended && <span style={{ fontSize: 10, background: "#FFF0F0", color: "#E74C3C", padding: "2px 7px", borderRadius: 8 }}>정지</span>}
              </div>
              <div style={{ fontSize: 12, color: "#c0b8b4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email} · {u.region}</div>
            </div>
            {!u.isAdmin && <button onClick={() => { setUsers(users.map(us => us.id === u.id ? { ...us, suspended: !us.suspended } : us)); showToast(u.suspended ? "정지 해제됐어요" : "계정이 정지됐어요"); }} style={{ ...S.btn(u.suspended ? "secondary" : "danger"), width: "auto", padding: "7px 12px", fontSize: 12 }}>{u.suspended ? "해제" : "정지"}</button>}
          </div>
        ))}
        {adminTab === "posts" && posts.map(post => (
          <div key={post.id} style={{ ...S.card, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 5, marginBottom: 5, flexWrap: "wrap" }}>
                <span style={S.tb(post.type)}>{post.type}</span><span style={S.sb(post.status)}>{post.status}</span>
                {post.reported && <span style={{ fontSize: 11, background: "#FFF0F0", color: "#E74C3C", padding: "3px 8px", borderRadius: 20, fontWeight: 700 }}>🚩신고</span>}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>{post.title}</div>
              <div style={{ fontSize: 12, color: "#c0b8b4", marginTop: 3 }}>by {post.author.nickname} · {post.createdAt} · 참여 {post.participants.length}명</div>
            </div>
            <button onClick={() => handleDeletePost(post.id)} style={{ ...S.btn("danger"), width: "auto", padding: "7px 12px", fontSize: 12, flexShrink: 0 }}>삭제</button>
          </div>
        ))}
        {adminTab === "reports" && (reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#d0c8c4" }}><div style={{ fontSize: 36, marginBottom: 10 }}>✅</div><p style={{ fontSize: 14 }}>신고 내역이 없어요</p></div>
        ) : reports.map(r => {
          const post = posts.find(p => p.id === r.postId);
          return (
            <div key={r.id} className="glass-card" style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#E74C3C" }}>🚩 신고 접수</span>
                <span style={{ fontSize: 11, background: r.status === "처리완료" ? "#EBFFF5" : "#FFF5EB", color: r.status === "처리완료" ? "#1AAF6B" : "#E07B2C", padding: "3px 8px", borderRadius: 10, fontWeight: 600 }}>{r.status}</span>
              </div>
              <div style={{ fontSize: 14, color: "#333", fontWeight: 600 }}>{post ? post.title : "삭제된 게시글"}</div>
              <div style={{ fontSize: 12, color: "#bbb", margin: "4px 0 10px" }}>사유: {r.reason} · {r.date}</div>
              {post && r.status !== "처리완료" && <button onClick={() => { handleDeletePost(r.postId); setReports(prev => prev.map(rp => rp.id === r.id ? { ...rp, status: "처리완료" } : rp)); }} style={{ ...S.btn("danger"), padding: "9px", fontSize: 13 }}>게시글 삭제 처리</button>}
            </div>
          );
        }))}
      </div>
      <BNav />
    </div>
  );

  return null;
}
