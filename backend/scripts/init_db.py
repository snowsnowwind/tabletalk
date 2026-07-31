"""
Initialize database with sample data
Run this script to set up demo data
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.models import User, Restaurant, MenuItem, UserRole
from app.services.auth import get_password_hash


def create_sample_data():
    """Create sample data for testing"""
    db = SessionLocal()
    
    try:
        # Create admin user
        admin = db.query(User).filter(User.email == "admin@tabletalk.com").first()
        if not admin:
            admin = User(
                email="admin@tabletalk.com",
                hashed_password=get_password_hash("admin123"),
                name="Admin User",
                phone="+852 1234 5678",
                role=UserRole.ADMIN
            )
            db.add(admin)
            print("✅ Created admin user: admin@tabletalk.com / admin123")
        
        # Create corporate user
        corporate = db.query(User).filter(User.email == "corp@company.com").first()
        if not corporate:
            corporate = User(
                email="corp@company.com",
                hashed_password=get_password_hash("corp123"),
                name="Corporate User",
                phone="+852 9876 5432",
                role=UserRole.CORPORATE
            )
            db.add(corporate)
            print("✅ Created corporate user: corp@company.com / corp123")
        
        # Create test customer
        customer = db.query(User).filter(User.email == "user@test.com").first()
        if not customer:
            customer = User(
                email="user@test.com",
                hashed_password=get_password_hash("user123"),
                name="Test Customer",
                phone="+852 5555 5555",
                role=UserRole.CUSTOMER
            )
            db.add(customer)
            print("✅ Created test user: user@test.com / user123")
        
        db.commit()
        
        # Create sample restaurants
        restaurants_data = [
            {
                "name": "Maxim Palace",
                "cuisine": "Chinese",
                "description": "Experience the finest Cantonese cuisine in an elegant setting. Serving Hong Kong since 1988.",
                "address": "123 Canton Road, Tsim Sha Tsui, Hong Kong",
                "phone": "+852 1234 5678",
                "email": "info@maximpalace.com",
                "rating": 4.8,
                "price_level": 4,
                "images": [
                    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
                ],
                "operating_hours": {
                    "monday": "11:30-22:30",
                    "tuesday": "11:30-22:30",
                    "wednesday": "11:30-22:30",
                    "thursday": "11:30-22:30",
                    "friday": "11:30-23:00",
                    "saturday": "10:30-23:00",
                    "sunday": "10:30-22:30"
                },
                "features": ["private_room", "parking", "wifi", "wheelchair_accessible"],
                "total_capacity": 200
            },
            {
                "name": "Sakura House",
                "cuisine": "Japanese",
                "description": "Authentic Japanese cuisine with fresh sushi and sashimi flown in daily from Tsukiji Market.",
                "address": "456 Nathan Road, Jordan, Hong Kong",
                "phone": "+852 2345 6789",
                "email": "info@sakurahouse.com",
                "rating": 4.7,
                "price_level": 3,
                "images": [
                    "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800"
                ],
                "operating_hours": {
                    "monday": "12:00-22:00",
                    "tuesday": "12:00-22:00",
                    "wednesday": "12:00-22:00",
                    "thursday": "12:00-22:00",
                    "friday": "12:00-23:00",
                    "saturday": "11:00-23:00",
                    "sunday": "11:00-22:00"
                },
                "features": ["private_room", "sake_bar"],
                "total_capacity": 80
            },
            {
                "name": "La Maison",
                "cuisine": "French",
                "description": "Michelin-starred French fine dining with an exceptional wine cellar.",
                "address": "789 Central Plaza, Hong Kong",
                "phone": "+852 3456 7890",
                "email": "reservations@lamaison.com",
                "rating": 4.9,
                "price_level": 5,
                "images": [
                    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
                ],
                "operating_hours": {
                    "tuesday": "18:00-23:00",
                    "wednesday": "18:00-23:00",
                    "thursday": "18:00-23:00",
                    "friday": "18:00-23:00",
                    "saturday": "12:00-14:30, 18:00-23:00",
                    "sunday": "12:00-14:30"
                },
                "features": ["michelin_star", "wine_cellar", "dress_code", "valet_parking"],
                "total_capacity": 50
            },
            {
                "name": "Mama Mia Trattoria",
                "cuisine": "Italian",
                "description": "Family-style Italian cooking with homemade pasta and wood-fired pizzas.",
                "address": "321 Queen's Road, Wan Chai, Hong Kong",
                "phone": "+852 4567 8901",
                "rating": 4.5,
                "price_level": 2,
                "images": [
                    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"
                ],
                "operating_hours": {
                    "monday": "11:00-22:00",
                    "tuesday": "11:00-22:00",
                    "wednesday": "11:00-22:00",
                    "thursday": "11:00-22:00",
                    "friday": "11:00-23:00",
                    "saturday": "10:00-23:00",
                    "sunday": "10:00-22:00"
                },
                "features": ["family_friendly", "outdoor_seating", "takeaway"],
                "total_capacity": 120
            },
            {
                "name": "Seoul Kitchen",
                "cuisine": "Korean",
                "description": "Best Korean BBQ in town with premium wagyu and authentic Korean side dishes.",
                "address": "654 Kimberley Road, Tsim Sha Tsui, Hong Kong",
                "phone": "+852 5678 9012",
                "rating": 4.6,
                "price_level": 3,
                "images": [
                    "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800"
                ],
                "features": ["bbq_grill", "group_friendly", "late_night"],
                "total_capacity": 100
            }
        ]
        
        for r_data in restaurants_data:
            existing = db.query(Restaurant).filter(Restaurant.name == r_data["name"]).first()
            if not existing:
                restaurant = Restaurant(**r_data)
                db.add(restaurant)
                print(f"✅ Created restaurant: {r_data['name']}")
        
        db.commit()
        
        # Create sample menu items for Maxim Palace
        maxim = db.query(Restaurant).filter(Restaurant.name == "Maxim Palace").first()
        if maxim:
            menu_items_data = [
                {"name": "Har Gow", "category": "dim_sum", "price": 68, "description": "Crystal shrimp dumplings", "is_spicy": False},
                {"name": "Siu Mai", "category": "dim_sum", "price": 58, "description": "Pork and shrimp dumplings", "is_spicy": False},
                {"name": "Char Siu Bao", "category": "dim_sum", "price": 48, "description": "BBQ pork buns", "is_spicy": False},
                {"name": "Cheong Fun", "category": "dim_sum", "price": 52, "description": "Rice noodle rolls with shrimp", "is_spicy": False},
                {"name": "Lo Mai Gai", "category": "dim_sum", "price": 58, "description": "Sticky rice in lotus leaf", "is_spicy": False},
                {"name": "Peking Duck", "category": "mains", "price": 688, "description": "Served in two courses", "is_spicy": False},
                {"name": "Steamed Grouper", "category": "seafood", "price": 388, "description": "Fresh grouper with ginger and scallions", "is_spicy": False},
                {"name": "Typhoon Shelter Crab", "category": "seafood", "price": 458, "description": "Wok-fried crab with garlic and chili", "is_spicy": True},
                {"name": "Wonton Noodle Soup", "category": "noodles", "price": 78, "description": "Traditional wonton noodles in broth", "is_spicy": False},
                {"name": "Yang Zhou Fried Rice", "category": "rice", "price": 88, "description": "Classic fried rice with shrimp and char siu", "is_spicy": False},
                {"name": "Ma Po Tofu", "category": "mains", "price": 98, "description": "Spicy Sichuan tofu", "is_spicy": True, "is_vegetarian": True},
                {"name": "Egg Tart", "category": "dessert", "price": 38, "description": "Crispy Portuguese-style egg tarts", "is_spicy": False},
                {"name": "Mango Pudding", "category": "dessert", "price": 48, "description": "Fresh mango pudding with cream", "is_spicy": False},
            ]
            
            for item_data in menu_items_data:
                existing = db.query(MenuItem).filter(
                    MenuItem.restaurant_id == maxim.id,
                    MenuItem.name == item_data["name"]
                ).first()
                if not existing:
                    item = MenuItem(restaurant_id=maxim.id, **item_data)
                    db.add(item)
            
            db.commit()
            print(f"✅ Created {len(menu_items_data)} menu items for Maxim Palace")
        
        print("\n🎉 Sample data created successfully!")
        print("\n📝 Test Accounts:")
        print("   Admin: admin@tabletalk.com / admin123")
        print("   Corporate: corp@company.com / corp123")
        print("   Customer: user@test.com / user123")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Initializing database...")
    init_db()
    print("📦 Creating sample data...")
    create_sample_data()
