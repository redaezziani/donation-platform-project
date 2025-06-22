import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../hooks/useLanguage";
import {
  CheckIcon,
  XIcon,
  EditIcon,
  TrashIcon,
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

const UsersTable = ({ 
  users, 
  loading, 
  searchTerm, 
  formatDate, 
  handleUserAction 
}) => {
  const { t } = useLanguage();

  const getStatusBadgeProps = (status) => {
    // Simplified status handling since is_suspended doesn't exist yet
    if (status === true || status === 'active') {
      return { 
        variant: 'default', 
        label: t('user.status.active', 'نشط')
      };
    } else {
      return { 
        variant: 'destructive', 
        label: t('user.status.inactive', 'غير نشط')
      };
    }
  };

  const getRoleBadgeProps = (role) => {
    switch (role) {
      case 'admin':
        return { 
          variant: 'secondary', 
          label: t('admin.role.admin', 'مدير')
        };
      case 'user':
        return { 
          variant: 'outline', 
          label: t('admin.role.user', 'مستخدم')
        };
      default:
        return { variant: 'outline', label: role };
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
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
            <TableHead>{t('user.name', 'الاسم')}</TableHead>
            <TableHead>{t('user.email', 'البريد الإلكتروني')}</TableHead>
            <TableHead>{t('user.status.label', 'الحالة')}</TableHead>
            <TableHead>{t('user.role', 'الدور')}</TableHead>
            <TableHead>{t('user.joinDate', 'تاريخ الانضمام')}</TableHead>
            <TableHead>{t('user.campaigns', 'الحملات')}</TableHead>
            <TableHead>{t('user.donations', 'التبرعات')}</TableHead>
            <TableHead className="text-left">{t('common.actions', 'إجراءات')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user, index) => {
            const statusProps = getStatusBadgeProps(user.status);
            const roleProps = getRoleBadgeProps(user.role);
            
            return (
              <motion.tr 
                key={user.id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium">
                  {user.full_name || user.username || user.name || t('common.notSpecified', 'غير محدد')}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={statusProps.variant}>
                    {statusProps.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={roleProps.variant}>
                    {roleProps.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDate(user.created_at || user.joinDate)}
                </TableCell>
                <TableCell>{user.campaigns_count || user.campaigns || 0}</TableCell>
                <TableCell>{user.donations_count || user.donations || 0}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex gap-2">
                        <EditIcon className="h-4 w-4" />
                        <span>{t('common.edit', 'تعديل')}</span>
                      </DropdownMenuItem>
                      {user.status !== 'active' ? (
                        <DropdownMenuItem 
                          className="flex gap-2 text-green-600"
                          onClick={() => handleUserAction(user.id, 'activate')}
                        >
                          <CheckIcon className="h-4 w-4" />
                          <span>{t('admin.activate', 'تنشيط')}</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          className="flex gap-2 text-amber-600"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                        >
                          <XIcon className="h-4 w-4" />
                          <span>{t('admin.suspend', 'تعليق')}</span>
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
          {filteredUsers.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                {searchTerm ? 
                  t('common.noSearchResults', 'لا توجد نتائج للبحث') : 
                  t('user.noUsers', 'لا توجد مستخدمين')
                }
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;