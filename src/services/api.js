// API Configuration
// Change this to your backend URL when available
const API_BASE_URL = 'https://faucial-elderly-lupita.ngrok-free.dev';

// Set to true to use mock data when backend is unavailable
const USE_MOCK_DATA = true;

// API Service for TableTalk
class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.useMock = USE_MOCK_DATA;
    }

    // Helper method for making API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Get restaurant recommendations from AI
    async getRecommendations(userId, scenario, topN = 5) {
        if (this.useMock) {
            return this.getMockRecommendations(userId, scenario, topN);
        }

        return this.request('/recommend', {
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
                scenario: scenario,
                top_n: topN,
            }),
        });
    }

    // Mock data for development
    getMockRecommendations(userId, scenario, topN) {
        const mockRestaurants = [
            {
                id: 1,
                name: "Golden Palace",
                cuisine: "Chinese",
                rating: 4.8,
                price_level: 4,
                score: 9.2,
                reason: "Perfect for business dinners with private rooms available",
                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
                address: "123 Main Street, Central District",
                phone: "+852 1234 5678"
            },
            {
                id: 2,
                name: "Sakura Garden",
                cuisine: "Japanese",
                rating: 4.7,
                price_level: 3,
                score: 8.9,
                reason: "Excellent sushi and authentic Japanese atmosphere",
                image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800",
                address: "456 Harbor Road, Wan Chai",
                phone: "+852 2345 6789"
            },
            {
                id: 3,
                name: "Trattoria Milano",
                cuisine: "Italian",
                rating: 4.6,
                price_level: 3,
                score: 8.7,
                reason: "Romantic setting with handmade pasta",
                image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
                address: "789 Queen's Road, Sheung Wan",
                phone: "+852 3456 7890"
            },
            {
                id: 4,
                name: "Le Petit Bistro",
                cuisine: "French",
                rating: 4.9,
                price_level: 5,
                score: 8.5,
                reason: "Michelin-starred French cuisine for special occasions",
                image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800",
                address: "321 Peak Road, The Peak",
                phone: "+852 4567 8901"
            },
            {
                id: 5,
                name: "Spice Route",
                cuisine: "Indian",
                rating: 4.5,
                price_level: 2,
                score: 8.3,
                reason: "Best value with authentic North Indian flavors",
                image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
                address: "654 Nathan Road, Tsim Sha Tsui",
                phone: "+852 5678 9012"
            },
            {
                id: 6,
                name: "Seoul Kitchen",
                cuisine: "Korean",
                rating: 4.6,
                price_level: 2,
                score: 8.1,
                reason: "Great for group dinners with BBQ tables",
                image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800",
                address: "987 Hennessy Road, Causeway Bay",
                phone: "+852 6789 0123"
            },
            {
                id: 7,
                name: "Thai Orchid",
                cuisine: "Thai",
                rating: 4.4,
                price_level: 2,
                score: 7.9,
                reason: "Authentic Thai street food in elegant setting",
                image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
                address: "147 Des Voeux Road, Central",
                phone: "+852 7890 1234"
            },
            {
                id: 8,
                name: "Maxim Palace",
                cuisine: "Chinese (Dim Sum)",
                rating: 4.7,
                price_level: 3,
                score: 9.0,
                reason: "Ideal for corporate banquets and annual dinners",
                image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
                address: "258 Canton Road, Tsim Sha Tsui",
                phone: "+852 8901 2345"
            }
        ];

        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    results: mockRestaurants.slice(0, topN)
                });
            }, 500);
        });
    }

    // Get restaurant details by ID
    async getRestaurantById(id) {
        if (this.useMock) {
            const { results } = await this.getMockRecommendations(1, 'all', 10);
            const restaurant = results.find(r => r.id === parseInt(id));
            return restaurant || null;
        }

        return this.request(`/restaurant/${id}`);
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
