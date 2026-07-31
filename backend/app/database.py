"""
Database connection and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import get_settings

settings = get_settings()

# Create database engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=settings.debug
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    seed_data()
    sync_menu_images()


def sync_menu_images():
    """Apply bundled dish images to new and existing menu rows."""
    from .menu_images import sync_menu_image_paths

    db = SessionLocal()
    try:
        sync_menu_image_paths(db)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def seed_data():
    """Seed initial menu data if database is empty"""
    from .models import Restaurant, MenuItem
    
    db = SessionLocal()
    try:
        # Only seed if no menu items exist
        if db.query(MenuItem).count() > 0:
            return
        
        # Ensure restaurant 1 exists
        restaurant = db.query(Restaurant).filter(Restaurant.id == 1).first()
        if not restaurant:
            restaurant = Restaurant(
                name="Table Talk",
                cuisine="Chinese",
                description="Premium Cantonese dining experience",
                address="123 Canton Road, Tsim Sha Tsui",
                phone="+852 1234 5678",
                rating=4.8,
                price_level=4,
                features=["Dim Sum", "Seafood", "Private Rooms"],
                images=["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"],
                is_active=True
            )
            db.add(restaurant)
            db.flush()
        
        menu_items = [
            MenuItem(
                restaurant_id=restaurant.id,
                name="Xiaolongbao",
                category="Dim Sum",
                price=99,
                image_url="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400",
                description="Traditional steamed dumplings with rich broth",
                is_vegetarian=False,
                is_spicy=False,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Shumai",
                category="Dim Sum",
                price=99,
                image_url="https://images.unsplash.com/photo-1576577445504-6af96477db52?w=400",
                description="Pork and shrimp dumplings",
                is_vegetarian=False,
                is_spicy=False,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Shrimp Dumplings",
                category="Dim Sum",
                price=99,
                image_url="https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400",
                description="Crystal shrimp dumplings (Har Gow)",
                is_vegetarian=False,
                is_spicy=False,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Steamed Vermicelli Roll",
                category="Dim Sum",
                price=99,
                image_url="https://images.unsplash.com/photo-1582452932329-9c830e72d7d9?w=400",
                description="Rice noodle rolls with filling",
                is_vegetarian=False,
                is_spicy=False,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Steamed Bun",
                category="Dim Sum",
                price=99,
                image_url="https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400",
                description="Soft steamed buns",
                is_vegetarian=True,
                is_spicy=False,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Char Siu Buns",
                category="Dim Sum",
                price=99,
                image_url="https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400",
                description="BBQ pork buns with fluffy dough",
                is_vegetarian=False,
                is_spicy=False,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Char Siu",
                category="Main Course",
                price=168,
                image_url="https://images.unsplash.com/photo-1544025162-d76978f8e4a1?w=400",
                description="Honey-glazed BBQ pork",
                is_vegetarian=False,
                is_spicy=False,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Peking Duck",
                category="Main Course",
                price=388,
                image_url="https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400",
                description="Crispy duck with pancakes and hoisin sauce",
                is_vegetarian=False,
                is_spicy=False,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Wonton Noodle Soup",
                category="Soup",
                price=78,
                image_url="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
                description="Classic Cantonese wonton noodle soup",
                is_vegetarian=False,
                is_spicy=False,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Steamed Sea Bass",
                category="Seafood",
                price=288,
                image_url="https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400",
                description="Whole steamed sea bass with ginger and scallion",
                is_vegetarian=False,
                is_spicy=False,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Mapo Tofu",
                category="Main Course",
                price=88,
                image_url="https://images.unsplash.com/photo-1582452932329-9c830e72d7d9?w=400",
                description="Spicy Sichuan-style tofu with minced pork",
                is_vegetarian=False,
                is_spicy=True,
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Mango Pudding",
                category="Dessert",
                price=58,
                image_url="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
                description="Classic Hong Kong mango pudding",
                is_vegetarian=True,
                is_spicy=False,
                is_available=True
            ),
        ]
        
        db.add_all(menu_items)
        db.commit()
        print("Menu items seeded successfully")
    except Exception as e:
        db.rollback()
        print(f"Seed data error: {e}")
    finally:
        db.close()

