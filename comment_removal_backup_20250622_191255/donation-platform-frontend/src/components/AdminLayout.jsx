import { AppSidebar } from './app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { Separator } from './ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from './ui/sidebar'
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();

  
  

  
  
  return (
    <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                    <span className="text-sm font-medium">لوحة الإدارة</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                    <span className="text-sm font-medium">
                        {user?.full_name || user?.username || 'لوحة الإدارة'}
                    </span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
       {children}
      </div>
    </SidebarInset>
  </SidebarProvider>
  );
};

export default AdminLayout;