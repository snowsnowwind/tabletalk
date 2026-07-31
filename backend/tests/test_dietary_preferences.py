import asyncio
import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock

from app.routers.auth import update_dietary_preferences
from app.schemas.user import DietaryPreferencesUpdate


class DietaryPreferencesTests(unittest.TestCase):
    def test_update_dietary_preferences_merges_and_persists_current_user_data(self):
        user = SimpleNamespace(
            preferences={"theme": "dark"},
        )
        database = MagicMock()
        payload = DietaryPreferencesUpdate(
            dietary_restrictions=["Vegetarian", "Low Sodium"],
            allergies=["Peanuts"],
            notes="Please avoid cross-contact.",
        )

        result = asyncio.run(
            update_dietary_preferences(
                preference_data=payload,
                db=database,
                current_user=user,
            )
        )

        self.assertEqual(
            result.preferences,
            {
                "theme": "dark",
                "dietary": {
                    "dietary_restrictions": ["Vegetarian", "Low Sodium"],
                    "allergies": ["Peanuts"],
                    "notes": "Please avoid cross-contact.",
                },
            },
        )
        database.commit.assert_called_once_with()
        database.refresh.assert_called_once_with(user)


if __name__ == "__main__":
    unittest.main()
