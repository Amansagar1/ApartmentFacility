"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/api/auth.api";
import { visitorsApi } from "@/api/visitors.api";
import { complaintsApi } from "@/api/complaints.api";
import { noticesApi } from "@/api/notices.api";
import { invoicesApi } from "@/api/invoices.api";
import { associationsApi } from "@/api/associations.api";
import { Bell, Tag, IndianRupee, AlertCircle, CheckCircle2, UserCheck, ShieldCheck, Clock, MoreVertical, Eye, BarChart3 } from "lucide-react";
import Script from "next/script";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const PIE_COLORS = ['#3C50E0', '#10B981', '#F59E0B', '#DC3545', '#8B5CF6'];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, setUser, setLoading } = useAuthStore();
  const [pendingVisitors, setPendingVisitors] = useState<any[]>([]);
  const [myComplaints, setMyComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [myInvoices, setMyInvoices] = useState<any[]>([]);
  const [allAssociations, setAllAssociations] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setLoading(false);

      if (user?.isSuperAdmin) {
        associationsApi.getAll()
          .then(res => setAllAssociations(res.data))
          .catch(err => console.error(err));
      }

      if (user?.memberships?.[0]?.associationId?._id) {
        const assocId = user.memberships[0].associationId._id;

        visitorsApi.getAllForAssociation(assocId)
          .then(res => {
            setPendingVisitors(res.data.filter((v: any) => v.status === "PENDING"));
          })
          .catch(err => console.error(err));

        complaintsApi.getMyComplaints()
          .then(res => {
            setMyComplaints(res.data);
          })
          .catch(err => console.error(err));

        noticesApi.getAllForAssociation(assocId)
          .then(res => {
            setNotices(res.data);
          })
          .catch(err => console.error(err));

        invoicesApi.getMyInvoices()
          .then(res => {
            setMyInvoices(res.data);
          })
          .catch(err => console.error(err));
      }
    }
  }, [isAuthenticated, router, setUser, setLoading, logout, user]);

  const handlePayment = async (invoice: any) => {
    if (!user) return;
    try {
      const { order, key_id } = await invoicesApi.createOrder(invoice._id);

      const options = {
        key: key_id,
        amount: order.amount,
        currency: "INR",
        name: "LiveMitra Maintenance",
        description: `Maintenance Bill for ${invoice.billingMonth}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await invoicesApi.verifyPayment(invoice._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert("Payment Successful!");
            const res = await invoicesApi.getMyInvoices();
            setMyInvoices(res.data);
          } catch (err) {
            console.error(err);
            alert("Payment Verification Failed!");
          }
        },
        prefill: {
          name: user.fullName,
          email: user.email,
        },
        theme: { color: "#3C50E0" }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert("Failed to initialize payment gateway.");
    }
  };

  const handleVisitorAction = async (id: string, action: "APPROVED" | "DENIED") => {
    try {
      await visitorsApi.updateStatus(id, action);
      setPendingVisitors(prev => prev.filter(v => v._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return null; // Handled by layout
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Analytics Calculations
  const unpaidInvoices = myInvoices.filter(i => i.status === 'UNPAID');
  const totalDues = unpaidInvoices.reduce((acc, curr) => acc + curr.amount, 0);
  const openComplaintsCount = myComplaints.filter(c => c.status !== 'RESOLVED').length;
  const resolvedComplaintsCount = myComplaints.filter(c => c.status === 'RESOLVED').length;

  const complaintCategories = myComplaints.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});
  const complaintStats = Object.keys(complaintCategories).map(key => ({ name: key, value: complaintCategories[key] }));

  // Prepare Visitor Chart Data (Mocking last 7 days since real data might be sparse)
  const visitorData = [
    { name: 'Mon', visitors: 12 },
    { name: 'Tue', visitors: 19 },
    { name: 'Wed', visitors: 15 },
    { name: 'Thu', visitors: 22 },
    { name: 'Fri', visitors: 28 },
    { name: 'Sat', visitors: 35 },
    { name: 'Sun', visitors: 25 },
  ];

  const invoiceChartData = myInvoices.slice(0, 6).reverse().map(inv => {
    let monthLabel = inv.billingMonth;
    const numMonth = parseInt(monthLabel, 10);
    if (!isNaN(numMonth) && numMonth >= 1 && numMonth <= 12) {
      monthLabel = MONTH_NAMES[numMonth - 1];
    } else {
      monthLabel = monthLabel.substring(0, 3);
    }
    return {
      month: monthLabel,
      amount: inv.amount
    };
  });

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {(!user.memberships || user.memberships.length === 0) && !user.isSuperAdmin ? (
        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-sm border border-[#E2E8F0] shadow-default">
          <AlertCircle className="w-16 h-16 text-[#8A99AF] mb-4" />
          <h3 className="text-2xl font-bold text-[#1C2434] mb-2">No Associations Found</h3>
          <p className="text-[#64748B] text-center max-w-md">You need to be invited to join an existing association to view your dashboard. Please contact your Association Admin.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Admin Quick Access Banner */}
          {(user.isSuperAdmin || user.memberships?.some((m: any) => m.role === 'ASSOCIATION_ADMIN')) && (
            <div className="bg-[#0F172A] rounded-xl border border-blue-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.12),inset_0px_1px_0px_rgba(255,255,255,0.1)] p-5 flex flex-col sm:flex-row items-center justify-between text-white relative overflow-hidden mb-2">
              {/* Sidebar Active State Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-500/5 pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-4 sm:mb-0 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-md flex items-center justify-center border border-blue-500/30 shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white">Association Admin Access</h3>
                  <p className="text-sm text-slate-300 font-medium mt-0.5">Manage flats, members, invoices, and settings.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const adminMembership = user.memberships?.find((m: any) => m.role === 'ASSOCIATION_ADMIN');
                  const assocId = adminMembership ? (typeof adminMembership.associationId === 'object' ? adminMembership.associationId._id : adminMembership.associationId) : null;
                  if (assocId) {
                    router.push(`/dashboard/association/${assocId}`);
                  } else if (user.isSuperAdmin) {
                    router.push(`/dashboard/associations`);
                  }
                }}
                className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 relative z-10 text-sm whitespace-nowrap border border-blue-500/50 shadow-[inset_0px_1px_0px_rgba(255,255,255,0.1)]"
              >
                Go to Admin Panel
              </button>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Dues KPI */}
            <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#3C50E0] group-hover:bg-[#3C50E0] group-hover:text-white transition-colors duration-300">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <h4 className="text-title-md font-extrabold text-[#1C2434] text-2xl tracking-tight">
                  ₹{totalDues.toLocaleString("en-IN")}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Dues</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${totalDues > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {totalDues > 0 ? 'Unpaid' : 'Clear'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Complaints KPI */}
            <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#3C50E0] group-hover:bg-[#3C50E0] group-hover:text-white transition-colors duration-300">
                <Tag className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <h4 className="text-title-md font-extrabold text-[#1C2434] text-2xl tracking-tight">
                  {openComplaintsCount}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Active Complaints</span>
                </div>
              </div>
            </div>

            {/* Pending Visitors KPI */}
            <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#3C50E0] group-hover:bg-[#3C50E0] group-hover:text-white transition-colors duration-300">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <h4 className="text-title-md font-extrabold text-[#1C2434] text-2xl tracking-tight">
                  {pendingVisitors.length}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Pending Visitors</span>
                </div>
              </div>
            </div>

            {/* Notices KPI */}
            <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#3C50E0] group-hover:bg-[#3C50E0] group-hover:text-white transition-colors duration-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <h4 className="text-title-md font-extrabold text-[#1C2434] text-2xl tracking-tight">
                  {notices.length}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Notices</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visitor Traffic Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-6">Visitor Traffic (Last 7 Days)</h4>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisitorsMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6577F3" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3C50E0" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3C50E0" />
                        <stop offset="100%" stopColor="#6577F3" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#0F172A', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="visitors" stroke="url(#lineGradient)" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitorsMain)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complaints Donut */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-6">Complaints by Category</h4>
              {complaintStats.length > 0 ? (
                <div className="h-[300px] flex flex-col justify-between">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={complaintStats} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                          {complaintStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 overflow-y-auto max-h-[80px]">
                    {complaintStats.map((stat, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                          <span className="text-sm font-medium text-slate-600">{stat.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-400" />
                  <p className="font-medium">No complaints found</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Widgets Row */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">

            {/* Notices List */}
            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between py-5 px-6 border-b border-slate-100 bg-slate-50/50">
                <h4 className="text-xl font-bold text-[#1C2434]">Noticeboard</h4>
                <button className="p-1 rounded-md hover:bg-slate-200 transition-colors">
                  <MoreVertical className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {notices.length === 0 ? (
                  <div className="text-center text-[#8A99AF] py-8">
                    No notices available at the moment.
                  </div>
                ) : (
                  notices.map(notice => (
                    <div key={notice._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div>
                        <h5 className="font-semibold text-[#1C2434] flex items-center gap-2">
                          {notice.isImportant && <span className="w-2 h-2 rounded-full bg-[#DC3545] shadow-[0_0_8px_rgba(220,53,69,0.5)]"></span>}
                          {notice.title}
                        </h5>
                        <p className="text-sm text-[#64748B] mt-1 line-clamp-1">{notice.content}</p>
                      </div>
                      <div className="text-xs font-semibold text-[#8A99AF] bg-slate-50 px-2.5 py-1 rounded-md sm:text-right shrink-0">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Approvals / Unpaid Invoices */}
            <div className="space-y-4">

              {/* Unpaid Invoices */}
              {unpaidInvoices.length > 0 && (
                <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between py-5 px-6 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-xl font-bold text-[#1C2434]">Upcoming Schedule</h4>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    {unpaidInvoices.map(invoice => (
                      <div key={invoice._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                            {new Date(invoice.dueDate).getDate()}
                          </div>
                          <div>
                            <h5 className="font-semibold text-[#1C2434] text-sm">Invoice for {invoice.billingMonth}</h5>
                            <p className="text-xs text-[#64748B] mt-0.5">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-[#3C50E0]">₹{invoice.amount}</span>
                          <button onClick={() => handlePayment(invoice)} className="px-4 py-2 text-sm font-bold text-white bg-[#0F172A] rounded-lg shadow-[inset_0px_1px_0px_rgba(255,255,255,0.1)] hover:bg-[#1E293B] border border-blue-500/30 transition-all whitespace-nowrap">
                            Pay Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Visitors */}
              {pendingVisitors.length > 0 && (
                <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between py-5 px-6 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-xl font-bold text-[#1C2434]">Visitor Approvals</h4>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    {pendingVisitors.map(visitor => (
                      <div key={visitor._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                        <div>
                          <h5 className="font-semibold text-[#1C2434] text-sm">{visitor.visitorName}</h5>
                          <p className="text-xs font-medium text-[#64748B] mt-0.5">{visitor.purpose} • {new Date(visitor.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleVisitorAction(visitor._id, "APPROVED")} className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 rounded-lg shadow-sm hover:bg-emerald-600 transition-colors">Approve</button>
                          <button onClick={() => handleVisitorAction(visitor._id, "DENIED")} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Deny</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
