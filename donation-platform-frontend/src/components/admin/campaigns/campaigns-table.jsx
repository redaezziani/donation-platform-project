import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../hooks/useLanguage";
import {
  CheckIcon,
  XIcon,
  EditIcon,
  EyeIcon,
  TrashIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  MoreVerticalIcon
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';

const CampaignsTable = ({ 
  campaigns, 
  loading, 
  searchTerm, 
  formatCurrency, 
  formatDate, 
  handleCampaignAction 
}) => {
  const { t } = useLanguage();

  const getStatusBadgeProps = (status) => {
    switch (status) {
      case 'active':
        return { 
          variant: 'default', 
          label: t('campaign.status.active', 'نشطة'), 
          icon: CheckCircleIcon 
        };
      case 'pending':
        return { 
          variant: 'warning', 
          label: t('campaign.status.pending', 'قيد المراجعة'), 
          icon: AlertCircleIcon 
        };
      case 'draft':
        return { 
          variant: 'outline', 
          label: t('campaign.status.draft', 'مسودة'), 
          icon: EditIcon 
        };
      case 'completed':
        return { 
          variant: 'success', 
          label: t('campaign.status.completed', 'مكتملة'), 
          icon: CheckIcon 
        };
      case 'cancelled':
        return { 
          variant: 'destructive', 
          label: t('campaign.status.cancelled', 'ملغية'), 
          icon: XIcon 
        };
      default:
        return { variant: 'outline', label: status, icon: null };
    }
  };

  const getLanguageDisplay = (langCode) => {
    const languages = {
      'ar': { flag: '🇸🇦', name: t('language.arabic', 'العربية') },
      'en': { flag: '🇺🇸', name: t('language.english', 'English') },
      'fr': { flag: '🇫🇷', name: t('language.french', 'Français') },
      'es': { flag: '🇪🇸', name: t('language.spanish', 'Español') },
      'ru': { flag: '🇷🇺', name: t('language.russian', 'Русский') }
    };
    
    const lang = languages[langCode];
    return lang ? `${lang.flag} ${lang.name}` : t('common.notSpecified', 'غير محدد');
  };

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         campaign.creator?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Animation variants for table rows
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">{t('common.id', '#')}</TableHead>
            <TableHead>{t('campaign.title', 'العنوان')}</TableHead>
            <TableHead>{t('campaign.creator', 'المنشئ')}</TableHead>
            <TableHead>{t('campaign.language', 'اللغة')}</TableHead>
            <TableHead>{t('campaign.status.label', 'الحالة')}</TableHead>
            <TableHead>{t('campaign.target', 'الهدف')}</TableHead>
            <TableHead>{t('campaign.raised', 'جُمع')}</TableHead>
            <TableHead>{t('campaign.progress', 'التقدم')}</TableHead>
            <TableHead>{t('campaign.createdAt', 'تاريخ الإنشاء')}</TableHead>
            <TableHead className="text-left">{t('common.actions', 'إجراءات')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCampaigns.map((campaign, index) => {
            const progress = Math.min(100, Math.round(((campaign.current_amount || 0) / campaign.target_amount) * 100));
            const statusProps = getStatusBadgeProps(campaign.status);
            const StatusIcon = statusProps.icon;
            
            return (
              <motion.tr 
                key={campaign.id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <TableCell>{campaign.id}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {campaign.title}
                </TableCell>
                <TableCell>
                  {campaign.creator?.username || campaign.creator?.full_name || t('common.notSpecified', 'غير محدد')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {getLanguageDisplay(campaign.lang)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusProps.variant} className="gap-1">
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    <span>{statusProps.label}</span>
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(campaign.target_amount)}</TableCell>
                <TableCell>{formatCurrency(campaign.current_amount)}</TableCell>
                <TableCell className="w-[150px]">
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="h-2" />
                    <span className="text-xs w-[30px] text-left">{progress}%</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(campaign.created_at)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex gap-2">
                        <EyeIcon className="h-4 w-4" />
                        <span>{t('common.view', 'عرض')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex gap-2">
                        <EditIcon className="h-4 w-4" />
                        <span>{t('common.edit', 'تعديل')}</span>
                      </DropdownMenuItem>
                      {campaign.status === 'pending' && (
                        <DropdownMenuItem 
                          className="flex gap-2 text-green-600"
                          onClick={() => handleCampaignAction(campaign.id, 'approve')}
                        >
                          <CheckIcon className="h-4 w-4" />
                          <span>{t('admin.approve', 'موافقة')}</span>
                        </DropdownMenuItem>
                      )}
                      {campaign.status !== 'cancelled' && campaign.status !== 'completed' && (
                        <DropdownMenuItem 
                          className="flex gap-2 text-amber-600"
                          onClick={() => handleCampaignAction(campaign.id, 'reject')}
                        >
                          <XIcon className="h-4 w-4" />
                          <span>{t('admin.cancel', 'إلغاء')}</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex gap-2 text-destructive">
                        <TrashIcon className="h-4 w-4" />
                        <span>{t('common.delete', 'حذف')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            );
          })}
          {filteredCampaigns.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                {searchTerm ? 
                  t('common.noSearchResults', 'لا توجد نتائج للبحث') : 
                  t('campaign.noCampaigns', 'لا توجد حملات')
                }
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignsTable;