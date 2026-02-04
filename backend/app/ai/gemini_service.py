"""
Gemini AI Service for recommendations and chat
"""
import google.generativeai as genai
from typing import List, Dict, Any, Optional
import json

from ..config import get_settings

settings = get_settings()


class GeminiAIService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        
        # Configure Proxy explicitly if set
        if settings.https_proxy:
            import os
            os.environ["HTTPS_PROXY"] = settings.https_proxy
            os.environ["HTTP_PROXY"] = settings.https_proxy
            
        self.model = None
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use the model found in list_models (gemini-2.5-flash)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def is_available(self) -> bool:
        """Check if Gemini API is configured"""
        return self.model is not None
    
    async def get_restaurant_recommendations(
        self,
        restaurants: List[Dict[str, Any]],
        user_role: str,
        scenario: str,
        budget_level: int,
        cuisine_preference: Optional[str] = None,
        guest_count: Optional[int] = None,
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """Get AI-powered restaurant recommendations"""
        
        if not self.is_available():
            # Fallback to simple scoring if API not available
            return self._simple_recommendation(restaurants, budget_level, cuisine_preference, top_n)
        
        # Build prompt
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

Please return a JSON array with the top {top_n} recommendations. Each recommendation should have:
- id: Restaurant ID
- name: Restaurant name
- cuisine: Cuisine type
- rating: Rating
- price_level: Price level
- score: Your match score (0-10)
- reason: Brief explanation why this is a good match (in Chinese)

Return ONLY the JSON array, no other text."""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            # Parse JSON from response
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            recommendations = json.loads(result_text.strip())
            return recommendations[:top_n]
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._simple_recommendation(restaurants, budget_level, cuisine_preference, top_n)
    
    async def get_menu_recommendations(
        self,
        menu_items: List[Dict[str, Any]],
        guest_count: int,
        budget_per_person: Optional[float] = None,
        dietary_restrictions: List[str] = [],
        occasion: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get AI-powered menu recommendations"""
        
        if not self.is_available():
            return self._simple_menu_recommendation(menu_items, guest_count, budget_per_person)
        
        prompt = f"""You are a restaurant menu expert. Please recommend a balanced menu for:

Event Details:
- Guest Count: {guest_count}
- Budget per Person: {'HK$' + str(budget_per_person) if budget_per_person else 'Not specified'}
- Dietary Restrictions: {', '.join(dietary_restrictions) if dietary_restrictions else 'None'}
- Occasion: {occasion or 'General dining'}

Available Menu Items:
{json.dumps(menu_items, indent=2)}

Please return a JSON object with:
- items: Array of recommended items, each with:
  - id: Menu item ID
  - name: Item name
  - category: Category
  - price: Price
  - reason: Why this item is recommended (in Chinese)
  - is_must_try: Boolean indicating if it's a signature dish
- total_cost: Estimated total cost
- ai_notes: General dining suggestions (in Chinese)

Return ONLY the JSON object, no other text."""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            return json.loads(result_text.strip())
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._simple_menu_recommendation(menu_items, guest_count, budget_per_person)
    
    async def optimize_event_flow(
        self,
        current_flow: List[Dict[str, Any]],
        guest_count: int,
        event_type: str,
        special_requirements: Optional[str] = None
    ) -> Dict[str, Any]:
        """AI-powered event flow optimization"""
        
        if not self.is_available():
            return {"optimized_flow": current_flow, "suggestions": [], "warnings": []}
        
        prompt = f"""You are an event planning expert. Please optimize the following event flow:

Event Details:
- Type: {event_type}
- Guest Count: {guest_count}
- Special Requirements: {special_requirements or 'None'}

Current Event Flow:
{json.dumps(current_flow, indent=2)}

Please return a JSON object with:
- optimized_flow: Array of optimized steps, each with:
  - step_order: Order number
  - title: Step title
  - suggested_time: Suggested start time
  - duration_minutes: Suggested duration
  - notes: Tips for this step (in Chinese)
  - improvement_reason: Why this change was made (if any, in Chinese)
- suggestions: Array of general suggestions (in Chinese)
- warnings: Array of potential issues to watch out for (in Chinese)

Return ONLY the JSON object, no other text."""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            return json.loads(result_text.strip())
        except Exception as e:
            print(f"Gemini API error: {e}")
            return {"optimized_flow": current_flow, "suggestions": [], "warnings": []}
    
    async def chat_assistant(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """AI chat assistant for booking"""
        
        if not self.is_available():
            return self._simple_chat_response(message, context)
        
        # Build conversation context
        history_text = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in conversation_history[-5:]  # Last 5 messages
        ])
        
        prompt = f"""You are a friendly restaurant booking assistant for a fine dining restaurant.
Help the user make a reservation by gathering necessary information.

Current Booking State:
{json.dumps(context, indent=2)}

Conversation History:
{history_text}

User's Latest Message: {message}

Please respond in a helpful, conversational manner (in Chinese).
Return a JSON object with:
- response: Your reply to the user (in Chinese)
- action: Next action (one of: "ask_date", "ask_time", "ask_guests", "ask_name", "ask_phone", "confirm_booking", "complete", null)
- extracted_data: Any booking information extracted from the message (e.g., {{"date": "2024-02-15", "guests": 4}})
- quick_replies: Array of suggested quick reply options (in Chinese)

Return ONLY the JSON object, no other text."""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            return json.loads(result_text.strip())
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._simple_chat_response(message, context)
    
    # Fallback methods when API is not available
    def _simple_recommendation(
        self, 
        restaurants: List[Dict], 
        budget_level: int,
        cuisine_preference: Optional[str],
        top_n: int
    ) -> List[Dict]:
        """Simple rule-based recommendation"""
        scored = []
        for r in restaurants:
            score = 5.0  # Base score
            
            # Budget match
            if r.get('price_level', 3) <= budget_level:
                score += 2.0
            
            # Rating boost
            score += r.get('rating', 4.0) / 2
            
            # Cuisine match
            if cuisine_preference and cuisine_preference.lower() in r.get('cuisine', '').lower():
                score += 3.0
            
            scored.append({
                **r,
                'score': min(score, 10.0),
                'reason': f"评分 {r.get('rating', 4.0)}，价位适中" if r.get('price_level', 3) <= budget_level else "高评分餐厅"
            })
        
        scored.sort(key=lambda x: x['score'], reverse=True)
        return scored[:top_n]
    
    def _simple_menu_recommendation(
        self,
        menu_items: List[Dict],
        guest_count: int,
        budget_per_person: Optional[float]
    ) -> Dict[str, Any]:
        """Simple menu recommendation"""
        # Select variety of items
        categories = {}
        for item in menu_items:
            cat = item.get('category', 'other')
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(item)
        
        selected = []
        for cat, items in categories.items():
            if items:
                selected.append({
                    **items[0],
                    'reason': '该类别推荐菜品',
                    'is_must_try': items[0].get('order_count', 0) > 10
                })
        
        total = sum(item.get('price', 0) for item in selected) * guest_count
        
        return {
            'items': selected[:8],
            'total_cost': total,
            'ai_notes': f'为{guest_count}位客人精选的菜单组合'
        }
    
    def _simple_chat_response(self, message: str, context: Dict) -> Dict[str, Any]:
        """Simple chat response without AI"""
        # Determine next action based on context
        if not context.get('date'):
            return {
                'response': '请问您想预订哪一天呢？',
                'action': 'ask_date',
                'extracted_data': {},
                'quick_replies': ['今天', '明天', '这周六']
            }
        elif not context.get('time'):
            return {
                'response': '请问您想订什么时间的位？',
                'action': 'ask_time',
                'extracted_data': {},
                'quick_replies': ['18:00', '19:00', '20:00']
            }
        elif not context.get('guests'):
            return {
                'response': '请问一共几位用餐？',
                'action': 'ask_guests',
                'extracted_data': {},
                'quick_replies': ['2位', '4位', '6位', '8位']
            }
        else:
            return {
                'response': f"好的，为您确认：{context.get('date')} {context.get('time')}，{context.get('guests')}位。请确认预订？",
                'action': 'confirm_booking',
                'extracted_data': {},
                'quick_replies': ['确认预订', '修改日期', '取消']
            }


# Singleton instance
gemini_service = GeminiAIService()
