import React, { useState } from 'react';
import { 
  PlusIcon, 
  Search, 
  FilterIcon, 
  MoreVerticalIcon, 
  CheckIcon, 
  XIcon, 
  EditIcon, 
  TrashIcon 
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
import PaginationComponent from '../../components/PaginationComponent';

// Mock data
const users = [
  { 
    id: 1, 
    name: 'أحمد محمد', 
    email: 'ahmed@example.com', 
    status: 'active',
    role: 'user',
    joinDate: '2023-05-15',
    campaigns: 3,
    donations: 12
  },
  { 
    id: 2, 
    name: 'سارة علي', 
    email: 'sara@example.com', 
    status: 'active',
    role: 'user',
    joinDate: '2023-06-22',
    campaigns: 1,
    donations: 5
  },
  { 
    id: 3, 
    name: 'محمد عبدالله', 
    email: 'mohamed@example.com', 
    status: 'inactive',
    role: 'user',
    joinDate: '2023-04-10',
    campaigns: 0,
    donations: 3
  },
  { 
    id: 4, 
    name: 'نور حسين', 
    email: 'noor@example.com', 
    status: 'active',
    role: 'admin',
    joinDate: '2022-11-05',
    campaigns: 2,
    donations: 8
  },
  { 
    id: 5, 
    name: 'خالد العمري', 
    email: 'khaled@example.com', 
    status: 'suspended',
    role: 'user',
    joinDate: '2023-01-30',
    campaigns: 1,
    donations: 0
  },
];

const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <Button className="gap-1">
          <PlusIcon className="h-4 w-4" />
          <span>إضافة مستخدم</span>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="بحث عن مستخدم..."
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
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="suspended">معلق</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-1/2 md:w-auto">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأدوار</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="user">مستخدم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>تاريخ الانضمام</TableHead>
              <TableHead>الحملات</TableHead>
              <TableHead>التبرعات</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      user.status === 'active' ? 'default' : 
                      user.status === 'inactive' ? 'outline' : 
                      'destructive'
                    }
                  >
                    {user.status === 'active' ? 'نشط' : 
                     user.status === 'inactive' ? 'غير نشط' : 
                     'معلق'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>
                    {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.joinDate).toLocaleDateString('ar-EG')}
                </TableCell>
                <TableCell>{user.campaigns}</TableCell>
                <TableCell>{user.donations}</TableCell>
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
                        <span>تعديل</span>
                      </DropdownMenuItem>
                      {user.status !== 'active' ? (
                        <DropdownMenuItem className="flex gap-2 text-green-600">
                          <CheckIcon className="h-4 w-4" />
                          <span>تنشيط</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="flex gap-2 text-amber-600">
                          <XIcon className="h-4 w-4" />
                          <span>تعليق</span>
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
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  لا توجد نتائج
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end">
        <PaginationComponent 
          currentPage={currentPage}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AdminUsersPage;