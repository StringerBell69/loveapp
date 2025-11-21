-- ============================================
-- Seed Daily Questions for Notre Calendrier
-- Execute this after running setup-functions.sql
-- ============================================

INSERT INTO daily_questions (question_text, category) VALUES
-- ============================================
-- MEMORIES (Souvenirs)
-- ============================================
('Quel est votre premier souvenir ensemble ?', 'memories'),
('Quelle est la chose la plus drôle qui vous soit arrivée ensemble ?', 'memories'),
('Quel voyage ensemble vous a le plus marqué ?', 'memories'),
('Quel moment difficile avez-vous surmonté ensemble ?', 'memories'),
('Quelle surprise avez-vous faite à votre partenaire dont vous êtes le plus fier ?', 'memories'),
('Quel compliment de votre partenaire vous a le plus touché ?', 'memories'),
('Quelle tradition avez-vous créée ensemble ?', 'memories'),
('Quel cadeau de votre partenaire vous a le plus marqué ?', 'memories'),
('Quel est le moment où vous avez su que c''était la bonne personne ?', 'memories'),
('Quelle est votre chanson préférée à écouter ensemble ?', 'memories'),

-- ============================================
-- DREAMS (Rêves)
-- ============================================
('Où rêvez-vous de voyager ensemble ?', 'dreams'),
('Comment imaginez-vous votre vie dans 10 ans ?', 'dreams'),
('Quel projet aimeriez-vous réaliser ensemble ?', 'dreams'),
('Quelle est votre maison de rêve ?', 'dreams'),
('Si vous pouviez vivre n''importe où, où iriez-vous ?', 'dreams'),
('Si vous gagniez au loto, que feriez-vous en premier ?', 'dreams'),
('Quel hobby aimeriez-vous apprendre ensemble ?', 'dreams'),
('Comment aimeriez-vous célébrer vos 50 ans de mariage ?', 'dreams'),
('Quel impact aimeriez-vous avoir ensemble sur le monde ?', 'dreams'),
('Quel est votre rêve secret que vous n''avez jamais partagé ?', 'dreams'),

-- ============================================
-- LOVE (Amour)
-- ============================================
('Qu''est-ce qui vous a fait tomber amoureux de votre partenaire ?', 'love'),
('Quelle est la qualité que vous préférez chez votre partenaire ?', 'love'),
('Comment votre partenaire vous rend-il/elle meilleur(e) ?', 'love'),
('Quel est votre langage d''amour principal ?', 'love'),
('Qu''est-ce qui vous fait vous sentir le plus aimé(e) ?', 'love'),
('Quelle petite attention quotidienne de votre partenaire vous touche le plus ?', 'love'),
('Comment montrez-vous votre amour au quotidien ?', 'love'),
('Quel sacrifice avez-vous fait pour votre partenaire ?', 'love'),
('Qu''admirez-vous le plus chez votre partenaire ?', 'love'),
('Comment définissez-vous l''amour dans votre couple ?', 'love'),

-- ============================================
-- PREFERENCES (Préférences)
-- ============================================
('Pizza ou sushi ?', 'preferences'),
('Montagne ou mer ?', 'preferences'),
('Film ou série ?', 'preferences'),
('Sortie en ville ou soirée à la maison ?', 'preferences'),
('Grasse matinée ou lever tôt ?', 'preferences'),
('Chat ou chien ?', 'preferences'),
('Café ou thé ?', 'preferences'),
('Été ou hiver ?', 'preferences'),
('Lecture ou sport ?', 'preferences'),
('Concert ou musée ?', 'preferences'),

-- ============================================
-- REFLECTION (Réflexion)
-- ============================================
('Qu''avez-vous appris sur vous-même grâce à cette relation ?', 'reflection'),
('Comment gérez-vous les désaccords ensemble ?', 'reflection'),
('Quelle est votre plus grande force en tant que couple ?', 'reflection'),
('Comment maintenez-vous la romance au quotidien ?', 'reflection'),
('Qu''est-ce qui rend votre relation unique ?', 'reflection'),
('Comment avez-vous évolué en tant que couple ?', 'reflection'),
('Quel défi avez-vous surmonté ensemble récemment ?', 'reflection'),
('Qu''aimeriez-vous améliorer dans votre relation ?', 'reflection'),
('Comment célébrez-vous vos réussites ensemble ?', 'reflection'),
('Quelle leçon importante avez-vous apprise dans votre relation ?', 'reflection'),

-- ============================================
-- FUN (Amusement)
-- ============================================
('Si vous étiez un duo de super-héros, quels seraient vos pouvoirs ?', 'fun'),
('Quelle chanson représente le mieux votre couple ?', 'fun'),
('Si vous étiez des animaux, lesquels seriez-vous ?', 'fun'),
('Quel serait le nom de votre sitcom de couple ?', 'fun'),
('Si vous pouviez inviter 3 personnes (vivantes ou non) à dîner, qui choisiriez-vous ?', 'fun'),
('Si vous étiez dans une émission de télé-réalité, laquelle serait-ce ?', 'fun'),
('Quelle serait votre playlist de couple idéale (5 chansons) ?', 'fun'),
('Si vous écriviez un livre ensemble, quel serait son titre ?', 'fun'),
('Si vous pouviez avoir un super-pouvoir ensemble, lequel ?', 'fun'),
('Quel surnom secret avez-vous l''un pour l''autre ?', 'fun'),

-- ============================================
-- PHILOSOPHY (Philosophie)
-- ============================================
('Qu''est-ce qui fait qu''une relation dure dans le temps ?', 'philosophy'),
('L''amour est-il un choix ou un sentiment ?', 'philosophy'),
('Qu''est-ce qui est le plus important : la communication ou la confiance ?', 'philosophy'),
('Comment définissez-vous le bonheur à deux ?', 'philosophy'),
('Quelle est votre philosophie de vie commune ?', 'philosophy'),
('Qu''est-ce qu''un couple heureux selon vous ?', 'philosophy'),
('Comment équilibrez-vous individualité et vie de couple ?', 'philosophy'),
('Quelle est la clé d''une relation épanouie ?', 'philosophy'),
('Qu''est-ce qui compte le plus dans l''amour : la passion ou la complicité ?', 'philosophy'),
('Comment définissez-vous l''engagement dans un couple ?', 'philosophy')

ON CONFLICT DO NOTHING;

-- Generate first question for today
SELECT generate_daily_question();

-- Display success message
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM daily_questions;
  RAISE NOTICE '✅ Seeded % questions across 7 categories!', v_count;
  RAISE NOTICE '📝 Question categories:';
  RAISE NOTICE '   - memories (souvenirs)';
  RAISE NOTICE '   - dreams (rêves)';
  RAISE NOTICE '   - love (amour)';
  RAISE NOTICE '   - preferences (préférences)';
  RAISE NOTICE '   - reflection (réflexion)';
  RAISE NOTICE '   - fun (amusement)';
  RAISE NOTICE '   - philosophy (philosophie)';
  
  IF EXISTS (SELECT 1 FROM question_of_the_day WHERE date = CURRENT_DATE) THEN
    RAISE NOTICE '🎯 Today''s question has been generated!';
  ELSE
    RAISE NOTICE '⚠️  No question generated for today. Run: SELECT generate_daily_question();';
  END IF;
END $$;
