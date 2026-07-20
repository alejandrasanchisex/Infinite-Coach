/**
 * PARCHE v92 - BIBLIOTECA PROFESIONAL DE EJERCICIOS
 * Inyecta +100 ejercicios con técnica profesional (YouTube) y asegura su permanencia.
 */
(function() {
    const PRO_EXERCISES = {
        'Pectorales': [
            { name: 'Press de Banca Plano (Barra)', videoUrl: 'https://www.youtube.com/watch?v=tuwHzzPrzOM' },
            { name: 'Press Inclinado (Barra)', videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lr6A' },
            { name: 'Press Declinado (Barra)', videoUrl: 'https://www.youtube.com/watch?v=LfyQbuJshYw' },
            { name: 'Press Plano (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=743p9qL-wY' },
            { name: 'Press Inclinado (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=743iPEnn-ltC8' },
            { name: 'Aperturas Planas (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=eGjt4lk6g34' },
            { name: 'Aperturas en Peck Deck', videoUrl: 'https://www.youtube.com/watch?v=743id882M_39E' },
            { name: 'Cruce de Poleas Altas', videoUrl: 'https://www.youtube.com/watch?v=taI4XpqatW0' },
            { name: 'Cruce de Poleas Bajas', videoUrl: 'https://www.youtube.com/watch?v=Mofp6LqWf1A' },
            { name: 'Flexiones (Push Ups)', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
            { name: 'Fondos en Paralelas (Pecho)', videoUrl: 'https://www.youtube.com/watch?v=743z8JmcrW-As' },
            { name: 'Press en Máquina Convergente', videoUrl: 'https://www.youtube.com/watch?v=xZ9Mms94k8o' },
            { name: 'Pullover con Mancuerna', videoUrl: 'https://www.youtube.com/watch?v=FK4rj9Ps0uM' },
            { name: 'Press con Mancuernas en Suelo (Floor Press)', videoUrl: 'https://www.youtube.com/watch?v=uGRB89V4WiU' },
            { name: 'Cruce de Poleas de pie', videoUrl: 'https://www.youtube.com/watch?v=taI4XpqatW0' },
            { name: 'Aperturas Inclinadas (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=Aj_t44nI8m4' },
            { name: 'Press de Banca con Agarre Invertido', videoUrl: 'https://www.youtube.com/watch?v=743p9qL-wY' },
            { name: 'Aperturas en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=taI4XpqatW0' },
            { name: 'Flexiones con manos juntas (Diamond Push Ups)', videoUrl: 'https://www.youtube.com/watch?v=J0DnG1_S92I' },
            { name: 'Press de Pecho en Máquina Hammer', videoUrl: 'https://www.youtube.com/watch?v=xZ9Mms94k8o' },
            { name: 'Aperturas Planas en Polea', videoUrl: 'https://www.youtube.com/watch?v=eGjt4lk6g34' },
            { name: 'Press de Banca con Mancuernas con Agarre Neutro', videoUrl: 'https://www.youtube.com/watch?v=743iPEnn-ltC8' },
            { name: 'Flexiones Declinadas', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' }
        ],
        'Dorsales': [
            { name: 'Dominadas (Prono)', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
            { name: 'Dominadas (Supino)', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
            { name: 'Jalón al Pecho (Ancho)', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
            { name: 'Jalón al Pecho (Estrecho)', videoUrl: 'https://www.youtube.com/watch?v=G86L6_W8y-w' },
            { name: 'Remo con Barra (90º)', videoUrl: 'https://www.youtube.com/watch?v=RQU8wL6G_HI' },
            { name: 'Remo con Mancuerna (1 mano)', videoUrl: 'https://www.youtube.com/watch?v=dFzUjzuW_2M' },
            { name: 'Remo en Polea Baja (Gironda)', videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74' },
            { name: 'Peso Muerto Convencional', videoUrl: 'https://www.youtube.com/watch?v=ytGaGIn3SjE' },
            { name: 'Remo en Punta (T-Bar)', videoUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4' },
            { name: 'Pull-over en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=P_m8_z_Lh-I' },
            { name: 'Hiperextensiones', videoUrl: 'https://www.youtube.com/watch?v=ph3pddpKzzw' },
            { name: 'Jalón con Brazos Rectos', videoUrl: 'https://www.youtube.com/watch?v=AJO_R0E-zB8' },
            { name: 'Remo con Soporte en Pecho', videoUrl: 'https://www.youtube.com/watch?v=roS6vXG3o1w' },
            { name: 'Remo con Barra con Agarre Supino', videoUrl: 'https://www.youtube.com/watch?v=RQU8wL6G_HI' },
            { name: 'Remo con Barra T con Soporte', videoUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4' },
            { name: 'Remo en Polea Alta con Agarre Neutro', videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74' },
            { name: 'Remo con Mancuerna apoyado en Banco Inclinado', videoUrl: 'https://www.youtube.com/watch?v=roS6vXG3o1w' },
            { name: 'Pull-down unilateral en Polea', videoUrl: 'https://www.youtube.com/watch?v=P_m8_z_Lh-I' },
            { name: 'Remo Pendlay', videoUrl: 'https://www.youtube.com/watch?v=h4nOCa7HQHQ' },
            { name: 'Jalón al Pecho con barra en V', videoUrl: 'https://www.youtube.com/watch?v=G86L6_W8y-w' },
            { name: 'Remo unilateral en máquina convergente', videoUrl: 'https://www.youtube.com/watch?v=roS6vXG3o1w' },
            { name: 'Jalón al Pecho Unilateral', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
            { name: 'Pull-over con Barra', videoUrl: 'https://www.youtube.com/watch?v=FK4rj9Ps0uM' }
        ],
        'Lumbares': [
            { name: 'Peso Muerto Rumano (Lumbares)', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzz9Sg' },
            { name: 'Buenos Días con Barra', videoUrl: 'https://www.youtube.com/watch?v=743S8vR3XUaA' },
            { name: 'Hiperextensiones invertidas', videoUrl: 'https://www.youtube.com/watch?v=ph3pddpKzzw' },
            { name: 'Peso Muerto con Barra Hexagonal', videoUrl: 'https://www.youtube.com/watch?v=ytGaGIn3SjE' },
            { name: 'Extensión Lumbar en Suelo (Supermans)', videoUrl: 'https://www.youtube.com/watch?v=ph3pddpKzzw' },
            { name: 'Bird Dog (Perro de caza)', videoUrl: 'https://www.youtube.com/watch?v=743XLEnwUr1gk' },
            { name: 'Puente Lumbar Isométrico', videoUrl: 'https://www.youtube.com/watch?v=j6iT33H99e0' },
            { name: 'Peso Muerto Sumo', videoUrl: 'https://www.youtube.com/watch?v=ytGaGIn3SjE' },
            { name: 'Cat-Cow (Gato-Camello)', videoUrl: 'https://www.youtube.com/watch?v=TvxNkmjdhMM' },
            { name: 'Plancha Lumbar / Inversa', videoUrl: 'https://www.youtube.com/watch?v=TvxNkmjdhMM' }
        ],
        'Hombros': [
            { name: 'Press Militar (Barra)', videoUrl: 'https://www.youtube.com/watch?v=743yjwxtZ_Vkg' },
            { name: 'Press Militar (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=hzV0is76j5I' },
            { name: 'Press Arnold', videoUrl: 'https://www.youtube.com/watch?v=743mcHe6Pvefc' },
            { name: 'Elevaciones Laterales (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=743VcKaXpzqRo' },
            { name: 'Elevaciones Laterales (Polea)', videoUrl: 'https://www.youtube.com/watch?v=PPrzBWZDOhA' },
            { name: 'Elevaciones Frontales (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=gzXoI26vT_o' },
            { name: 'Pájaros (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=743yMdhi2DVao' },
            { name: 'Pájaros (Polea)', videoUrl: 'https://www.youtube.com/watch?v=H530fW3KWfk' },
            { name: 'Facepulls', videoUrl: 'https://www.youtube.com/watch?v=V8dZ3on_D_Y' },
            { name: 'Encogimientos de Hombros', videoUrl: 'https://www.youtube.com/watch?v=g6qbq4u19OY' },
            { name: 'Remo al Mentón (Barra EZ)', videoUrl: 'https://www.youtube.com/watch?v=um3VVz_SIsg' },
            { name: 'Pájaros en Peck Deck Invertido', videoUrl: 'https://www.youtube.com/watch?v=743yWTVfXNntc' },
            { name: 'Press Militar con Mancuernas Sentado', videoUrl: 'https://www.youtube.com/watch?v=hzV0is76j5I' },
            { name: 'Elevaciones Laterales Inclinadas (Mancuerna)', videoUrl: 'https://www.youtube.com/watch?v=743VcKaXpzqRo' },
            { name: 'Elevaciones Frontales con Disco', videoUrl: 'https://www.youtube.com/watch?v=gzXoI26vT_o' },
            { name: 'Pájaros Sentado', videoUrl: 'https://www.youtube.com/watch?v=743yMdhi2DVao' },
            { name: 'Press de Hombros en Máquina Smith', videoUrl: 'https://www.youtube.com/watch?v=743yjwxtZ_Vkg' },
            { name: 'Elevaciones Laterales Unilaterales en Polea', videoUrl: 'https://www.youtube.com/watch?v=PPrzBWZDOhA' },
            { name: 'Face Pull en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=V8dZ3on_D_Y' },
            { name: 'Elevaciones Laterales en Máquina', videoUrl: 'https://www.youtube.com/watch?v=743VcKaXpzqRo' },
            { name: 'Press militar arrodillado con mancuerna', videoUrl: 'https://www.youtube.com/watch?v=hzV0is76j5I' },
            { name: 'Elevaciones Frontales con Polea', videoUrl: 'https://www.youtube.com/watch?v=gzXoI26vT_o' }
        ],
        'Cuadriceps': [
            { name: 'Sentadilla Libre (Barra)', videoUrl: 'https://www.youtube.com/watch?v=SW_C1A-SHMA' },
            { name: 'Prensa de Piernas 45º', videoUrl: 'https://www.youtube.com/watch?v=yZ800I4r_0g' },
            { name: 'Extensiones de Cuádriceps', videoUrl: 'https://www.youtube.com/watch?v=YyvSfVLYd80' },
            { name: 'Zancadas Caminando (Lunges)', videoUrl: 'https://www.youtube.com/watch?v=D7KaRcUTQeE' },
            { name: 'Sentadilla Búlgara (Foco Cuádriceps)', videoUrl: 'https://www.youtube.com/watch?v=743C-uNgKwPLE' },
            { name: 'Sentadilla Hack', videoUrl: 'https://www.youtube.com/watch?v=EdSndmB-A7c' },
            { name: 'Sentadilla Goblet', videoUrl: 'https://www.youtube.com/watch?v=MeIiGibT6X0' },
            { name: 'Sentadilla Frontal con Barra', videoUrl: 'https://www.youtube.com/watch?v=SW_C1A-SHMA' },
            { name: 'Zancadas con Mancuernas', videoUrl: 'https://www.youtube.com/watch?v=D7KaRcUTQeE' },
            { name: 'Sentadilla Sissy', videoUrl: 'https://www.youtube.com/watch?v=YyvSfVLYd80' },
            { name: 'Extensión de Cuádriceps unilateral', videoUrl: 'https://www.youtube.com/watch?v=YyvSfVLYd80' },
            { name: 'Step Ups con Mancuernas', videoUrl: 'https://www.youtube.com/watch?v=743_C8p9pNc6U' },
            { name: 'Prensa de Piernas a una pierna', videoUrl: 'https://www.youtube.com/watch?v=yZ800I4r_0g' },
            { name: 'Sentadilla Búlgara con Mancuernas', videoUrl: 'https://www.youtube.com/watch?v=743C-uNgKwPLE' },
            { name: 'Sentadilla en Máquina Smith', videoUrl: 'https://www.youtube.com/watch?v=SW_C1A-SHMA' },
            { name: 'Zancadas invertidas', videoUrl: 'https://www.youtube.com/watch?v=D7KaRcUTQeE' },
            { name: 'Sentadilla isométrica apoyada en pared', videoUrl: 'https://www.youtube.com/watch?v=SW_C1A-SHMA' }
        ],
        'Isquiotibiales': [
            { name: 'Curl Femoral Tumbado', videoUrl: 'https://www.youtube.com/watch?v=743Tq3QdAUUoI' },
            { name: 'Curl Femoral Sentado', videoUrl: 'https://www.youtube.com/watch?v=F488k66OZuE' },
            { name: 'Peso Muerto Rumano (Isquios)', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzz9Sg' },
            { name: 'Peso Muerto Rumano con Mancuernas', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzz9Sg' },
            { name: 'Curl Femoral de Pie en Máquina', videoUrl: 'https://www.youtube.com/watch?v=F488k66OZuE' },
            { name: 'Curl Femoral con Fitball', videoUrl: 'https://www.youtube.com/watch?v=743Tq3QdAUUoI' },
            { name: 'Peso Muerto Rumano Unilateral', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzz9Sg' },
            { name: 'Buenos Días con Mancuernas', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzz9Sg' },
            { name: 'Curl Femoral con Mancuerna entre pies', videoUrl: 'https://www.youtube.com/watch?v=743Tq3QdAUUoI' },
            { name: 'Glute-Ham Raise (GHR)', videoUrl: 'https://www.youtube.com/watch?v=F488k66OZuE' },
            { name: 'Curl de Piernas Sentado Unilateral', videoUrl: 'https://www.youtube.com/watch?v=F488k66OZuE' },
            { name: 'Curl Femoral en Polea', videoUrl: 'https://www.youtube.com/watch?v=743Tq3QdAUUoI' },
            { name: 'Peso Muerto Rumano con barra hexagonal', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzz9Sg' }
        ],
        'Gemelos': [
            { name: 'Elevación de Gemelos (De pie)', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
            { name: 'Elevación de Gemelos (Sentado)', videoUrl: 'https://www.youtube.com/watch?v=JbyjN7BW3ic' },
            { name: 'Elevación de Gemelos en Prensa', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
            { name: 'Elevación de Gemelos tipo Burro (Donkey Raises)', videoUrl: 'https://www.youtube.com/watch?v=JbyjN7BW3ic' },
            { name: 'Elevación de Gemelos Unilateral', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
            { name: 'Elevación de Gemelos en Sentadilla Hack', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
            { name: 'Elevación de Gemelos en Suelo sin peso', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
            { name: 'Paseo del granjero de puntillas', videoUrl: 'https://www.youtube.com/watch?v=dFzUjzuW_2M' },
            { name: 'Elevación de Gemelos sentado con Mancuerna', videoUrl: 'https://www.youtube.com/watch?v=JbyjN7BW3ic' },
            { name: 'Elevación de Gemelos con Barra de pie', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
            { name: 'Elevación de Gemelos con tensor elástico', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
            { name: 'Saltos a la comba de puntillas', videoUrl: 'https://www.youtube.com/watch?v=JbyjN7BW3ic' }
        ],
        'Glúteos': [
            { name: 'Hip Thrust (Barra)', videoUrl: 'https://www.youtube.com/watch?v=SEDZFull6pQ' },
            { name: 'Puente de Glúteo (Barra)', videoUrl: 'https://www.youtube.com/watch?v=j6iT33H99e0' },
            { name: 'Patada de Glúteo en Polea', videoUrl: 'https://www.youtube.com/watch?v=N_p2U_62jG8' },
            { name: 'Abducciones en Máquina', videoUrl: 'https://www.youtube.com/watch?v=NpZp824T3lE' },
            { name: 'Zancada Búlgara (Foco Glúteo)', videoUrl: 'https://www.youtube.com/watch?v=743C-uNgKwPLE' },
            { name: 'Step Up (Cajón Alto)', videoUrl: 'https://www.youtube.com/watch?v=743_C8p9pNc6U' },
            { name: 'Abducciones en Polea', videoUrl: 'https://www.youtube.com/watch?v=NpZp824F3lE' },
            { name: 'Hip Thrust con Mancuerna', videoUrl: 'https://www.youtube.com/watch?v=SEDZFull6pQ' },
            { name: 'Patadas de Glúteo en Suelo (Quadruped Hip Extension)', videoUrl: 'https://www.youtube.com/watch?v=N_p2U_62jG8' },
            { name: 'Puentes de Glúteo Unilaterales', videoUrl: 'https://www.youtube.com/watch?v=j6iT33H99e0' },
            { name: 'Frog Pumps (Puente de Glúteo Rana)', videoUrl: 'https://www.youtube.com/watch?v=j6iT33H99e0' },
            { name: 'Zancadas cruzadas (Curtsy Lunges)', videoUrl: 'https://www.youtube.com/watch?v=743C-uNgKwPLE' },
            { name: 'Extensión de cadera en banco inclinado', videoUrl: 'https://www.youtube.com/watch?v=NpZp824T3lE' },
            { name: 'Caminata lateral con banda elástica (Monster Walk)', videoUrl: 'https://www.youtube.com/watch?v=NpZp824T3lE' },
            { name: 'Peso muerto rumano enfocado en glúteos', videoUrl: 'https://www.youtube.com/watch?v=SEDZFull6pQ' },
            { name: 'Sentadilla Sumo con Mancuerna', videoUrl: 'https://www.youtube.com/watch?v=743_C8p9pNc6U' },
            { name: 'Abducciones de cadera tumbado (Clamshells)', videoUrl: 'https://www.youtube.com/watch?v=NpZp824T3lE' }
        ],
        'Biceps': [
            { name: 'Curl con Barra Z', videoUrl: 'https://www.youtube.com/watch?v=LY1V6p-XvJk' },
            { name: 'Curl Martillo', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4' },
            { name: 'Curl Predicador (Scott)', videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0' },
            { name: 'Curl Alterno (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=sAq_ocpRh_I' },
            { name: 'Curl Concentrado', videoUrl: 'https://www.youtube.com/watch?v=v0ZStv9fU8k' },
            { name: 'Curl en Polea Baja', videoUrl: 'https://www.youtube.com/watch?v=AsAVbgh8Syg' },
            { name: 'Curl de Bíceps en Banco Inclinado', videoUrl: 'https://www.youtube.com/watch?v=sAq_ocpRh_I' },
            { name: 'Curl Spider (Araña) en Banco', videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0' },
            { name: 'Curl de Bíceps Zottman', videoUrl: 'https://www.youtube.com/watch?v=LY1V6p-XvJk' },
            { name: 'Curl Concentrado apoyado en Muslo', videoUrl: 'https://www.youtube.com/watch?v=v0ZStv9fU8k' },
            { name: 'Curl de Bíceps con Barra Recta', videoUrl: 'https://www.youtube.com/watch?v=AsAVbgh8Syg' },
            { name: 'Curl de Bíceps en Polea con Cuerda', videoUrl: 'https://www.youtube.com/watch?v=AsAVbgh8Syg' },
            { name: 'Curl Martillo con Polea', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4' },
            { name: 'Curl Predicador con Mancuerna', videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0' },
            { name: 'Curl de Bíceps Unilateral apoyado en rodilla', videoUrl: 'https://www.youtube.com/watch?v=v0ZStv9fU8k' },
            { name: 'Curl de Bíceps en Pronación (Invertido)', videoUrl: 'https://www.youtube.com/watch?v=LY1V6p-XvJk' }
        ],
        'Triceps': [
            { name: 'Press Francés', videoUrl: 'https://www.youtube.com/watch?v=743u1_NreL7mU' },
            { name: 'Extensiones en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=743-LAMcpzHLU' },
            { name: 'Patada de Tríceps (Polea)', videoUrl: 'https://www.youtube.com/watch?v=743SS6K3lAwZ8' },
            { name: 'Press de Banca Estrecho', videoUrl: 'https://www.youtube.com/watch?v=wX-EPr_x4_A' },
            { name: 'Extensiones tras nuca', videoUrl: 'https://www.youtube.com/watch?v=743XhS6_q1Vtc' },
            { name: 'Patada de Tríceps con Mancuerna', videoUrl: 'https://www.youtube.com/watch?v=743SS6K3lAwZ8' },
            { name: 'Fondos entre Bancos (Tríceps)', videoUrl: 'https://www.youtube.com/watch?v=743z8JmcrW-As' },
            { name: 'Press Francés con Mancuernas', videoUrl: 'https://www.youtube.com/watch?v=743u1_NreL7mU' },
            { name: 'Extensión de Tríceps por encima de la cabeza en Polea', videoUrl: 'https://www.youtube.com/watch?v=743XhS6_q1Vtc' },
            { name: 'Fondos en Máquina para Tríceps', videoUrl: 'https://www.youtube.com/watch?v=743z8JmcrW-As' },
            { name: 'Rompecráneos (Skull Crushers) con barra EZ', videoUrl: 'https://www.youtube.com/watch?v=743u1_NreL7mU' },
            { name: 'Extensión de Tríceps unilateral en Polea', videoUrl: 'https://www.youtube.com/watch?v=743-LAMcpzHLU' },
            { name: 'Flexiones de diamante en banco', videoUrl: 'https://www.youtube.com/watch?v=wX-EPr_x4_A' },
            { name: 'Extensión de Tríceps con mancuerna a dos manos', videoUrl: 'https://www.youtube.com/watch?v=743XhS6_q1Vtc' },
            { name: 'Extensiones de Tríceps con Cuerda invertida', videoUrl: 'https://www.youtube.com/watch?v=743-LAMcpzHLU' }
        ],
        'Antebrazo': [
            { name: 'Curl de Muñeca en Pronación con Barra', videoUrl: 'https://www.youtube.com/watch?v=LY1V6p-XvJk' },
            { name: 'Curl de Muñeca en Supinación con Barra', videoUrl: 'https://www.youtube.com/watch?v=LY1V6p-XvJk' },
            { name: 'Paseo del Granjero (Farmer\'s Walk)', videoUrl: 'https://www.youtube.com/watch?v=dFzUjzuW_2M' },
            { name: 'Curl Invertido con barra Z (Foco Antebrazo)', videoUrl: 'https://www.youtube.com/watch?v=LY1V6p-XvJk' },
            { name: 'Rotaciones de muñeca con Mancuerna', videoUrl: 'https://www.youtube.com/watch?v=v0ZStv9fU8k' },
            { name: 'Cuelgue Pasivo en Barra (Dead Hang)', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
            { name: 'Curl Martillo con Mancuernas (Foco Braquiorradial)', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4' },
            { name: 'Enrollamiento de cuerda con peso (Wrist Roller)', videoUrl: 'https://www.youtube.com/watch?v=LY1V6p-XvJk' },
            { name: 'Curl de Muñeca con Mancuerna detrás de la espalda', videoUrl: 'https://www.youtube.com/watch?v=LY1V6p-XvJk' },
            { name: 'Pinza manual (Hand Gripper)', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4' }
        ],
        'Abdominales': [
            { name: 'Plancha Abdominal', videoUrl: 'https://www.youtube.com/watch?v=TvxNkmjdhMM' },
            { name: 'Crunch en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=S08E3B6xLMc' },
            { name: 'Elevación de Piernas (Colgado)', videoUrl: 'https://www.youtube.com/watch?v=hd_FpXy97r0' },
            { name: 'Rueda Abdominal (Ab Wheel)', videoUrl: 'https://www.youtube.com/watch?v=H7m_L0XF9vI' },
            { name: 'Dead Bug', videoUrl: 'https://www.youtube.com/watch?v=743XLEnwUr1gk' },
            { name: 'Crunch Abdominal en Suelo', videoUrl: 'https://www.youtube.com/watch?v=S08E3B6xLMc' },
            { name: 'Elevación de Piernas tumbado (Leg Raises)', videoUrl: 'https://www.youtube.com/watch?v=hd_FpXy97r0' },
            { name: 'Giros Rusos (Russian Twists)', videoUrl: 'https://www.youtube.com/watch?v=743XLEnwUr1gk' },
            { name: 'Escaladores (Mountain Climbers)', videoUrl: 'https://www.youtube.com/watch?v=TvxNkmjdhMM' },
            { name: 'Crunch de Bicicleta', videoUrl: 'https://www.youtube.com/watch?v=S08E3B6xLMc' },
            { name: 'Tijeras Abdominales (Flutter Kicks)', videoUrl: 'https://www.youtube.com/watch?v=hd_FpXy97r0' },
            { name: 'Plancha Lateral (Side Plank)', videoUrl: 'https://www.youtube.com/watch?v=TvxNkmjdhMM' },
            { name: 'Elevación de Pelvis en Plancha', videoUrl: 'https://www.youtube.com/watch?v=TvxNkmjdhMM' },
            { name: 'Abdominales en V (V-Ups)', videoUrl: 'https://www.youtube.com/watch?v=hd_FpXy97r0' },
            { name: 'Leñador (Woodchopper) en Polea', videoUrl: 'https://www.youtube.com/watch?v=H7m_L0XF9vI' }
        ],
        'Cuello': [
            { name: 'Extensión de Cuello con Disco', videoUrl: 'https://www.youtube.com/watch?v=um3VVz_SIsg' },
            { name: 'Flexión de Cuello con Disco', videoUrl: 'https://www.youtube.com/watch?v=um3VVz_SIsg' },
            { name: 'Extensión de Cuello isométrica manual', videoUrl: 'https://www.youtube.com/watch?v=um3VVz_SIsg' },
            { name: 'Flexión de Cuello isométrica manual', videoUrl: 'https://www.youtube.com/watch?v=um3VVz_SIsg' },
            { name: 'Flexión lateral de Cuello manual', videoUrl: 'https://www.youtube.com/watch?v=um3VVz_SIsg' },
            { name: 'Rotaciones de Cuello controladas', videoUrl: 'https://www.youtube.com/watch?v=um3VVz_SIsg' },
            { name: 'Encogimientos con barra por detrás de la espalda', videoUrl: 'https://www.youtube.com/watch?v=g6qbq4u19OY' },
            { name: 'Paseo del granjero pesado (Foco trapecio/cuello)', videoUrl: 'https://www.youtube.com/watch?v=dFzUjzuW_2M' },
            { name: 'Encogimientos con Mancuernas sentados', videoUrl: 'https://www.youtube.com/watch?v=g6qbq4u19OY' },
            { name: 'Extensión de cuello con arnés para cabeza', videoUrl: 'https://www.youtube.com/watch?v=um3VVz_SIsg' }
        ]
    };

    function initializeProExercises() {
        const isClient = !window.location.pathname.includes('trainer-') && !window.location.pathname.includes('admin-');
        if (isClient) {
            if (typeof loadMedia === 'function') loadMedia();
            if (typeof loadRoutines === 'function') loadRoutines();
            return;
        }

        if (!window.getData || !window.saveData) {
            console.warn("CustomExercises: Core functions not found. Retrying in 100ms...");
            setTimeout(initializeProExercises, 100);
            return;
        }

        const data = window.getData();
        let changed = false;

        // --- LÓGICA DE PURGA REAL (v92 PRO) ---
        if (data.media && data.media.length > 0) {
            const initialCount = data.media.length;
            data.media = data.media.filter(m => {
                if (m.category !== 'exercise') return true;
                const isOfficial = m.id && (String(m.id).startsWith('sys-ex-') || String(m.id).startsWith('prof-ex-'));
                const isSystem = m.isSystem === true;
                const isPersonal = !isOfficial && !isSystem; // Conservar los añadidos por el entrenador
                return isOfficial || isSystem || isPersonal;
            });

            // Deduplicación por ID para evitar duplicados del bug de comparación por título
            const seenIds = new Set();
            data.media = data.media.filter(m => {
                if (m.category === 'exercise' && m.id) {
                    if (seenIds.has(m.id)) {
                        return false;
                    }
                    seenIds.add(m.id);
                }
                return true;
            });

            if (data.media.length !== initialCount) {
                console.log(`🧹 Real Mode (Exercises): Purga/Deduplicación completada. Eliminados ${initialCount - data.media.length} activos.`);
                changed = true;
            }
        }

        // 1. Asegurar estructura de Configuración con los 13 nuevos grupos
        const targetGroups = ['Pectorales', 'Dorsales', 'Lumbares', 'Hombros', 'Biceps', 'Triceps', 'Antebrazo', 'Abdominales', 'Cuadriceps', 'Isquiotibiales', 'Gemelos', 'Glúteos', 'Cuello'];
        
        if (!data.muscleGroupsConfig) {
            data.muscleGroupsConfig = {
                groups: targetGroups,
                exercises: {}
            };
            changed = true;
        } else {
            const currentGroups = data.muscleGroupsConfig.groups || [];
            if (JSON.stringify(currentGroups) !== JSON.stringify(targetGroups)) {
                data.muscleGroupsConfig.groups = targetGroups;
                changed = true;
            }
        }

        const mgConfig = data.muscleGroupsConfig;
        if (!mgConfig.exercises) {
            mgConfig.exercises = {};
            changed = true;
        }

        // 2. Inyectar / Actualizar Ejercicios PRO
        for (const group in PRO_EXERCISES) {
            if (!mgConfig.exercises[group]) {
                mgConfig.exercises[group] = [];
                changed = true;
            }

            PRO_EXERCISES[group].forEach(proEx => {
                const index = mgConfig.exercises[group].findIndex(ex => {
                    const exName = typeof ex === 'string' ? ex : ex.name;
                    return exName.toLowerCase().trim() === proEx.name.toLowerCase().trim();
                });

                if (index === -1) {
                    mgConfig.exercises[group].push({ name: proEx.name, videoUrl: proEx.videoUrl });
                    changed = true;
                } else {
                    const currentEx = mgConfig.exercises[group][index];
                    const currentUrl = typeof currentEx === 'string' ? '' : (currentEx.videoUrl || '');
                    
                    if (!currentUrl || currentUrl.includes('placeholder')) {
                        mgConfig.exercises[group][index] = { 
                            name: typeof currentEx === 'string' ? currentEx : currentEx.name, 
                            videoUrl: proEx.videoUrl 
                        };
                        changed = true;
                    }
                }
            });
        }

        // 3. Sincronizar con la Biblioteca Multimedia (Media)
        if (data.media) {
            for (const group in PRO_EXERCISES) {
                PRO_EXERCISES[group].forEach(proEx => {
                    const targetId = 'sys-ex-' + proEx.name.replace(/\s+/g, '-').toLowerCase();
                    const mediaIndex = data.media.findIndex(m => 
                        m.category === 'exercise' && 
                        m.id === targetId
                    );

                    if (mediaIndex === -1) {
                        data.media.push({
                            id: targetId,
                            type: 'video',
                            category: 'exercise',
                            url: proEx.videoUrl,
                            title: proEx.name,
                            muscleGroup: group,
                            isSystem: true,
                            createdAt: new Date().toISOString()
                        });
                        changed = true;
                    } else {
                        const currentEx = data.media[mediaIndex];
                        // Si el entrenador personalizó la url o el grupo, lo marcamos como userEdited para protegerlo
                        if (currentEx.url && currentEx.url !== proEx.videoUrl && !currentEx.url.includes('placeholder')) {
                            if (!currentEx.userEdited) {
                                currentEx.userEdited = true;
                                changed = true;
                            }
                        }
                        
                        // Solo actualizamos de forma automática si no ha sido editado por el usuario
                        if (!currentEx.userEdited) {
                            if (currentEx.url !== proEx.videoUrl || currentEx.muscleGroup !== group) {
                                currentEx.url = proEx.videoUrl;
                                currentEx.muscleGroup = group;
                                changed = true;
                            }
                        }
                    }
                });
            }
        }

        // 4. Guardar si hubo cambios
        if (changed) {
            data.muscleGroupsConfig = mgConfig;
            window.saveData(data);
            console.log("CustomExercises: Biblioteca profesional inyectada y sincronizada ✅");
            if (window.syncToCloud) window.syncToCloud();
        }

        if (typeof loadMedia === 'function') loadMedia();
        if (typeof loadRoutines === 'function') loadRoutines();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProExercises);
    } else {
        setTimeout(initializeProExercises, 50);
    }
})();

// =========================================================================
// INTERACTIVE SVG ANATOMICAL MUSCLE MAP MODAL (MALE & FEMALE SIDE-BY-SIDE)
// =========================================================================
window.showAnatomicalMapModal = function() {
    // 1. Get categorized exercises dynamically from library
    let config = null;
    if (typeof getMuscleGroups === 'function') {
        config = getMuscleGroups();
    } else {
        // Fallback dynamic builder for client-details view
        const exercisesList = Media.getAll().filter(m => m.category === 'exercise');
        const defaultGroups = ['Pectorales', 'Dorsales', 'Lumbares', 'Hombros', 'Biceps', 'Triceps', 'Antebrazo', 'Abdominales', 'Cuadriceps', 'Isquiotibiales', 'Gemelos', 'Glúteos', 'Cuello'];
        const activeGroups = exercisesList.map(m => m.muscleGroup).filter(Boolean);
        const groups = [...new Set([...defaultGroups, ...activeGroups])];
        
        const exerciseMap = {};
        groups.forEach(g => {
            exerciseMap[g] = exercisesList
                .filter(m => m.muscleGroup === g)
                .map(m => ({ name: m.title, videoUrl: m.url, id: m.id }));
        });
        config = { groups, exercises: exerciseMap };
    }

    const modalContent = `
        <style>
            .muscle-hotspot {
                fill: rgba(0, 217, 255, 0.05);
                stroke: rgba(0, 217, 255, 0.25);
                stroke-width: 1.5;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .muscle-hotspot:hover, .muscle-hotspot.active {
                fill: rgba(255, 20, 147, 0.35) !important;
                stroke: #ff1493 !important;
                filter: drop-shadow(0 0 10px rgba(255, 20, 147, 0.8));
            }
            .body-silhouette {
                fill: rgba(255, 255, 255, 0.02);
                stroke: rgba(255, 255, 255, 0.08);
                stroke-width: 1;
            }
            .map-exercise-card {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 10px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s ease;
                gap: 10px;
            }
            .map-exercise-card:hover {
                background: rgba(255, 20, 147, 0.06);
                border-color: rgba(255, 20, 147, 0.3);
                transform: translateX(3px);
            }
            .svg-container {
                transition: transform 0.3s ease;
            }
            .svg-container:hover {
                transform: scale(1.02);
            }
            
            /* Prevent modal-body scrolling and force proper flex layout */
            .modal-overlay.modal-xl .modal-body {
                overflow: hidden !important;
                display: flex;
                flex-direction: column;
            }
        </style>
        
        <div style="display: flex; gap: 20px; height: 65vh; min-height: 480px; max-height: 650px; align-items: stretch; justify-content: space-between; width: 100%; box-sizing: border-box; flex-wrap: wrap;">
            <!-- Contenedor del Mapa (2 siluetas side-by-side: Frente y Espalda) -->
            <div style="flex: 1.2; min-width: 350px; display: grid; grid-template-columns: repeat(2, 1fr); align-items: center; justify-items: center; background: rgba(0,0,0,0.25); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); padding: 15px 10px; gap: 20px; overflow: hidden; height: 100%;">
                <!-- Frente -->
                <div class="svg-container" style="text-align: center; width: 100%;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 800; margin-bottom: 8px; letter-spacing: 1px; text-transform: uppercase;">FRENTE</div>
                    <svg width="100%" height="380" viewBox="0 0 160 320" style="overflow: visible;">
                        <path class="body-silhouette" d="M80,10 C86,10 90,14 90,20 C90,26 86,30 80,30 C74,30 70,26 70,20 C70,14 74,10 80,10 Z M76,30 L84,30 L84,38 L76,38 Z M76,38 L84,38 L104,46 L108,70 L118,100 L112,102 L103,75 L96,105 L90,160 L102,230 L94,310 L84,310 L78,235 L72,235 L66,310 L56,310 L48,230 L60,160 L54,105 L47,75 L38,102 L32,100 L42,70 L46,46 Z"/>
                        <polygon class="muscle-hotspot" data-muscle="Cuello" points="74,30 86,30 84,38 76,38" />
                        <polygon class="muscle-hotspot" data-muscle="Hombros" points="46,46 58,49 54,65 42,60" />
                        <polygon class="muscle-hotspot" data-muscle="Hombros" points="104,46 118,49 114,65 102,60" />
                        <polygon class="muscle-hotspot" data-muscle="Pectorales" points="58,49 80,52 80,75 56,72" />
                        <polygon class="muscle-hotspot" data-muscle="Pectorales" points="80,52 102,49 104,72 80,75" />
                        <polygon class="muscle-hotspot" data-muscle="Biceps" points="42,60 54,65 48,95 38,90" />
                        <polygon class="muscle-hotspot" data-muscle="Biceps" points="118,60 106,65 112,95 122,90" />
                        <polygon class="muscle-hotspot" data-muscle="Antebrazo" points="48,95 38,90 32,120 42,125" />
                        <polygon class="muscle-hotspot" data-muscle="Antebrazo" points="112,95 122,90 128,120 118,125" />
                        <polygon class="muscle-hotspot" data-muscle="Abdominales" points="56,72 80,75 104,72 96,120 80,123 64,120" />
                        <polygon class="muscle-hotspot" data-muscle="Cuadriceps" points="64,125 80,128 76,190 54,185" />
                        <polygon class="muscle-hotspot" data-muscle="Cuadriceps" points="80,128 96,125 106,185 84,190" />
                        <polygon class="muscle-hotspot" data-muscle="Cuadriceps" points="54,190 74,190 70,250 58,250" />
                        <polygon class="muscle-hotspot" data-muscle="Cuadriceps" points="86,190 106,190 102,250 90,250" />
                    </svg>
                </div>
                
                <!-- Espalda -->
                <div class="svg-container" style="text-align: center; width: 100%;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 800; margin-bottom: 8px; letter-spacing: 1px; text-transform: uppercase;">ESPALDA</div>
                    <svg width="100%" height="380" viewBox="0 0 160 320" style="overflow: visible;">
                        <path class="body-silhouette" d="M80,10 C86,10 90,14 90,20 C90,26 86,30 80,30 C74,30 70,26 70,20 C70,14 74,10 80,10 Z M76,30 L84,30 L84,38 L76,38 Z M76,38 L84,38 L104,46 L108,70 L118,100 L112,102 L103,75 L96,105 L90,160 L102,230 L94,310 L84,310 L78,235 L72,235 L66,310 L56,310 L48,230 L60,160 L54,105 L47,75 L38,102 L32,100 L42,70 L46,46 Z"/>
                        <polygon class="muscle-hotspot" data-muscle="Trapecio" points="70,38 90,38 98,48 80,51 62,48" />
                        <polygon class="muscle-hotspot" data-muscle="Hombros" points="46,46 58,49 54,65 42,60" />
                        <polygon class="muscle-hotspot" data-muscle="Hombros" points="104,46 118,49 114,65 102,60" />
                        <polygon class="muscle-hotspot" data-muscle="Dorsales" points="62,48 80,51 98,48 94,80 80,84 66,80" />
                        <polygon class="muscle-hotspot" data-muscle="Triceps" points="42,60 54,65 48,95 38,90" />
                        <polygon class="muscle-hotspot" data-muscle="Triceps" points="118,60 106,65 112,95 122,90" />
                        <polygon class="muscle-hotspot" data-muscle="Lumbares" points="66,80 80,84 94,80 90,110 80,114 70,110" />
                        <polygon class="muscle-hotspot" data-muscle="Glúteos" points="70,110 80,114 80,145 56,140" />
                        <polygon class="muscle-hotspot" data-muscle="Glúteos" points="80,114 90,110 104,140 80,145" />
                        <polygon class="muscle-hotspot" data-muscle="Isquiotibiales" points="56,140 80,145 76,205 54,200" />
                        <polygon class="muscle-hotspot" data-muscle="Isquiotibiales" points="80,145 104,140 106,200 84,205" />
                        <polygon class="muscle-hotspot" data-muscle="Gemelos" points="54,200 74,200 70,260 58,260" />
                        <polygon class="muscle-hotspot" data-muscle="Gemelos" points="86,200 106,200 102,260 90,260" />
                    </svg>
                </div>
            </div>
            
            <!-- Sidebar de Ejercicios (Glassmorphism) -->
            <div id="mapExercisesPanel" style="width: 320px; background: rgba(26,26,46,0.5); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); height: 100%;">
                <!-- Título del Músculo e Instrucción -->
                <div id="mapPanelHeader">
                    <h3 id="mapPanelTitle" style="margin: 0; font-size: 1.25rem; color: var(--primary-color);">Selecciona un músculo</h3>
                    <p id="mapPanelDesc" style="margin: 8px 0 0 0; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
                        Pasa el cursor o pulsa sobre las zonas iluminadas del cuerpo para ver y añadir ejercicios al instante.
                    </p>
                </div>
                <!-- Listado Scrollable -->
                <div id="mapPanelExercisesList" style="flex: 1; overflow-y: auto; margin-top: 15px; padding-right: 5px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; margin-top: 50px;">
                        <i>Apoya el cursor en una zona muscular (Pecho, Espalda, Piernas...)</i>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Abrir modal usando el helper showModal
    showModal('Mapa Anatómico Interactivo', modalContent, [
        { text: 'Cerrar Mapa', class: 'btn-secondary', onclick: 'this.closest(".modal-overlay").remove()' }
    ], 'modal-xl');

    // Vincular eventos dentro del modal creado
    const modalEl = document.querySelector('.modal-overlay:last-of-type');
    if (!modalEl) return;

    const exerciseMap = config.exercises;

    // Eventos Hover y Click para SVGs
    const hotspots = modalEl.querySelectorAll('.muscle-hotspot');
    hotspots.forEach(hot => {
        const muscle = hot.getAttribute('data-muscle');

        // Al pasar el cursor
        hot.addEventListener('mouseenter', () => {
            // Resaltar todos los segmentos del mismo grupo
            hotspots.forEach(h => {
                if (h.getAttribute('data-muscle') === muscle) {
                    h.classList.add('active');
                } else {
                    h.classList.remove('active');
                }
            });

            // Actualizar Panel Lateral
            updateMapExercisesPanel(muscle, exerciseMap);
        });

        // Al hacer clic (soporte para móviles y bloqueo táctil)
        hot.addEventListener('click', () => {
            hotspots.forEach(h => {
                if (h.getAttribute('data-muscle') === muscle) {
                    h.classList.add('active');
                } else {
                    h.classList.remove('active');
                }
            });
            updateMapExercisesPanel(muscle, exerciseMap);
        });
    });
};

function updateMapExercisesPanel(muscle, exerciseMap) {
    const titleEl = document.getElementById('mapPanelTitle');
    const listEl = document.getElementById('mapPanelExercisesList');
    if (!titleEl || !listEl) return;

    titleEl.textContent = muscle;
    titleEl.style.color = 'var(--primary-color)';

    const list = exerciseMap[muscle] || [];
    if (list.length === 0) {
        listEl.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; margin-top: 50px;">
                No hay ejercicios asignados en la biblioteca para <b>${muscle}</b>.
            </div>
        `;
        return;
    }

    listEl.innerHTML = list.map(ex => {
        return `
            <div class="map-exercise-card">
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                    <span style="font-size: 0.8rem; font-weight: 600; color: #fff; line-height: 1.2;">${ex.name}</span>
                    ${ex.videoUrl ? `<a href="${ex.videoUrl}" target="_blank" style="font-size: 0.65rem; color: var(--primary-color); text-decoration: none; font-weight: bold;">📺 Ver Video</a>` : ''}
                </div>
                <button class="btn btn-xs btn-primary" onclick="injectExerciseFromMap('${ex.name.replace(/'/g, "\\'")}')" style="padding: 4px 10px; font-size: 0.75rem; height: 28px; border-radius: 6px;">➕</button>
            </div>
        `;
    }).join('');
}

// Inyector global mapeado a la pantalla de rutinas y a la ficha del cliente
window.injectExerciseFromMap = function(name) {
    let added = false;

    // 1. Caso de editor visual directo inline en ficha del cliente (trainer-client-detail.html)
    if (typeof window.activeInlineDayIndex !== 'undefined' && window.activeInlineDayIndex !== null) {
        const dIdx = window.activeInlineDayIndex;
        if (editingRoutine && editingRoutine.days && editingRoutine.days[dIdx]) {
            if (!editingRoutine.days[dIdx].exercises) {
                editingRoutine.days[dIdx].exercises = [];
            }
            editingRoutine.days[dIdx].exercises.push({
                name: name,
                sets: '4',
                reps: '10-12',
                intensity: '2',
                notes: ''
            });
            if (typeof updateAssignedRoutineView === 'function') {
                updateAssignedRoutineView();
            }
            added = true;
        }
    }
    // 2. Caso de editor de plantillas de rutinas (trainer-routines.html)
    else if (typeof addExerciseToDay === 'function' && typeof updateExerciseData === 'function') {
        if (!editingRoutine.days[activeDayIndex].exercises) {
            editingRoutine.days[activeDayIndex].exercises = [];
        }
        editingRoutine.days[activeDayIndex].exercises.push({
            name: name,
            sets: '4',
            reps: '10-12',
            intensity: '2',
            notes: ''
        });
        renderRoutineEditor();
        added = true;
    }
    // 3. Caso de editor de rutinas de clientes (trainer-client-detail.html)
    else if (typeof addRoutineExercise === 'function' && typeof updateRoutineExercise === 'function') {
        if (!editingRoutine.days[activeDayIndex].exercises) {
            editingRoutine.days[activeDayIndex].exercises = [];
        }
        editingRoutine.days[activeDayIndex].exercises.push({
            name: name,
            sets: '4',
            reps: '10-12',
            intensity: '2',
            notes: ''
        });
        renderRoutineEditor();
        added = true;
    }

    if (added) {
        const targetDay = (typeof window.activeInlineDayIndex !== 'undefined' && window.activeInlineDayIndex !== null) 
            ? window.activeInlineDayIndex + 1 
            : (typeof activeDayIndex !== 'undefined' ? activeDayIndex + 1 : 1);
            
        if (typeof showToast === 'function') {
            showToast(`"${name}" añadido al Día ${targetDay}`, 'success');
        } else if (typeof showMsg === 'function') {
            showMsg(`"${name}" añadido con éxito`, 'success');
        } else {
            console.log(`"${name}" añadido con éxito`);
        }
    }
};
