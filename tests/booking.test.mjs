import assert from 'node:assert/strict';
import test from 'node:test';

import {
    applyAssistantTurn,
    assistantMessageForDisplay,
    buildManualReservationPayload,
    buildReservationPayload,
    mergeBookingData,
} from '../src/utils/booking.js';

const restaurants = [{ id: 3, name: 'La Maison' }];

test('keeps collected booking details when AI returns empty values', () => {
    const booking = mergeBookingData(
        { date: '2026-12-31', time: '19:00', guests: 2, name: 'Ada', phone: '+85212345678' },
        { date: null, guests: '', special_requests: 'Window seat' },
    );

    assert.equal(booking.date, '2026-12-31');
    assert.equal(booking.guests, 2);
    assert.equal(booking.special_requests, 'Window seat');
});

test('keeps the restaurant selected by the user when AI returns a restaurant ID', () => {
    const booking = mergeBookingData(
        { restaurant_id: 3, date: '2026-12-31' },
        { restaurant_id: 1, time: '19:00' },
    );

    assert.equal(booking.restaurant_id, 3);
    assert.equal(booking.time, '19:00');
});

test('refuses to create a reservation with missing contact details', () => {
    assert.throws(
        () => buildReservationPayload({ date: '2026-12-31', time: '19:00', guests: 2 }, restaurants),
        /Missing booking information: name, phone/,
    );
});

test('refuses a reservation without an explicitly selected restaurant', () => {
    assert.throws(
        () => buildReservationPayload(
            { date: '2026-12-31', time: '19:00', guests: 2, name: 'Ada', phone: '+85212345678' },
            restaurants,
        ),
        /restaurant selection/,
    );
});

test('refuses a reservation for an unknown restaurant', () => {
    assert.throws(
        () => buildReservationPayload(
            { restaurant_id: 999, date: '2026-12-31', time: '19:00', guests: 2, name: 'Ada', phone: '+85212345678' },
            restaurants,
        ),
        /not available/,
    );
});

test('uses a real restaurant ID and normalizes the reservation date', () => {
    const { restaurant, payload } = buildReservationPayload(
        { restaurant_id: 3, date: '2026-12-31', time: '19:00', guests: '2', name: 'Ada', phone: '+85212345678' },
        restaurants,
    );

    assert.equal(restaurant.id, 3);
    assert.deepEqual(payload, {
        restaurant_id: 3,
        date: '2026-12-31T00:00:00',
        time: '19:00',
        guests: 2,
        guest_name: 'Ada',
        guest_phone: '+85212345678',
        special_requests: null,
    });
});

test('manual reservation submits a displayed 12-hour time in canonical 24-hour format', () => {
    const payload = buildManualReservationPayload(
        {
            date: '2026-12-31',
            time: '7:30 PM',
            guests: '2',
            name: 'Ada',
            phone: '+85212345678',
            email: '',
            specialRequests: '',
            dietaryRestrictions: '',
        },
        3,
    );

    assert.equal(payload.time, '19:30');
});

test('manual reservation rejects a fractional or partially numeric guest count', () => {
    const baseForm = {
        date: '2026-12-31',
        time: '19:30',
        name: 'Ada',
        phone: '+85212345678',
        email: '',
        specialRequests: '',
        dietaryRestrictions: '',
    };

    assert.throws(
        () => buildManualReservationPayload({ ...baseForm, guests: '2.5' }, 3),
        /whole number/,
    );
    assert.throws(
        () => buildManualReservationPayload({ ...baseForm, guests: '2people' }, 3),
        /whole number/,
    );
});

test('does not display model-authored completion wording before persistence succeeds', () => {
    assert.equal(
        assistantMessageForDisplay({
            action: 'complete',
            response: 'Your booking is confirmed!',
        }),
        'Your reservation details are ready for review.',
    );
    assert.equal(
        assistantMessageForDisplay({
            action: 'ask_phone',
            response: 'What phone number should we use?',
        }),
        'What phone number should we use?',
    );
});

test('applies an explicit optional-field clear without allowing restaurant authority changes', () => {
    const result = applyAssistantTurn(
        {
            restaurant_id: 3,
            date: '2026-12-31',
            time: '19:30',
            guests: 2,
            name: 'Ada',
            phone: '+85212345678',
            special_requests: 'Window seat',
        },
        {
            action: 'confirm_booking',
            extracted_data: { restaurant_id: 99 },
            clear_fields: ['special_requests', 'restaurant_id'],
        },
    );

    assert.equal(result.cancelled, false);
    assert.equal(result.shouldPersist, false);
    assert.equal(result.bookingData.special_requests, null);
    assert.equal(result.bookingData.restaurant_id, 3);
});

test('cancelling a draft clears its state and never requests persistence', () => {
    const result = applyAssistantTurn(
        {
            restaurant_id: 3,
            date: '2026-12-31',
            time: '19:30',
            guests: 2,
            name: 'Ada',
            phone: '+85212345678',
            special_requests: 'Window seat',
        },
        { action: 'cancel_draft', response: 'Booking confirmed.' },
    );

    assert.equal(result.cancelled, true);
    assert.equal(result.shouldPersist, false);
    assert.deepEqual(result.bookingData, {
        restaurant_id: null,
        date: null,
        time: null,
        guests: null,
        name: null,
        phone: null,
        special_requests: null,
    });
    assert.equal(
        assistantMessageForDisplay({ action: 'cancel_draft', response: 'Booking confirmed.' }),
        'Your draft reservation has been cancelled.',
    );
});
