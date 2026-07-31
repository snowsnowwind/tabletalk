"""
TableTalk Backend Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/tabletalk"
    
    # JWT
    secret_key: str = "your-super-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours
    
    # OpenCode Go API (OpenAI-compatible chat completions)
    opencode_go_api_key: str = ""
    opencode_go_base_url: str = "https://opencode.ai/zen/go/v1"
    opencode_go_model: str = "deepseek-v4-flash"
    opencode_go_thinking: str = "disabled"
    opencode_go_temperature: float = 0.0
    opencode_go_top_p: float = 1.0
    opencode_go_max_tokens: int = 2000
    opencode_go_history_limit: int = 50
    opencode_go_proxy_url: str = ""

    # DeepSeek native API (OpenAI-compatible chat completions)
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-v4-flash"
    deepseek_thinking: str = "disabled"
    deepseek_temperature: float = 0.0
    deepseek_top_p: float = 1.0
    deepseek_max_tokens: int = 2000
    deepseek_history_limit: int = 50
    deepseek_proxy_url: str = ""
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8570
    debug: bool = True
    
    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings():
    return Settings()
