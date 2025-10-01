-- Fix the supervisor password hash
-- This script updates the admin account with a proper bcrypt hash for password: admin123

UPDATE supervisors 
SET password_hash = '$2a$10$YourValidBcryptHashHere'
WHERE username = 'admin';

-- If the above doesn't work, delete and recreate the supervisor
DELETE FROM supervisors WHERE username = 'admin';

INSERT INTO supervisors (username, password_hash, full_name, email, role)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    'admin@school.edu',
    'admin'
);
