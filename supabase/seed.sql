-- Seed data for development

-- Insert test users
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@comhotel.com', 'hashed_password', 'Admin', 'User', 'admin'),
('owner@comhotel.com', 'hashed_password', 'Hotel', 'Owner', 'hotel_owner'),
('guest@comhotel.com', 'hashed_password', 'Guest', 'User', 'guest');

-- Insert test hotels
INSERT INTO hotels (name, description, address, city, country, zip_code, latitude, longitude, star_rating, owner_id) VALUES
('Grand Hotel Paris', 'Luxurious hotel in the heart of Paris', '123 Champs-Élysées', 'Paris', 'France', '75008', 48.8566, 2.3522, 5, (SELECT id FROM users WHERE email = 'owner@comhotel.com')),
('Hotel Moderne Lyon', 'Modern hotel with great amenities', '45 Rue de la République', 'Lyon', 'France', '69002', 45.7640, 4.8357, 4, (SELECT id FROM users WHERE email = 'owner@comhotel.com'));

-- Insert test rooms
INSERT INTO rooms (hotel_id, number, type, description, price_per_night, capacity) VALUES
((SELECT id FROM hotels WHERE name = 'Grand Hotel Paris'), '101', 'single', 'Cozy single room', 120.00, 1),
((SELECT id FROM hotels WHERE name = 'Grand Hotel Paris'), '201', 'double', 'Spacious double room', 200.00, 2),
((SELECT id FROM hotels WHERE name = 'Hotel Moderne Lyon'), '102', 'suite', 'Luxurious suite', 350.00, 4);
