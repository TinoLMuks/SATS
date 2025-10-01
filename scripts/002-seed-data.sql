-- Insert default supervisor account
-- Password: admin123 (hashed with bcrypt)
INSERT INTO supervisors (username, password_hash, full_name, email, role)
VALUES (
    'admin',
    '$2a$10$rKZvVVvVVvVVvVVvVVvVVuO8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    'System Administrator',
    'admin@school.edu',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample students for testing
INSERT INTO students (student_id, first_name, last_name, email, phone, grade_level)
VALUES 
    ('STU001', 'John', 'Doe', 'john.doe@student.edu', '555-0101', '10'),
    ('STU002', 'Jane', 'Smith', 'jane.smith@student.edu', '555-0102', '11'),
    ('STU003', 'Michael', 'Johnson', 'michael.j@student.edu', '555-0103', '12'),
    ('STU004', 'Emily', 'Brown', 'emily.brown@student.edu', '555-0104', '10'),
    ('STU005', 'David', 'Wilson', 'david.w@student.edu', '555-0105', '11')
ON CONFLICT (student_id) DO NOTHING;
