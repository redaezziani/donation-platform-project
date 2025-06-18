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
    BookOpen,
    Bot,
    Command,
    Frame,
    LifeBuoy,
    Map,
    PieChart,
    Send,
    Settings2,
    SquareTerminal,
  } from "lucide-react"
  
  import { NavMain } from './nav-main'
  import { NavProjects } from './nav-projects'
  import { NavSecondary } from './nav-secondary'
  import { NavUser } from './nav-user'


  const data = {
    user: {
      name: "شادكن",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "ساحة التجربة",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "السجل",
            url: "#",
          },
          {
            title: "المميزة",
            url: "#",
          },
          {
            title: "الإعدادات",
            url: "#",
          },
        ],
      },
      {
        title: "النماذج",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "جينيسيس",
            url: "#",
          },
          {
            title: "إكسبلورر",
            url: "#",
          },
          {
            title: "كوانتوم",
            url: "#",
          },
        ],
      },
      {
        title: "التوثيق",
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: "مقدمة",
            url: "#",
          },
          {
            title: "ابدأ الآن",
            url: "#",
          },
          {
            title: "الدروس التعليمية",
            url: "#",
          },
          {
            title: "سجل التغييرات",
            url: "#",
          },
        ],
      },
      {
        title: "الإعدادات",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "عام",
            url: "#",
          },
          {
            title: "الفريق",
            url: "#",
          },
          {
            title: "الفوترة",
            url: "#",
          },
          {
            title: "الحدود",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "الدعم",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "ملاحظات",
        url: "#",
        icon: Send,
      },
    ],
    projects: [
      {
        name: "هندسة التصميم",
        url: "#",
        icon: Frame,
      },
      {
        name: "المبيعات والتسويق",
        url: "#",
        icon: PieChart,
      },
      {
        name: "السفر",
        url: "#",
        icon: Map,
      },
    ],
  };
  
  
  export function AppSidebar(props) {


    return (
        <Sidebar variant="inset" {...props}>
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
                        شادكن
                    </span>
                    <span className="truncate text-xs">
                        لوحة التحكم
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavProjects projects={data.projects} />
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    )
  }