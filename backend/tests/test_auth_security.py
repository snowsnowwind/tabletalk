import asyncio
import unittest

from app.routers.auth import register
from app.schemas.user import UserCreate, UserRole
from app.services.auth import get_password_hash, verify_password


class _EmptyQuery:
    def filter(self, *args):
        return self

    def first(self):
        return None


class _RegistrationDatabase:
    def __init__(self):
        self.added_user = None

    def query(self, model):
        return _EmptyQuery()

    def add(self, user):
        self.added_user = user

    def commit(self):
        pass

    def refresh(self, user):
        user.id = 1


class AuthenticationSecurityTests(unittest.TestCase):
    def test_password_hash_is_not_plaintext_and_verifies_only_correct_password(self):
        encoded = get_password_hash("correct horse battery staple")

        self.assertNotEqual(encoded, "correct horse battery staple")
        self.assertTrue(verify_password("correct horse battery staple", encoded))
        self.assertFalse(verify_password("wrong password", encoded))

    def test_malformed_or_legacy_password_value_fails_closed(self):
        self.assertFalse(verify_password("submitted password", "not-a-password-hash"))

    def test_passwords_that_differ_after_72_bytes_are_not_interchangeable(self):
        first = ("a" * 72) + "X"
        second = ("a" * 72) + "Y"
        encoded = get_password_hash(first)

        self.assertTrue(verify_password(first, encoded))
        self.assertFalse(verify_password(second, encoded))

    def test_registration_persists_a_hash_instead_of_the_submitted_password(self):
        database = _RegistrationDatabase()
        request = UserCreate(
            email="ada@example.com",
            password="correct horse battery staple",
            name="Ada Lovelace",
        )

        asyncio.run(register(request, database))

        self.assertIsNotNone(database.added_user)
        self.assertNotEqual(
            database.added_user.hashed_password,
            "correct horse battery staple",
        )
        self.assertTrue(
            verify_password(
                "correct horse battery staple",
                database.added_user.hashed_password,
            )
        )

    def test_public_registration_cannot_create_an_admin_account(self):
        database = _RegistrationDatabase()
        request = UserCreate(
            email="attacker@example.com",
            password="correct horse battery staple",
            name="Normal Customer",
            role=UserRole.ADMIN,
        )

        asyncio.run(register(request, database))

        self.assertEqual(database.added_user.role.value, "customer")


if __name__ == "__main__":
    unittest.main()
