# PuriPilot (한국어)

일반적인 공기청정기는 `미세먼지 + 유해가스 센서`에만 의존합니다.  
이 때문에 다음과 같은 문제가 생깁니다.

1. 방향제, 디퓨저, 섬유 탈취제, 향수, 화장품 등을 사용할 때  
   공기청정기가 `무해한 향 분자`까지 과도하게 빨아들여  
   `필터 수명이 불필요하게 줄어들 수` 있습니다.
2. 냄새는 기본적으로 `여러 방으로 확산`되지만,  
   대부분의 제품은 `단일 기기만 제어`할 수 있고  
   집 전체 공기청정기를 `동시에 제어하는 기능`은 거의 없습니다.

PuriPilot은 이 문제를 다음과 같이 해결하려는 스마트홈 AI 프로젝트입니다.

1. e-nose(전자코)를 이용해 `냄새 패턴`을 학습하고,  
   사람이 `불쾌하다고 느끼는 냄새`일 때만
   - 규칙 기반으로 `공기청정기 가동 모드`를 올려 줍니다.
2. `Room-Graph`(방 연결 그래프)를 이용해  
   집 전체 공기청정기를 `동시에 / 연관성 있게 제어`합니다.
3. 이 모든 동작을 사용자가 `웹에서 확인하고 제어`할 수 있습니다.

정리하면: PuriPilot은 `LG PuriCare 제어가 가능한 스마트홈 평면도 + 3D 디자인 데모`이며,  
`ESP32 + 센서 + Edge Impulse` 기반의 냄새 인지 자동화를 염두에 두고 있습니다.


## 주요 기능

다음과 같은 일을 할 수 있습니다.

- 2D 평면도 편집
- 여러 대의 LG PuriCare 장치 배치
- 말풍선(bubble)에서 장치 정보 확인  
  (id / name / mode / smell_class / last_seen)
- UI에서 바로 모드 변경
- 평면도와 장치 정보를 MySQL에 영구 저장
- Swagger UI로 API를 탐색하고 테스트
- ESP32 + e-nose + Edge Impulse 연동으로:
  - 냄새 패턴 분류
  - 불쾌한 냄새일 때만 모드 상승
  - Room-Graph를 이용한 다중 장치 제어

이 저장소는 다음과 같은 `데모 / 실험용 프로젝트`입니다.

- 스마트홈 UI/UX (2D 평면도 + 3D 느낌의 장치 배치)
- 다수 공기청정기 관리 및 제어
- IoT 디바이스(ESP32 + 센서 + Edge Impulse)와 웹 백엔드 연동


## 아키텍처 개요

- **프론트엔드**
  - example/ 하위 폴더에서 작동
  - 2D 평면도 편집
  - 평면도 위에 LG PuriCare 장치 배치
  - 말풍선에서 장치 정보를 확인하고 모드를 바로 변경

- **백엔드**
  - Node.js + Express
  - MySQL로 평면도 및 장치 상태를 저장
  - Swagger UI를 포함한 REST API 제공

- **IoT / 추론 (모델 추가 학습 예정)**
  - ESP32 + e-nose(온도, 습도, 가스 등 센서 포함)
  - Edge Impulse 모델로 **냄새 / 공기질 패턴 분류**
  - 규칙 기반 로직으로 “불쾌한 냄새인지” 판별
  - Room-Graph 기반으로 여러 공기청정기를 함께 제어
  - ESP32가 상태와 예측값을 백엔드로 전송


## 빠른 시작

### 사전 준비

- Node.js 18+
- MySQL 인스턴스 (로컬 또는 원격)

### 환경 설정

프로젝트 루트에 `.env` 파일을 만들고, 다음과 같이 설정합니다.

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=puripilot_db
PORT=3001
```

> 참고: `PORT`는 **백엔드 HTTP 서버 포트**(기본 `3001`)이며,  
> MySQL 포트가 아닙니다.

### 설치 및 실행

```
# 프로젝트 루트
npm install

npm run start:server   # 백엔드 서버 실행, DB 마이그레이션 및 기본 lg-puricare-1 시드
```

다른 터미널에서:

```
cd example
npx http-server .      # 또는 example/ 폴더를 서빙할 수 있는 아무 정적 서버
```

이후 아래 주소로 접속합니다.

- 프론트엔드: `http://localhost:8080` (또는 사용 중인 정적 서버 주소)
- 백엔드: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/api/docs`


## 앱 사용 방법

1. `평면도 편집` 
   - 2D 에디터에서 집 구조를 그리거나 수정합니다.  
   - `Done` 버튼을 누르면 평면도가 자동으로 백엔드에 저장됩니다.

2. `LG PuriCare 장치 추가`  
   - `Add Items → Lg Puricare` 메뉴를 선택합니다.  
   - 평면도에 하나를 배치할 때마다 MySQL에 `장치 row가 1개씩 생성`됩니다.

3. `장치 정보 확인 및 제어`  
   - `Design` 탭으로 이동합니다.  
   - 평면도 위의 `Lg Puricare` 장치를 선택합니다.  
   - 말풍선(bubble)에 다음 정보가 표시됩니다.
     - `id`, `name`, `mode`, `smell_class`, `last_seen`
   - 말풍선 안의 모드 버튼을 누르면 즉시 `PATCH 요청`이 전송됩니다.
   - 장치 이름을 수정하고 저장할 수도 있습니다.

이를 통해 집 안에 장치가 `어디에 있는지 시각화`하고,  
여러 공기청정기를 한 화면에서 쉽게 관리할 수 있습니다.


## ESP32 + Edge Impulse 연동 (예정)

PuriPilot은 **실제 IoT 장치**와 연동하기 쉽게 설계되어 있습니다.

- **ESP32**에서 e-nose(및 기타 센서) 데이터를 읽고,
- **Edge Impulse**에서 학습한 모델로 **냄새 패턴**을 분류합니다.
- 규칙 기반 로직으로:
  - 이 냄새가 **불쾌한 냄새인지** 판단하고
  - 해당 방의 공기청정기 **가동 모드를 올릴지** 결정합니다.
- **Room-Graph**를 이용해 냄새가 퍼질 수 있는 인접 방의 공기청정기도 함께 제어할 수 있습니다.
- ESP32는 주기적으로:
  - 센서 데이터
  - 예측된 smell class
  - 상태 / 타임스탬프
  를 백엔드로 전송하고, 백엔드는 각 장치의 `smell_class`, `last_seen` 등을 갱신합니다.

향후 README에 다음 내용을 자세히 추가할 예정입니다.

1. Arduino IDE에서 Edge Impulse 모델을 ESP32에 배포하는 방법  
2. ESP32에서 추론 결과를 PuriPilot 백엔드로 보내는 방법  
3. ESP32 디바이스를 PuriPilot의 `device_id` 및 Room-Graph와 연결하는 방법  


## NPM 스크립트

- `npm run start:server` — Express + MySQL + Swagger 서버 실행
- `npm run build` — 브라우저용 클라이언트 빌드 (레거시 browserify 파이프라인)
- `npx http-server example -p 8080 -c-1 -o index.html`


## 저장소

```
git@github.com:PuriPilot/Smart-Home-PuriPilot.git
```
```