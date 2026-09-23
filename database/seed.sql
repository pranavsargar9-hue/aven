-- AVEN sample catalog (~40 books)
-- Run after schema.sql:
--   mysql -u root -p aven < database/seed.sql
--
-- Note: the "cover" column is left blank on purpose. The frontend fetches a
-- real, matching cover image at runtime from the Google Books API using the
-- book's title + author, so covers stay accurate without us hand-picking
-- image URLs. If you'd rather store fixed URLs, just fill in this column.

INSERT INTO books (title, author, genre, description, cover, pages, publication_year) VALUES
('The Name of the Wind', 'Patrick Rothfuss', 'Fantasy', 'A gifted young man recounts, in his own words, how he rose from an orphaned street performer to a living legend of magic and music.', '', 662, 2007),
('A Game of Thrones', 'George R. R. Martin', 'Fantasy', 'Noble houses across the Seven Kingdoms scheme, ally, and betray one another as a long summer ends and winter finally comes.', '', 694, 1996),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'A comfort-loving hobbit is swept into a quest across Middle-earth to help a company of dwarves reclaim their mountain home from a dragon.', '', 310, 1937),
('Mistborn: The Final Empire', 'Brandon Sanderson', 'Fantasy', 'In a world blanketed in ash and ruled by an immortal emperor, a street thief with rare powers is recruited into a plot to overthrow him.', '', 541, 2006),
('The Night Circus', 'Erin Morgenstern', 'Fantasy', 'Two young illusionists are bound into a magical competition staged within a mysterious circus that only opens at night.', '', 387, 2011),
('Circe', 'Madeline Miller', 'Fantasy', 'The daughter of the sun god is banished to a lonely island, where she hones her power and crosses paths with figures from Greek myth.', '', 393, 2018),
('The Priory of the Orange Tree', 'Samantha Shannon', 'Fantasy', 'A sweeping tale of dragons, queens, and an ancient evil stirring beneath the sea, told across several interlocking kingdoms.', '', 848, 2019),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy', 'An orphaned boy discovers he is a wizard and begins his first year at a school of magic, uncovering a plot tied to his own past.', '', 309, 1997),
('The Silent Patient', 'Alex Michaelides', 'Mystery', 'A criminal psychotherapist becomes obsessed with treating a woman who shot her husband and has not spoken a word since.', '', 336, 2019),
('Gone Girl', 'Gillian Flynn', 'Mystery', 'When a woman vanishes on her wedding anniversary, the portrait of a happy marriage quickly starts to unravel.', '', 419, 2012),
('The Girl with the Dragon Tattoo', 'Stieg Larsson', 'Mystery', 'A disgraced journalist and a brilliant, guarded hacker team up to investigate a decades-old disappearance in a wealthy Swedish family.', '', 465, 2005),
('And Then There Were None', 'Agatha Christie', 'Mystery', 'Ten strangers are lured to an isolated island, where they are picked off one by one according to an old nursery rhyme.', '', 264, 1939),
('The Da Vinci Code', 'Dan Brown', 'Mystery', 'A symbologist races across Europe to unravel a centuries-old religious mystery hidden in the works of Leonardo da Vinci.', '', 489, 2003),
('Big Little Lies', 'Liane Moriarty', 'Mystery', 'The seemingly ordinary lives of three mothers in a coastal town spiral toward a shocking event on trivia night.', '', 460, 2014),
('Pride and Prejudice', 'Jane Austen', 'Romance', 'A sharp-witted young woman and a proud, wealthy gentleman must overcome first impressions and family pressure to find happiness.', '', 279, 1813),
('The Hating Game', 'Sally Thorne', 'Romance', 'Two rival executive assistants locked in constant one-upmanship find their animosity turning into something else entirely.', '', 384, 2016),
('Beach Read', 'Emily Henry', 'Romance', 'A heartbroken romance novelist and a literary writer with writer''s block swap genres for the summer, with unexpected results.', '', 361, 2020),
('Red, White & Royal Blue', 'Casey McQuiston', 'Romance', 'The son of the American president and a British prince turn a manufactured rivalry into a closely guarded romance.', '', 421, 2019),
('Dune', 'Frank Herbert', 'Science Fiction', 'On a harsh desert planet that is the only source of the universe''s most valuable substance, a young heir is thrust into a battle for survival and destiny.', '', 412, 1965),
('Project Hail Mary', 'Andy Weir', 'Science Fiction', 'A lone astronaut wakes with no memory on a solo mission that may be humanity''s last chance to save the sun and Earth.', '', 476, 2021),
('The Martian', 'Andy Weir', 'Science Fiction', 'An astronaut stranded alone on Mars must use ingenuity and sheer stubbornness to survive until a rescue can reach him.', '', 369, 2011),
('Ender''s Game', 'Orson Scott Card', 'Science Fiction', 'A gifted child is trained at a military school in orbit to lead humanity''s defense against an alien threat.', '', 324, 1985),
('Brave New World', 'Aldous Huxley', 'Science Fiction', 'In a future society engineered for stability and pleasure, one man begins to question the cost of a world without pain.', '', 311, 1932),
('The Kite Runner', 'Khaled Hosseini', 'Literary Fiction', 'A man haunted by a childhood betrayal in Afghanistan returns years later seeking a way to make things right.', '', 371, 2003),
('Where the Crawdads Sing', 'Delia Owens', 'Literary Fiction', 'A girl raised alone in the marshes of North Carolina becomes a murder suspect years after a young man is found dead nearby.', '', 384, 2018),
('Normal People', 'Sally Rooney', 'Literary Fiction', 'Two Irish teenagers drift in and out of each other''s lives through school and university, in a quiet, complicated love story.', '', 273, 2018),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Literary Fiction', 'A mysterious millionaire''s obsession with a lost love unfolds against the glittering excess of Jazz Age Long Island.', '', 180, 1925),
('To Kill a Mockingbird', 'Harper Lee', 'Literary Fiction', 'A young girl in a small Alabama town watches her father defend a Black man falsely accused of a crime, and learns about justice and prejudice.', '', 281, 1960),
('Sapiens', 'Yuval Noah Harari', 'Non-fiction', 'A sweeping look at how Homo sapiens came to dominate the planet, from the cognitive revolution to the modern age.', '', 443, 2011),
('Educated', 'Tara Westover', 'Non-fiction', 'A woman raised off the grid in rural Idaho recounts her path from a childhood without formal schooling to a PhD.', '', 334, 2018),
('Atomic Habits', 'James Clear', 'Non-fiction', 'A practical guide to building good habits and breaking bad ones through small, consistent changes.', '', 320, 2018),
('Quiet', 'Susan Cain', 'Non-fiction', 'An exploration of introversion and the quiet strengths it brings to a world that tends to prize extroversion.', '', 333, 2012),
('Mexican Gothic', 'Silvia Moreno-Garcia', 'Horror', 'A young socialite travels to a decaying countryside mansion to check on her newly married cousin and finds something deeply wrong within its walls.', '', 301, 2020),
('The Haunting of Hill House', 'Shirley Jackson', 'Horror', 'Four visitors staying in a notoriously unsettling mansion begin to unravel as the house itself seems to turn against them.', '', 246, 1959),
('It', 'Stephen King', 'Horror', 'A group of childhood friends confronts an ancient evil that preys on their small town, first as children and again decades later.', '', 1138, 1986),
('The Book Thief', 'Markus Zusak', 'Historical Fiction', 'Narrated by Death, the story follows a young girl in Nazi Germany who finds solace in stolen books during the war.', '', 552, 2005),
('All the Light We Cannot See', 'Anthony Doerr', 'Historical Fiction', 'The paths of a blind French girl and a German boy converge during the Second World War around a legendary jewel and a hidden radio broadcast.', '', 531, 2014),
('The Nightingale', 'Kristin Hannah', 'Historical Fiction', 'Two sisters in Nazi-occupied France choose very different paths of survival and resistance during the war.', '', 440, 2015),
('The Fault in Our Stars', 'John Green', 'Young Adult', 'Two teenagers who meet in a cancer support group fall in love while grappling with mortality and meaning.', '', 313, 2012),
('Six of Crows', 'Leigh Bardugo', 'Young Adult', 'A crew of six dangerous outcasts is offered a fortune to pull off a seemingly impossible heist in a rival city.', '', 465, 2015);
