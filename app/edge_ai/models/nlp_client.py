# app/edge_ai/models/nlp_client.py

from typing import Dict, Any
import json

from openai import OpenAI
from app.edge_ai.core.config import settings


# OpenAI 클라이언트 한 번만 생성
_client = OpenAI(api_key=settings.EDGE_OPENAI_API_KEY)


def call_gpt_json(system_prompt: str, user_content: str) -> Dict[str, Any]:
    """
    system_prompt: 역할/규칙 설명 (한국어/영어 상관 없음)
    user_content : 사용자 입력 (평문 문자열 또는 JSON 문자열)

    반환값: GPT가 만들어 준 JSON을 dict로 파싱한 객체
    """
    resp = _client.responses.create(
        model=settings.EDGE_OPENAI_MODEL,
        instructions=system_prompt,
        input=user_content,
        response_format={"type": "json_object"},
    )

    # 첫 번째 출력 블록의 텍스트를 가져와 JSON 파싱
    text = resp.output[0].content[0].text
    return json.loads(text)
