import { BookOpenIcon, InfoIcon, LifeBuoyIcon, UserIcon, LogOutIcon, Settings, HeartHandshake, CircleDollarSign, LayoutDashboard, Search, Globe } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTranslation } from 'react-i18next'
import { cn } from "../lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
} from "../components/ui/avatar"
import SearchBar from "./SearchBar"
import LanguageSwitcher from "./LanguageSwitcher"

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t } = useTranslation()
  
  // Navigation links with translations
  const navigationLinks = [
    { href: "/", label: t('navigation.home') },
    {
      label: t('navigation.donations'),
      submenu: true,
      type: "description",
      items: [
        {
          href: "/campaigns",
          label: t('navigation.browseCampaigns'),
          description: t('navigation.browseCampaignsDesc', 'Browse all active charitable campaigns.'),
        },
        {
          href: "/create-campaign",
          label: t('navigation.createCampaign'),
          description: t('navigation.createCampaignDesc', 'Create a new donation campaign for a cause you care about.'),
        },
        {
          href: "/dashboard",
          label: t('navigation.dashboard'),
          description: t('navigation.dashboardDesc', 'Manage your campaigns and donations.'),
        },
      ],
    },
    {
      label: t('navigation.categories'),
      submenu: true,
      type: "simple",
      items: [
        { href: "/categories/water", label: t('navigation.waterProjects') },
        { href: "/categories/education", label: t('navigation.orphanEducation') },
        { href: "/categories/medical", label: t('navigation.medicalAid') },
        { href: "/categories/food", label: t('navigation.foodRelief') },
      ],
    },
    {
      label: t('navigation.aboutPlatform'),
      submenu: true,
      type: "icon",
      items: [
        { href: "/about", label: t('navigation.aboutUs'), icon: "InfoIcon" },
        { href: "/how-it-works", label: t('navigation.howItWorks'), icon: "BookOpenIcon" },
        { href: "/contact", label: t('navigation.contact'), icon: "LifeBuoyIcon" },
      ],
    },
  ]
  
  // Get user's initials for avatar
  const getUserInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    return 'U';
  }

  // Get display name
  const getDisplayName = () => {
    return user?.full_name || user?.username || t('common.user', 'User');
  }

  return (
   <div className="w-full bg-muted flex justify-center items-center fixed top-0 z-50 ">
     <header className=" w-full max-w-7xl px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 p-2 md:hidden">
              {/* Mobile Search Bar */}
              <div className="mb-4 px-1">
                <SearchBar />
              </div>
              
              {/* Mobile Language Switcher */}
              <div className="mb-4 px-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
                  <Globe size={14} />
                  <span>{t('common.language', 'Language')}</span>
                </div>
                <LanguageSwitcher />
              </div>
              
              <div className="border-t pt-3">
                <NavigationMenu className="max-w-none *:w-full">
                  <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        {link.submenu ? (
                          <>
                            <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                              {link.label}
                            </div>
                            <ul>
                              {link.items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  <NavigationMenuLink
                                    href={item.href}
                                    className="py-1.5"
                                  >
                                    {item.label}
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <NavigationMenuLink href={link.href} className="py-1.5">
                            {link.label}
                          </NavigationMenuLink>
                        )}
                        {/* Add separator between different types of items */}
                        {index < navigationLinks.length - 1 &&
                          // Show separator if:
                          // 1. One is submenu and one is simple link OR
                          // 2. Both are submenus but with different types
                          ((!link.submenu &&
                            navigationLinks[index + 1].submenu) ||
                            (link.submenu &&
                              !navigationLinks[index + 1].submenu) ||
                            (link.submenu &&
                              navigationLinks[index + 1].submenu &&
                              link.type !== navigationLinks[index + 1].type)) && (
                            <div
                              role="separator"
                              aria-orientation="horizontal"
                              className="bg-border -mx-1 my-1 h-px w-full"
                            />
                          )}
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <a href="/" className="text-primary text-2xl  font-AlRaiMediaBold hover:text-primary/90">
            {t('footer.brandName')}
            </a>
            {/* Navigation menu - Desktop only */}
            <NavigationMenu viewport={false} className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    {link.submenu ? (
                      <>
                        <NavigationMenuTrigger className="text-muted-foreground hover:text-primary bg-transparent px-2 py-1.5 font-medium *:[svg]:-me-0.5 *:[svg]:size-3.5">
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16! z-50 p-1">
                          <ul
                            className={cn(
                              link.type === "description"
                                ? "min-w-64"
                                : "min-w-48"
                            )}
                          >
                            {link.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <NavigationMenuLink
                                  href={item.href}
                                  className="py-1.5"
                                >
                                  {/* Display icon if present */}
                                  {link.type === "icon" && "icon" in item && (
                                    <div className="flex items-center gap-2">
                                      {item.icon === "BookOpenIcon" && (
                                        <BookOpenIcon
                                          size={16}
                                          className="text-foreground opacity-60"
                                          aria-hidden="true"
                                        />
                                      )}
                                      {item.icon === "LifeBuoyIcon" && (
                                        <LifeBuoyIcon
                                          size={16}
                                          className="text-foreground opacity-60"
                                          aria-hidden="true"
                                        />
                                      )}
                                      {item.icon === "InfoIcon" && (
                                        <InfoIcon
                                          size={16}
                                          className="text-foreground opacity-60"
                                          aria-hidden="true"
                                        />
                                      )}
                                      <span>{item.label}</span>
                                    </div>
                                  )}

                                  {/* Display label with description if present */}
                                  {link.type === "description" &&
                                  "description" in item ? (
                                    <div className="space-y-1">
                                      <div className="font-medium">
                                        {item.label}
                                      </div>
                                      <p className="text-muted-foreground line-clamp-2 text-xs">
                                        {item.description}
                                      </p>
                                    </div>
                                  ) : (
                                    // Display simple label if not icon or description type
                                    !link.type ||
                                    (link.type !== "icon" &&
                                      link.type !== "description" && (
                                        <span>{item.label}</span>
                                      ))
                                  )}
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink
                        href={link.href}
                        className="text-muted-foreground hover:text-primary py-1.5 font-medium"
                      >
                        {link.label}
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Desktop Search and Language - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3">
            <SearchBar />
            <LanguageSwitcher />
          </div>
          
          {/* User menu - Always visible */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-primary/10 text-primary">{getUserInitial()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <UserIcon className="ml-2 h-4 w-4" />
                      <span>{t('navigation.dashboard')}</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/create-campaign">
                      <HeartHandshake className="ml-2 h-4 w-4" />
                      <span>{t('navigation.createCampaign')}</span>
                    </Link>
                  </DropdownMenuItem>

                  {user?.is_admin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <LayoutDashboard className="ml-2 h-4 w-4" />
                        <span>{t('admin.adminPanel')}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={logout}>
                    <LogOutIcon className="ml-2 h-4 w-4" />
                    <span>{t('auth.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="text-sm">
                <Link to="/login">{t('auth.login')}</Link>
              </Button>
              <Button asChild size="sm" className="text-sm max-sm:hidden">
                <Link to="/register">{t('auth.createAccount')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
   </div>
  )
}
