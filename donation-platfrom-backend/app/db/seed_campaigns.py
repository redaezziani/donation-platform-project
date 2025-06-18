from app.db.database import SessionLocal
from app.db.models import User, Campaign, CampaignStatus
from sqlalchemy.exc import NoResultFound
from datetime import datetime, timedelta

def get_or_create_default_user(db):
    user = db.query(User).filter_by(email="demo@donation.com").first()
    if not user:
        user = User(
            email="demo@donation.com",
            username="demo_user",
            hashed_password="notahash",
            full_name="Demo User"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def seed_campaigns():
    db = SessionLocal()
    user = get_or_create_default_user(db)

    db.query(Campaign).delete()
    db.commit()

    campaigns = [
        Campaign(
            title="حملة بناء آبار لتوفير مياه شرب نقية وآمنة في المجتمعات الريفية المحرومة",
            description=(
                "في العديد من القرى النائية، يسير الأطفال والنساء لأكثر من 5 كيلومترات يوميًا لجلب مياه غالبًا ما تكون ملوثة. "
                "هذه الحملة تسعى لبناء آبار مياه عميقة وآمنة باستخدام تقنيات تنقية حديثة. "
                "نسعى لتوفير مصدر ماء مستدام يغير حياة مئات العائلات ويحدّ من انتشار الأمراض. "
                "مع كل تبرع، تقترب قرية جديدة من الأمل والحياة الكريمة. "
                "فلنكن نحن السبب في تغيير هذا الواقع القاسي."
            ),
            markdown_text="""
# 💦 حملة توفير مياه شرب نقية

في كثير من القرى الفقيرة، تعتبر المياه النظيفة حلمًا بعيد المنال. 

> بدون الماء، لا حياة.

## لماذا ندعم هذه الحملة؟
- **أكثر من 2 مليار شخص** حول العالم يفتقرون إلى مياه نظيفة.
- الأمراض الناتجة عن المياه الملوثة تقتل آلاف الأطفال كل عام.
- مشاريع الآبار يمكنها تغيير مستقبل قرية كاملة.

## أهدافنا:
- حفر 5 آبار عميقة مجهزة بتقنيات تنقية المياه.
- تغطية احتياجات **2000 فرد يوميًا**.
- تدريب سكان القرى على إدارة وصيانة الآبار.

📌 **كل تبرع يُحدث فرقًا.**  
شاركنا في زرع الأمل، بقطرة ماء.
""",
            target_amount=20000.0,
            current_amount=3000.0,
            start_date=datetime.utcnow() - timedelta(days=12),
            end_date=datetime.utcnow() + timedelta(days=60),
            status=CampaignStatus.ACTIVE,
            image_path="uploads/campaigns/water-campaign.jpg",
            creator_id=user.id
        ),
        Campaign(
            title="برنامج شامل لدعم تعليم الأطفال الأيتام وتمكينهم من مستقبل أفضل",
            description=(
                "يتعرض الأيتام في المجتمعات الفقيرة للحرمان من التعليم بسبب غياب المعيل وانعدام الموارد. "
                "تهدف هذه الحملة إلى توفير بيئة تعليمية كاملة تشمل الرسوم المدرسية، اللوازم، والدعم النفسي. "
                "نحن نؤمن أن التعليم هو أقوى سلاح لمحاربة الفقر وكسر الحواجز. "
                "كل مساهمة هي استثمار في جيل جديد قادر على بناء المستقبل. "
                "لنمنح الأمل لمن حُرم من أبسط حقوقه."
            ),
            markdown_text="""
# 📘 حملة تعليم الأيتام

الأطفال الأيتام غالبًا ما يواجهون التهميش والحرمان من أبسط حقوقهم.

> التعليم هو السبيل الوحيد لكسر دائرة الفقر.

## ماذا نقدم؟
- **رسوم مدرسية** كاملة للأطفال غير القادرين.
- **لوازم مدرسية**: كتب، دفاتر، حقائب، أقلام.
- **دعم نفسي** لتحفيز الاستقرار العاطفي والنفسي.

## مستهدفات الحملة:
- تمويل تعليم **100 طفل يتيم** لمدة عام كامل.
- إقامة ورش تنمية بشرية وتدريبية لتعزيز مهاراتهم.
- إشراك المجتمع المحلي في عملية التعليم والرعاية.

✏️ *كل 10 دراهم قد تعني بداية جديدة لطفل لا يملك خيارًا آخر.*
""",
            target_amount=15000.0,
            current_amount=4500.0,
            start_date=datetime.utcnow() - timedelta(days=7),
            end_date=datetime.utcnow() + timedelta(days=35),
            status=CampaignStatus.ACTIVE,
            image_path="uploads/campaigns/orphan-education.jpg",
            creator_id=user.id
        ),
        Campaign(
            title="حملة طبية عاجلة لتوفير الأدوية والمستلزمات الصحية للاجئين في المخيمات",
            description=(
                "اللاجئون في المخيمات يفتقرون لأبسط مقومات الحياة، وخاصة الرعاية الصحية. "
                "تفتقر المراكز الصحية الميدانية للأدوية الأساسية، ما يهدد حياة الآلاف. "
                "تهدف هذه الحملة إلى تزويد تلك المراكز بالأدوية والمعدات الطبية الضرورية. "
                "نحن بحاجة ماسة لدعمكم لإنقاذ حياة لاجئين لا يملكون خيارًا آخر. "
                "ساهم معنا لتكون عونًا في ساعة العجز."
            ),
            markdown_text="""
# 🏥 مساعدات طبية عاجلة للاجئين

في مخيمات اللاجئين، يمكن لنزلة برد أن تتحول إلى تهديد حقيقي للحياة بسبب نقص الأدوية.

## لماذا هذه الحملة عاجلة؟
- تفشي أمراض تنفسية وجلدية في مخيمات مكتظة.
- نقص حاد في المضادات الحيوية وأدوية الأطفال.
- عجز في المستلزمات الأساسية كالقفازات والمعقمات.

## كيف نساعد؟
- **شراء الأدوية العاجلة** من الموردين المحليين.
- **توزيع مباشر** في المخيمات بالتعاون مع فرق طبية.
- **دعم المستوصفات** وتجهيز غرف طوارئ.

🆘 *ساعدنا في إنقاذ الأرواح. كل ثانية قد تكون حاسمة.*
""",
            target_amount=30000.0,
            current_amount=11000.0,
            start_date=datetime.utcnow() - timedelta(days=20),
            end_date=datetime.utcnow() + timedelta(days=45),
            status=CampaignStatus.ACTIVE,
            image_path="uploads/campaigns/medical-aid.jpg",
            creator_id=user.id
        ),
    ]

    for campaign in campaigns:
        db.add(campaign)
    db.commit()
    print("Seeded campaigns successfully.")
    db.close()

if __name__ == "__main__":
    seed_campaigns()
