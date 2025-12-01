# app/edge_ai/core/config.py

from pathlib import Path
from pydantic_settings import BaseSettings

# config.py 위치: app/edge_ai/core/config.py
# parents[0] = core, parents[1] = edge_ai
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"


class EdgeSettings(BaseSettings):
    EDGE_OPENAI_API_KEY: str
    EDGE_OPENAI_MODEL: str = "gpt-4.1-mini"

    class Config:
        env_file = str(ENV_PATH)
        env_file_encoding = "utf-8"


settings = EdgeSettings()
