import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../hooks/useLanguage";
import AnimatedCounter from "../../AnimatedCounter";

const UserStatsCards = ({ stats }) => {
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
    <div className="bg-white py-14 sm:py-14">
      <div className="mx-auto ">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
          <motion.div 
            className="mx-auto flex max-w-xs flex-col gap-y-4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <dt className="text-base/7 text-gray-600">
              {t('admin.totalUsers', 'إجمالي المستخدمين')}
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              <AnimatedCounter value={stats.totalUsers} duration={1.5} />
            </dd>
          </motion.div>
          
          <motion.div 
            className="mx-auto flex max-w-xs flex-col gap-y-4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <dt className="text-base/7 text-gray-600">
              {t('user.status.active', 'المستخدمون النشطون')}
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              <AnimatedCounter value={stats.activeUsers} duration={1.5} />
            </dd>
          </motion.div>
          
          <motion.div 
            className="mx-auto flex max-w-xs flex-col gap-y-4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <dt className="text-base/7 text-gray-600">
              {t('admin.pendingUsers', 'المستخدمون المعلقون')}
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              <AnimatedCounter value={stats.suspendedUsers} duration={1.5} />
            </dd>
          </motion.div>
          
          <motion.div 
            className="mx-auto flex max-w-xs flex-col gap-y-4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <dt className="text-base/7 text-gray-600">
              {t('admin.adminUsers', 'المديرين')}
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              <AnimatedCounter value={stats.adminUsers} duration={1.5} />
            </dd>
          </motion.div>
        </dl>
      </div>
    </div>
  );
};

export default UserStatsCards;