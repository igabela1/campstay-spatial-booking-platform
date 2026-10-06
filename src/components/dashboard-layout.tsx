'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { NavLink } from '@/lib/nav-links';
import { iconMap } from '@/lib/nav-links';

type DashboardLayoutProps = {
  children: React.ReactNode;
  navLinks: NavLink[];
  user: { name?: string | null; email?: string | null; image?: string | null };
};

export function DashboardLayout({
  children,
  navLinks,
  user,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  const userName = user?.name ?? 'User';
  const userEmail = user?.email ?? 'No email';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-950 pt-16 text-white">
        <Sidebar className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-slate-800 bg-slate-950">
          <SidebarHeader className="border-b border-slate-800">
            <Link href="/" className="flex h-28 items-center justify-center">
              <Image
                src="/logo.jpg"
                alt="Miris Ljeta Logo"
                width={95}
                height={95}
                className="h-24 w-24 rounded-full object-contain"
                priority
              />
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu className="p-2">
              {navLinks.map((link) => {
                const Icon = iconMap[link.iconName];
                const isActive =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.label}
                      className="text-slate-200 hover:bg-slate-800 hover:text-white data-[active=true]:bg-blue-600 data-[active=true]:text-white"
                    >
                      <Link href={link.href}>
                        <Icon />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-14 w-full justify-start px-2 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {user?.image && (
                        <AvatarImage src={user.image} alt={userName} />
                      )}
                      <AvatarFallback>
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="hidden text-left group-data-[collapsible=icon]:hidden md:block">
                      <p className="font-semibold">{userName}</p>
                      <p className="max-w-36 truncate text-xs text-slate-400">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="ml-64 min-h-[calc(100vh-4rem)] flex-1 p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}