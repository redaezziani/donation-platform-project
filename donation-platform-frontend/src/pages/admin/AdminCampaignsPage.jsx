import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  Search, 
  MoreVerticalIcon, 
  CheckIcon, 
  XIcon, 
  EditIcon, 
  EyeIcon,
  TrashIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  DollarSignIcon,
  UsersIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import PaginationComponent from '../../components/PaginationComponent';
import { adminAPI } from '../../lib/api';

const getStatusBadgeProps = (status) => {
  switch (status) {
    case 'active':
      return { variant: 'default', label: 'نشطة', icon: CheckCircleIcon };
    case 'pending':
      return { variant: 'warning', label: 'قيد المراجعة', icon: AlertCircleIcon };
    case 'draft':
      return { variant: 'outline', label: 'مسودة', icon: EditIcon };
    case 'completed':
      return { variant: 'success', label: 'مكتملة', icon: CheckIcon };
    case 'cancelled':
      return { variant: 'destructive', label: 'ملغية', icon: XIcon };
    default:
      return { variant: 'outline', label: status, icon: null };
  }
};

const AdminCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    pendingCampaigns: 0,
    totalRaised: 0,
    totalDonors: 0
  });

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    // Reset to first page when search term changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchCampaigns();
    }
  }, [searchTerm, statusFilter]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllCampaigns(currentPage, 10, statusFilter);
      setCampaigns(response.items || []);
      setTotalPages(response.pagination?.total_pages || 1);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const campaignStats = await adminAPI.getCampaignStats();
      setStats({
        activeCampaigns: campaignStats.activeCampaigns,
        pendingCampaigns: campaignStats.pendingCampaigns,
        totalRaised: campaignStats.totalRaised,
        totalDonors: 0 // We don't have this data yet
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCampaignAction = async (campaignId, action) => {
    try {
      if (action === 'approve') {
        await adminAPI.updateCampaignStatus(campaignId, 'active');
      } else if (action === 'reject') {
        await adminAPI.updateCampaignStatus(campaignId, 'cancelled');
      }
      
      // Refresh the campaigns list
      fetchCampaigns();
      fetchStats();
    } catch (err) {
      console.error(`Error ${action}ing campaign:`, err);
      alert(`حدث خطأ أثناء ${action === 'approve' ? 'الموافقة على' : 'رفض'} الحملة`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter campaigns based on search term and filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         campaign.creator?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || true; // We don't have category in backend yet
    
    return matchesSearch && matchesCategory;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الحملات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة الحملات</h1>
        <Button className="gap-1">
          <PlusIcon className="h-4 w-4" />
          <span>إنشاء حملة</span>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الحملات النشطة</p>
              <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertCircleIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">بانتظار الموافقة</p>
              <p className="text-2xl font-bold">{stats.pendingCampaigns}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSignIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي التبرعات</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRaised)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المتبرعون</p>
              <p className="text-2xl font-bold">{stats.totalDonors}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="بحث عن حملة..."
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
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="active">نشطة</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
                <SelectItem value="cancelled">ملغية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Campaigns Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>المنشئ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الهدف</TableHead>
              <TableHead>جُمع</TableHead>
              <TableHead>التقدم</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.map(campaign => {
              const progress = Math.min(100, Math.round(((campaign.current_amount || 0) / campaign.target_amount) * 100));
              const statusProps = getStatusBadgeProps(campaign.status);
              const StatusIcon = statusProps.icon;
              
              return (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.id}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {campaign.title}
                  </TableCell>
                  <TableCell>{campaign.creator?.username || campaign.creator?.full_name || 'غير محدد'}</TableCell>
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
                          <span>عرض</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex gap-2">
                          <EditIcon className="h-4 w-4" />
                          <span>تعديل</span>
                        </DropdownMenuItem>
                        {campaign.status === 'pending' && (
                          <DropdownMenuItem 
                            className="flex gap-2 text-green-600"
                            onClick={() => handleCampaignAction(campaign.id, 'approve')}
                          >
                            <CheckIcon className="h-4 w-4" />
                            <span>موافقة</span>
                          </DropdownMenuItem>
                        )}
                        {campaign.status !== 'cancelled' && campaign.status !== 'completed' && (
                          <DropdownMenuItem 
                            className="flex gap-2 text-amber-600"
                            onClick={() => handleCampaignAction(campaign.id, 'reject')}
                          >
                            <XIcon className="h-4 w-4" />
                            <span>إلغاء</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex gap-2 text-destructive">
                          <TrashIcon className="h-4 w-4" />
                          <span>حذف</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredCampaigns.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد حملات'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
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

export default AdminCampaignsPage;