import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../hooks/useLanguage";
import AnimatedCounter from "../../AnimatedCounter";
import AnimatedCurrency from "../../AnimatedCurrency";

const StatsCards = ({ stats, formatCurrency }) => {
  const { t } = useLanguage();

  // Animation variants for the cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="bg-white py-14 sm:py-6">
      <div className="mx-auto ">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
          <motion.div 
            className="mx-auto flex max-w-xs flex-col gap-y-4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <dt className="text-base/7 text-muted-foreground">
              {t('admin.activeCampaigns', 'الحملات النشطة')}
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              <AnimatedCounter value={stats.activeCampaigns} duration={1.5} />
            </dd>
          </motion.div>
          
          <motion.div 
            className="mx-auto flex max-w-xs flex-col gap-y-4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <dt className="text-base/7 text-muted-foreground">
              {t('admin.pendingApproval', 'بانتظار الموافقة')}
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              <AnimatedCounter value={stats.pendingCampaigns} duration={1.5} />
            </dd>
          </motion.div>
          
          <motion.div 
            className="mx-auto flex max-w-xs flex-col gap-y-4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <dt className="text-base/7 text-muted-foreground">
              {t('admin.totalRaised', 'إجمالي المبلغ المُجمع')}
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              <AnimatedCurrency value={stats.totalRaised} duration={2} />
            </dd>
          </motion.div>
          
          <motion.div 
            className="mx-auto flex max-w-xs flex-col gap-y-4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <dt className="text-base/7 text-muted-foreground">
              {t('admin.totalDonors', 'المتبرعون')}
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              <AnimatedCounter value={stats.totalDonors} duration={1.5} />
            </dd>
          </motion.div>
        </dl>
      </div>
    </div>
  );
};

export default StatsCards;
