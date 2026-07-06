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
('11111111-1111-1111-1111-111111111120', 'PostgreSQL', 'Technical'),
('11111111-1111-1111-1111-111111111121', 'Clinical Medicine', 'Healthcare'),
('11111111-1111-1111-1111-111111111122', 'Mathematics & Physics Teaching', 'Education'),
('11111111-1111-1111-1111-111111111123', 'Digital Marketing', 'Marketing'),
('11111111-1111-1111-1111-111111111124', 'Cisco Networking', 'Technical'),
('11111111-1111-1111-1111-111111111125', 'Civil Engineering & AutoCAD', 'Engineering'),
('11111111-1111-1111-1111-111111111126', 'Nursing Care', 'Healthcare'),
('11111111-1111-1111-1111-111111111127', 'Agronomy & Agriculture', 'Science'),
('11111111-1111-1111-1111-111111111128', 'Banking Operations', 'Business'),
('11111111-1111-1111-1111-111111111129', 'Graphic Design & Photoshop', 'Design'),
('11111111-1111-1111-1111-111111111130', 'IT Security & Firewalls', 'Technical')
ON CONFLICT (name) DO NOTHING;

-- Seed Courses
INSERT INTO courses (id, title, provider, url, tags) VALUES
('c1111111-1111-1111-1111-111111111111', 'Python for Everybody Specialization', 'Coursera', 'https://www.coursera.org/specializations/python', '["Python", "Programming"]'),
('c2222222-2222-2222-2222-222222222222', 'Modern React with Redux [2026 Update]', 'Udemy', 'https://www.udemy.com/course/react-redux/', '["React.js", "Next.js", "Javascript"]'),
('c3333333-3333-3333-3333-333333333333', 'Financial Modeling & Valuation Analyst (FMVA)®', 'CFI', 'https://corporatefinanceinstitute.com/certifications/financial-modeling-valuation-analyst-fmva/', '["Financial Modeling", "Excel"]'),
('c4444444-4444-4444-4444-444444444444', 'FastAPI: Build Modern Python Web APIs', 'Udemy', 'https://www.udemy.com/course/fastapi-modern-python-web-apis/', '["FastAPI", "Python", "SQL"]'),
('c5555555-5555-5555-5555-555555555555', 'Interaction Design Specialization', 'Coursera / UC San Diego', 'https://www.coursera.org/specializations/interaction-design', '["UI/UX Design", "Figma"]')
ON CONFLICT DO NOTHING;

