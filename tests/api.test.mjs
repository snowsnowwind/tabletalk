import assert from 'node:assert/strict';
import test from 'node:test';

const storage = new Map();
globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
};

const { apiService } = await import('../src/services/api.js');

test('posts a reservation after an earlier network failure', async () => {
    const originalFetch = globalThis.fetch;
    const originalConsoleError = console.error;
    const calls = [];
    apiService.useMock = false;
    console.error = () => {};
    globalThis.fetch = async (url, options = {}) => {
        calls.push({ url, options });
        if (calls.length === 1) {
            throw new TypeError('Failed to fetch');
        }
        return new Response(JSON.stringify({ confirmation_code: 'REAL1234' }), { status: 200 });
    };

    try {
        await assert.rejects(() => apiService.getRestaurants(), /Failed to fetch/);
        const reservation = await apiService.createReservation({ restaurant_id: 1 });

        assert.equal(reservation.confirmation_code, 'REAL1234');
        assert.equal(calls.length, 2);
        assert.equal(calls[1].url, '/api/reservations');
        assert.equal(calls[1].options.method, 'POST');
    } finally {
        apiService.useMock = false;
        globalThis.fetch = originalFetch;
        console.error = originalConsoleError;
    }
});

test('sends the selected AI provider with chat requests', async () => {
    const originalFetch = globalThis.fetch;
    let requestBody;
    globalThis.fetch = async (_url, options = {}) => {
        requestBody = JSON.parse(options.body);
        return new Response(JSON.stringify({
            response: 'How can I help?',
            action: null,
            extracted_data: {},
            clear_fields: [],
            quick_replies: [],
        }), { status: 200 });
    };

    try {
        await apiService.chatWithAssistant('Hello', [], {}, 'deepseek');
        assert.equal(requestBody.provider, 'deepseek');
    } finally {
        globalThis.fetch = originalFetch;
    }
});
