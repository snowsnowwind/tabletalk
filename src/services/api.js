/**
 * TableTalk API Service
 * Connects to the FastAPI backend for all operations
 */

// Use the configured public backend in production. During local/ngrok development,
// same-origin /api requests are forwarded to FastAPI by Vite.
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';

// Set to true to use mock data when backend is unavailable
const USE_MOCK_DATA = false;

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.useMock = USE_MOCK_DATA;
        this.token = localStorage.getItem('authToken');
    }

    // Set auth token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Clear auth token (logout)
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Get auth headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Helper method for making API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                this.clearToken();
                // Optionally redirect to login
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // ==================== AUTHENTICATION ====================

    async register(email, password, name, phone = null, role = 'customer') {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, phone, role }),
        });
    }

    async login(email, password) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (response.access_token) {
            this.setToken(response.access_token);
        }
        return response;
    }

    async getCurrentUser() {
        return this.request('/api/auth/me');
    }

    async updateDietaryPreferences(data) {
        return this.request('/api/auth/me/dietary-preferences', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    logout() {
        this.clearToken();
    }

    // ==================== RESTAURANTS ====================

    async getRestaurants(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/api/restaurants${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    async getRestaurantById(id) {
        return this.request(`/api/restaurants/${id}`);
    }

    async getRestaurantMenu(restaurantId, category = null) {
        let endpoint = `/api/restaurants/${restaurantId}/menu`;
        if (category) {
            endpoint += `?category=${category}`;
        }
        return this.request(endpoint);
    }

    async createMenuItem(restaurantId, itemData) {
        return this.request(`/api/restaurants/${restaurantId}/menu`, {
            method: 'POST',
            body: JSON.stringify(itemData)
        });
    }

    async updateMenuItem(itemId, itemData) {
        return this.request(`/api/restaurants/menu/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(itemData)
        });
    }

    async deleteMenuItem(itemId) {
        return this.request(`/api/restaurants/menu/${itemId}`, {
            method: 'DELETE'
        });
    }


    // ==================== MOCK DATA HELPERS ====================


    async getMyReservations(status = null) {
        let endpoint = '/api/reservations';
        if (status) {
            endpoint += `?status=${status}`;
        }
        return this.request(endpoint);
    }

    async createReservation(data) {
        return await this.request('/api/reservations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getReservationById(id) {
        return this.request(`/api/reservations/${id}`);
    }

    async updateReservation(id, data) {
        return this.request(`/api/reservations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async cancelReservation(id) {
        return this.request(`/api/reservations/${id}`, {
            method: 'DELETE',
        });
    }

    // Staff endpoints
    async getAllReservations(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/reservations/staff/all?${queryString}`);
    }

    async updateReservationStatus(id, status, tableNumber = null) {
        let endpoint = `/api/reservations/staff/${id}/status?status=${status}`;
        if (tableNumber) {
            endpoint += `&table_number=${tableNumber}`;
        }
        return this.request(endpoint, { method: 'PUT' });
    }

    // ==================== CORPORATE EVENTS ====================

    async getMyEvents() {
        return this.request('/api/events');
    }

    async createEvent(data) {
        return this.request('/api/events', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getEventById(id) {
        return this.request(`/api/events/${id}`);
    }

    async updateEvent(id, data) {
        return this.request(`/api/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteEvent(id) {
        return this.request(`/api/events/${id}`, {
            method: 'DELETE',
        });
    }

    async addEventFlow(eventId, flowData) {
        return this.request(`/api/events/${eventId}/flow`, {
            method: 'POST',
            body: JSON.stringify(flowData),
        });
    }

    // ==================== AI FEATURES ====================

    async getRecommendations(params) {
        if (this.useMock) {
            return this.getMockRecommendations(params);
        }

        try {
            return await this.request('/api/ai/recommend/restaurants', {
                method: 'POST',
                body: JSON.stringify({
                    user_role: params.user_role || 'customer',
                    scenario: params.scenario || 'dinner',
                    budget_level: params.budget_level || 3,
                    cuisine_preference: params.cuisine_preference || null,
                    guest_count: params.guest_count || null,
                    top_n: params.top_n || 5,
                }),
            });
        } catch (error) {
            console.log('AI recommendation failed, using mock data');
            return this.getMockRecommendations(params);
        }
    }

    async getMenuRecommendations(params) {
        return this.request('/api/ai/recommend/menu', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    async optimizeEventFlow(params) {
        return this.request('/api/ai/optimize/event', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    async chatWithAssistant(message, conversationHistory = [], context = {}, provider = 'opencode_go') {
        try {
            return await this.request('/api/ai/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message,
                    conversation_history: conversationHistory,
                    context,
                    provider,
                }),
            });
        } catch (error) {
            console.error("AI Error:", error);
            // Fallback response if AI is unavailable
            return {
                response: 'Sorry, the AI assistant is temporarily unavailable. Please use the booking form.',
                action: null,
                extracted_data: {},
                quick_replies: ['Use booking form'],
            };
        }
    }

    async getUserPreferences() {
        return this.request('/api/ai/preferences');
    }

    async getAIStatus() {
        return this.request('/api/ai/status');
    }

    // ==================== MOCK DATA ====================

    getMockRecommendations(params) {
        const mockRestaurants = [
            {
                id: 1,
                name: "Table Talk",
                cuisine: "Chinese",
                rating: 4.8,
                price_level: 4,
                score: 9.2,
                reason: "精选粤菜，适合商务宴请，包房服务",
                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
                address: "123 Canton Road, Tsim Sha Tsui",
            },
            {
                id: 2,
                name: "Sakura House",
                cuisine: "Japanese",
                rating: 4.7,
                price_level: 3,
                score: 8.9,
                reason: "新鲜刺身，正宗日式氛围",
                image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800",
                address: "456 Nathan Road, Jordan",
            },
            {
                id: 3,
                name: "La Maison",
                cuisine: "French",
                rating: 4.9,
                price_level: 5,
                score: 8.7,
                reason: "米其林星级法国料理，特殊场合首选",
                image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
                address: "789 Central Plaza",
            },
            {
                id: 4,
                name: "Mama Mia Trattoria",
                cuisine: "Italian",
                rating: 4.5,
                price_level: 2,
                score: 8.5,
                reason: "家庭式意大利菜，手工意面",
                image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
                address: "321 Queen's Road, Wan Chai",
            },
            {
                id: 5,
                name: "Seoul Kitchen",
                cuisine: "Korean",
                rating: 4.6,
                price_level: 3,
                score: 8.3,
                reason: "正宗韩国烤肉，适合聚餐",
                image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800",
                address: "654 Kimberley Road, TST",
            },
        ];

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    recommendations: mockRestaurants.slice(0, params.top_n || 5),
                    total: mockRestaurants.length,
                });
            }, 500);
        });
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
