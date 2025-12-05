## ESP32에서 쓸 “전처리 + 예측 규칙”은 최대한 단순화:
- 온도/습도/압력/가스값을 현재처럼 읽기
- 같은 방식(평균, 표준편차 등)을 쓸 거면 윈도우 기반 특징을 추가로 설계
- 최종적으로 “if / table lookup”에 가깝게 변환하거나, Edge Impulse로 옮기는 게 편함.

## Edge Impulse 루트:
- 이 CSV들을 하나로 합쳐서 Edge Impulse에 업로드
- Impulse: Time series → 1D conv or FC NN
- Generate C++ library → ESP32 Arduino 프로젝트에 include