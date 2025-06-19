import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Search, 
  CreditCard, 
  TrendingUp, 
  UserPlus,
  FileText,
  CheckCircle,
  Heart,
  Shield,
  Bell,
  Users,
  Target,
  ArrowRight,
  PlayCircle
} from 'lucide-react';

const HowItWorksPage = () => {
  const { t } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Steps for donors
  const donorSteps = [
    {
      step: '01',
      icon: Search,
      title: t('howItWorks.donor.browse.title', 'تصفح الحملات'),
      description: t('howItWorks.donor.browse.description', 'استعرض الحملات المتاحة واختر القضية التي تهمك من بين مختلف المجالات الإنسانية والاجتماعية'),
      details: [
        t('howItWorks.donor.browse.detail1', 'تصفح حسب الفئة (تعليم، صحة، إغاثة، إلخ)'),
        t('howItWorks.donor.browse.detail2', 'اقرأ تفاصيل كل حملة وأهدافها'),
        t('howItWorks.donor.browse.detail3', 'تحقق من مدى تقدم الحملة نحو هدفها')
      ]
    },
    {
      step: '02',
      icon: CreditCard,
      title: t('howItWorks.donor.donate.title', 'تبرع بأمان'),
      description: t('howItWorks.donor.donate.description', 'اختر المبلغ الذي تريد التبرع به وأكمل عملية الدفع بأمان عبر نظام الدفع المشفر'),
      details: [
        t('howItWorks.donor.donate.detail1', 'اختر مبلغ التبرع المناسب لك'),
        t('howItWorks.donor.donate.detail2', 'أدخل بياناتك أو تبرع بدون كشف الهوية'),
        t('howItWorks.donor.donate.detail3', 'ادفع بأمان عبر بوابة الدفع المشفرة')
      ]
    },
    {
      step: '03',
      icon: TrendingUp,
      title: t('howItWorks.donor.track.title', 'تتبع الأثر'),
      description: t('howItWorks.donor.track.description', 'تابع كيف ساهم تبرعك في تحقيق أهداف الحملة واحصل على تحديثات منتظمة'),
      details: [
        t('howItWorks.donor.track.detail1', 'تلقى تأكيد فوري للتبرع'),
        t('howItWorks.donor.track.detail2', 'تابع تقدم الحملة في الوقت الفعلي'),
        t('howItWorks.donor.track.detail3', 'احصل على تحديثات عن استخدام التبرعات')
      ]
    }
  ];

  // Steps for campaign creators
  const creatorSteps = [
    {
      step: '01',
      icon: UserPlus,
      title: t('howItWorks.creator.register.title', 'إنشاء حساب'),
      description: t('howItWorks.creator.register.description', 'سجل حساباً جديداً وقم بتوثيق هويتك لضمان الشفافية والأمان'),
      details: [
        t('howItWorks.creator.register.detail1', 'املأ نموذج التسجيل'),
        t('howItWorks.creator.register.detail2', 'تحقق من بريدك الإلكتروني'),
        t('howItWorks.creator.register.detail3', 'أكمل عملية توثيق الهوية')
      ]
    },
    {
      step: '02',
      icon: FileText,
      title: t('howItWorks.creator.create.title', 'إنشاء الحملة'),
      description: t('howItWorks.creator.create.description', 'أنشئ حملتك بتفاصيل واضحة وأهداف محددة وارفق الوثائق المطلوبة'),
      details: [
        t('howItWorks.creator.create.detail1', 'اكتب عنوان ووصف مقنع للحملة'),
        t('howItWorks.creator.create.detail2', 'حدد الهدف المالي والمدة الزمنية'),
        t('howItWorks.creator.create.detail3', 'ارفق صور ووثائق داعمة')
      ]
    },
    {
      step: '03',
      icon: CheckCircle,
      title: t('howItWorks.creator.launch.title', 'إطلاق الحملة'),
      description: t('howItWorks.creator.launch.description', 'بعد موافقة الإدارة، انشر حملتك وابدأ في جمع التبرعات وتحديث المتبرعين'),
      details: [
        t('howItWorks.creator.launch.detail1', 'انتظر موافقة فريق المراجعة'),
        t('howItWorks.creator.launch.detail2', 'انشر الحملة على وسائل التواصل'),
        t('howItWorks.creator.launch.detail3', 'قدم تحديثات منتظمة للمتبرعين')
      ]
    }
  ];

  // Platform features
  const features = [
    {
      icon: Shield,
      title: t('howItWorks.features.security.title', 'الأمان أولاً'),
      description: t('howItWorks.features.security.description', 'جميع المعاملات محمية بأحدث تقنيات التشفير')
    },
    {
      icon: Bell,
      title: t('howItWorks.features.notifications.title', 'تحديثات فورية'),
      description: t('howItWorks.features.notifications.description', 'تلقى إشعارات فورية عن تقدم الحملات')
    },
    {
      icon: Users,
      title: t('howItWorks.features.community.title', 'مجتمع متفاعل'),
      description: t('howItWorks.features.community.description', 'انضم لمجتمع من المتبرعين والمؤسسات الخيرية')
    },
    {
      icon: Target,
      title: t('howItWorks.features.transparency.title', 'شفافية كاملة'),
      description: t('howItWorks.features.transparency.description', 'تتبع كيفية استخدام تبرعاتك بدقة')
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
              {t('howItWorks.badge', 'كيف تعمل المنصة')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-AlRaiMediaBold font-bold text-primary mb-6">
              {t('howItWorks.hero.title', 'كيف تعمل منصة التبرعات')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('howItWorks.hero.description', 'تعرف على كيفية عمل منصتنا خطوة بخطوة، سواء كنت تريد التبرع لحملة موجودة أو إنشاء حملة جديدة لقضية تهمك.')}
            </p>
            <div className="flex justify-center">
              <Link to="/">
                <Button size="lg">
                  {t('howItWorks.hero.getStarted', 'ابدأ الآن')}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* For Donors Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('howItWorks.donors.title', 'للمتبرعين')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorks.donors.subtitle', 'ثلاث خطوات بسيطة لتبدأ رحلة العطاء')}
            </p>
          </motion.div>

          <motion.div 
            className="space-y-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {donorSteps.map((step, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl font-bold text-primary">{step.step}</div>
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">{step.title}</h3>
                  <p className="text-lg text-muted-foreground mb-6">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                    <CardContent className="p-8">
                      <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                        <step.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-primary font-semibold mb-2">
                          {t('howItWorks.step', 'الخطوة')} {step.step}
                        </div>
                        <div className="font-bold text-lg">{step.title}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Campaign Creators Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('howItWorks.creators.title', 'لأصحاب الحملات')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorks.creators.subtitle', 'كيفية إنشاء حملة ناجحة على منصتنا')}
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {creatorSteps.map((step, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">{step.step}</div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('howItWorks.platformFeatures.title', 'مميزات المنصة')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorks.platformFeatures.subtitle', 'ما يميز منصتنا عن غيرها')}
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
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('howItWorks.faq.title', 'الأسئلة الشائعة')}
            </h2>
          </motion.div>

          <motion.div 
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t('howItWorks.faq.q1', 'هل التبرع آمن على المنصة؟')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('howItWorks.faq.a1', 'نعم، جميع المعاملات محمية بأحدث تقنيات التشفير ونتبع أعلى معايير الأمان المصرفي.')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t('howItWorks.faq.q2', 'كيف أتأكد من وصول تبرعي للمستحقين؟')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('howItWorks.faq.a2', 'نوفر تحديثات منتظمة عن استخدام التبرعات وتقارير شفافة عن تقدم كل حملة.')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t('howItWorks.faq.q3', 'هل يمكنني إنشاء حملة لأي قضية؟')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('howItWorks.faq.a3', 'نقبل الحملات الإنسانية والاجتماعية والخيرية، ويتم مراجعة كل حملة قبل الموافقة عليها.')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <Heart className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('howItWorks.cta.title', 'جاهز لتبدأ؟')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t('howItWorks.cta.description', 'انضم إلى آلاف المتبرعين الذين يحدثون فرقاً حقيقياً في العالم')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full sm:w-auto"
                >
                  {t('howItWorks.cta.browseCampaigns', 'تصفح الحملات')}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/create-campaign">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  {t('howItWorks.cta.createCampaign', 'أنشئ حملة')}
                  <PlayCircle className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
