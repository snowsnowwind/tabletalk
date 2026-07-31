import unittest
from datetime import date

from pydantic import ValidationError

from app.schemas.reservation import ReservationCreate


class ReservationSchemaTests(unittest.TestCase):
    def test_rejects_zero_guests(self):
        with self.assertRaises(ValidationError):
            ReservationCreate(
                restaurant_id=3,
                date='2026-12-31T00:00:00',
                time='19:00',
                guests=0,
            )

    def test_rejects_non_hhmm_time(self):
        with self.assertRaises(ValidationError):
            ReservationCreate(
                restaurant_id=3,
                date='2026-12-31T00:00:00',
                time='tomorrow evening',
                guests=2,
            )

    def test_rejects_boolean_guest_count(self):
        with self.assertRaises(ValidationError):
            ReservationCreate(
                restaurant_id=3,
                date='2026-12-31T00:00:00',
                time='19:00',
                guests=True,
            )

    def test_rejects_noncanonical_hhmm_time(self):
        with self.assertRaises(ValidationError):
            ReservationCreate(
                restaurant_id=3,
                date='2026-12-31T00:00:00',
                time='7:00',
                guests=2,
            )

    def test_rejects_placeholder_phone_number(self):
        with self.assertRaises(ValidationError):
            ReservationCreate(
                restaurant_id=3,
                date='2026-12-31T00:00:00',
                time='19:00',
                guests=2,
                guest_phone='00000000',
            )

    def test_rejects_a_date_before_the_configured_booking_date(self):
        with self.assertRaisesRegex(ValidationError, "past"):
            ReservationCreate.model_validate(
                {
                    "restaurant_id": 3,
                    "date": "2026-08-09T00:00:00",
                    "time": "19:00",
                    "guests": 2,
                },
                context={"booking_date": date(2026, 8, 10)},
            )

    def test_accepts_the_configured_booking_date(self):
        reservation = ReservationCreate.model_validate(
            {
                "restaurant_id": 3,
                "date": "2026-08-10T00:00:00",
                "time": "19:00",
                "guests": 2,
            },
            context={"booking_date": date(2026, 8, 10)},
        )

        self.assertEqual(reservation.date.date(), date(2026, 8, 10))


if __name__ == '__main__':
    unittest.main()
