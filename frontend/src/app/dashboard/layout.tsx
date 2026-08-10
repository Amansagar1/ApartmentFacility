"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/api/auth.api";
import {
  Loader2,
  LayoutDashboard,
  Receipt,
  MessageSquare,
  Users,
  Menu,
  X,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  BarChart2,
  Building2,
  PlusCircle,
  Shield,
  Settings
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.getMe();
        setUser(res.data);
      } catch (error) {
        logout();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, router, setUser, setLoading, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <Loader2 className="w-10 h-10 animate-spin text-[#3C50E0]" />
      </div>
    );
  }

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Invoices", href: "/dashboard/my-invoices", icon: Receipt },
    { name: "Complaints", href: "/dashboard/complaints", icon: MessageSquare },
  ];

  const roleItems = [];

  if (user?.isSuperAdmin) {
    roleItems.push(
      { name: "All Associations", href: "/dashboard/associations", icon: Building2 },
      { name: "Onboard Association", href: "/dashboard/create-association", icon: PlusCircle }
    );
  }

  if (user?.isSuperAdmin || user?.isGatekeeper) {
    roleItems.push(
      { name: "Gatekeeper Portal", href: "/gatekeeper", icon: Shield }
    );
  }

  // Check for association admin
  const adminMembership = user?.memberships?.find(m => m.role === 'ASSOCIATION_ADMIN');
  if (adminMembership && adminMembership.associationId) {
    const assocId = typeof adminMembership.associationId === 'object' ? adminMembership.associationId._id : adminMembership.associationId;
    if (assocId) {
      roleItems.push(
        { name: "Admin Dashboard", href: `/dashboard/association/${assocId}`, icon: Settings }
      );
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Failed to log out from server", error);
    } finally {
      logout();
      router.push("/login");
    }
  };

  let displayRole = "Resident";
  if (user?.isSuperAdmin) {
    displayRole = "Super Admin";
  } else if (user?.memberships?.some((m: any) => m.role === 'ASSOCIATION_ADMIN')) {
    displayRole = "Association Admin";
  } else if (user?.isGatekeeper || user?.memberships?.some((m: any) => m.role === 'EMPLOYEE')) {
    displayRole = "Gatekeeper";
  }

  return (
    <div className="min-h-screen flex bg-[#F1F5F9] font-sans text-[#64748B]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[290px] bg-[#0F172A] border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header / Logo */}
        <div className="flex items-center px-10 py-7 border-b border-white/10 lg:border-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#3C50E0] to-[#6577F3] rounded-[8px] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BarChart2 className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="text-[24px] font-bold text-white tracking-tight">LiveMitra</span>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6 text-white/70 hover:text-white" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 lg:px-6 py-4 space-y-6 overflow-y-auto sidebar-nav">

          {/* MENU GROUP */}
          <div>
            <div className="px-4 mb-4 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">
              Menu
            </div>
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/5 text-white border border-blue-500/30 shadow-[inset_0px_1px_0px_rgba(255,255,255,0.1)]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className={`w-[22px] h-[22px] transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} strokeWidth={1.5} />
                    <span className="text-[15px]">{item.name}</span>

                    {/* Optional dropdown arrow for structure look */}
                    <ChevronDown className={`absolute right-4 w-4 h-4 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`} strokeWidth={2} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ROLES GROUP */}
          {roleItems.length > 0 && (
            <div className="mt-8">
              <div className="px-4 mb-4 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">
                Roles & Management
              </div>
              <div className="space-y-1.5">
                {roleItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                          ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/5 text-white border border-blue-500/30 shadow-[inset_0px_1px_0px_rgba(255,255,255,0.1)]'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon className={`w-[22px] h-[22px] transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} strokeWidth={1.5} />
                      <span className="text-[15px]">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}



        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-[72px] w-full items-center justify-between px-4 sm:px-6 backdrop-blur-xl bg-white/70 border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
            <button
              className="p-2 rounded-xl bg-white/80 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors focus:outline-none"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3C50E0] to-[#6577F3] rounded-lg flex items-center justify-center shadow-md">
                <BarChart2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* <div className="hidden lg:block w-full max-w-md ml-4"> */}
          {/* <div className="relative"> */}
          {/* <button className="absolute left-0 top-1/2 -translate-y-1/2"> */}
          {/* <Search className="w-5 h-5 text-[#8A99AF]" /> */}
          {/* </button> */}
          {/* <input  */}
          {/* // type="text"  */}
          {/* // placeholder="Type to search..."  */}
          {/* // className="w-full bg-transparent pl-9 pr-4 py-2 text-sm text-[#1C2434] outline-none placeholder:text-[#8A99AF]" */}
          {/* // /> */}
          {/* </div> */}
          {/* </div> */}

          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-full hover:bg-[#F1F5F9] transition-colors">
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#DC3545]"></span>
                <Bell className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <div className="hidden text-right lg:block">
                  <span className="block text-sm font-medium text-[#1C2434]">
                    {user?.fullName || "User"}
                  </span>
                  <span className="block text-xs text-[#64748B]">{displayRole}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                  <span className="font-bold text-[#1C2434] text-sm">
                    {user?.fullName?.charAt(0) || "U"}
                  </span>
                </div>
                <ChevronDown className="hidden w-4 h-4 text-[#64748B] sm:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-4 flex w-64 flex-col rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 overflow-hidden transform opacity-100 transition-all duration-200 origin-top-right">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">{user?.fullName}</p>
                    <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user?.email}</p>
                    <p className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-wider">{displayRole}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100/80 hover:text-red-600 rounded-lg transition-colors group"
                    >
                      <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
