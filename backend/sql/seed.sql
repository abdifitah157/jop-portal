-- Seed Skills
INSERT INTO skills (id, name, category) VALUES
('11111111-1111-1111-1111-111111111111', 'Python', 'Technical'),
('11111111-1111-1111-1111-111111111112', 'SQL', 'Technical'),
('11111111-1111-1111-1111-111111111113', 'React.js', 'Technical'),
('11111111-1111-1111-1111-111111111114', 'FastAPI', 'Technical'),
('11111111-1111-1111-1111-111111111115', 'Financial Modeling', 'Business'),
('11111111-1111-1111-1111-111111111116', 'Somali Language Translation', 'Language'),
('11111111-1111-1111-1111-111111111117', 'Project Management', 'Business'),
('11111111-1111-1111-1111-111111111118', 'UI/UX Design', 'Design'),
('11111111-1111-1111-1111-111111111119', 'Next.js', 'Technical'),
('11111111-1111-1111-1111-111111111120', 'PostgreSQL', 'Technical')
ON CONFLICT (name) DO NOTHING;

-- Seed Courses
INSERT INTO courses (title, provider, url, tags) VALUES
('Python for Everybody Specialization', 'Coursera', 'https://www.coursera.org/specializations/python', '["Python", "Programming"]'),
('Modern React with Redux [2026 Update]', 'Udemy', 'https://www.udemy.com/course/react-redux/', '["React.js", "Next.js", "Javascript"]'),
('Financial Modeling & Valuation Analyst (FMVA)®', 'CFI', 'https://corporatefinanceinstitute.com/certifications/financial-modeling-valuation-analyst-fmva/', '["Financial Modeling", "Excel"]'),
('FastAPI: Build Modern Python Web APIs', 'Udemy', 'https://www.udemy.com/course/fastapi-modern-python-web-apis/', '["FastAPI", "Python", "SQL"]'),
('Interaction Design Specialization', 'Coursera / UC San Diego', 'https://www.coursera.org/specializations/interaction-design', '["UI/UX Design", "Figma"]')
ON CONFLICT DO NOTHING;