-- Seed Mock Users (Passwords are hashed 'password123')
INSERT INTO users (id, email, password_hash, phone_number, role) VALUES
('22222222-2222-2222-2222-222222222222', 'hr@hormuud.com', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252615551234', 'employer'),
('22222222-2222-2222-2222-222222222223', 'hr@telesom.com', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252634441122', 'employer'),
('22222222-2222-2222-2222-222222222224', 'hr@dahabshiil.com', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252635559900', 'employer'),
('22222222-2222-2222-2222-222222222225', 'hr@premierbank.so', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252618883344', 'employer'),
('22222222-2222-2222-2222-222222222226', 'hr@salaambank.so', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252619992211', 'employer'),
('33333333-3333-3333-3333-333333333333', 'seeker1@gmail.com', '$2b$12$Z0u/j9Zz3E.K4WcZg7Cbeuqh5T5a5G1/k/93P3eJ66V9R/tA.7.x.', '+252612229988', 'seeker'),
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
    }'
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
    }'
)
ON CONFLICT DO NOTHING;

-- Connect Profile Skills
INSERT INTO profile_skills (profile_id, skill_id, proficiency) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Intermediate'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111112', 'Intermediate'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111114', 'Beginner'),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111115', 'Expert'),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111117', 'Intermediate')
ON CONFLICT DO NOTHING;

-- Seed 20 Jobs in Somalia
INSERT INTO jobs (id, employer_id, title, description, company_name, location, type, salary_range, required_metadata, status) VALUES
-- 1
(
    'a1000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Backend Engineer (FastAPI/Python)',
    'We are seeking a Backend Software Engineer with experience in Python and FastAPI to join our core digital services team in Mogadishu. You will develop APIs, optimize queries, and integrate AI pipelines.',
    'Hormuud Telecom',
    'Mogadishu, Somalia',
    'Full-time',
    '$800 - $1200 / Month',
    '{"experience_required": "1-3 years", "education": "Bachelor in CS or related"}',
    'active'
),
-- 2
(
    'a1000000-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'Investment & Finance Analyst',
    'Join our strategic investment team in Mogadishu. The candidate will build financial models, analyze market rates, and structure reports in both Somali and English.',
    'Hormuud Telecom',
    'Mogadishu, Somalia',
    'Full-time',
    '$1000 - $1500 / Month',
    '{"experience_required": "2+ years", "education": "BBA, Finance, or Accounting"}',
    'active'
),
-- 3
(
    'a1000000-0000-0000-0000-000000000003',
    '22222222-2222-2222-2222-222222222224',
    'Frontend Developer (React.js)',
    'Dahabshiil Group is looking for an experienced Frontend React Developer to join our Hargeisa office. You will be building responsive web applications, working with modern state management, and designing elegant Somali-focused consumer portals.',
    'Dahabshiil',
    'Hargeisa, Somalia',
    'Full-time',
    '$900 - $1400 / Month',
    '{"experience_required": "2+ years", "education": "Bachelor in IT or Software Engineering"}',
    'active'
),
-- 4
(
    'a1000000-0000-0000-0000-000000000004',
    '22222222-2222-2222-2222-222222222225',
    'Database Administrator (PostgreSQL/SQL)',
    'Premier Bank is seeking a database administrator responsible for designing, deploying, and maintaining high-performance databases. You will write complex SQL queries, optimize index performance, and secure customer databases in Mogadishu.',
    'Premier Bank',
    'Mogadishu, Somalia',
    'Full-time',
    '$1200 - $1800 / Month',
    '{"experience_required": "3-5 years", "education": "BS in Computer Science or Database Admin Cert"}',
    'active'
),
-- 5
(
    'a1000000-0000-0000-0000-000000000005',
    '22222222-2222-2222-2222-222222222226',
    'UI/UX Designer',
    'Salaam Somali Bank is hiring a UI/UX Designer to craft beautiful and intuitive user journeys for our mobile and web banking apps. You will build wireframes, design mockups, and work closely with front-end engineers in Mogadishu.',
    'Salaam Somali Bank',
    'Mogadishu, Somalia',
    'Full-time',
    '$700 - $1100 / Month',
    '{"experience_required": "1-3 years", "education": "Diploma/Degree in Design, CS, or Portfolio equivalent"}',
    'active'
),
-- 6
(
    'a1000000-0000-0000-0000-000000000006',
    '22222222-2222-2222-2222-222222222222',
    'Project Manager',
    'We are seeking a structured IT Project Manager to lead several digital projects at Hormuud. The ideal candidate will coordinate team tasks, manage software development life cycles, and report progress to executive stakeholders.',
    'Hormuud Telecom',
    'Mogadishu, Somalia',
    'Full-time',
    '$1500 - $2200 / Month',
    '{"experience_required": "3+ years", "education": "Bachelor in Business, CS, or PMP certified"}',
    'active'
),
-- 7
(
    'a1000000-0000-0000-0000-000000000007',
    '22222222-2222-2222-2222-222222222224',
    'English-Somali Translator & Content Writer',
    'Dahabshiil Group is seeking a freelance or part-time English-Somali translator and technical content writer. The candidate will translate user documentation, localise applications, and write weekly Somali business press releases.',
    'Dahabshiil',
    'Remote',
    'Part-time',
    '$400 - $600 / Month',
    '{"experience_required": "1+ years", "education": "Bachelor in Linguistics, English, or Somali Studies"}',
    'active'
),
-- 8
(
    'a1000000-0000-0000-0000-000000000008',
    '22222222-2222-2222-2222-222222222223',
    'Full Stack Web Developer (Next.js/Python)',
    'Telesom Hargeisa is seeking a Full Stack developer with strong Next.js frontend skills and Python backend capabilities. You will design, build, and support critical customer-facing merchant systems.',
    'Telesom',
    'Hargeisa, Somalia',
    'Full-time',
    '$1300 - $1900 / Month',
    '{"experience_required": "2-4 years", "education": "BS in Software Engineering or equivalent"}',
    'active'
),
-- 9
(
    'a1000000-0000-0000-0000-000000000009',
    '22222222-2222-2222-2222-222222222222',
    'Dhakhtar Guud (General Practitioner)',
    'Banadir Hospital is hiring a General Practitioner to treat outpatients and emergency room arrivals. Requires diagnostic precision, patience, and dedication to medical service in Banadir region.',
    'Banadir Hospital',
    'Mogadishu, Somalia',
    'Full-time',
    '$1500 - $2000 / Month',
    '{"experience_required": "2+ years", "education": "Doctor of Medicine (MD) or equivalent"}',
    'active'
),
-- 10
(
    'a1000000-0000-0000-0000-000000000010',
    '22222222-2222-2222-2222-222222222225',
    'Macalin Xisaabta & Fiisigiska',
    'SIMAD University is seeking a passionate High School and Preparatory Math & Physics teacher. Candidates must prepare curriculum, present lectures, and guide student laboratory experiments.',
    'Simad University',
    'Mogadishu, Somalia',
    'Full-time',
    '$500 - $800 / Month',
    '{"experience_required": "1+ years", "education": "BSc in Mathematics, Physics, or Education"}',
    'active'
),
-- 11
(
    'a1000000-0000-0000-0000-000000000011',
    '22222222-2222-2222-2222-222222222223',
    'Sarkaalka Suuqgeynta (Marketing Officer)',
    'Somtel Garowe is looking for a digital marketing specialist. You will manage social media campaigns, promote mobile data services (e.g. e-Dahab), and run analytics on user engagement.',
    'Somtel',
    'Garowe, Somalia',
    'Full-time',
    '$600 - $900 / Month',
    '{"experience_required": "1-3 years", "education": "Bachelor in Marketing or Business"}',
    'active'
),
-- 12
(
    'a1000000-0000-0000-0000-000000000012',
    '22222222-2222-2222-2222-222222222224',
    'Maareeyaha Hawlgalka (Operations Manager)',
    'Jubba Airways is seeking an Operations Manager to oversee flight scheduling, ground services, and cargo handling operations in Aden Adde Airport, Mogadishu.',
    'Jubba Airways',
    'Mogadishu, Somalia',
    'Full-time',
    '$1400 - $2200 / Month',
    '{"experience_required": "3+ years", "education": "Degree in Aviation Management or Business Administration"}',
    'active'
),
-- 13
(
    'a1000000-0000-0000-0000-000000000013',
    '22222222-2222-2222-2222-222222222223',
    'Injineerka Shabaqada (Network Engineer)',
    'Golis Telecom is seeking a Network Engineer in Bosaso. You will design, install, and manage Cisco routing, switching, and fiber optic network infrastructure to optimize telecom connectivity.',
    'Golis Telecom',
    'Bosaso, Somalia',
    'Full-time',
    '$1100 - $1600 / Month',
    '{"experience_required": "2+ years", "education": "BSc in Telecommunication or CCNA/CCNP certified"}',
    'active'
),
-- 14
(
    'a1000000-0000-0000-0000-000000000014',
    '22222222-2222-2222-2222-222222222224',
    'Injineerka Madaniga ah (Civil Engineer)',
    'Hargeisa Water Agency is seeking a Civil Engineer to design water distribution systems, supervise pipe installation projects, and inspect infrastructural developments across Somaliland.',
    'Hargeisa Water Agency',
    'Hargeisa, Somalia',
    'Full-time',
    '$1200 - $1800 / Month',
    '{"experience_required": "3+ years", "education": "BSc in Civil Engineering or Water Resources"}',
    'active'
),
-- 15
(
    'a1000000-0000-0000-0000-000000000015',
    '22222222-2222-2222-2222-222222222222',
    'Kalkaaliso Caafimaad (Registered Nurse)',
    'Somali Red Crescent Society is hiring registered nurses for mobile clinics. You will provide primary healthcare, administer vaccines, and document patient data in remote communities near Mogadishu.',
    'Somali Red Crescent',
    'Mogadishu, Somalia',
    'Full-time',
    '$450 - $700 / Month',
    '{"experience_required": "1+ years", "education": "Diploma or Degree in Nursing"}',
    'active'
),
-- 16
(
    'a1000000-0000-0000-0000-000000000016',
    '22222222-2222-2222-2222-222222222223',
    'La-taliyaha Beeraha (Agricultural Consultant)',
    'Somcable is looking for an agricultural consultant to work on hydroponics and soil productivity projects in rural areas. Requires strong research background and field experience.',
    'Somcable',
    'Remote',
    'Part-time',
    '$700 - $1000 / Month',
    '{"experience_required": "2+ years", "education": "BSc in Agronomy or Agriculture"}',
    'active'
),
-- 17
(
    'a1000000-0000-0000-0000-000000000017',
    '22222222-2222-2222-2222-222222222225',
    'Khasnaji Bankiga (Bank Teller)',
    'IBS Bank is seeking customer-focused Bank Tellers to process cash transactions, register deposits, and support general customer enquiries in our Mogadishu branches.',
    'IBS Bank',
    'Mogadishu, Somalia',
    'Full-time',
    '$400 - $600 / Month',
    '{"experience_required": "Entry level", "education": "Diploma in Business Administration or Banking"}',
    'active'
),
-- 18
(
    'a1000000-0000-0000-0000-000000000018',
    '22222222-2222-2222-2222-222222222224',
    'Naqshadeeye Garaafyada (Graphic Designer)',
    'Hass Petroleum is seeking a creative graphic designer to build marketing assets, design labels, and support brand guidelines for Somali fuel station networks.',
    'Hass Petroleum',
    'Mogadishu, Somalia',
    'Full-time',
    '$500 - $800 / Month',
    '{"experience_required": "1+ years", "education": "Strong portfolio in Photoshop and Illustrator"}',
    'active'
),
-- 19
(
    'a1000000-0000-0000-0000-000000000019',
    '22222222-2222-2222-2222-222222222226',
    'Sarkaalka Amniga IT-ga (IT Security Officer)',
    'Salaam Somali Bank is seeking an IT Security Specialist to defend banking services against cyber threats, monitor firewall activity, and secure core banking database transactions.',
    'Salaam Somali Bank',
    'Mogadishu, Somalia',
    'Full-time',
    '$1400 - $2000 / Month',
    '{"experience_required": "3+ years", "education": "BSc in Cybersecurity or Computer Network"}',
    'active'
),
-- 20
(
    'a1000000-0000-0000-0000-000000000020',
    '22222222-2222-2222-2222-222222222222',
    'Maareeyaha Qaybinta (Logistics Manager)',
    'Maandeeq Supermarket is hiring a Logistics and Supply Chain Coordinator. You will oversee supplier transactions, inventory control, and fleet scheduling across Mogadishu outlets.',
    'Maandeeq Supermarket',
    'Mogadishu, Somalia',
    'Full-time',
    '$800 - $1200 / Month',
    '{"experience_required": "2+ years", "education": "Degree in Logistics, Business or Procurement"}',
    'active'
)
ON CONFLICT DO NOTHING;

-- Seed Job Skills
INSERT INTO job_skills (job_id, skill_id, is_mandatory) VALUES
('a1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', TRUE),
('a1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111114', TRUE),
('a1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111112', FALSE),

('a1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111115', TRUE),
('a1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111116', FALSE),

('a1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111113', TRUE),
('a1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111119', FALSE),

('a1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111112', TRUE),
('a1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111120', TRUE),

('a1000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111118', TRUE),

('a1000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111117', TRUE),
('a1000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111116', FALSE),

('a1000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111116', TRUE),

('a1000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111119', TRUE),
('a1000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', TRUE),

('a1000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111121', TRUE),

('a1000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111122', TRUE),

('a1000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111123', TRUE),

('a1000000-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111117', TRUE),

('a1000000-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111124', TRUE),

('a1000000-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111125', TRUE),

('a1000000-0000-0000-0000-000000000015', '11111111-1111-1111-1111-111111111126', TRUE),

('a1000000-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111127', TRUE),

('a1000000-0000-0000-0000-000000000017', '11111111-1111-1111-1111-111111111128', TRUE),

('a1000000-0000-0000-0000-000000000018', '11111111-1111-1111-1111-111111111129', TRUE),

('a1000000-0000-0000-0000-000000000019', '11111111-1111-1111-1111-111111111130', TRUE),

('a1000000-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111117', TRUE)
ON CONFLICT DO NOTHING;

-- Seed Applications
INSERT INTO applications (id, job_id, seeker_id, status, match_percentage, cover_letter) VALUES
(
    '99999999-9999-9999-9999-999999999999',
    'a1000000-0000-0000-0000-000000000001',
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
    'a1000000-0000-0000-0000-000000000001',
    'Strong match in Python and database querying. Basic knowledge of FastAPI matches the job core requirement. Recommended to bolster hands-on API deployment projects.',
    '{"matching_skills": ["Python", "SQL"], "missing_skills": ["FastAPI"]}',
    '[
        {"title": "FastAPI: Build Modern Python Web APIs", "provider": "Udemy", "url": "https://www.udemy.com/course/fastapi-modern-python-web-apis/"}
    ]'
)
ON CONFLICT DO NOTHING;
