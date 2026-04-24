import type { SecurityRequirement } from "../types";

export const CHECKLIST: SecurityRequirement[] = [
  {
    "code": "1-1",
    "category": "인증",
    "title": "고유 ID 사용",
    "requirement": "사용자 계정 발급 시 한 사람에게 한 개의 사용자 계정(고유 ID)를 부여",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 사용자를 유일하게 구분할 수 있는 식별자(ID)를 할당",
    "sort_order": 1
  },
  {
    "code": "1-2",
    "category": "인증",
    "title": "추측 가능한 계정 사용 여부",
    "requirement": "추측 가능하거나 디폴트 계정 사용 금지",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 관리자 및 특수권한 계정의 경우 추측 가능한 식별자(root, admin, administrator 등)나 Default 계정을 사용하면 안됨\n- 기본 계정 및 시험계정 등은 제거 또는 추측이 어려운 계정으로 변경",
    "sort_order": 2
  },
  {
    "code": "2-1",
    "category": "인증",
    "title": "비밀번호 길이 및 조합 규칙",
    "requirement": "비밀번호 최소길이와 조합규칙을 수립 후 어플리케이션의 비밀번호 생성시 적용",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 다음 비밀번호 작성규칙을 준수해야한다.\n1) 비밀번호는 영문자 + 숫자를 포함한 10자 이상 생성하거나 영문자 + 숫자 + 특수문자 3종류 8자 이상 생성해야 한다.\n2) 비밀번호의 유효기간은 3개월(90일)이며 만료 시 변경해야 한다.\n3) 사용자계정 ID, 사번 및 사용자 정보(이름, 생년월일, 전화번호 등)와 같이 유추 가능하거나 개인정보와 관련된 정보를 이용한 비밀번호를 사용하지 않는다. (단, 해당 정보시스템 사용자의 해당 정보를 보유하고 있는 경우에 한한다.)\n4) 사용자 계정과 동일한 비밀번호 및 동일 숫자/문자가 연속으로 3자 이상 포함된 비밀번호는 사용할 수 없다.\n5) 이전에 사용했던 비밀번호는 향후 3회 변경 시 까지 재사용하지 말아야 하며, 재사용할 목적으로 연속적으로 재변경하지 말아야 한다.",
    "sort_order": 3
  },
  {
    "code": "2-2",
    "category": "인증",
    "title": "비밀번호 화면표시 금지",
    "requirement": "비밀번호는 화면상에서 읽을 수 없는 형태로 표시되도록 설계",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 비밀번호는 입력 시 타인이 추측할 수 없도록 화면상에 표시하지 않거나 인식 불가능한 문자로 마스킹(Masking)하여 표시하도록 한다.",
    "sort_order": 4
  },
  {
    "code": "2-3",
    "category": "인증",
    "title": "비밀번호 변경 및 확인 시 보안적용",
    "requirement": "비밀번호 변경 시 현재 비밀번호를 먼저 확인한 후 변경 사항 적용되도록 설계",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 사용자의 비밀번호 변경 시 현재 비밀번호의 검증 후 변경 비밀번호가 적용되도록 한다.",
    "sort_order": 5
  },
  {
    "code": "2-4",
    "category": "인증",
    "title": "비밀번호 유실 및 임시 비밀번호 제공",
    "requirement": "비밀번호 유실 시에는 초기화되도록 설계\n※ 임시 비밀번호 부여",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 서버 시스템 관리자, 어플리케이션 시스템 관리자도 사용자의 비밀번호를 조회할 수 없으며, 비밀번호 유실시에는 초기화 기능으로 변경될 수 있도록 한다.\n- 임시 비밀번호는 개인만이 알 수 있는 방법(SMS 등)으로 안전하게 전달되도록 하며, 초기에 임의 부여된 비밀번호는 접속 즉시 변경 요구될 수 있도록 한다.",
    "sort_order": 6
  },
  {
    "code": "2-5",
    "category": "인증",
    "title": "초기 비밀번호의 변경 기능 제공",
    "requirement": "초기/임시 비밀번호 최초 로그인 시 변경하도록 설계",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 어플리케이션 구조상 초기 비밀번호는 생성시 사용자가 처음 접속 시에 자신의 비밀번호로 변경을 하도록 강제화하는 기능을 부여해야한다.",
    "sort_order": 7
  },
  {
    "code": "3-1",
    "category": "로그인 관리",
    "title": "로그인 실패 이유 표시 금지",
    "requirement": "로그인 실패 시, 단순히 로그인이 실패하였다고만 안내",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 로그인 실패시 문제의 원인이 될 만한 정보를 사용자에게 피드백하지 말고 단순히 로그인 절차가 잘못 되었다는 정보만 표시하도록 한다.(단, 로그인 실패 이유를 상세하게 표시할 필요성이 있는 경우는 예외로 할 수 있음)",
    "sort_order": 8
  },
  {
    "code": "3-2",
    "category": "로그인 관리",
    "title": "잘못된 패스워드 입력 횟수 제한",
    "requirement": "패스워드 입력 오류 시 패스워드 잠김 임계치 설정을 통해 사용이 차단되도록 설계",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 5회 이상 사용자 패스워드 입력 오류가 발생할 경우, 경고 메시지가 뜨고 일시적으로 계정 사용을 정지시키고, 초기화 후에 사용할 수 있도록 한다.",
    "sort_order": 9
  },
  {
    "code": "3-3",
    "category": "로그인 관리",
    "title": "계정 잠김 해제",
    "requirement": "인증 실패 등으로 사용자 계정 잠김 시 잠김 해제를 위한 관리자 모듈 존재",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 사용자 계정이 잠겼을 시 이를 풀기 위해서는 적절한 사용자 본인 확인 절차가 존재함",
    "sort_order": 10
  },
  {
    "code": "3-4",
    "category": "로그인 관리",
    "title": "일정시간 경과 시 자동 로그오프",
    "requirement": "사용자로부터 일정시간 동안 입력이 없을 경우 자동 로그오프 또는 세션 종료 처리되도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 어플리케이션 사용자로부터 일정시간 동안 어떤 입력도 일어나지 않는 경우 타임아웃 설정을 통해 자동적으로 로그오프시키거나 세션이 종료되도록 한다.",
    "sort_order": 11
  },
  {
    "code": "3-5",
    "category": "로그인 관리",
    "title": "다중 접속 제한",
    "requirement": "하나의 사용자 ID로 다수의 PC에서 동시 접속을 차단하도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 2명 이상 같은 ID로 로그인 시도가 있을 경우, 먼저 접속한 사용자가 로그아웃되도록 한다.",
    "sort_order": 12
  },
  {
    "code": "3-6",
    "category": "로그인 관리",
    "title": "최근 로그인 정보 표시",
    "requirement": "로그인 시 해당 사용자가 자신의 로그인 정보를 확인할 수 있도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 특수한 권한을 보유한 계정의 경우 어플리케이션 사용자가 로그인 시 가장 최근에 성공적으로 로그인한 날짜, 시각 등의 접속정보를 화면에 표시하여 비인가자에 의한 해당 ID로의 로그인 여부를 확인할 수 있도록 한다.",
    "sort_order": 13
  },
  {
    "code": "4-1",
    "category": "인증 및 접근 권한 통제",
    "title": "계정 잠금 기능",
    "requirement": "일정기간 사용하지 않는 계정 잠금 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 90일 간 사용하지 않는 ID는 잠금 기능을 적용해야한다.\n- 관리자 확인 또는 본인 확인 후에만 사용이 가능할 수 있도록 한다.",
    "sort_order": 14
  },
  {
    "code": "4-2",
    "category": "인증 및 접근 권한 통제",
    "title": "중요시스템의 추가 인증 적용",
    "requirement": "중요 정보시스템은 추가적인 인증 절차가 이루어질 수 있도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 외부망에서 접근하는 중요시스템에 대해서는 SMS(또는 OTP) 인증을 추가 적용할 수 있도록 한다.",
    "sort_order": 15
  },
  {
    "code": "4-3",
    "category": "인증 및 접근 권한 통제",
    "title": "사용자 그룹별 접근 권한",
    "requirement": "어플리케이션의 사용자를 사용자별, 직책별, 부서별, 인가된 등급 등으로 접근 권한을 관리할 수 있도록 설계하고 화면 및 메뉴별로 접근 권한 부여가 가능하도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 정보시스템 설계 시 업무 성격, 프로세스, 보안 요구사항에 따라 다음과 같은 기준을 고려하여 접근권한 부여 기능을 마련\n* 사용자별, 사용자 업무역할별, 기능별, 메뉴별 등\n* 접근권한의 관리는 추후 관리가 가능하도록 이력이 관리되어야 하며, 관리자에게 적절한 UI가 구성되어야 함",
    "sort_order": 16
  },
  {
    "code": "4-4",
    "category": "인증 및 접근 권한 통제",
    "title": "관리자 및 특수권한 통제",
    "requirement": "정보시스템 및 중요정보 관리, 특수목적을 위해 부여한 계정은 별도로 식별하고, 접근권한을 명확히 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 관리자 권한 및 특수권한(배치나 모니터링을 위하여 부여받은 권한, 계정 및 접근 설정 권한 등)은 별도로 권한을 구분하여 승인된 자에게만 부여될 수 있도록 통제해야한다.",
    "sort_order": 17
  },
  {
    "code": "4-5",
    "category": "인증 및 접근 권한 통제",
    "title": "권한에 따라 조회, 출력, 다운로드 등의 기능 통제",
    "requirement": "각각의 업무 형태나 시스템 접근권한에 따라 보여지는 출력항목이 다르게 설정되도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 중요정보나 개인정보 처리시스템의 저장, 출력, 다운로드 등의 권한을 차등으로 부여하도록 구현되어야 함\n- 개인정보를 파일로 다운로드 하는 기능 및 개인정보가 목록에서 조회되는 것은 제한되어야 함",
    "sort_order": 18
  },
  {
    "code": "4-6",
    "category": "인증 및 접근 권한 통제",
    "title": "관리자 전용 응용프로그램 통제",
    "requirement": "관리자 전용 응용프로그램을 외부에 오픈되지 않도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 관리자 웹페이지, 관리콘솔은 외부에서 오픈되지 않도록 방화벽 등으로 접근통제되어야 함\n  ※ 재택근무 등의 불가피한 사유로 외부접속 시 VPN 또는 추가 인증 적용",
    "sort_order": 19
  },
  {
    "code": "4-7",
    "category": "인증 및 접근 권한 통제",
    "title": "개인정보처리시스템망분리",
    "requirement": "개인정보의 다운로드, 권한 부여가 가능한 시스템은 망분리",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보의 다운로드, 권한 부여가 가능한 경우 해당 사용자는 내부망 내에서 접속하도록 분리",
    "sort_order": 20
  },
  {
    "code": "4-8",
    "category": "인증 및 접근 권한 통제",
    "title": "원격에서의 정보 송수신",
    "requirement": "원격지에서 업무를 처리할 때 송수신되는 정보가 암호화 통신이 되도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 외부에서 내부시스템에 접속할 경우, VPN 또는 SSL등을 통하여 암호화 실시\n- SSL-VPN으로 접속해야 하는 사용자가 있다면, 기존 VPN 권한 그룹을 식별하거나 사용자 그룹을 새로 구성",
    "sort_order": 21
  },
  {
    "code": "5-1",
    "category": "시스템 구성",
    "title": "저장 시 암호화",
    "requirement": "중요정보에 대해 안전성이 입증된 알고리즘과 키 길이를 사용하여 암호화하며, 패스워드 저장 시 복호화되지 않도록 일방향 암호화 알고리즘 적용하여 설계",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 주민등록번호, 여권번호, 운전면허번호, 외국인등록번호 등 고유식별정보 및 지문, 홍채, 음성, 필적 등 바이오정보는 안전한 암호알고리즘으로 암호화하여 저장하도록 설계(AES, ARIA-256, SEED-256이상)되어야 함\n- 비밀번호에 대해서는 일방향 암호화 적용(SHA-256 이상)되어야 함",
    "sort_order": 22
  },
  {
    "code": "5-2",
    "category": "시스템 구성",
    "title": "정보 전송 시 암호화",
    "requirement": "중요정보 전송 구간 암호화 설계",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 어플리케이션에서 다음과 같은 정보가 네트워크를 통해 전송될 때에는 암호화 전송되도록 설계되어야 함\n 1. 사용자 ID, 패스워드, 주민등록번호 등 개인정보\n 2. 금융거래 정보 등 노출 시 사용자에게 피해를 줄 수 있는 중요 정보\n- 암호화 방식은 응용프로그램을 개발하거나, SSL을 적용하거나, VPN을 적용하는 방식으로 적용되어야 함",
    "sort_order": 23
  },
  {
    "code": "5-3",
    "category": "시스템 구성",
    "title": "암호키 관리",
    "requirement": "암호화하여 데이터베이스에 자료 저장 시 키 관리 정책 및 복구에 대한 안전성 확인",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 암호키가 포함된 테이블은 타 응용프로그램과 별도의 계정으로 생성하여 암호 키 관리자의 통제를 받도록 한다.\n- 암호화 키 테이블은 DB 백업을 해야한다.\n- 가능하면 HSM을 연계하도록 검토해야한다.",
    "sort_order": 24
  },
  {
    "code": "5-4",
    "category": "시스템 구성",
    "title": "DB 접근 통제",
    "requirement": "사용자가 직접적으로 데이터베이스에 접근할 수 없도록 설계",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 일반사용자가 어플리케이션(프로그램)을 통하지 않고 직접적으로 DB 및 중요 정보를 가진 파일에 접근할 수 없도록 한다.",
    "sort_order": 25
  },
  {
    "code": "5-5",
    "category": "시스템 구성",
    "title": "방화벽 정책 설계",
    "requirement": "데이터베이스 접근을 허용하는 IP, 포트, 응용프로그램을 통제",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- DMZ 구간에 위치한 웹서버에서 내부 네트워크 DB로 접근할 경우 관련 포트 이외의 서비스포트(ftp, telnet, 터미널 등)는 차단해야한다.",
    "sort_order": 26
  },
  {
    "code": "5-6",
    "category": "개발 시 보안 적용 사항",
    "title": "개발과 운영 환경 분리",
    "requirement": "개발 및 QA 시스템을 운영시스템과 분리",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 개발/테스트 환경이 운영환경과 분리\n- 개발환경에는 실제 개인정보를 적재할 수 없음",
    "sort_order": 27
  },
  {
    "code": "6-1",
    "category": "입출력 관리",
    "title": "입력 오류 검증을 위한 이중 입력",
    "requirement": "어플리케이션 내에서 입력 오류를 방지하기 위한 이중입력 설계",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 어플리케이션 내에서 패스워드와 같이 사용자의 혼동의 가능성이 있거나 혹은 중요한 정보라고 판단되는 경우 입력 오류를 줄이기 위해 2회 입력하도록 구현",
    "sort_order": 28
  },
  {
    "code": "6-2",
    "category": "입출력  관리",
    "title": "출력 데이터의 부분적인 은폐",
    "requirement": "어플리케이션 화면 및 문서 출력데이터 중 사용자에 관련된 중요정보(계좌번호, 주민등록번호, 신용카드번호 등)는 부분적으로 은폐되어 출력되도록 설계\n ※ 단, 사용자 확인, 거래정보 확인 등 업무적으로 필요성이 인정되는 경우에는 예외로 할 수 있음",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 고유식별정보, 비밀번호와 같은 중요 개인정보를 입력하는 경우 특정 자릿수를 별표(*) 처리하여 제3자에게 개인정보가 노출되지 않도록 권장\n- 홈페이지 등에 게시물 및 댓글 작성시 ID, 이름 등 작성자 정보를 화면에 출력할 경우에는 게시물 및 댓글을 통해 제3자에게 개인정보가 노출되지 않도록 작성자 정보의 특정 자릿수를 별표(*) 처리 권장\n1. 성명 중 이름의 첫 번째 글자 이상\n2. 생년월일\n3. 전화번호 또는 휴대폰 전화번호의 국번\n4. 주소의 읍·면·동\n5. 인터넷주소는 버전 4의 경우 17~24비트 영역, 버전 6의 경우 113~128비트 영역",
    "sort_order": 29
  },
  {
    "code": "6-3",
    "category": "입출력  관리",
    "title": "업로드 제한",
    "requirement": "Upload 파일 제한 설계",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 파일 업로드는 반드시 필요한 경우에만 실시\n- 업로드되는 파일은 확장자 제한, 실행 권한 제거 등을 실시\n  ※ 파일 업로드 확장자 제한은 화이트방식 리스트의 형태로 적용\n  ※ 블랙리스트: 전부 허용, 리스트 목록차단 / 화이트리스트: 전부 차단, 리스트 목록허용\n- 다운로드 시에는 적정한 권한을 보유하였는 지 확인할 수 있도록 시스템 구현",
    "sort_order": 30
  },
  {
    "code": "7-1",
    "category": "로그 관리",
    "title": "사용자 개인정보 처리 기록",
    "requirement": "중요 정보의 사용자 활동에 대하여 로그를 기록하도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보의 입·출력 및 수정사항, 화면별·담당자별 데이터접근내역 등을 자동으로 기록할 수 있도록 구현\n- 개인정보취급자 식별정보(ID), 접속일시(날짜 및 시간), 접속지 정보(접속지 IP), 처리내역 (열람, 수정, 삭제, 인쇄, 다운로드, 입력 등)을 포함\n ① 정보주체(조회대상 고객) 식별정보 : 예)123456789\n     / 단, 목록을 조회하는 등 정보주체 식별정보를 지정하기 어려운 경우 조회 조건을 기록\n ② 개인정보취급자 식별정보 : 예)홍길동(HGD)\n ③ 접속일시 : 예)2009.06.03, 15:00:00\n ④ 접속지 정보 : 예)172.168.168.11\n ⑤ 부여된 권한 유형에 따른 수행업무 : 예)조회(고객응대),수정,삭제,출력 등\n ⑥ 업무를 수행한 메뉴명 또는 메뉴 경로 / 식별자\n- 로그에 대해서는 통합보안관제시스템과 연동\n- 개인정보처리시스템 접속기록은 최소 1개월 이상 저장하도록 개발\n\n[ 참고사항 ]\n개인정보처리시스템: 최소 1년 이상 보관·관리\n5만명이상 개인정보처리시스템: 2년 이상 보관·관리\n고유식별정보 또는 민감정보 개인정보처리시스템: 2년 이상 보관·관리",
    "sort_order": 31
  },
  {
    "code": "7-2",
    "category": "로그 관리",
    "title": "권한관리 로그 기록",
    "requirement": "보안관련 로그, 감사증적 등을 확보하고 접근 권한의 부여, 변경 또는 말소에 대한 내역을 보관하도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 보안사고 발생 시 책임 추적을 위하여 정보시스템에 다음과 같은 로그를 남기도록 구현\n 1. 사용자 및 관리자의 접속기록 (로그인 및 로그아웃)\n 2. 계정의 생성, 삭제, 중지 및 복구 기록\n 3. 사용자 권한 부여, 변경, 말소 기록\n * 해당 기록은 5년 이상 보관\n- 권한변경 이력 로깅 항목\n ① 대상ID : 권한변경된 ID\n ② 대상자 식별정보 : 사번등 대상자 식별값(주민번호X)\n ③ 대상 권한 : 권한그룹명\n ④ 유형 : 신규/변경/삭제 등 변경 내용\n ⑤ 사유 : 변경 사유\n ⑥ 일시 : 변경일시\n ⑦ 작업자 ID : 작업 수행자 ID",
    "sort_order": 32
  },
  {
    "code": "7-3",
    "category": "로그 관리",
    "title": "로그 생성 시각 동기화",
    "requirement": "로그 생성 시 시간 정보 추가",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 시스템 시각의 동기화 적용",
    "sort_order": 33
  },
  {
    "code": "7-4",
    "category": "로그 관리",
    "title": "로그 접근통제",
    "requirement": "로그 파일 및 테이블에 대한 접근 제한",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 로그는 통합로그관리시스템과 연동",
    "sort_order": 34
  },
  {
    "code": "8-1",
    "category": "개발 시 보안 적용 사항",
    "title": "소스코드내 사용자 ID \n및 패스워드 삽입 금지",
    "requirement": "사용자 계정 및 패스워드가 포함되지 않도록 한다.",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 개발자는 소스코드에 ID 또는 패스워드, 시스템 정보, DB정보 등 민감한 정보가 포함되거나 주석으로 포함되지 않도록 처리",
    "sort_order": 35
  },
  {
    "code": "8-2",
    "category": "개발 시 보안 적용 사항",
    "title": "기술적 보안취약점 점검",
    "requirement": "소스 코드에 대한 취약점 점검",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 시스템이 안전한 코딩표준에 따라 구현하는 지 소스코드 검증 (소스코드 검증도구 활용 등)\n- 기술적 보안 취약점이 존재하는 지 확인하여 취약점 발견 시 재코딩 필요",
    "sort_order": 36
  },
  {
    "code": "8-3",
    "category": "개발 시 보안 적용 사항",
    "title": "모의해킹 실시",
    "requirement": "홈페이지/앱 모의해킹 실시",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 외부에서 접속이 가능한 시스템의 경우 중요도에 따라 모의해킹 필요",
    "sort_order": 37
  },
  {
    "code": "8-4",
    "category": "개발 시 보안 적용 사항",
    "title": "운영환경에 승인되지 않은 파일 금지",
    "requirement": "이관 시 운영환경에 서비스 실행에 필요한 파일만을 설치",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 운영환경에는 승인되지 않은 개발도구(컴파일러, 편집기 등)와 소스코드(백업본 포함)가 있어서는 안되며 승인된 실행파일만 설치\n- 개발 중인 어플리케이션 관련 정보(프로그램 소스, 데이터, 백업 파일, 테스트 파일 등)는 실운영 시스템에 저장하지 않도록 한다.",
    "sort_order": 38
  },
  {
    "code": "9-1",
    "category": "보안솔루션",
    "title": "보안솔루션 적용",
    "requirement": "웹 방화벽 적용",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- DMZ에 있는 웹서비스에 대해서는 웹 방화벽 적용",
    "sort_order": 39
  },
  {
    "code": "9-2",
    "category": "보안솔루션",
    "title": "보안솔루션 적용",
    "requirement": "DB / 시스템 접근제어 적용",
    "applies_personal": true,
    "applies_non_personal": true,
    "description": "- 개인정보를 처리하는 시스템의 경우 DB-Safer 에이전트 설치\n- 불가피한 사유로 DB-Safer를 설치하지 못하는 경우, DB 자체의 감사로그 기능을 활용",
    "sort_order": 40
  },
  {
    "code": "9-3",
    "category": "보안솔루션",
    "title": "보안솔루션 적용",
    "requirement": "DB 암호화 적용",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보를 처리하는 시스템의 경우 DB암호화 실시\n[암호화 대상 개인정보]\n - 양방향 암호화 : 주민등록번호, 여권번호, 운전면허번호, 외국인등록번호, 바이오정보, 신용카드번호, 계좌번호\n - 일방향 암호화 : 비밀번호",
    "sort_order": 41
  },
  {
    "code": "10-1",
    "category": "개인정보보호",
    "title": "개인정보처리방침",
    "requirement": "대외서비스 시스템의 경우 개인정보처리방침 게시 등 확인",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보처리방침 홈페이지 게시\n- 개인정보처리방침 필수적 기재사항 확인\n- 변경이력 게시 여부 확인\n\n[ 참고사항 ]\n개인정보처리방침이라는 문구는 구분이 명확하도록 글자 크기, 색상 등을 활용하여 다른 고지사항과 구분",
    "sort_order": 42
  },
  {
    "code": "10-2",
    "category": "개인정보보호",
    "title": "개인정보 수집 시 동의 설계",
    "requirement": "웹 상에서 개인정보 처리 동의 받을 시 각각의 동의 사항을 구분하여 받을 수 있도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 정보주체로부터 온라인으로 개인정보 획득시 동의 절차 필수\n- 오프라인 수집 후 온라인 입력시 오프라인 수집 동의서 등 통해 동의 획득\n- 회원가입시 \"이용약관\"과 구분해 동의 획득\n- 4가지 항목 포함\n① 개인정보의 수집·이용 목적\n② 수집하려는 개인정보의 항목\n③ 개인정보의 보유 및 이용 기간\n④ 동의를 거부할 권리가 있다는 사실 및 동의 거부에 따른 불이익이 있는 경우에는 그 불이익의 내용\n- 스마트폰 앱을 통해 개인정보 수집 동의시 동의 내용 전문 확인 후 동의 획득토록 동의 버튼 위치 고려 \n- 수집하는 개인정보의 항목이 변경되는 경우 재동의 여부",
    "sort_order": 43
  },
  {
    "code": "10-3",
    "category": "개인정보보호",
    "title": "개인정보 수집 시 동의 받는 방법",
    "requirement": "웹 상에서 개인정보 처리 동의 받을 시 중요한 내용을 명확히 표기할 수 있도록 설계",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "1. 중요내용\n① 개인정보 보유 및 이용기간(제공 시 제공받는 자의 보유 및 이용기간)\n② 재화나 서비스의 홍보 또는 판매 권유 등을 위하여 해당 개인정보를 이용하여 연락할 수 있다는 사실\n③ 개인정보를 제공받는자 및 제공받는 자의 개인정보 이용목적\n④ 처리하려는 개인정보의 항목\n   1) 민감정보(사상·신념, 건강, 정당의 가입·탈퇴 등)\n   2) 여권번호, 운전면허 번호, 외국인 등록번호\n\n2. 표기방법\n① 글씨 크기 : 최소 9포인트 이상, 다른 내용보다 20퍼센트 이상\n② 색깔, 굵기 또는 밑줄 등을 통해 명확히 표시\n③ 중요한 내용이 명확히 구분되기 어려운 경우 중요한 내용이 쉽게 확인될 수 있도록 그 밖의 내용과 별도로 구분하여 표시",
    "sort_order": 44
  },
  {
    "code": "10-4",
    "category": "개인정보보호",
    "title": "개인정보 수집항목",
    "requirement": "최소정보 수집 여부",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 필수 / 선택 동의 사항 구분하여 별도 동의를 득해야한다.\n- 선택정보 미입력시도 서비스 가능해야한다.",
    "sort_order": 45
  },
  {
    "code": "10-5",
    "category": "개인정보보호",
    "title": "고유식별정보 수집",
    "requirement": "주민번호, 여권번호, 운전면허번호, 외국인 등록번호 수집",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 주민등록번호는 법적 근거에 따라서만 수집해야하며, 그 외 고유식별정보 수집 시 일반 개인정보와 별도 동의를 득해야한다.\n- 수집되는 시스템의 보안 대책에 대해서는 별도로 검토",
    "sort_order": 46
  },
  {
    "code": "10-6",
    "category": "개인정보보호",
    "title": "민감정보 수집",
    "requirement": "최소성 여부 확인",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보보호법의 민감정보 : 사상·신념, 노동조합·정당의 가입·탈퇴, 정치적 견해, 건강, 성생활, 유전정보, 범죄경력 등 사생활을 현저히 침해할 수 있는 정보\n- 정보통신망법의 민감정보 : 사상, 신념, 가족 및 친인척관계, 학력, 병력, 기타 사회활동 경력 등 개인의 권리·이익이나 사생활을 뚜렷하게 침해할 우려가 있는 정보\n- 반드시 필요한 경우만 별도의 동의를 거쳐 수집 가능\n- 수집하는 경우 시스템 보안 대책에 대하여 별도 협의",
    "sort_order": 47
  },
  {
    "code": "10-7",
    "category": "개인정보보호",
    "title": "미성년자 개인정보수집",
    "requirement": "만 14세 미만 개인정보 수집 시 법정 대리인 동의 여부",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 법정대리인 동의를 위해 법정대리인 성명, 연락처는 동의없이 해당 아동에게 수집 가능, 단 이 경우 아동에게 자신의 신분, 연락처, 법정대리인 연락처 수집 사유 고지 필요",
    "sort_order": 48
  },
  {
    "code": "10-8",
    "category": "개인정보보호",
    "title": "개인정보 국외이전",
    "requirement": "개인정보 국외이전 시 별도 동의",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보를 국외 업체로 이전하거나 국외에 위탁하는 경우 별도의 동의를 받도록 설계",
    "sort_order": 49
  },
  {
    "code": "10-9",
    "category": "개인정보보호",
    "title": "제3자를 통한 개인정보 수집 시 통보",
    "requirement": "제3자로부터 개인정보를 수집할 경우 정보주체에게 통보",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보를 수집하는 경우 E-mail을 확보할 수 있도록 설계\n- 개인정보를 수집한 사실에 대하여 정보주체에게 통보할 수 있도록 구성(E-mail / SMS)\n ① 개인정보의 수집 출처\n ② 개인정보의 처리 목적\n ③ 개인정보 처리의 정지를 요구할 권리가 있다는 사실",
    "sort_order": 50
  },
  {
    "code": "10-10",
    "category": "개인정보보호",
    "title": "개인정보 이용·제공·위탁",
    "requirement": "제3자 혹은 제휴업체에 개인정보 제공 시 고지/동의 절차 준수",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보를 제3자에게 제공하는 경우, 동의 근거 및 동의문구 작성 내역 확인\n1. 개인정보를 제공받는 자 및 연락처\n2. 개인정보를 제공받는 자의 개인정보 이용 목적\n3. 제공하는 개인정보의 항목\n4. 개인정보를 제공받는 자의 개인정보 보유 및 이용 기간\n5. 동의를 거부할 권리가 있다는 사실 및 동의 거부에 따른 불이익이 있는 경우에는 그 불이익의 내용",
    "sort_order": 51
  },
  {
    "code": "10-11",
    "category": "개인정보보호",
    "title": "개인정보 이용·제공·위탁",
    "requirement": "제3자에 제공되는 개인정보 항목 사전 협의",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보 처리의 외부 위탁 및 제3자 제공에 관한 사항이 명시적으로 정보시스템 구축 계획에 규정\n- 위탁 및 제3자에게 제공되는 개인정보 항목 정의",
    "sort_order": 52
  },
  {
    "code": "10-12",
    "category": "개인정보보호",
    "title": "개인정보 이용·제공·위탁",
    "requirement": "개인정보 대량 추출 및 이용 제한",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 데이터를 추출하는 기능은 인가된 사용자에 의해서만 가능하도록 구현",
    "sort_order": 53
  },
  {
    "code": "10-13",
    "category": "개인정보보호",
    "title": "개인정보 이용·제공·위탁",
    "requirement": "개인정보 처리 위탁 시 협력업체 및 수탁업체 등에 대한 보안통제",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 시스템 운영 또는 관리업무를 위탁할 협력업체 및 수탁업체에 대한 기술적.관리적 보호조치 사항 마련\n- 협력업체/수탁업체에서 접근할 수 있는 개인정보의 범위 명확하게 정의",
    "sort_order": 54
  },
  {
    "code": "10-14",
    "category": "개인정보보호",
    "title": "광고성 정보 제공",
    "requirement": "개인정보의 광고성 정보 활용 동의 등",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보를 마케팅 목적으로 활용할 때는 방법에 따른 적절한 동의를 얻도록 설계\n- 광고성, 마케팅 활용 동의 등에 대한 보유기간 명시필요(예시: 동의일로부터 회원탈퇴 혹은 마케팅 동의 해제시 까지 보유 이용 등)",
    "sort_order": 55
  },
  {
    "code": "10-15",
    "category": "개인정보보호",
    "title": "이용자 통지",
    "requirement": "개인정보 이용내역을 주기적으로 이용자에게 통지",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 수집한 이용자 개인정보의 이용내역(제공 및 개인정보 취급위탁 사항)을 주기적으로 이용자에게 통지해야한다.\n[ 참고사항 ]\n주기적에 대한 법적기준 제시를 위헤 연1회 이상 명시",
    "sort_order": 56
  },
  {
    "code": "10-16",
    "category": "개인정보보호",
    "title": "개인정보 파기 방안",
    "requirement": "수집 개인정보의 보유기간 경과/이용목적이 달성시 개인정보를 파기하거나 이용 중 개인정보와 별도 분리 보관",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "1. 회원 탈퇴 완료 후 자동으로 개인정보가 DB에서 삭제될 수 있도록 파기절차 자동화(파기되는 기록은 별도로 로깅)\n2. 회원 탈퇴 이후 정당한 사유(예: 전자상거래법에 따른 거래기록 보관 등)로 추가 보관이 필요한 경우 별도 DB에 저장될 수 있도록 구성\n3. 망법 등의 제약조건에 따라 회원 정보 등이 정기적으로 삭제되도록 구현",
    "sort_order": 57
  },
  {
    "code": "10-17",
    "category": "개인정보보호",
    "title": "동의 철회 기능 제공",
    "requirement": "동의 철회 기능(회원탈퇴, 제3자 제공 철회 등) 제공",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 개인정보 수집에 대한 선택 동의, 제3자 제공 동의, 회원 탈퇴에 대한 철회 기능 제공\n- 회원가입 보다 쉬운 탈퇴절차 마련",
    "sort_order": 58
  },
  {
    "code": "10-18",
    "category": "개인정보보호",
    "title": "개인정보 표출",
    "requirement": "주요 개인정보 Masking 적용",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "#VALUE!",
    "sort_order": 59
  },
  {
    "code": "10-19",
    "category": "개인정보보호",
    "title": "해지DB 구성",
    "requirement": "타 법령에 의해 개인정보 보존 필요시 분리보관",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "[참고사항]\n- 보존의무 규정 법규 예시\n  1. 전자상거래법\n  ① 표시·광고에 관한 기록 : 6월\n  ② 계약 또는 청약철회 등에 관한 기록 : 5년\n  ③ 대금결제 및 재화등의 공급에 관한 기록 : 5년\n  ④ 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년\n  2. 근로기준법\n  ① 근로자 명부, 근로계약서, 임금대장, 임금계산 기초서류, 해고/퇴직서류, 승급/감급, 휴가 등 3년\n  ② 각 문서별 보존기간 기산일은 근로기준법 시행령 제22조 보존대상 서류 참고\n- 관련 법에 따라 개인정보 보존 필요시 다른 개인정보와 분리하여 저장\n- 관련 법에 따른 보존 필요시 개인정보 처리방침에 관련 내용 고지\n- 해지DB 접근인력 최소화",
    "sort_order": 60
  },
  {
    "code": "10-20",
    "category": "개인정보보호",
    "title": "위치정보처리",
    "requirement": "개인 위치정보 수집 동의 여부 및 제3자 제공 시 별도 동의 획득 여부",
    "applies_personal": true,
    "applies_non_personal": false,
    "description": "- 정보주체(위치정보 소유자)에 대해 사전고지와 명시적 동의 획득 여부\n- 개인위치정보를 제3자에게 제공하는 경우 매회 개인위치정보 주체에게 제공받는 자, 제공일시 및 제공목적 즉시 통보 (단, 개인위치정보주체의 동의를 받은 경우에는 최대 30일의 범위에서 횟수 또는 기간 등의 기준에 따라 일괄 통보가능)",
    "sort_order": 61
  }
];
