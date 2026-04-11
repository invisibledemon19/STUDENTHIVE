-- ============================================
-- StudentHive PostgreSQL Database Schema
-- Designed by SAJAL AGARWAL
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    trust_score DECIMAL(3,2) DEFAULT 5.00,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
    department VARCHAR(255),
    year_of_study INTEGER CHECK (year_of_study BETWEEN 1 AND 6),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verified ON users(verified);

-- ============================================
-- OTP VERIFICATION TABLE
-- ============================================
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_email ON otp_codes(user_email);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);

-- ============================================
-- RESOURCES TABLE (Labs, Auditoriums, Halls)
-- ============================================
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('lab', 'hall', 'conference', 'studio')),
    building VARCHAR(255) NOT NULL,
    floor VARCHAR(50),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    amenities JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_status ON resources(status);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rejected', 'completed')),
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Prevent overlapping bookings on the same resource/date/time
    CONSTRAINT no_overlap_bookings EXCLUDE USING gist (
        resource_id WITH =,
        date WITH =,
        tsrange(
            (date + start_time)::timestamp,
            (date + end_time)::timestamp,
            '[)'
        ) WITH &&
    ) WHERE (status NOT IN ('cancelled', 'rejected'))
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_resource ON bookings(resource_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================
-- MARKETPLACE LISTINGS TABLE
-- ============================================
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'books', 'electronics', 'notes', 'accessories', 
        'sports', 'clothing', 'furniture', 'other'
    )),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    condition VARCHAR(50) NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved', 'removed')),
    images JSONB DEFAULT '[]'::jsonb,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_listings_category ON marketplace_listings(category);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
CREATE INDEX idx_listings_price ON marketplace_listings(price);

-- Full-text search on listings
CREATE INDEX idx_listings_search ON marketplace_listings 
    USING gin(to_tsvector('english', title || ' ' || description));

-- ============================================
-- MARKETPLACE MESSAGES TABLE
-- ============================================
CREATE TABLE marketplace_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_listing ON marketplace_messages(listing_id);
CREATE INDEX idx_messages_receiver ON marketplace_messages(receiver_id);

-- ============================================
-- LOST & FOUND TABLE
-- ============================================
CREATE TABLE lost_found_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    date_reported DATE DEFAULT CURRENT_DATE,
    tags TEXT[] DEFAULT '{}',
    image_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'matched', 'recovered', 'expired')),
    matched_with UUID REFERENCES lost_found_items(id),
    claimed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lf_reporter ON lost_found_items(reporter_id);
CREATE INDEX idx_lf_type ON lost_found_items(type);
CREATE INDEX idx_lf_status ON lost_found_items(status);
CREATE INDEX idx_lf_tags ON lost_found_items USING gin(tags);
CREATE INDEX idx_lf_location ON lost_found_items(location);

-- Full-text search on lost & found
CREATE INDEX idx_lf_search ON lost_found_items 
    USING gin(to_tsvector('english', title || ' ' || description));

-- ============================================
-- WISHLIST TABLE
-- ============================================
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'booking_confirmed', 'booking_rejected', 'booking_reminder',
        'listing_inquiry', 'listing_sold',
        'item_matched', 'item_claimed', 'item_recovered',
        'system'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================
-- SEED DATA: Default Resources (10 Labs + 3 Halls)
-- ============================================
INSERT INTO resources (name, type, building, floor, capacity, amenities) VALUES
('Computer Lab A', 'lab', 'Tech Block', '2nd', 40, '["Projector", "AC", "Wi-Fi", "Whiteboard"]'),
('Computer Lab B', 'lab', 'Tech Block', '2nd', 35, '["Projector", "AC", "Wi-Fi"]'),
('Physics Lab', 'lab', 'Science Block', '1st', 30, '["AC", "Instruments"]'),
('Chemistry Lab', 'lab', 'Science Block', '1st', 25, '["AC", "Fume Hood", "Safety Gear"]'),
('Electronics Lab', 'lab', 'Tech Block', '3rd', 30, '["Oscilloscopes", "AC", "Wi-Fi"]'),
('Biology Lab', 'lab', 'Science Block', '2nd', 28, '["Microscopes", "AC"]'),
('Robotics Lab', 'lab', 'Innovation Hub', '1st', 20, '["3D Printers", "Wi-Fi", "Tools"]'),
('AI Research Lab', 'lab', 'Innovation Hub', '2nd', 15, '["GPUs", "Wi-Fi", "AC"]'),
('Design Studio', 'lab', 'Arts Block', '1st', 25, '["iMacs", "Tablets", "AC"]'),
('Network Lab', 'lab', 'Tech Block', '3rd', 20, '["Routers", "Switches", "Wi-Fi"]'),
('Main Auditorium', 'hall', 'Central Block', 'Ground', 500, '["Projector", "Sound System", "AC", "Stage"]'),
('Mini Auditorium', 'hall', 'Central Block', '1st', 150, '["Projector", "Sound System", "AC"]'),
('Conference Hall', 'hall', 'Admin Block', '3rd', 80, '["Video Conf", "AC", "Whiteboard"]');

-- ============================================
-- FUNCTIONS: Auto-update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_resources_timestamp BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_timestamp BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_listings_timestamp BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_lf_timestamp BEFORE UPDATE ON lost_found_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
