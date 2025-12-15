# PuriPilot (한국어)

▶ **[PuriPilot Demo Video 보기](docs/PuriPilot.mp4)**  
간단한 오프닝과 함께 2D 평면도 편집, 장치 배치, 모드 제어 흐름을 확인할 수 있는 데모 영상입니다.

---

일반적인 공기청정기는 `미세먼지 + 유해가스 센서`에만 의존합니다.  
이 때문에 다음과 같은 문제가 발생합니다.

1. 방향제, 디퓨저, 섬유 탈취제, 향수, 화장품 등을 사용할 때  
   공기청정기가 `무해한 향 분자`까지 과도하게 흡입하여  
   `필터 수명이 불필요하게 단축`될 수 있습니다.
2. 냄새는 기본적으로 `여러 방으로 확산`되지만,  
   대부분의 제품은 `단일 기기만 제어`할 수 있으며  
   집 전체 공기청정기를 `연관성 있게 동시에 제어`하는 기능은 거의 없습니다.

**PuriPilot**은 이러한 문제를 해결하기 위한 **스마트홈 AI 기반 공기청정기 제어 프로젝트**입니다.

## PuriPilot 개요

PuriPilot은 다음과 같은 접근으로 문제를 해결합니다.

1. **e-nose(전자코)** 를 이용해 `냄새 패턴`을 학습하고,  
   사람이 `불쾌하다고 느끼는 냄새`일 때만  
   - 규칙 기반으로 `공기청정기 가동 모드`를 상향 조정합니다.
2. **Room-Graph(방 연결 그래프)** 를 이용해  
   집 전체 공기청정기를 `동시에 / 연관성 있게 제어`합니다.
3. 모든 동작을 사용자가 **웹 기반 평면도 UI에서 시각적으로 확인하고 제어**할 수 있습니다.

정리하면, PuriPilot은  
**LG PuriCare 제어가 가능한 스마트홈 평면도 + 3D 디자인 데모**이며,  
**ESP32 + 센서 + Edge Impulse 기반 냄새 인지 자동화**를 염두에 두고 설계되었습니다.

## 주요 기능

PuriPilot 데모에서는 다음과 같은 기능을 제공합니다.

- 2D 평면도 편집
- 여러 대의 LG PuriCare 장치 배치
- 장치 말풍선(bubble) UI 제공  
  - `id / name / mode / smell_class / last_seen` 표시
- UI에서 즉시 공기청정기 모드 변경
- 평면도 및 장치 정보를 MySQL에 영구 저장
- Swagger UI를 통한 REST API 탐색 및 테스트
- ESP32 + e-nose + Edge Impulse 연동을 고려한 구조
  - 냄새 패턴 분류
  - 불쾌한 냄새일 때만 모드 상승
  - Room-Graph 기반 다중 장치 제어

본 저장소는 다음을 목표로 하는 **데모 / 실험용 프로젝트**입니다.

- 스마트홈 UI/UX (2D 평면도 + 3D 느낌의 장치 배치)
- 다수 공기청정기 관리 및 제어
- IoT 디바이스와 웹 백엔드 연동 구조 검증

## 아키텍처 개요

![PuriPilot Architecture Context](docs/architecture_context.svg)

- **프론트엔드**
- `example/` 하위 폴더에서 실행
- 2D 평면도 편집
- 평면도 위 LG PuriCare 장치 배치
- 말풍선 UI에서 장치 상태 확인 및 모드 제어

- **백엔드**
- Node.js + Express
- MySQL 기반 평면도 및 장치 상태 영구 저장
- Swagger UI를 포함한 REST API 제공

- **IoT / 추론 (확장 예정)**
- ESP32 + e-nose (온도, 습도, 가스 등 센서)
- Edge Impulse 기반 냄새 및 공기질 패턴 분류
- 규칙 기반 로직으로 불쾌한 냄새 여부 판단
- Room-Graph 기반 다중 공기청정기 연계 제어
- ESP32가 상태 및 예측 결과를 백엔드로 전송


## 빠른 시작

### 사전 준비

- Node.js 18 이상
- MySQL 인스턴스 (로컬 또는 원격)

### 환경 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음과 같이 설정합니다.

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=puripilot_db
PORT=3001
```
PORT는 백엔드 HTTP 서버 포트이며,
MySQL 포트와는 무관합니다.

### 설치 및 실행
```
npm install
npm run start:server
```
위 명령은 다음을 수행합니다.
-	Express 서버 실행
-	MySQL 테이블 생성 및 마이그레이션
-	기본 LG PuriCare 장치 시드 데이터 생성

다른 터미널에서 프론트엔드를 실행합니다.
```
cd example
npx http-server .
```

### 접속 주소
-	프론트엔드: http://localhost:8080
-	백엔드 API: http://localhost:3001
-	Swagger UI: http://localhost:3001/api/docs

## 앱 사용 방법
### 1.	평면도 편집
- 2D 에디터에서 집 구조를 생성 또는 수정합니다.
- Done 버튼을 누르면 평면도가 자동 저장됩니다.
### 2.	LG PuriCare 장치 추가
- Add Items → Lg Puricare 메뉴 선택
- 장치 1개 배치 시 MySQL에 장치 row가 자동 생성됩니다.
### 3.	장치 정보 확인 및 제어
-	Design 탭으로 이동
-	평면도 위 장치를 선택하면 말풍선 UI 표시
-	모드 버튼 클릭 시 즉시 PATCH 요청 전송
-	장치 이름 수정 후 저장 가능

이를 통해 집 안의 장치 위치를 시각적으로 파악하고
여러 공기청정기를 한 화면에서 직관적으로 관리할 수 있습니다.

## ESP32 + Edge Impulse 연동

PuriPilot은 실제 IoT 장치 연동을 고려한 구조로 설계되었습니다.
-	ESP32에서 e-nose 센서 데이터 수집
-	Edge Impulse에서 냄새 패턴 모델 학습
-	추론 결과를 기반으로 불쾌한 냄새 여부 판단
-	Room-Graph를 이용한 인접 방 공기청정기 동시 제어
-	ESP32가 다음 정보를 주기적으로 백엔드에 전송
-	센서 데이터
-	예측된 smell_class
-	상태 및 타임스탬프

향후 README에는 다음 내용을 추가할 예정입니다.
1.	Edge Impulse 모델을 ESP32에 배포하는 방법
2.	ESP32에서 추론 결과를 백엔드로 전송하는 방식
3.	ESP32 디바이스를 PuriPilot device_id 및 Room-Graph와 연결하는 방법

```
NPM 스크립트
$ npm run start:server
Express + MySQL + Swagger 서버 실행
$ npm run build
브라우저용 클라이언트 빌드 (browserify 기반)
$ npx http-server example -p 8080 -c-1 -o index.html
프론트엔드 정적 서버 실행
```

## 저장소
```
git@github.com:PuriPilot/Smart-Home-PuriPilot.git
```