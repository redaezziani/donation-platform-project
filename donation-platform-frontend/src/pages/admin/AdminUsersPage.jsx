import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  Search 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import PaginationComponent from '../../components/PaginationComponent';
import UserStatsCards from '../../components/admin/users/user-stats-cards';
import UsersTable from '../../components/admin/users/users-table';
import { adminAPI } from '../../lib/api';
import { useLanguage } from '../../hooks/useLanguage';

const AdminUsersPage = () => {
  const { t } = useLanguage();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    adminUsers: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, statusFilter, roleFilter]);

  useEffect(() => {
    // Reset to first page when search term changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchUsers();
    }
  }, [searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllUsers(currentPage, 10, statusFilter, roleFilter);
      setUsers(response.items || []);
      setTotalPages(response.pagination?.total_pages || 1);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('common.errorLoadingData', 'حدث خطأ أثناء جلب البيانات'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const userStats = await adminAPI.getUserStats();
      setStats({
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
        suspendedUsers: userStats.suspendedUsers,
        adminUsers: userStats.adminUsers
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'activate') {
        await adminAPI.updateUserStatus(userId, 'active');
      } else if (action === 'suspend') {
        await adminAPI.updateUserStatus(userId, 'suspended');
      }
      
      // Refresh the users list
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      const actionText = action === 'activate' 
        ? t('admin.activate', 'تنشيط') 
        : t('admin.suspend', 'تعليق');
      alert(`${t('common.error', 'حدث خطأ أثناء')} ${actionText} ${t('user.entity', 'المستخدم')}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('user.loading', 'جاري تحميل المستخدمين...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('admin.userManagement', 'إدارة المستخدمين')}</h1>
        <Button className="gap-1">
          <PlusIcon className="h-4 w-4" />
          <span>{t('admin.addUser', 'إضافة مستخدم')}</span>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {/* Statistics Cards */}
      <UserStatsCards stats={stats} />
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <Input
            placeholder={t('user.searchPlaceholder', 'بحث عن مستخدم...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            prefix={<Search className="h-4 w-4 ml-2 text-muted-foreground" />}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="w-1/2 md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t('user.status.label', 'الحالة')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allStatuses', 'كل الحالات')}</SelectItem>
                <SelectItem value="active">{t('user.status.active', 'نشط')}</SelectItem>
                <SelectItem value="inactive">{t('user.status.inactive', 'غير نشط')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-1/2 md:w-auto">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t('user.role', 'الدور')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allRoles', 'كل الأدوار')}</SelectItem>
                <SelectItem value="admin">{t('admin.role.admin', 'مدير')}</SelectItem>
                <SelectItem value="user">{t('admin.role.user', 'مستخدم')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <UsersTable 
        users={users}
        loading={loading}
        searchTerm={searchTerm}
        formatDate={formatDate}
        handleUserAction={handleUserAction}
      />
      
      {totalPages > 1 && (
        <div className="flex justify-end">
          <PaginationComponent 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;