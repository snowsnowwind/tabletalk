"""Canonical local image paths for menu items."""

MENU_IMAGE_PATHS = {
    "Har Gow": "/images/menu/har-gow.jpg",
    "Shrimp Dumplings": "/images/menu/har-gow.jpg",
    "Siu Mai": "/images/menu/siu-mai.jpg",
    "Shumai": "/images/menu/siu-mai.jpg",
    "Char Siu Bao": "/images/menu/char-siu-bao.jpg",
    "Char Siu Buns": "/images/menu/char-siu-bao.jpg",
    "Cheong Fun": "/images/menu/cheong-fun.jpg",
    "Steamed Vermicelli Roll": "/images/menu/cheong-fun.jpg",
    "Lo Mai Gai": "/images/menu/lo-mai-gai.png",
    "Peking Duck": "/images/menu/peking-duck.jpg",
    "Steamed Grouper": "/images/menu/steamed-grouper.png",
    "Steamed Sea Bass": "/images/menu/steamed-grouper.png",
    "Typhoon Shelter Crab": "/images/menu/typhoon-shelter-crab.png",
    "Wonton Noodle Soup": "/images/menu/wonton-noodle-soup.png",
    "Yang Zhou Fried Rice": "/images/menu/yang-zhou-fried-rice.jpg",
    "Ma Po Tofu": "/images/menu/ma-po-tofu.png",
    "Mapo Tofu": "/images/menu/ma-po-tofu.png",
    "Egg Tart": "/images/menu/egg-tart.png",
    "Mango Pudding": "/images/menu/mango-pudding.jpg",
    "Salmon Sashimi": "/images/menu/salmon-sashimi.png",
    "Sushi Platter": "/images/menu/sushi-platter.png",
    "Tonkotsu Ramen": "/images/menu/tonkotsu-ramen.png",
    "Chicken Teriyaki": "/images/menu/chicken-teriyaki.png",
    "French Onion Soup": "/images/menu/french-onion-soup.png",
    "Duck Confit": "/images/menu/duck-confit.png",
    "Beef Bourguignon": "/images/menu/beef-bourguignon.png",
    "Crème Brûlée": "/images/menu/creme-brulee.png",
    "Margherita Pizza": "/images/menu/margherita-pizza.png",
    "Spaghetti Carbonara": "/images/menu/spaghetti-carbonara.png",
    "Lasagna al Forno": "/images/menu/lasagna.png",
    "Tiramisu": "/images/menu/tiramisu.png",
    "Korean BBQ Galbi": "/images/menu/korean-bbq-galbi.png",
    "Bibimbap": "/images/menu/bibimbap.png",
    "Tteokbokki": "/images/menu/tteokbokki.png",
    "Kimchi Jjigae": "/images/menu/kimchi-jjigae.png",
}

RESTAURANT_MENU_CATALOG = {
    "Sakura House": [
        {
            "name": "Salmon Sashimi",
            "description": "Premium salmon with daikon, shiso and wasabi",
            "category": "sashimi",
            "price": 148,
            "allergens": ["fish"],
        },
        {
            "name": "Sushi Platter",
            "description": "Chef's selection of nigiri and maki",
            "category": "sushi",
            "price": 188,
            "allergens": ["fish", "shellfish"],
        },
        {
            "name": "Tonkotsu Ramen",
            "description": "Rich pork broth, chashu and soft-boiled egg",
            "category": "noodles",
            "price": 108,
            "allergens": ["egg", "gluten"],
        },
        {
            "name": "Chicken Teriyaki",
            "description": "Grilled chicken thigh with house teriyaki glaze",
            "category": "mains",
            "price": 128,
            "allergens": ["soy", "sesame"],
        },
    ],
    "La Maison": [
        {
            "name": "French Onion Soup",
            "description": "Caramelized onion broth with toasted Gruyère",
            "category": "starter",
            "price": 118,
            "allergens": ["dairy", "gluten"],
        },
        {
            "name": "Duck Confit",
            "description": "Crisp duck leg, potato purée and red wine jus",
            "category": "mains",
            "price": 268,
            "allergens": ["dairy"],
        },
        {
            "name": "Beef Bourguignon",
            "description": "Slow-braised beef, mushrooms and pearl onions",
            "category": "mains",
            "price": 248,
            "allergens": [],
        },
        {
            "name": "Crème Brûlée",
            "description": "Vanilla custard with caramelized sugar crust",
            "category": "dessert",
            "price": 88,
            "is_vegetarian": True,
            "allergens": ["dairy", "egg"],
        },
    ],
    "Mama Mia Trattoria": [
        {
            "name": "Margherita Pizza",
            "description": "Wood-fired tomato, mozzarella and fresh basil",
            "category": "pizza",
            "price": 138,
            "is_vegetarian": True,
            "allergens": ["dairy", "gluten"],
        },
        {
            "name": "Spaghetti Carbonara",
            "description": "Guanciale, egg, Pecorino and black pepper",
            "category": "pasta",
            "price": 148,
            "allergens": ["dairy", "egg", "gluten"],
        },
        {
            "name": "Lasagna al Forno",
            "description": "Layered beef ragù, béchamel and baked cheese",
            "category": "pasta",
            "price": 158,
            "allergens": ["dairy", "gluten"],
        },
        {
            "name": "Tiramisu",
            "description": "Espresso-soaked ladyfingers and mascarpone",
            "category": "dessert",
            "price": 78,
            "is_vegetarian": True,
            "allergens": ["dairy", "egg", "gluten"],
        },
    ],
    "Seoul Kitchen": [
        {
            "name": "Korean BBQ Galbi",
            "description": "Marinated beef short ribs grilled at the table",
            "category": "bbq",
            "price": 228,
            "allergens": ["soy", "sesame"],
        },
        {
            "name": "Bibimbap",
            "description": "Stone-pot rice, vegetables, beef and fried egg",
            "category": "rice",
            "price": 118,
            "allergens": ["egg", "sesame"],
        },
        {
            "name": "Tteokbokki",
            "description": "Rice cakes and fish cake in spicy gochujang sauce",
            "category": "street_food",
            "price": 88,
            "is_spicy": True,
            "allergens": ["fish", "soy"],
        },
        {
            "name": "Kimchi Jjigae",
            "description": "Kimchi stew with pork belly, tofu and scallions",
            "category": "stew",
            "price": 108,
            "is_spicy": True,
            "allergens": ["soy"],
        },
    ],
}


def sync_menu_image_paths(db):
    """Seed missing restaurant menus and connect rows to bundled photographs."""
    from .models import MenuItem, Restaurant

    changed = False
    restaurants = {
        restaurant.name: restaurant
        for restaurant in db.query(Restaurant).filter(Restaurant.is_active.is_(True)).all()
    }

    for restaurant_name, catalog_items in RESTAURANT_MENU_CATALOG.items():
        restaurant = restaurants.get(restaurant_name)
        if not restaurant:
            continue

        existing_names = {
            item.name
            for item in db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).all()
        }
        for catalog_item in catalog_items:
            if catalog_item["name"] in existing_names:
                continue
            item_data = {
                "restaurant_id": restaurant.id,
                "image_url": MENU_IMAGE_PATHS[catalog_item["name"]],
                "is_vegetarian": False,
                "is_spicy": False,
                "is_available": True,
                "allergens": [],
                **catalog_item,
            }
            db.add(MenuItem(**item_data))
            changed = True

    for item in db.query(MenuItem).all():
        image_path = MENU_IMAGE_PATHS.get(item.name)
        if image_path and item.image_url != image_path:
            item.image_url = image_path
            changed = True

    if changed:
        db.commit()
