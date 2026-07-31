"""DeepSeek native API service using the shared booking safety workflow."""
from datetime import date
from typing import Optional

from ..config import get_settings
from .opencode_go_service import OpenCodeGoAIService

settings = get_settings()


class DeepSeekAIService(OpenCodeGoAIService):
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        current_date: Optional[date] = None,
    ):
        super().__init__(
            api_key=settings.deepseek_api_key if api_key is None else api_key,
            base_url=settings.deepseek_base_url if base_url is None else base_url,
            model=settings.deepseek_model if model is None else model,
            thinking=settings.deepseek_thinking,
            temperature=settings.deepseek_temperature,
            top_p=settings.deepseek_top_p,
            max_tokens=settings.deepseek_max_tokens,
            history_limit=settings.deepseek_history_limit,
            proxy_url=settings.deepseek_proxy_url,
            current_date=current_date,
            provider_name="DeepSeek",
        )


deepseek_ai_service = DeepSeekAIService()
