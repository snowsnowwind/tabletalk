import unittest

from app.ai import get_ai_service
from app.schemas.ai import ChatRequest


class AIProviderSwitchingTests(unittest.TestCase):
    def test_chat_request_defaults_to_opencode_go(self):
        request = ChatRequest(message="Hello")

        self.assertEqual(request.provider, "opencode_go")

    def test_deepseek_provider_uses_official_endpoint(self):
        service = get_ai_service("deepseek")

        self.assertEqual(service.provider_name, "DeepSeek")
        self.assertEqual(service.base_url, "https://api.deepseek.com")
        self.assertEqual(service.model, "deepseek-v4-flash")

    def test_opencode_go_provider_remains_available(self):
        service = get_ai_service("opencode_go")

        self.assertEqual(service.provider_name, "OpenCode Go")
        self.assertEqual(service.base_url, "https://opencode.ai/zen/go/v1")


if __name__ == "__main__":
    unittest.main()
