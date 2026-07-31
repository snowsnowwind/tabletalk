import asyncio
import unittest

from fastapi import HTTPException

from app.routers.reservations import create_reservation
from app.schemas.reservation import ReservationCreate


class _Restaurant:
    def __init__(self, is_active):
        self.id = 3
        self.is_active = is_active


class _Query:
    def __init__(self, restaurant):
        self.restaurant = restaurant

    def filter(self, *args):
        return self

    def first(self):
        return self.restaurant


class _Database:
    def __init__(self, restaurant):
        self.restaurant = restaurant

    def query(self, model):
        return _Query(self.restaurant)

    def add(self, reservation):
        pass

    def commit(self):
        pass

    def refresh(self, reservation):
        pass


class ReservationRouteTests(unittest.TestCase):
    def test_rejects_an_inactive_restaurant(self):
        reservation_data = ReservationCreate(
            restaurant_id=3,
            date='2026-12-31T00:00:00',
            time='19:00',
            guests=2,
            guest_name='Ada',
            guest_phone='+85212345678',
        )

        with self.assertRaises(HTTPException) as error:
            asyncio.run(create_reservation(reservation_data, _Database(_Restaurant(False)), None))

        self.assertEqual(error.exception.status_code, 404)

    def test_rejects_a_placeholder_phone_from_a_logged_in_user(self):
        reservation_data = ReservationCreate(
            restaurant_id=3,
            date='2026-12-31T00:00:00',
            time='19:00',
            guests=2,
        )
        user = type('User', (), {
            'id': 1,
            'name': 'Ada',
            'phone': '00000000',
            'email': 'ada@example.com',
        })()

        with self.assertRaises(HTTPException) as error:
            asyncio.run(create_reservation(reservation_data, _Database(_Restaurant(True)), user))

        self.assertEqual(error.exception.status_code, 400)


if __name__ == '__main__':
    unittest.main()
