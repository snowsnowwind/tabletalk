const requiredFields = ['date', 'time', 'guests', 'name', 'phone'];
const userOwnedFields = new Set([...requiredFields, 'special_requests']);
const emptyBookingState = Object.freeze({
    restaurant_id: null,
    date: null,
    time: null,
    guests: null,
    name: null,
    phone: null,
    special_requests: null,
});

export function assistantMessageForDisplay(data = {}) {
    if (data.action === 'cancel_draft') {
        return 'Your draft reservation has been cancelled.';
    }
    if (data.action === 'complete') {
        return 'Your reservation details are ready for review.';
    }
    return data.response || '';
}

export function normaliseReservationTime(value) {
    const time = String(value || '').trim();
    if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        return time;
    }

    const match = time.match(/^(1[0-2]|[1-9]):([0-5]\d)\s*(AM|PM)$/i);
    if (!match) {
        throw new Error('Reservation time must use HH:MM or h:mm AM/PM format');
    }

    let hour = Number(match[1]) % 12;
    if (match[3].toUpperCase() === 'PM') {
        hour += 12;
    }
    return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

export function buildManualReservationPayload(formData, restaurantId) {
    const guests = Number(formData.guests);
    if (!Number.isInteger(guests) || guests < 1) {
        throw new Error('Guest count must be a positive whole number');
    }

    return {
        restaurant_id: Number(restaurantId),
        date: formData.date.includes('T') ? formData.date : `${formData.date}T00:00:00`,
        time: normaliseReservationTime(formData.time),
        guests,
        guest_name: formData.name.trim(),
        guest_phone: formData.phone.trim(),
        guest_email: formData.email?.trim() || null,
        special_requests:
            [formData.specialRequests, formData.dietaryRestrictions]
                .filter(Boolean)
                .join('\n') || null,
    };
}

export function mergeBookingData(context, extractedData = {}, clearFields = []) {
    const merged = {
        ...context,
        ...Object.fromEntries(
            Object.entries(extractedData).filter(
                ([key, value]) => key !== 'restaurant_id' && value !== null && value !== '',
            ),
        ),
    };
    for (const field of clearFields) {
        if (userOwnedFields.has(field)) {
            merged[field] = null;
        }
    }
    return merged;
}

export function applyAssistantTurn(context, data = {}) {
    if (data.action === 'cancel_draft') {
        return {
            bookingData: { ...emptyBookingState },
            cancelled: true,
            shouldPersist: false,
        };
    }
    return {
        bookingData: mergeBookingData(
            context,
            data.extracted_data,
            Array.isArray(data.clear_fields) ? data.clear_fields : [],
        ),
        cancelled: false,
        shouldPersist: data.action === 'complete',
    };
}

export function buildReservationPayload(bookingData, restaurants) {
    const missing = requiredFields.filter((field) => !bookingData[field]);
    if (missing.length) {
        throw new Error(`Missing booking information: ${missing.join(', ')}`);
    }

    const guests = Number(bookingData.guests);
    if (!Number.isInteger(guests) || guests < 1) {
        throw new Error('Guest count must be at least 1');
    }

    const restaurantId = Number(bookingData.restaurant_id);
    if (
        typeof bookingData.restaurant_id === 'boolean' ||
        !Number.isInteger(restaurantId) ||
        restaurantId < 1
    ) {
        throw new Error('restaurant selection is required');
    }

    const restaurant = restaurants.find(({ id }) => id === restaurantId);
    if (!restaurant) {
        throw new Error('selected restaurant is not available');
    }

    return {
        restaurant,
        payload: {
            restaurant_id: restaurant.id,
            date: bookingData.date.includes('T') ? bookingData.date : `${bookingData.date}T00:00:00`,
            time: bookingData.time,
            guests,
            guest_name: bookingData.name.trim(),
            guest_phone: bookingData.phone.trim(),
            special_requests: bookingData.special_requests || null,
        },
    };
}