-- Seed Mock Users (Passwords are hashed 'password123')
-- Employer (Telesom / Hormuud style)
INSERT INTO users (id, email, password_hash, phone_number, role) VALUES
('22222222-2222-2222-2222-222222222222', 'hr@hormuud.com', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252615551234', 'employer'),
('22222222-2222-2222-2222-222222222223', 'hr@telesom.com', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252634441122', 'employer'),
('22222222-2222-2222-2222-222222222224', 'hr@dahabshiil.com', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252635559900', 'employer'),
('22222222-2222-2222-2222-222222222225', 'hr@premierbank.so', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252618883344', 'employer'),
('22222222-2222-2222-2222-222222222226', 'hr@salaambank.so', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252619992211', 'employer'),
-- Seeker 1
('33333333-3333-3333-3333-333333333333', 'seeker1@gmail.com', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252612229988', 'seeker'),
-- Seeker 2
('44444444-4444-4444-4444-444444444444', 'seeker2@gmail.com', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252613337766', 'seeker')
ON CONFLICT DO NOTHING;

-- Seed Profiles
INSERT INTO profiles (id, user_id, full_name, current_title, location, summary, resume_url, profile_score, metadata) VALUES
(
    '55555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    'Abdirahman Mohamed',
    'Junior Python Developer',
    'Mogadishu, Somalia',
    'Passionate junior developer specialized in Python web APIs and SQL databases. Eager to contribute to tech solutions in Somalia.',
    'https://shaqodoon-cvs.s3.amazonaws.com/abdirahman_cv.pdf',
    85.00,
    '{
        "education": [
            {"degree": "Bachelor of Computer Science", "school": "Simad University", "grad_year": "2025"}
        ],
        "experience": [
            {"title": "Web Intern", "company": "Somali Tech Hub", "duration": "6 months"}
        ]
    }'::jsonb
),
(
    '66666666-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    'Fartun Ahmed',
    'Financial Analyst',
    'Hargeisa, Somalia',
    'Certified business and financial planning analyst with 3 years of experience in corporate valuation and bookkeeping.',
    'https://shaqodoon-cvs.s3.amazonaws.com/fartun_cv.pdf',
    90.00,
    '{
        "education": [
            {"degree": "BBA in Finance", "school": "Amoud University", "grad_year": "2023"}
        ],
        "experience": [
            {"title": "Junior Analyst", "company": "Dahabshiil Bank", "duration": "2 years"}
        ]
    }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Connect Profile Skills
INSERT INTO profile_skills (profile_id, skill_id, proficiency) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Intermediate'), -- Python
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111112', 'Intermediate'), -- SQL
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111114', 'Beginner'),     -- FastAPI
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111115', 'Expert'),       -- Financial Modeling
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111117', 'Intermediate')  -- Project Management
ON CONFLICT DO NOTHING;

-- Seed Jobs
INSERT INTO jobs (id, employer_id, title, description, company_name, location, type, salary_range, required_metadata, status) VALUES
(
    '77777777-7777-7777-7777-777777777777',
    '22222222-2222-2222-2222-222222222222',
    'Backend Engineer (FastAPI/Python)',
    'We are seeking a Backend Software Engineer with experience in Python and FastAPI to join our core digital services team in Mogadishu. You will develop APIs, optimize queries, and integrate AI pipelines.',
    'Hormuud Telecom',
    'Mogadishu, Somalia',
    'Full-time',
    '$800 - $1200 / Month',
    '{"experience_required": "1-3 years", "education": "Bachelor in CS or related"}'::jsonb,
    'active'
),
(
    '88888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222',
    'Investment & Finance Analyst',
    'Join our strategic investment team in Mogadishu. The candidate will build financial models, analyze market rates, and structure reports in both Somali and English.',
    'Hormuud Telecom',
    'Mogadishu, Somalia',
    'Full-time',
    '$1000 - $1500 / Month',
    '{"experience_required": "2+ years", "education": "BBA, Finance, or Accounting"}'::jsonb,
    'active'
),
(
    'd1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222224',
    'Frontend Developer (React.js)',
    'Dahabshiil Group is looking for an experienced Frontend React Developer to join our Hargeisa office. You will be building responsive web applications, working with modern state management, and designing elegant Somali-focused consumer portals.',
    'Dahabshiil',
    'Hargeisa, Somalia',
    'Full-time',
    '$900 - $1400 / Month',
    '{"experience_required": "2+ years", "education": "Bachelor in IT or Software Engineering"}'::jsonb,
    'active'
),
(
    'd2222222-2222-2222-2222-222222222225',
    '22222222-2222-2222-2222-222222222225',
    'Database Administrator (PostgreSQL/SQL)',
    'Premier Bank is seeking a database administrator responsible for designing, deploying, and maintaining high-performance databases. You will write complex SQL queries, optimize index performance, and secure customer databases in Mogadishu.',
    'Premier Bank',
    'Mogadishu, Somalia',
    'Full-time',
    '$1200 - $1800 / Month',
    '{"experience_required": "3-5 years", "education": "BS in Computer Science or Database Admin Cert"}'::jsonb,
    'active'
),
(
    'd3333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222226',
    'UI/UX Designer',
    'Salaam Somali Bank is hiring a UI/UX Designer to craft beautiful and intuitive user journeys for our mobile and web banking apps. You will build wireframes, design mockups, and work closely with front-end engineers in Mogadishu.',
    'Salaam Somali Bank',
    'Mogadishu, Somalia',
    'Full-time',
    '$700 - $1100 / Month',
    '{"experience_required": "1-3 years", "education": "Diploma/Degree in Design, CS, or Portfolio equivalent"}'::jsonb,
    'active'
),
(
    'd4444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'Project Manager',
    'We are seeking a structured IT Project Manager to lead several digital projects at Hormuud. The ideal candidate will coordinate team tasks, manage software development life cycles, and report progress to executive stakeholders.',
    'Hormuud Telecom',
    'Mogadishu, Somalia',
    'Full-time',
    '$1500 - $2200 / Month',
    '{"experience_required": "3+ years", "education": "Bachelor in Business, CS, or PMP certified"}'::jsonb,
    'active'
),
(
    'd5555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222224',
    'English-Somali Translator & Content Writer',
    'Dahabshiil Group is seeking a freelance or part-time English-Somali translator and technical content writer. The candidate will translate user documentation, localise applications, and write weekly Somali business press releases.',
    'Dahabshiil',
    'Remote',
    'Part-time',
    '$400 - $600 / Month',
    '{"experience_required": "1+ years", "education": "Bachelor in Linguistics, English, or Somali Studies"}'::jsonb,
    'active'
),
(
    'd6666666-6666-6666-6666-666666666666',
    '22222222-2222-2222-2222-222222222223',
    'Full Stack Web Developer (Next.js/Python)',
    'Telesom Hargeisa is seeking a Full Stack developer with strong Next.js frontend skills and Python backend capabilities. You will design, build, and support critical customer-facing merchant systems.',
    'Telesom',
    'Hargeisa, Somalia',
    'Full-time',
    '$1300 - $1900 / Month',
    '{"experience_required": "2-4 years", "education": "BS in Software Engineering or equivalent"}'::jsonb,
    'active'
)
ON CONFLICT DO NOTHING;

-- Seed Job Skills
INSERT INTO job_skills (job_id, skill_id, is_mandatory) VALUES
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', TRUE),  -- Python (Mandatory)
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111114', TRUE),  -- FastAPI (Mandatory)
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111112', FALSE), -- SQL (Optional)

('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111115', TRUE),  -- Financial Modeling (Mandatory)
('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111116', FALSE), -- Somali Language Translation (Optional)

('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111113', TRUE),  -- React.js (Mandatory)
('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111119', FALSE), -- Next.js (Optional)

('d2222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111112', TRUE),  -- SQL (Mandatory)
('d2222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111120', TRUE),  -- PostgreSQL (Mandatory)

('d3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111118', TRUE),  -- UI/UX Design (Mandatory)

('d4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111117', TRUE),  -- Project Management (Mandatory)
('d4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111116', FALSE), -- Somali Language Translation (Optional)

('d5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111116', TRUE),  -- Somali Language Translation (Mandatory)

('d6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111119', TRUE),  -- Next.js (Mandatory)
('d6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', TRUE),  -- Python (Mandatory)
('d6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111112', FALSE)  -- SQL (Optional)
ON CONFLICT DO NOTHING;

-- Seed Applications
INSERT INTO applications (id, job_id, seeker_id, status, match_percentage, cover_letter) VALUES
(
    '99999999-9999-9999-9999-999999999999',
    '77777777-7777-7777-7777-777777777777',
    '33333333-3333-3333-3333-333333333333',
    'Applied',
    82.50,
    'Dear Hormuud HR, I am Abdirahman. I love coding in Python and building modern APIs with FastAPI. I would love to join your tech team!'
)
ON CONFLICT DO NOTHING;

-- Seed AI Analysis
INSERT INTO ai_analysis (id, application_id, profile_id, job_id, score_breakdown, skill_gap, course_recommendations) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '99999999-9999-9999-9999-999999999999',
    '55555555-5555-5555-5555-555555555555',
    '77777777-7777-7777-7777-777777777777',
    'Strong match in Python and database querying. Basic knowledge of FastAPI matches the job core requirement. Recommended to bolster hands-on API deployment projects.',
    '{"matching_skills": ["Python", "SQL"], "missing_skills": ["FastAPI"]}'::jsonb,
    '[
        {"title": "FastAPI: Build Modern Python Web APIs", "provider": "Udemy", "url": "https://www.udemy.com/course/fastapi-modern-python-web-apis/"}
    ]'::jsonb
)
ON CONFLICT DO NOTHING;
