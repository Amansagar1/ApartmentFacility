"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { visitorsApi } from "@/api/visitors.api";
import { UserCheck, Clock, UserX, UserPlus, LogOut, ShieldCheck, Search, ChevronRight, Activity } from "lucide-react";
import { authApi } from "@/api/auth.api";

export default function GatekeeperDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Assuming the gatekeeper belongs to one association
  const associationId = user?.memberships?.[0]?.associationId?._id;

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        if (!associationId) return;
        const res = await visitorsApi.getAllForAssociation(associationId);
        setVisitors(res.data);
      } catch (error) {
        console.error("Failed to fetch visitors", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVisitors();
    
    // Auto-refresh every 10 seconds to check for approvals
    const interval = setInterval(fetchVisitors, 10000);
    return () => clearInterval(interval);
  }, [associationId]);

  const handleLogout = async () => {
    await authApi.logout();
    logout();
    router.push("/login");
  };

  const markExited = async (id: string) => {
    try {
      await visitorsApi.updateStatus(id, "EXITED");
      setVisitors(visitors.map(v => v._id === id ? { ...v, status: "EXITED" } : v));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  const filteredVisitors = visitors.filter(v => 
    v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.flatId?.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeVisitorsCount = visitors.filter(v => v.status === "ENTERED").length;
  const pendingApprovalsCount = visitors.filter(v => v.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      
      {/* Top Navigation Bar with Glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white shadow-[0_4px_30px_rgb(0,0,0,0.03)] px-4 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight tracking-tight">Security Portal</h1>
            <p className="text-[11px] font-semibold tracking-wider text-indigo-600 uppercase">{user.memberships?.[0]?.associationId?.name || "Main Gate"}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6 mt-4">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeVisitorsCount}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Inside Now</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingApprovalsCount}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => router.push("/gatekeeper/new-visitor")}
          className="w-full h-16 text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-2xl shadow-xl shadow-gray-900/20 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] hover:-translate-y-0.5 border border-gray-700"
        >
          <UserPlus className="w-6 h-6" />
          <span>Log New Visitor</span>
        </Button>

        <div>
          <div className="flex items-center justify-between mb-4 px-1 mt-8">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Visitors</h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-[14px] w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search visitors or flat no..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading records...</p>
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-bold text-lg mb-1">No visitors found</p>
              <p className="text-gray-500 text-sm">There are no records matching your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVisitors.map(visitor => (
                <div key={visitor._id} className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:border-indigo-100 group">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <span className="font-bold text-gray-600 group-hover:text-indigo-600">
                        {visitor.visitorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-[17px] mb-0.5">{visitor.visitorName}</h3>
                      <p className="text-gray-500 text-sm font-medium flex items-center">
                        <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded mr-2 text-xs font-bold">Flat {visitor.flatId?.blockName}-{visitor.flatId?.flatNumber}</span>
                        {visitor.purpose}
                      </p>
                      <div className="mt-3 flex items-center">
                        {visitor.status === "PENDING" && (
                          <span className="inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span> Pending Approval
                          </span>
                        )}
                        {visitor.status === "APPROVED" && (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Approved
                          </span>
                        )}
                        {visitor.status === "DENIED" && (
                          <span className="inline-flex items-center text-[10px] font-bold text-red-600 bg-red-50 border border-red-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span> Denied
                          </span>
                        )}
                        {visitor.status === "ENTERED" && (
                          <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span> Inside Premises
                          </span>
                        )}
                        {visitor.status === "EXITED" && (
                          <span className="inline-flex items-center text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span> Exited
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Gatekeeper Actions based on Status */}
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                    {visitor.status === "APPROVED" && (
                      <Button size="sm" className="w-full sm:w-auto rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/20" onClick={() => markExited(visitor._id)}>
                        Allow Entry
                      </Button>
                    )}
                    {visitor.status === "ENTERED" && (
                      <Button size="sm" variant="outline" className="w-full sm:w-auto rounded-xl font-bold text-gray-700 hover:bg-gray-50 border-gray-200" onClick={() => markExited(visitor._id)}>
                        Mark Exit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
