from app.db.database import SessionLocal
from app.db.models import User, Campaign, CampaignStatus
from sqlalchemy.exc import NoResultFound
from datetime import datetime, timedelta
from app.auth.password import get_password_hash

def get_or_create_admin_user(db):
    """Create or get an admin user with properly hashed password"""
    admin = db.query(User).filter_by(email="admin@donation.com").first()
    if not admin:
        # Create admin with hashed password
        admin = User(
            email="admin@donation.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),  # Password is hashed securely
            full_name="Admin User",
            is_admin=True  # Set admin privileges
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("Admin user created successfully with email: admin@donation.com and password: admin123")
    else:
        print("Admin user already exists")
    return admin

def get_or_create_default_user(db):
    user = db.query(User).filter_by(email="demo@donation.com").first()
    if not user:
        user = User(
            email="demo@donation.com",
            username="demo_user",
            hashed_password=get_password_hash("demo123"),  # Updated to use proper hashing
            full_name="Demo User"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_campaign_content(lang):
    """Get campaign content based on language"""
    content = {
        'ar': {
            'title': 'قوة العلم: حملة دعم البحث العلمي والتعليم',
            'description': 'حملة لدعم البحث العلمي والتعليم في المجتمعات المحرومة، بهدف نشر المعرفة وتطوير القدرات العلمية للأجيال القادمة. نؤمن بأن العلم هو أساس التقدم والازدهار.',
            'markdown': '''# 🔬 قوة العلم: بناء المستقبل من خلال المعرفة

العلم هو القوة الحقيقية التي تحرك العالم نحو التقدم والازدهار. في عصر التكنولوجيا والابتكار، نحتاج إلى استثمار أكبر في البحث العلمي والتعليم لضمان مستقبل أفضل للأجيال القادمة.

---

## 🎯 أهداف الحملة:

### 🧪 1. دعم البحث العلمي
- تمويل مشاريع البحث العلمي في الجامعات والمراكز البحثية
- توفير الأجهزة والمعدات المخبرية المتطورة
- دعم الباحثين الشباب والمبتكرين

### 📚 2. تطوير التعليم العلمي
- إنشاء مختبرات علمية في المدارس
- تدريب المعلمين على أحدث طرق التدريس العلمي
- توفير المناهج والكتب العلمية المتطورة

### 💡 3. نشر الثقافة العلمية
- تنظيم ورش عمل ومحاضرات عامة
- إقامة معارض علمية تفاعلية
- دعم برامج التلفزيون والإذاعة العلمية

### 🌍 4. حل المشاكل المجتمعية
- البحث في حلول للمشاكل البيئية
- تطوير تقنيات الطاقة المتجددة
- إيجاد حلول طبية للأمراض المستعصية

---

## 💫 لماذا العلم مهم؟

العلم ليس مجرد معرفة نظرية، بل هو أداة التغيير الحقيقي في حياة البشر. من خلال العلم:
- نطور اللقاحات والأدوية
- نبتكر التقنيات التي تسهل حياتنا
- نفهم الكون والطبيعة من حولنا
- نحل المشاكل المعقدة التي تواجه البشرية

🧡 **معًا نبني مستقبلاً علمياً مشرقاً للجميع.**
'''
        },
        'en': {
            'title': 'The Power of Science: Supporting Scientific Research and Education',
            'description': 'A campaign to support scientific research and education in underserved communities, aiming to spread knowledge and develop scientific capabilities for future generations. We believe that science is the foundation of progress and prosperity.',
            'markdown': '''# 🔬 The Power of Science: Building the Future Through Knowledge

Science is the true force that drives the world toward progress and prosperity. In an age of technology and innovation, we need greater investment in scientific research and education to ensure a better future for generations to come.

---

## 🎯 Campaign Goals:

### 🧪 1. Supporting Scientific Research
- Funding research projects in universities and research centers
- Providing advanced laboratory equipment and instruments
- Supporting young researchers and innovators

### 📚 2. Developing Science Education
- Establishing science laboratories in schools
- Training teachers in modern scientific teaching methods
- Providing advanced scientific curricula and textbooks

### 💡 3. Promoting Scientific Culture
- Organizing workshops and public lectures
- Hosting interactive science exhibitions
- Supporting scientific TV and radio programs

### 🌍 4. Solving Community Problems
- Researching solutions to environmental problems
- Developing renewable energy technologies
- Finding medical solutions for incurable diseases

---

## 💫 Why Science Matters?

Science is not just theoretical knowledge, but a tool for real change in human life. Through science:
- We develop vaccines and medicines
- We innovate technologies that make our lives easier
- We understand the universe and nature around us
- We solve complex problems facing humanity

🧡 **Together we build a bright scientific future for everyone.**
'''
        },
        'fr': {
            'title': 'Le Pouvoir de la Science: Soutenir la Recherche Scientifique et l\'Éducation',
            'description': 'Une campagne pour soutenir la recherche scientifique et l\'éducation dans les communautés défavorisées, visant à diffuser les connaissances et développer les capacités scientifiques pour les générations futures. Nous croyons que la science est le fondement du progrès et de la prospérité.',
            'markdown': '''# 🔬 Le Pouvoir de la Science: Construire l'Avenir par la Connaissance

La science est la véritable force qui pousse le monde vers le progrès et la prospérité. À l'ère de la technologie et de l'innovation, nous avons besoin d'investissements plus importants dans la recherche scientifique et l'éducation pour assurer un avenir meilleur aux générations futures.

---

## 🎯 Objectifs de la Campagne:

### 🧪 1. Soutenir la Recherche Scientifique
- Financer des projets de recherche dans les universités et centres de recherche
- Fournir des équipements et instruments de laboratoire avancés
- Soutenir les jeunes chercheurs et innovateurs

### 📚 2. Développer l'Éducation Scientifique
- Établir des laboratoires scientifiques dans les écoles
- Former les enseignants aux méthodes d'enseignement scientifique modernes  
- Fournir des programmes et manuels scientifiques avancés

### 💡 3. Promouvoir la Culture Scientifique
- Organiser des ateliers et conférences publiques
- Accueillir des expositions scientifiques interactives
- Soutenir les programmes scientifiques TV et radio

### 🌍 4. Résoudre les Problèmes Communautaires
- Rechercher des solutions aux problèmes environnementaux
- Développer des technologies d'énergie renouvelable
- Trouver des solutions médicales pour les maladies incurables

---

## 💫 Pourquoi la Science Importe?

La science n'est pas seulement une connaissance théorique, mais un outil de changement réel dans la vie humaine. Grâce à la science:
- Nous développons des vaccins et des médicaments
- Nous innovons des technologies qui facilitent notre vie
- Nous comprenons l'univers et la nature qui nous entourent
- Nous résolvons des problèmes complexes auxquels l'humanité fait face

🧡 **Ensemble, nous construisons un avenir scientifique brillant pour tous.**
'''
        },
        'ru': {
            'title': 'Сила Науки: Поддержка Научных Исследований и Образования',
            'description': 'Кампания по поддержке научных исследований и образования в малообеспеченных сообществах, направленная на распространение знаний и развитие научных способностей для будущих поколений. Мы верим, что наука - это основа прогресса и процветания.',
            'markdown': '''# 🔬 Сила Науки: Строим Будущее Через Знания

Наука - это истинная сила, которая движет мир к прогрессу и процветанию. В эпоху технологий и инноваций нам нужны большие инвестиции в научные исследования и образование, чтобы обеспечить лучшее будущее для грядущих поколений.

---

## 🎯 Цели Кампании:

### 🧪 1. Поддержка Научных Исследований
- Финансирование исследовательских проектов в университетах и научных центрах
- Предоставление передового лабораторного оборудования и инструментов
- Поддержка молодых исследователей и новаторов

### 📚 2. Развитие Научного Образования
- Создание научных лабораторий в школах
- Обучение учителей современным методам научного преподавания
- Предоставление передовых научных программ и учебников

### 💡 3. Продвижение Научной Культуры
- Организация семинаров и публичных лекций
- Проведение интерактивных научных выставок
- Поддержка научных телевизионных и радиопрограмм

### 🌍 4. Решение Общественных Проблем
- Исследование решений экологических проблем
- Разработка технологий возобновляемой энергии
- Поиск медицинских решений для неизлечимых болезней

---

## 💫 Почему Наука Важна?

Наука - это не просто теоретические знания, а инструмент реальных изменений в человеческой жизни. Благодаря науке:
- Мы разрабатываем вакцины и лекарства
- Мы создаем технологии, которые облегчают нашу жизнь
- Мы понимаем вселенную и природу вокруг нас
- Мы решаем сложные проблемы, стоящие перед человечеством

🧡 **Вместе мы строим светлое научное будущее для всех.**
'''
        },
        'es': {
            'title': 'El Poder de la Ciencia: Apoyando la Investigación Científica y la Educación',
            'description': 'Una campaña para apoyar la investigación científica y la educación en comunidades desatendidas, con el objetivo de difundir el conocimiento y desarrollar capacidades científicas para las generaciones futuras. Creemos que la ciencia es la base del progreso y la prosperidad.',
            'markdown': '''# 🔬 El Poder de la Ciencia: Construyendo el Futuro a Través del Conocimiento

La ciencia es la verdadera fuerza que impulsa al mundo hacia el progreso y la prosperidad. En una era de tecnología e innovación, necesitamos mayor inversión en investigación científica y educación para asegurar un mejor futuro para las generaciones venideras.

---

## 🎯 Objetivos de la Campaña:

### 🧪 1. Apoyar la Investigación Científica
- Financiar proyectos de investigación en universidades y centros de investigación
- Proporcionar equipos e instrumentos de laboratorio avanzados
- Apoyar a jóvenes investigadores e innovadores

### 📚 2. Desarrollar la Educación Científica
- Establecer laboratorios científicos en escuelas
- Capacitar a maestros en métodos modernos de enseñanza científica
- Proporcionar currículos y libros de texto científicos avanzados

### 💡 3. Promover la Cultura Científica
- Organizar talleres y conferencias públicas
- Realizar exposiciones científicas interactivas
- Apoyar programas científicos de TV y radio

### 🌍 4. Resolver Problemas Comunitarios
- Investigar soluciones a problemas ambientales
- Desarrollar tecnologías de energía renovable
- Encontrar soluciones médicas para enfermedades incurables

---

## 💫 ¿Por Qué Importa la Ciencia?

La ciencia no es solo conocimiento teórico, sino una herramienta para el cambio real en la vida humana. A través de la ciencia:
- Desarrollamos vacunas y medicamentos
- Innovamos tecnologías que facilitan nuestras vidas
- Entendemos el universo y la naturaleza que nos rodea
- Resolvemos problemas complejos que enfrenta la humanidad

🧡 **Juntos construimos un futuro científico brillante para todos.**
'''
        }
    }
    return content[lang]

def seed_campaigns():
    db = SessionLocal()
    user = get_or_create_default_user(db)
    admin = get_or_create_admin_user(db)  # Create admin user

    # Clear existing data - delete donations first due to foreign key constraints
    from app.db.models.donation import Donation
    db.query(Donation).delete()
    db.query(Campaign).delete()
    db.commit()

    # Create one campaign in multiple languages
    languages = ['ar', 'en', 'fr', 'ru', 'es']
    campaigns = []
    
    for lang in languages:
        content = get_campaign_content(lang)
        campaign = Campaign(
            title=content['title'],
            description=content['description'],
            markdown_text=content['markdown'],
            target_amount=50000,  # Higher target for science research
            current_amount=8500,   # Some initial donations
            start_date=datetime.utcnow() - timedelta(days=2),
            end_date=datetime.utcnow() + timedelta(days=60),  # 60 days campaign
            status=CampaignStatus.ACTIVE,
            image_path=f"uploads/campaigns/science-power-{lang}.jpg",
            lang=lang,
            creator_id=user.id
        )
        campaigns.append(campaign)

    # Save all campaigns
    for campaign in campaigns:
        db.add(campaign)
    
    db.commit()
    print(f"Seeded 1 science campaign in {len(languages)} languages: {', '.join(languages)}")
    db.close()

if __name__ == "__main__":
    seed_campaigns()
