from app.db.database import SessionLocal
from app.db.models import User, Campaign, CampaignStatus
from sqlalchemy.exc import NoResultFound
from datetime import datetime, timedelta
from app.auth.password import get_password_hash


def get_or_create_admin_user(db):
    """Create or get an admin user with properly hashed password"""
    admin = db.query(User).filter_by(email="admin@donation.com").first()
    if not admin:
        admin = User(
            email="admin@donation.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            is_admin=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("Admin user created successfully.")
    else:
        print("Admin user already exists.")
    return admin


def get_or_create_default_user(db):
    user = db.query(User).filter_by(email="demo@donation.com").first()
    if not user:
        user = User(
            email="demo@donation.com",
            username="demo_user",
            hashed_password=get_password_hash("demo123"),
            full_name="Demo User"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_water_campaign_content(lang):
    content = {
        'en': {
            'title': 'Water for Every Life: Clean Water for Remote Communities',
            'description': 'A campaign to bring clean, safe drinking water to remote and underserved communities where access is limited or nonexistent.',
            'markdown': '''# 💧 Water for Every Life: Clean Water for Remote Communities

Every human being deserves access to clean water. In remote areas, lack of water leads to health crises, missed education, and poverty. This campaign brings life-changing water solutions to those who need it most.

---

## 🎯 Campaign Goals:

### 🚰 1. Build Sustainable Water Sources
- Drill wells in drought-prone villages
- Install rainwater harvesting systems
- Maintain existing water infrastructure

### 🧼 2. Promote Hygiene and Health
- Provide sanitation kits to families
- Conduct hygiene education in schools
- Reduce water-borne diseases

### 👩‍👩‍👧‍👦 3. Empower Local Communities
- Train locals in water maintenance
- Employ residents in water projects
- Create water committees for sustainability

---

## 💫 Why Water?

Clean water transforms lives:
- Reduces child mortality
- Frees up time for women and children
- Improves education and economic outcomes

🧡 **Your donation helps turn water scarcity into water security.**
'''
        },
        'fr': {
            'title': 'De l\'Eau pour Tous: Accès à l\'Eau Potable dans les Régions Éloignées',
            'description': 'Une campagne pour fournir de l\'eau potable et propre aux communautés éloignées et mal desservies.',
            'markdown': '''# 💧 De l'Eau pour Tous: Eau Potable pour les Communautés Éloignées

Chaque être humain mérite un accès à l'eau propre. Le manque d'eau dans les zones isolées entraîne des crises sanitaires et freine le développement. Cette campagne apporte des solutions durables.

---

## 🎯 Objectifs de la Campagne:

### 🚰 1. Construire des Sources Durables
- Forer des puits dans les villages secs
- Installer des systèmes de récupération des eaux de pluie
- Réparer les infrastructures d’eau existantes

### 🧼 2. Promouvoir l’Hygiène
- Fournir des kits sanitaires
- Éduquer les enfants à l’hygiène
- Réduire les maladies liées à l’eau

### 👩‍👩‍👧‍👦 3. Autonomiser les Communautés
- Former les habitants à l’entretien
- Créer des emplois dans les projets d’eau
- Mettre en place des comités de gestion

---

## 💫 Pourquoi l'Eau?

L'eau propre change la vie :
- Réduction de la mortalité infantile
- Libération du temps des femmes et enfants
- Meilleure santé et éducation

🧡 **Votre soutien transforme la soif en espoir.**
'''
        },
        'ar': {
            'title': 'الماء لكل إنسان: توفير مياه نظيفة للمجتمعات النائية',
            'description': 'حملة تهدف إلى توفير مياه شرب نظيفة وآمنة للمجتمعات النائية والمحرومة.',
            'markdown': '''# 💧 الماء لكل إنسان: مياه نظيفة للمجتمعات النائية

الحصول على مياه نظيفة حق أساسي لكل إنسان. في المناطق البعيدة، يعاني السكان من نقص حاد في المياه. تسعى هذه الحملة إلى توفير حلول دائمة وآمنة للمياه.

---

## 🎯 أهداف الحملة:

### 🚰 1. بناء مصادر مياه مستدامة
- حفر آبار في القرى المتضررة من الجفاف
- تركيب أنظمة حصاد مياه الأمطار
- صيانة البنية التحتية للمياه

### 🧼 2. تعزيز الصحة والنظافة
- توزيع أدوات النظافة
- تعليم الأطفال أسس النظافة الشخصية
- تقليل الأمراض المنقولة بالماء

### 👩‍👩‍👧‍👦 3. تمكين المجتمعات المحلية
- تدريب السكان على صيانة المشاريع
- توفير وظائف ضمن المشاريع
- تشكيل لجان لإدارة الموارد المائية

---

## 💫 لماذا الماء؟

الماء النظيف ينقذ الأرواح ويغير المستقبل:
- تقليل وفيات الأطفال
- تحسين التعليم والصحة
- تمكين المرأة والأطفال

🧡 **ساهم معنا في جعل الماء حقًا للجميع.**
'''
        },
        'es': {
            'title': 'Agua para Todos: Agua Limpia para Comunidades Remotas',
            'description': 'Una campaña para proporcionar agua potable limpia y segura a comunidades remotas y vulnerables.',
            'markdown': '''# 💧 Agua para Todos: Agua Limpia para Comunidades Remotas

El acceso al agua es un derecho. En muchas regiones alejadas, la falta de agua impacta gravemente la salud y el desarrollo. Nuestra campaña busca llevar soluciones sostenibles a quienes más lo necesitan.

---

## 🎯 Objetivos de la Campaña:

### 🚰 1. Crear Fuentes de Agua Sostenibles
- Perforación de pozos
- Recolección de aguas de lluvia
- Mantenimiento de infraestructuras

### 🧼 2. Mejorar la Higiene y la Salud
- Entrega de kits de higiene
- Educación sobre limpieza en escuelas
- Reducción de enfermedades

### 👩‍👩‍👧‍👦 3. Fortalecer Comunidades
- Capacitación local en mantenimiento
- Generación de empleo en proyectos
- Comités de agua comunitarios

---

## 💫 ¿Por Qué Agua?

El agua cambia todo:
- Reduce enfermedades
- Aumenta la asistencia escolar
- Libera tiempo para las mujeres

🧡 **Con tu ayuda, el agua es vida.**
'''
        },
        'ru': {
            'title': 'Вода для Каждого: Чистая Вода для Отдалённых Сообществ',
            'description': 'Кампания по обеспечению чистой питьевой воды в удалённых и бедных регионах.',
            'markdown': '''# 💧 Вода для Каждого: Чистая Вода для Отдалённых Сообществ

Чистая вода — это жизнь. В удалённых районах её отсутствие приводит к болезням и страданиям. Наша цель — обеспечить доступ к безопасной воде для всех.

---

## 🎯 Цели Кампании:

### 🚰 1. Устойчивые Источники Воды
- Бурение колодцев
- Сбор дождевой воды
- Ремонт водных систем

### 🧼 2. Гигиена и Здоровье
- Гигиенические наборы
- Обучение в школах
- Снижение заболеваний

### 👩‍👩‍👧‍👦 3. Поддержка Местных
- Обучение ремонту
- Трудоустройство
- Комитеты по управлению водой

---

## 💫 Почему Это Важно?

Чистая вода спасает жизни:
- Меньше болезней
- Лучшая учёба и работа
- Женщины получают больше свободы

🧡 **С вашей помощью вода становится доступной для всех.**
'''
        }
    }
    return content[lang]


def seed_campaigns():
    db = SessionLocal()
    user = get_or_create_default_user(db)
    admin = get_or_create_admin_user(db)

    languages = ['en', 'fr', 'ar', 'es', 'ru']
    campaigns = []

    for lang in languages:
        content = get_water_campaign_content(lang)
        campaign = Campaign(
            title=content['title'],
            description=content['description'],
            markdown_text=content['markdown'],
            target_amount=30000,
            current_amount=0,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=45),
            status=CampaignStatus.ACTIVE,
            image_path=f"uploads/campaigns/water_{lang}.jpg",
            lang=lang,
            creator_id=user.id
        )
        campaigns.append(campaign)

    for campaign in campaigns:
        db.add(campaign)

    db.commit()
    print(f"Seeded {len(campaigns)} campaigns successfully.")
    db.close()


if __name__ == "__main__":
    seed_campaigns()
