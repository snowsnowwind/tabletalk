import unittest
from datetime import date

from app.ai.booking_prompts import (
    build_controlled_booking_prompt,
    build_direct_payload_prompt,
    build_prompt_only_confirmation_prompt,
)


class BookingPromptTests(unittest.TestCase):
    def test_controlled_prompt_contains_complete_transaction_policy(self):
        prompt = build_controlled_booking_prompt(
            date(2026, 8, 10),
            {"restaurant_id": 3, "special_requests": "Window seat"},
        )

        self.assertIn("Current date: 2026-08-10", prompt)
        self.assertIn('"restaurant_id": 3', prompt)
        self.assertIn("clear_fields", prompt)
        self.assertIn("cancel_draft", prompt)
        self.assertIn("Only use complete after the\nuser explicitly confirms", prompt)

    def test_direct_payload_prompt_discloses_the_absence_of_application_controls(self):
        prompt = build_direct_payload_prompt(
            current_date=date(2026, 8, 10),
            selected_restaurant={"id": 3, "name": "La Maison"},
            initial_state={"restaurant_id": 3},
            transcript=[{"role": "user", "content": "Book tomorrow"}],
        )

        self.assertIn("direct-payload", prompt)
        self.assertIn("There is no separate", prompt)
        self.assertIn('"id": 3', prompt)

    def test_prompt_only_baseline_states_confirmation_rule_without_code_guard(self):
        prompt = build_prompt_only_confirmation_prompt(
            current_date=date(2026, 8, 10),
            selected_restaurant={"id": 3, "name": "La Maison"},
            current_state={"restaurant_id": 3, "date": "2026-08-11"},
            transcript=[{"role": "user", "content": "Yes, confirm it"}],
        )

        self.assertIn("prompt-only confirmation baseline", prompt)
        self.assertIn("explicitly confirms in the current user turn", prompt)
        self.assertIn("No application code will correct your action", prompt)
        self.assertIn('"restaurant_id": 3', prompt)


if __name__ == "__main__":
    unittest.main()
