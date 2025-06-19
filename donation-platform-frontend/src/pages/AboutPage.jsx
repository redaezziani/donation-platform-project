import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Globe, 
  Shield, 
  Zap, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Handshake,
  DollarSign,
  TrendingUp
} from 'lucide-react';

const AboutPage = () => {
  const { t } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: Shield,
      title: t('about.features.secure.title', 'آمان وموثوقية'),
      description: t('about.features.secure.description', 'نضمن أمان جميع المعاملات والبيانات الشخصية باستخدام أحدث تقنيات التشفير')
    },
    {
      icon: Globe,
      title: t('about.features.global.title', 'وصول عالمي'),
      description: t('about.features.global.description', 'ندعم أكثر من 30 دولة حول العالم بعدة لغات ومختلف العملات')
    },
    {
      icon: Zap,
      title: t('about.features.instant.title', 'تبرع فوري'),
      description: t('about.features.instant.description', 'تبرع بسهولة وسرعة عبر منصتنا الآمنة والموثوقة')
    },
    {
      icon: Target,
      title: t('about.features.transparent.title', 'شفافية كاملة'),
      description: t('about.features.transparent.description', 'تتبع تبرعاتك ومشاهدة الأثر المباشر لمساهماتك')
    }
  ];

  const stats = [
    {
      icon: Users,
      value: '1000+',
      label: t('about.stats.donors', 'متبرع نشط')
    },
    {
      icon: DollarSign,
      value: '50K+',
      label: t('about.stats.raised', 'مبلغ مجمع')
    },
    {
      icon: CheckCircle,
      value: '120+',
      label: t('about.stats.campaigns', 'حملة ناجحة')
    },
    {
      icon: TrendingUp,
      value: '30+',
      label: t('about.stats.countries', 'دولة مشاركة')
    }
  ];

  const steps = [
    {
      number: '01',
      title: t('about.howItWorks.browse.title', 'تصفح الحملات'),
      description: t('about.howItWorks.browse.description', 'استعرض الحملات المختلفة واختر القضية التي تهمك')
    },
    {
      number: '02',
      title: t('about.howItWorks.donate.title', 'تبرع بأمان'),
      description: t('about.howItWorks.donate.description', 'اختر المبلغ وتبرع بسهولة عبر نظام دفع آمن')
    },
    {
      number: '03',
      title: t('about.howItWorks.track.title', 'تتبع الأثر'),
      description: t('about.howItWorks.track.description', 'شاهد كيف ساهم تبرعك في تحقيق الهدف المطلوب')
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-4">
              {t('about.badge', 'من نحن')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-AlRaiMediaBold font-bold text-primary mb-6">
              {t('about.hero.title', 'منصة التبرعات الرقمية')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('about.hero.description', 'نحن منصة رقمية تهدف إلى ربط المتبرعين بالحملات الإنسانية والاجتماعية المؤثرة. نؤمن بقوة العطاء في تغيير العالم وخلق مستقبل أفضل للجميع.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/campaigns">
                <Button size="lg" className="w-full sm:w-auto">
                  {t('about.hero.browseCampaigns', 'تصفح الحملات')}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/create-campaign">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('about.hero.createCampaign', 'إنشاء حملة')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            {...fadeInUp}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                {t('about.mission.title', 'رسالتنا')}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t('about.mission.description', 'نسعى لخلق عالم أكثر عدالة ورحمة من خلال تسهيل عملية التبرع وربط القلوب الخيرة بالقضايا التي تحتاج إلى دعم. نؤمن أن كل تبرع، مهما كان صغيراً، يمكن أن يحدث فرقاً كبيراً في حياة الآخرين.')}
              </p>
              <div className="flex items-center gap-4">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">
                    {t('about.mission.vision', 'رؤيتنا')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('about.mission.visionText', 'عالم يتآزر فيه الجميع لمساعدة المحتاجين')}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/cover.jpg"
                alt="Mission"
                className="rounded-lg shadow-lg w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-lg"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('about.features.title', 'مميزات منصتنا')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('about.features.subtitle', 'نقدم تجربة تبرع متميزة وآمنة تضمن وصول مساهمتك للمستحقين')}
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('about.stats.title', 'إنجازاتنا')}
            </h2>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('about.howItWorks.title', 'كيف تعمل المنصة')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('about.howItWorks.subtitle', 'ثلاث خطوات بسيطة لتحدث فرقاً في حياة الآخرين')}
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-4xl font-bold text-primary mb-4">{step.number}</div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <Handshake className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('about.cta.title', 'انضم إلينا في رحلة العطاء')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t('about.cta.description', 'كن جزءاً من مجتمع المتبرعين الذين يؤمنون بقوة العطاء في تغيير العالم')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full sm:w-auto"
                >
                  {t('about.cta.startDonating', 'ابدأ التبرع الآن')}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/create-campaign">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  {t('about.cta.createCampaign', 'أنشئ حملتك')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
