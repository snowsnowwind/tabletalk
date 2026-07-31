"""AI services module."""
from .opencode_go_service import OpenCodeGoAIService, ai_service
from .deepseek_service import DeepSeekAIService, deepseek_ai_service

ai_services = {
    "opencode_go": ai_service,
    "deepseek": deepseek_ai_service,
}


def get_ai_service(provider: str):
    return ai_services[provider]


__all__ = [
    "OpenCodeGoAIService",
    "DeepSeekAIService",
    "ai_service",
    "deepseek_ai_service",
    "ai_services",
    "get_ai_service",
]
