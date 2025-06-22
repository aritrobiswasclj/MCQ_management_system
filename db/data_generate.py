from datetime import datetime

# Generate SQL content from earlier outputs

questions_sql = """
INSERT INTO question (question_id, category_id, user_id, institution_id, question_text, is_approved, is_active, is_public, created_at)
VALUES
(24, 2, 1, 2, 'In the above case maximum moment at section 8 m from left support occurs when', TRUE, TRUE, TRUE, NOW()),
(25, 2, 1, 2, 'The moment which makes all the fibres at the section to yield is known as', TRUE, TRUE, TRUE, NOW()),
(26, 2, 1, 2, 'Which one of the following is wrong with respect to strain energy method for finding deflection?', TRUE, TRUE, TRUE, NOW()),
(27, 2, 1, 2, 'The point in the cross section of beam through which if load acts there will not be any twisting of the beam but there will be only bending is known as', TRUE, TRUE, TRUE, NOW()),
(28, 2, 1, 2, 'The shape factor of a diamond shaped section for bending about its diametral arise is', TRUE, TRUE, TRUE, NOW()),
(29, 3, 1, 2, 'The background colour of the informatory sign board is', TRUE, TRUE, TRUE, NOW()),
(30, 3, 1, 2, 'The most efficient traffic signal system is', TRUE, TRUE, TRUE, NOW()),
(31, 3, 1, 2, 'The main function of prime coat is to', TRUE, TRUE, TRUE, NOW()),
(32, 3, 1, 2, 'Rapid curing cutback bitumen is produced by blending bitumen with', TRUE, TRUE, TRUE, NOW()),
(33, 3, 1, 2, 'When the speed of traffic flow becomes zero, then', TRUE, TRUE, TRUE, NOW()),
(34, 3, 1, 2, 'Nagpur road plan formulae were prepared by assuming', TRUE, TRUE, TRUE, NOW()),
(35, 3, 1, 2, 'In a national highway the minimum width of road and shoulder on each side are ____ respectively.', TRUE, TRUE, TRUE, NOW()),
(36, 3, 1, 2, 'For an excellent base material CBR value is', TRUE, TRUE, TRUE, NOW()),
(37, 3, 1, 2, 'The type of bituminous road construction includes', TRUE, TRUE, TRUE, NOW()),
(38, 3, 1, 2, 'The shape of the camber, best suited for cement concrete pavements is', TRUE, TRUE, TRUE, NOW());
"""

options_sql = ""  # Will be constructed below
tags_sql = ""     # Will be constructed below

# Mapping for options per question
options = [
    (24, ['First 15 kN load is on the section', 'Second 15 kN is on the section', '8 kN load is on the section', '10 kN load is on the section'], 1),
    (25, ['moment of resistance', 'plastic moment capacity', 'yield moment', 'flexural rigidity'], 2),
    (26, ['Structure should be subjected to a single concentrated load', 'Deflection can be found at any point in desired direction', 'Deflection can be found only in direction of load', 'Deflection can be found only at the loaded point'], 2),
    (27, ['shear centre', 'centre of gravity', 'centroid', 'all the above'], 1),
    (28, ['1.2', '1.5', '2.0', '3.0'], 3),
    (29, ['red', 'white', 'green', 'yellow'], 4),
    (30, ['simple progressive system', 'flexible progressive system', 'alternate system', 'simultaneous system'], 2),
    (31, ['control dust nuisance', 'provide bond between the existing base and surfacing of new construction', 'improve riding quality of pavement', 'provide bond between old and new surfacing'], 2),
    (32, ['petrol', 'diesel', 'benzene', 'kerosene'], 1),
    (33, ['traffic density attains maximum value whereas traffic volume becomes zero', 'traffic density becomes zero whereas traffic volume attains maximum value', 'traffic density and traffic volume both', 'traffic density and traffic volume both attain maximum value'], 1),
    (34, ['radial or star and grid road pattern', 'radial or star and circular road pattern', 'radial or star and block road pattern', 'rectangular or block road system'], 1),
    (35, ['8 m to 1.5 m', '8 m and 2 m', '10 m and 1.5 m', '10 m and 2.0 m'], 2),
    (36, ['50%', '60%', '100%', '150%'], 3),
    (37, ['built up spray grout', 'grouted or penetrations macadam', 'surface dressing', 'all the above'], 4),
    (38, ['combination of straight and parabolic', 'elliptical', 'parabolic', 'straight line'], 4),
]

option_id = 121
for q_id, texts, correct_index in options:
    for i, txt in enumerate(texts):
        is_correct = 'TRUE' if (i + 1) == correct_index else 'FALSE'
        options_sql += f"INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES ({option_id}, {q_id}, '{txt}', {is_correct}, {i+1});\n"
        option_id += 1

# Tags
for q_id in range(24, 39):
    for tag_id in [1, 2, 3]:
        tags_sql += f"INSERT INTO question_tag (question_id, tag_id) VALUES ({q_id}, {tag_id});\n"

# Combine all
full_sql = f"-- Questions\n{questions_sql}\n-- Options\n{options_sql}\n-- Tags\n{tags_sql}"

# Save to file
path = "cuet_questions_seed.sql"
with open(path, "w", encoding="utf-8") as f:
    f.write(full_sql)

path
