import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,  

  } from "./ui/sidebar"

  import {
    LayoutDashboard,
    Users,
    HeartHandshake,
    CircleDollarSign,
    Command,
  } from "lucide-react"
  
  import { NavMain } from './nav-main'
  import { NavProjects } from './nav-projects'
  import { NavSecondary } from './nav-secondary'
  import { NavUser } from './nav-user'
  import { useLanguage } from '../hooks/useLanguage'
  import { useAuth } from '../contexts/AuthContext'


export function AppSidebar(props) {
  const { t,currentLanguage } = useLanguage();
  const { user } = useAuth();

  const data = {
    user: {
      name: user?.full_name || user?.username || t('admin.admin'),
      email: user?.email || "admin@example.com",
      avatar: "/avatars/admin.jpg",
    },
    navMain: [
      {
        title: t('admin.dashboard'),
        url: "/admin",
        icon: LayoutDashboard,
        isActive: true,
        items: []
      },
      {
        title: t('admin.userManagement'),
        url: "/admin/users",
        icon: Users,
        items: []
      },
      {
        title: t('admin.campaignManagement'),
        url: "/admin/campaigns",
        icon: HeartHandshake,
        items: []
      },
      {
        title: t('admin.donationManagement'),
        url: "/admin/donations",
        icon: CircleDollarSign,
        items: []
      }
    ],
    navSecondary: [],
    projects: [],
  };


    return (
        <Sidebar
        side={currentLanguage === 'ar' ? 'right' : 'left'}
        variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                        {t('common.brandName')}
                    </span>
                    <span className="truncate text-xs">
                        {t('admin.adminPanel')}
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    )
  }