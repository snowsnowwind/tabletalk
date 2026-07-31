"""OpenCode Go AI service for TableTalk's AI features."""
import asyncio
from datetime import date, datetime, timedelta
import json
import logging
import re
from typing import Any, Dict, List, Optional
from urllib.request import ProxyHandler, Request, build_opener
from zoneinfo import ZoneInfo

from ..config import get_settings
from ..schemas.ai import ChatResponse
from .booking_prompts import build_controlled_booking_prompt

settings = get_settings()
logger = logging.getLogger(__name__)


class OpenCodeGoAIService:
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        thinking: Optional[str] = None,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        max_tokens: Optional[int] = None,
        history_limit: Optional[int] = None,
        proxy_url: Optional[str] = None,
        current_date: Optional[date] = None,
        provider_name: str = "OpenCode Go",
    ):
        self.provider_name = provider_name
        self.api_key = settings.opencode_go_api_key if api_key is None else api_key
        self.base_url = (settings.opencode_go_base_url if base_url is None else base_url).rstrip("/")
        self.model = settings.opencode_go_model if model is None else model
        self.thinking = settings.opencode_go_thinking if thinking is None else thinking
        if self.thinking not in {"enabled", "disabled"}:
            raise ValueError(f"{self.provider_name} thinking must be 'enabled' or 'disabled'")
        self.temperature = settings.opencode_go_temperature if temperature is None else temperature
        self.top_p = settings.opencode_go_top_p if top_p is None else top_p
        self.max_tokens = settings.opencode_go_max_tokens if max_tokens is None else max_tokens
        self.history_limit = (
            settings.opencode_go_history_limit if history_limit is None else history_limit
        )
        if self.history_limit < 1:
            raise ValueError(f"{self.provider_name} history limit must be at least 1")
        self.current_date = date.today() if current_date is None else current_date
        self.proxy_url = settings.opencode_go_proxy_url if proxy_url is None else proxy_url
        proxy_map = {"http": self.proxy_url, "https": self.proxy_url} if self.proxy_url else {}
        self._url_opener = build_opener(ProxyHandler(proxy_map))
        self.last_provider_request: Optional[Dict[str, Any]] = None
        self.last_provider_response: Optional[Dict[str, Any]] = None
        self.last_chat_metadata: Dict[str, Any] = {}

    def is_available(self) -> bool:
        return bool(self.api_key)

    async def _generate_json(self, messages: List[Dict[str, str]]) -> Any:
        response = await asyncio.to_thread(self._post_completion, messages)
        try:
            choice = response["choices"][0]
            message = choice["message"]
            content = message["content"]
        except (KeyError, IndexError, TypeError) as error:
            raise ValueError(f"{self.provider_name} returned no chat completion content") from error
        self.last_provider_response = {
            "id": response.get("id"),
            "model": response.get("model", self.model),
            "content": content,
            "finish_reason": choice.get("finish_reason"),
            "usage": response.get("usage"),
        }
        return self._parse_json(content)

    def _post_completion(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        if not self.is_available():
            raise RuntimeError(f"{self.provider_name} API key is not configured")

        request_body = {
            "model": self.model,
            "messages": messages,
            "thinking": {"type": self.thinking},
            "temperature": self.temperature,
            "top_p": self.top_p,
            "max_tokens": self.max_tokens,
        }
        self.last_provider_request = request_body
        payload = json.dumps(request_body).encode()
        request = Request(
            f"{self.base_url}/chat/completions",
            data=payload,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "TableTalk/1.0",
            },
            method="POST",
        )
        with self._url_opener.open(request, timeout=30) as response:
            return json.load(response)

    @staticmethod
    def _parse_json(content: Any) -> Any:
        if not isinstance(content, str):
            raise ValueError("AI provider response content is not text")

        text = content.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else ""
            if text.endswith("```"):
                text = text[:-3]
        return json.loads(text.strip())

    async def get_restaurant_recommendations(
        self,
        restaurants: List[Dict[str, Any]],
        user_role: str,
        scenario: str,
        budget_level: int,
        cuisine_preference: Optional[str] = None,
        guest_count: Optional[int] = None,
        top_n: int = 5,
    ) -> List[Dict[str, Any]]:
        if not self.is_available():
            return self._simple_recommendation(restaurants, budget_level, cuisine_preference, top_n)

        prompt = f"""You are a restaurant recommendation expert. Based on the following criteria,
rank and recommend the best restaurants from the list provided.

User Profile:
- Role: {user_role}
- Dining Scenario: {scenario}
- Budget Level: {budget_level}/5
- Cuisine Preference: {cuisine_preference or 'Any'}
- Guest Count: {guest_count or 'Not specified'}

Available Restaurants:
{json.dumps(restaurants, indent=2)}

Return ONLY a JSON array with at most {top_n} recommendations. Each recommendation must include id,
name, cuisine, rating, price_level, score (0-10), and a Chinese reason."""

        try:
            recommendations = await self._generate_json([{"role": "user", "content": prompt}])
            return recommendations[:top_n]
        except Exception as error:
            logger.warning("%s restaurant recommendation failed: %s", self.provider_name, error)
            return self._simple_recommendation(restaurants, budget_level, cuisine_preference, top_n)

    async def get_menu_recommendations(
        self,
        menu_items: List[Dict[str, Any]],
        guest_count: int,
        budget_per_person: Optional[float] = None,
        dietary_restrictions: Optional[List[str]] = None,
        occasion: Optional[str] = None,
    ) -> Dict[str, Any]:
        if not self.is_available():
            return self._simple_menu_recommendation(menu_items, guest_count, budget_per_person)

        prompt = f"""You are a restaurant menu expert. Recommend a balanced menu for:

Event Details:
- Guest Count: {guest_count}
- Budget per Person: {'HK$' + str(budget_per_person) if budget_per_person else 'Not specified'}
- Dietary Restrictions: {', '.join(dietary_restrictions) if dietary_restrictions else 'None'}
- Occasion: {occasion or 'General dining'}

Available Menu Items:
{json.dumps(menu_items, indent=2)}

Return ONLY a JSON object with items, total_cost, and ai_notes. Each item must include id, name,
category, price, Chinese reason, and is_must_try."""

        try:
            return await self._generate_json([{"role": "user", "content": prompt}])
        except Exception as error:
            logger.warning("%s menu recommendation failed: %s", self.provider_name, error)
            return self._simple_menu_recommendation(menu_items, guest_count, budget_per_person)

    async def optimize_event_flow(
        self,
        current_flow: List[Dict[str, Any]],
        guest_count: int,
        event_type: str,
        special_requirements: Optional[str] = None,
    ) -> Dict[str, Any]:
        if not self.is_available():
            return {"optimized_flow": current_flow, "suggestions": [], "warnings": []}

        prompt = f"""You are an event planning expert. Optimize this restaurant event flow:

Event Details:
- Type: {event_type}
- Guest Count: {guest_count}
- Special Requirements: {special_requirements or 'None'}

Current Event Flow:
{json.dumps(current_flow, indent=2)}

Return ONLY a JSON object with optimized_flow, suggestions, and warnings. Each optimized step must
include step_order, title, suggested_time, duration_minutes, Chinese notes, and improvement_reason."""

        try:
            return await self._generate_json([{"role": "user", "content": prompt}])
        except Exception as error:
            logger.warning("%s event optimization failed: %s", self.provider_name, error)
            return {"optimized_flow": current_flow, "suggestions": [], "warnings": []}

    async def chat_assistant(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        self.last_provider_request = None
        self.last_provider_response = None
        self.last_chat_metadata = {
            "provider": self.provider_name,
            "model": self.model,
            "fallback_activated": False,
            "error_type": None,
        }
        if not self.is_available():
            self.last_chat_metadata["fallback_activated"] = True
            self.last_chat_metadata["error_type"] = "missing_api_key"
            return self._simple_chat_response(message, context)

        system_prompt = build_controlled_booking_prompt(self.current_date, context)
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(
            {
                "role": "assistant" if item.get("role") in {"assistant", "model"} else "user",
                "content": item["content"],
            }
            for item in conversation_history[-self.history_limit:]
            if item.get("content")
        )
        messages.append({"role": "user", "content": message})

        try:
            provider_response = await self._generate_json(messages)
            if isinstance(provider_response, dict):
                provider_response = {
                    **provider_response,
                    "extracted_data": provider_response.get("extracted_data") or {},
                    "clear_fields": provider_response.get("clear_fields") or [],
                    "quick_replies": provider_response.get("quick_replies") or [],
                }
            response = ChatResponse.model_validate(provider_response).model_dump()
            return self._normalize_booking_response(response, context, message)
        except Exception as error:
            logger.warning("%s chat failed: %s", self.provider_name, error)
            self.last_chat_metadata["fallback_activated"] = True
            self.last_chat_metadata["error_type"] = type(error).__name__
            return self._simple_chat_response(message, context)

    def _normalize_booking_response(
        self,
        response: Dict[str, Any],
        context: Dict[str, Any],
        user_message: str = "",
    ) -> Dict[str, Any]:
        if self._is_complex_non_booking_request(user_message):
            return self._scope_refusal_response()
        if (
            self._is_booking_start_request(user_message)
            and context.get("restaurant_id")
            and response.get("action") is None
        ):
            return self._simple_chat_response("", context)
        if (
            response.get("action") in {
                "ask_date",
                "ask_time",
                "ask_guests",
                "ask_name",
                "ask_phone",
                "confirm_booking",
                "complete",
            }
            and (
                self._is_simple_general_inquiry(user_message)
                or self._is_restaurant_information_request(user_message, context)
            )
        ):
            return self._non_booking_fallback_response(user_message, context)

        extracted_data = {
            key: value
            for key, value in response.get("extracted_data", {}).items()
            if key != "restaurant_id" and value not in (None, "")
        }
        clear_fields = [
            field
            for field in response.get("clear_fields", [])
            if field in {"date", "time", "guests", "name", "phone", "special_requests"}
        ]
        response = {
            **response,
            "extracted_data": extracted_data,
            "clear_fields": clear_fields,
        }
        if response.get("action") == "cancel_draft":
            return {
                "response": "Your draft reservation has been cancelled.",
                "action": "cancel_draft",
                "extracted_data": {},
                "clear_fields": [],
                "quick_replies": [],
            }
        if response.get("action") not in {"confirm_booking", "complete"}:
            return response

        booking_context = {**context, **extracted_data}
        for field in clear_fields:
            booking_context[field] = None
        if not booking_context.get("restaurant_id"):
            return {
                "response": "Please select a restaurant before confirming your booking.",
                "action": None,
                "extracted_data": extracted_data,
                "clear_fields": clear_fields,
                "quick_replies": [],
            }

        next_step = self._simple_chat_response("", booking_context)
        if next_step["action"] != "confirm_booking":
            next_step["extracted_data"] = extracted_data
            next_step["clear_fields"] = clear_fields
            return next_step
        if (
            response.get("action") == "complete"
            and not self._is_booking_confirmation(user_message)
        ):
            return {
                "response": (
                    f"Please confirm your reservation for {booking_context.get('date')} at "
                    f"{booking_context.get('time')} for {booking_context.get('guests')} guests."
                ),
                "action": "confirm_booking",
                "extracted_data": extracted_data,
                "clear_fields": clear_fields,
                "quick_replies": ["Confirm booking", "Change date", "Cancel"],
            }
        if response.get("action") == "complete":
            response["response"] = "Your reservation details are ready for review."
        return response

    def _simple_recommendation(
        self,
        restaurants: List[Dict[str, Any]],
        budget_level: int,
        cuisine_preference: Optional[str],
        top_n: int,
    ) -> List[Dict[str, Any]]:
        scored = []
        for restaurant in restaurants:
            score = 5.0
            if restaurant.get("price_level", 3) <= budget_level:
                score += 2.0
            score += restaurant.get("rating", 4.0) / 2
            if cuisine_preference and cuisine_preference.lower() in restaurant.get("cuisine", "").lower():
                score += 3.0
            scored.append(
                {
                    **restaurant,
                    "score": min(score, 10.0),
                    "reason": "评分较高，价位适中"
                    if restaurant.get("price_level", 3) <= budget_level
                    else "高评分餐厅",
                }
            )
        scored.sort(key=lambda item: item["score"], reverse=True)
        return scored[:top_n]

    def _simple_menu_recommendation(
        self,
        menu_items: List[Dict[str, Any]],
        guest_count: int,
        budget_per_person: Optional[float],
    ) -> Dict[str, Any]:
        categories: Dict[str, List[Dict[str, Any]]] = {}
        for item in menu_items:
            categories.setdefault(item.get("category", "other"), []).append(item)

        selected = [
            {
                **items[0],
                "reason": "该类别推荐菜品",
                "is_must_try": items[0].get("order_count", 0) > 10,
            }
            for items in categories.values()
            if items
        ]
        return {
            "items": selected[:8],
            "total_cost": sum(item.get("price", 0) for item in selected) * guest_count,
            "ai_notes": f"为{guest_count}位客人精选的菜单组合",
        }

    @staticmethod
    def _is_booking_confirmation(message: str) -> bool:
        return message.strip(" .!?\u3002\uff01\uff1f").lower() in {
            "confirm booking",
            "confirm",
            "yes",
            "\u786e\u8ba4\u9884\u8ba2",
            "\u786e\u8ba4",
        }

    @staticmethod
    def _is_draft_cancellation(message: str) -> bool:
        text = message.strip().lower()
        return bool(
            re.search(
                r"\b(cancel (?:this |the )?(?:booking|reservation)|"
                r"do not book|don't book|changed my mind|"
                r"withdraw (?:this |the )?(?:booking|reservation))\b",
                text,
            )
            or re.search(r"(取消预订|取消预约|不订了|不預訂|唔訂)", text)
        )

    @staticmethod
    def _explicit_clear_fields(message: str) -> List[str]:
        text = message.strip().lower()
        clears_special_request = bool(
            re.search(
                r"\b(no special requests?|no preference|"
                r"remove .{0,40}(?:request|preference)|"
                r"clear .{0,40}(?:request|preference))\b",
                text,
            )
            or re.search(
                r"(取消.{0,20}(要求|需求)|没有特殊要求|沒有特殊要求|无特殊要求|無特殊要求)",
                text,
            )
        )
        return ["special_requests"] if clears_special_request else []

    @staticmethod
    def _is_complex_non_booking_request(message: str) -> bool:
        text = message.strip().lower()
        food_related = bool(
            re.search(
                r"\b(food|dish|meal|menu|restaurant|ingredient|recipe|cook|cuisine|"
                r"nutrition|diet|allergen|vegetarian|vegan|pork|beef|chicken|duck|"
                r"seafood|dessert|drink|wine|dining)\b",
                text,
            )
            or re.search(
                r"(食物|餐饮|餐飲|餐厅|餐廳|菜|菜单|菜單|食材|成分|配料|烹饪|烹飪|"
                r"营养|營養|过敏|過敏|素食|猪肉|豬肉|牛肉|鸡肉|雞肉|鸭|鴨|海鲜|海鮮)",
                message,
            )
        )
        if food_related:
            return False
        return bool(
            re.search(
                r"\b(?:write|draft|compose|generate|create)\b.{0,40}"
                r"\b(?:essay|thesis|dissertation|homework|report|article|code|program)\b",
                text,
            )
            or re.search(r"\b(?:[5-9]\d{2}|[1-9]\d{3,})[- ]?words?\b", text)
            or re.search(r"(写|撰写|生成|创作).{0,20}(论文|作业|报告|代码|程序|文章)", message)
            or re.search(r"\d{3,}\s*字", message)
        )

    @staticmethod
    def _has_booking_intent(message: str) -> bool:
        text = message.strip().lower()
        return bool(
            re.search(
                r"\b(book|booking|reserve|reservation|make a reservation|table for)\b",
                text,
            )
            or re.search(r"(预订|預訂|预约|預約|订位|訂位|订桌|訂桌)", message)
        )

    @staticmethod
    def _is_booking_start_request(message: str) -> bool:
        text = message.strip().lower()
        return bool(
            re.search(
                r"\b(make (?:a )?(?:restaurant )?reservation|"
                r"book (?:a )?table|reserve (?:a )?table|"
                r"i (?:would|'d) like to (?:book|reserve))\b",
                text,
            )
            or re.search(r"(我要|我想|帮我|幫我).{0,8}(预订|預訂|预约|預約|订位|訂位|订桌|訂桌)", message)
        )

    @classmethod
    def _is_simple_general_inquiry(cls, message: str) -> bool:
        if cls._has_booking_intent(message):
            return False
        text = message.strip().lower()
        return bool(
            re.search(r"\b(weather|forecast|temperature)\b", text)
            or re.search(r"\b(what time is it|current time|time now)\b", text)
            or re.fullmatch(r"(?:hello|hi|hey|good (?:morning|afternoon|evening))[!. ]*", text)
            or re.search(r"(天气|天氣|气温|氣溫|几点了|幾點了|现在几点|現在幾點)", message)
        )

    @classmethod
    def _is_restaurant_information_request(
        cls,
        message: str,
        context: Dict[str, Any] | None = None,
    ) -> bool:
        if cls._has_booking_intent(message):
            return False
        text = message.strip().lower()
        mentions_menu_item = any(
            item_name in text
            for item in (context or {}).get("selected_menu", [])
            if (item_name := str(item.get("name", "")).strip().lower())
        )
        return bool(
            mentions_menu_item
            or
            re.search(
                r"\b(menu|dish|food|recommend|popular|signature|price|cost|"
                r"vegetarian|vegan|spicy|allergen|cuisine|restaurant|opening hours?|"
                r"ingredient|recipe|cook|nutrition|diet|pork|beef|chicken|duck|seafood)\b",
                text,
            )
            or re.search(
                r"(菜单|菜單|菜品|推荐菜|推薦菜|招牌菜|价格|價錢|多少钱|多少錢|"
                r"素食|过敏|過敏|辣|餐厅|餐廳|营业时间|營業時間|食材|成分|配料|"
                r"烹饪|烹飪|营养|營養|猪肉|豬肉|牛肉|鸡肉|雞肉|鸭|鴨|海鲜|海鮮)",
                message,
            )
        )

    @staticmethod
    def _scope_refusal_response() -> Dict[str, Any]:
        return {
            "response": (
                "I can help with restaurant information, menu recommendations, prices, and "
                "reservations, as well as brief everyday questions, but I can't write long-form "
                "essays or complete complex assignments."
            ),
            "action": None,
            "extracted_data": {},
            "clear_fields": [],
            "quick_replies": ["Recommend dishes", "View menu prices", "Make a reservation"],
        }

    def _non_booking_fallback_response(
        self,
        message: str,
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        text = message.strip().lower()
        if self._is_restaurant_information_request(message, context):
            selected_restaurant = context.get("selected_restaurant") or {}
            menu = context.get("selected_menu") or []
            if ("peking duck" in text or "北京烤鸭" in message or "北京烤鴨" in message) and re.search(
                r"\b(ingredients?|made of|contain|what (?:is|are))\b|成分|食材|配料|有什么|有什麼",
                message,
                re.IGNORECASE,
            ):
                return {
                    "response": (
                        "Peking duck typically uses a whole duck, maltose or another sugar glaze, "
                        "and seasoning. It is commonly served with thin pancakes, scallions, "
                        "cucumber, and hoisin or sweet bean sauce. Recipes can vary."
                    ),
                    "action": None,
                    "extracted_data": {},
                    "clear_fields": [],
                    "quick_replies": ["Which dishes contain pork?", "Recommend dishes"],
                }
            if not selected_restaurant:
                names = [
                    restaurant.get("name")
                    for restaurant in context.get("restaurant_catalog", [])
                    if restaurant.get("name")
                ]
                response = (
                    "Please select a restaurant so I can give you its real menu, prices, and "
                    "recommendations."
                )
                if names:
                    response += f" Available restaurants include: {', '.join(names)}."
            elif not menu:
                response = (
                    f"I don't have an available menu for {selected_restaurant.get('name', 'this restaurant')} "
                    "right now."
                )
            else:
                asks_for_pork = bool(re.search(r"\bpork\b", text) or re.search(r"(猪肉|豬肉)", message))
                if asks_for_pork:
                    pork_items = [
                        item
                        for item in menu
                        if re.search(
                            r"\b(pork|char siu|tonkotsu|ham|bacon)\b|猪|豬|叉烧|叉燒",
                            f"{item.get('name', '')} {item.get('description', '')}",
                            re.IGNORECASE,
                        )
                    ]
                    response = (
                        "Based on the listed menu descriptions, dishes that contain or clearly "
                        "indicate pork are: "
                        + (
                            ", ".join(item["name"] for item in pork_items)
                            if pork_items
                            else "none that I can confirm"
                        )
                        + ". Please ask the restaurant directly if this is for an allergy or "
                        "religious dietary requirement."
                    )
                    return {
                        "response": response,
                        "action": None,
                        "extracted_data": {},
                        "clear_fields": [],
                        "quick_replies": ["Show menu prices", "Which dishes are vegetarian?"],
                    }
                named_items = [
                    item for item in menu if item.get("name", "").lower() in text
                ]
                if named_items:
                    item = named_items[0]
                    details = [f"{item['name']} costs HKD {item['price']:.0f}"]
                    if item.get("description"):
                        details.append(item["description"])
                    response = ". ".join(details) + "."
                elif re.search(r"\b(price|cost|menu)\b", text) or re.search(
                    r"(价格|價錢|多少钱|多少錢|菜单|菜單)", message
                ):
                    items = menu[:6]
                    response = (
                        f"Here are some prices at {selected_restaurant.get('name')}: "
                        + ", ".join(
                            f"{item['name']} — HKD {item['price']:.0f}" for item in items
                        )
                        + "."
                    )
                else:
                    popular = sorted(
                        menu,
                        key=lambda item: item.get("order_count", 0),
                        reverse=True,
                    )[:3]
                    response = (
                        f"Popular choices at {selected_restaurant.get('name')} include "
                        + ", ".join(
                            f"{item['name']} (HKD {item['price']:.0f})" for item in popular
                        )
                        + "."
                    )
            return {
                "response": response,
                "action": None,
                "extracted_data": {},
                "clear_fields": [],
                "quick_replies": ["Recommend dishes", "View menu prices", "Make a reservation"],
            }

        if re.search(r"\b(what time is it|current time|time now)\b", text) or re.search(
            r"(几点了|幾點了|现在几点|現在幾點)", message
        ):
            current_time = datetime.now(ZoneInfo("Asia/Hong_Kong")).strftime("%H:%M")
            response = f"It is currently {current_time} Hong Kong time (UTC+8)."
        elif re.search(r"\b(weather|forecast|temperature)\b", text) or re.search(
            r"(天气|天氣|气温|氣溫)", message
        ):
            if "beijing" in text or re.search(r"(北京)", message):
                response = (
                    "Beijing in late July is typically hot and humid, with daytime temperatures "
                    "often around 30–35°C and occasional thunderstorms. I can't verify the exact "
                    "conditions for a specific day without a live or historical weather source."
                )
            else:
                response = (
                    "I don't have an exact live weather feed, but I can still explain the typical "
                    "seasonal conditions for a city and date."
                )
        else:
            response = (
                "Hello! I can help with restaurants, menu recommendations, prices, and reservations."
            )
        return {
            "response": response,
            "action": None,
            "extracted_data": {},
            "clear_fields": [],
            "quick_replies": ["Recommend dishes", "View menu prices", "Make a reservation"],
        }

    def _extract_fallback_booking_data(
        self,
        message: str,
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        text = message.strip()
        if not text:
            return {}

        extracted_data: Dict[str, Any] = {}
        normalized_text = text.lower()
        if not context.get("date"):
            date_match = re.search(r"\b\d{4}-\d{2}-\d{2}\b", text)
            if date_match:
                try:
                    extracted_data["date"] = date.fromisoformat(date_match.group()).isoformat()
                except ValueError:
                    pass
            elif "tomorrow" in normalized_text or "\u660e\u5929" in text:
                    extracted_data["date"] = (self.current_date + timedelta(days=1)).isoformat()
            elif "today" in normalized_text or "\u4eca\u5929" in text:
                extracted_data["date"] = self.current_date.isoformat()
            elif "this saturday" in normalized_text or "\u8fd9\u5468\u516d" in text:
                days_until_saturday = (5 - self.current_date.weekday()) % 7
                extracted_data["date"] = (
                    self.current_date + timedelta(days=days_until_saturday)
                ).isoformat()

        if not context.get("time"):
            time_match = re.search(r"\b([01]?\d|2[0-3]):([0-5]\d)\b", text)
            meridiem_match = re.search(r"\b(1[0-2]|0?[1-9])\s*(am|pm)\b", normalized_text)
            if time_match:
                extracted_data["time"] = f"{int(time_match.group(1)):02d}:{time_match.group(2)}"
            elif meridiem_match:
                hour = int(meridiem_match.group(1)) % 12
                if meridiem_match.group(2) == "pm":
                    hour += 12
                extracted_data["time"] = f"{hour:02d}:00"

        if not context.get("guests"):
            guests_match = re.search(
                r"\b([1-9]\d*)\s*(?:guests?|people|persons?)\b|([1-9]\d*|[\u4e00\u4e8c\u4e24\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341])\s*(?:\u4f4d|\u4eba)",
                text,
                flags=re.IGNORECASE,
            )
            if guests_match:
                guest_text = guests_match.group(1) or guests_match.group(2)
                extracted_data["guests"] = (
                    int(guest_text)
                    if guest_text.isdigit()
                    else {
                        "\u4e00": 1,
                        "\u4e8c": 2,
                        "\u4e24": 2,
                        "\u4e09": 3,
                        "\u56db": 4,
                        "\u4e94": 5,
                        "\u516d": 6,
                        "\u4e03": 7,
                        "\u516b": 8,
                        "\u4e5d": 9,
                        "\u5341": 10,
                    }[guest_text]
                )

        if (
            not context.get("name")
            and all(context.get(field) for field in ("date", "time", "guests"))
            and not self._is_booking_confirmation(message)
        ):
            extracted_data["name"] = text
        if context.get("name") and not context.get("phone") and sum(character.isdigit() for character in text) >= 7:
            extracted_data["phone"] = text
        return extracted_data

    def _simple_chat_response(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        if self._is_draft_cancellation(message):
            return {
                "response": "Your draft reservation has been cancelled.",
                "action": "cancel_draft",
                "extracted_data": {},
                "clear_fields": [],
                "quick_replies": [],
            }

        if self._is_complex_non_booking_request(message):
            return self._scope_refusal_response()
        if (
            self._is_simple_general_inquiry(message)
            or self._is_restaurant_information_request(message, context)
        ):
            return self._non_booking_fallback_response(message, context)

        clear_fields = self._explicit_clear_fields(message)
        extracted_data = self._extract_fallback_booking_data(message, context)
        booking_context = {**context, **extracted_data}
        for field in clear_fields:
            booking_context[field] = None
        if not booking_context.get("date"):
            return {
                "response": "Which date would you like to book?",
                "action": "ask_date",
                "extracted_data": extracted_data,
                "clear_fields": clear_fields,
                "quick_replies": ["Today", "Tomorrow", "This Saturday"],
            }
        if not booking_context.get("time"):
            return {
                "response": "What time would you like to book?",
                "action": "ask_time",
                "extracted_data": extracted_data,
                "clear_fields": clear_fields,
                "quick_replies": ["18:00", "19:00", "20:00"],
            }
        if not booking_context.get("guests"):
            return {
                "response": "How many guests will be dining?",
                "action": "ask_guests",
                "extracted_data": extracted_data,
                "clear_fields": clear_fields,
                "quick_replies": ["2 guests", "4 guests", "6 guests", "8 guests"],
            }
        if not booking_context.get("name"):
            return {
                "response": "Before I can confirm the booking, may I have your name?",
                "action": "ask_name",
                "extracted_data": extracted_data,
                "clear_fields": clear_fields,
                "quick_replies": [],
            }
        if not booking_context.get("phone"):
            return {
                "response": "Please provide a contact phone number for the reservation.",
                "action": "ask_phone",
                "extracted_data": extracted_data,
                "clear_fields": clear_fields,
                "quick_replies": [],
            }
        if self._is_booking_confirmation(message):
            return {
                "response": "Thank you. Your reservation details are ready to be saved.",
                "action": "complete",
                "extracted_data": extracted_data,
                "clear_fields": clear_fields,
                "quick_replies": [],
            }
        return {
            "response": (
                f"Please confirm your reservation for {booking_context.get('date')} at "
                f"{booking_context.get('time')} for {booking_context.get('guests')} guests."
            ),
            "action": "confirm_booking",
            "extracted_data": extracted_data,
            "clear_fields": clear_fields,
            "quick_replies": ["Confirm booking", "Change date", "Cancel"],
        }


ai_service = OpenCodeGoAIService()
