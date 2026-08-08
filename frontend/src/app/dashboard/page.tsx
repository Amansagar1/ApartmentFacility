"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { authApi } from "@/api/auth.api";
import { visitorsApi } from "@/api/visitors.api";
import { complaintsApi } from "@/api/complaints.api";
import { noticesApi } from "@/api/notices.api";
import { invoicesApi } from "@/api/invoices.api";
import { Bell, Clock, Plus, Tag, Megaphone, IndianRupee } from "lucide-react";
import Script from "next/script";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, setUser, setLoading } = useAuthStore();
  const [pendingVisitors, setPendingVisitors] = useState<any[]>([]);
  const [myComplaints, setMyComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [myInvoices, setMyInvoices] = useState<any[]>([]);

  useEffect(() => {
    // Attempt to fetch current user if not loaded yet
    const fetchUser = async () => {
      try {
        const res = await authApi.getMe();
        setUser(res.data);
      } catch (error) {
        // Token is invalid or missing, redirect to login
        logout();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      fetchUser();
    } else {
      setLoading(false);
      // Fetch pending visitors if user has an association
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
        theme: { color: "#2563EB" }
      };
      
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert("Failed to initialize payment gateway. Please ensure Razorpay keys are configured in the backend.");
    }
  };

  const handleLogout = async () => {
    try {
      // Call the new backend endpoint to clear the HTTP-only cookie
      await authApi.logout();
    } catch (error) {
      console.error("Failed to log out from server", error);
    } finally {
      // Clear frontend Zustand store and redirect
      logout();
      router.push("/login");
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // The useEffect will handle the redirect
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] p-8 font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-4xl mx-auto space-y-10">

        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          <Button variant="outline" className="rounded-full px-6 font-medium" onClick={handleLogout}>Log Out</Button>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">Welcome, {user.fullName}</h2>
            <p className="text-gray-500 font-medium mb-8">
              Logged in as {user.email}
            </p>

            {/* My Dues (Unpaid Invoices) */}
            {myInvoices.filter(i => i.status === 'UNPAID').length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2 text-red-600" /> Outstanding Dues
                </h3>
                <div className="space-y-3">
                  {myInvoices.filter(i => i.status === 'UNPAID').map(invoice => (
                    <div key={invoice._id} className="p-5 rounded-2xl border bg-red-50 border-red-100 shadow-[0_4px_20px_rgb(220,38,38,0.1)] flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-lg text-red-900">Maintenance: {invoice.billingMonth}</h4>
                        <p className="text-sm font-medium text-red-700/80 mt-1">Due by: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold text-red-800">₹{invoice.amount}</span>
                        <Button onClick={() => handlePayment(invoice)} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-6">
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Noticeboard */}
            {notices.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-blue-600" /> Community Noticeboard
                </h3>
                <div className="space-y-3">
                  {notices.map(notice => (
                    <div key={notice._id} className={`p-4 rounded-2xl border ${notice.isImportant ? 'bg-red-50 border-red-100 shadow-[0_4px_20px_rgb(220,38,38,0.1)]' : 'bg-white border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold text-lg ${notice.isImportant ? 'text-red-800' : 'text-gray-900'}`}>
                          {notice.isImportant && "🚨 "} {notice.title}
                        </h4>
                        <span className="text-xs font-medium text-gray-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className={`font-medium mt-1 leading-relaxed ${notice.isImportant ? 'text-red-700/90' : 'text-gray-500'}`}>{notice.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Visitor Approvals */}
            {pendingVisitors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                  <Bell className="w-5 h-5 mr-2 text-red-500 animate-pulse" />
                  Action Required: Visitor at Gate
                </h3>
                <div className="space-y-3">
                  {pendingVisitors.map(visitor => (
                    <div key={visitor._id} className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-red-900 text-lg">{visitor.visitorName}</h4>
                        <p className="text-sm font-medium text-red-700/80">
                          {visitor.purpose} • Flat: {visitor.flatId?.blockName}-{visitor.flatId?.flatNumber}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleVisitorAction(visitor._id, "APPROVED")} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 font-bold">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleVisitorAction(visitor._id, "DENIED")} className="rounded-full text-red-600 border-red-200 hover:bg-red-50 font-bold">
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Helpdesk Tickets */}
            {(user.memberships?.length ?? 0) > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">My Helpdesk Tickets</h3>
                  <Button onClick={() => router.push("/dashboard/complaints/new")} className="rounded-full px-6 font-semibold shadow-[0_4px_14px_0_rgb(0,0,0,0.1)]">
                    <Plus className="w-4 h-4 mr-2" /> Raise Ticket
                  </Button>
                </div>
                
                {myComplaints.length === 0 ? (
                  <div className="py-10 bg-white rounded-3xl border border-gray-100 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <p className="text-gray-500 font-medium">You have no active complaints.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myComplaints.map(complaint => (
                      <div key={complaint._id} className="p-5 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              <Tag className="w-3 h-3 mr-1" /> {complaint.category}
                            </span>
                            <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                              complaint.status === 'OPEN' ? 'text-yellow-600 bg-yellow-50' : 
                              complaint.status === 'IN_PROGRESS' ? 'text-purple-600 bg-purple-50' : 
                              'text-green-600 bg-green-50'
                            }`}>
                              {complaint.status.replace("_", " ")}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg">{complaint.title}</h4>
                          <p className="text-sm font-medium text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>
                        </div>
                        <div className="text-xs text-gray-400 font-medium whitespace-nowrap">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Check if user has no associations */}
            {(!user.memberships || user.memberships.length === 0) ? (
              <div className="py-12 px-6 text-center bg-[#f5f5f7] rounded-[2rem] flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">No Associations</h3>
                <p className="text-gray-500 mb-8 max-w-sm text-center leading-relaxed">
                  You need to create your apartment association or be invited to join an existing one to proceed.
                </p>
                <Button onClick={() => router.push("/dashboard/create-association")} className="h-14 px-10 rounded-full font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] transition-all">
                  Create Association
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Your Associations</h3>
                <div className="grid gap-4">
                  {user.memberships.map((membership: any, index: number) => (
                    <div key={index} className="p-6 rounded-2xl border border-gray-100 bg-[#fbfbfd] flex justify-between items-center transition-all hover:bg-gray-50">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">{membership.associationId?.name || "Association"}</h4>
                        <p className="text-sm text-gray-500 font-medium mt-1">Role: {membership.role}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-full px-6 font-medium"
                        onClick={() => router.push(`/dashboard/association/${membership.associationId?._id}`)}
                      >
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user.isSuperAdmin && (
              <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 flex items-center">
                <span className="text-gray-900 font-medium tracking-tight">You have Super Admin privileges.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
