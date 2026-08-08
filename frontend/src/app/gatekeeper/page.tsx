"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { visitorsApi } from "@/api/visitors.api";
import { UserCheck, Clock, UserX, UserPlus, LogOut, ShieldCheck } from "lucide-react";
import { authApi } from "@/api/auth.api";

export default function GatekeeperDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      
      {/* Top Navigation Bar */}
      <div className="bg-gray-900 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="font-bold text-lg leading-tight">Security App</h1>
            <p className="text-xs text-gray-400">{user.memberships?.[0]?.associationId?.name || "Main Gate"}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white transition-colors">
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6 mt-4">
        
        <Button 
          onClick={() => router.push("/gatekeeper/new-visitor")}
          className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-6 h-6" />
          <span>Log New Visitor</span>
        </Button>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Recent Visitors</h2>
          
          {isLoading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : visitors.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-medium">No visitors logged today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visitors.map(visitor => (
                <div key={visitor._id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{visitor.visitorName}</h3>
                    <p className="text-gray-500 text-sm font-medium">
                      {visitor.purpose} • Flat {visitor.flatId?.blockName}-{visitor.flatId?.flatNumber}
                    </p>
                    <div className="mt-2">
                      {visitor.status === "PENDING" && <span className="inline-flex items-center text-xs font-bold text-yellow-600 bg-yellow-100 px-2.5 py-1 rounded-full"><Clock className="w-3 h-3 mr-1"/> PENDING APPROVAL</span>}
                      {visitor.status === "APPROVED" && <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full"><UserCheck className="w-3 h-3 mr-1"/> APPROVED</span>}
                      {visitor.status === "DENIED" && <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full"><UserX className="w-3 h-3 mr-1"/> DENIED</span>}
                      {visitor.status === "ENTERED" && <span className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">INSIDE PREMISES</span>}
                      {visitor.status === "EXITED" && <span className="inline-flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">EXITED</span>}
                    </div>
                  </div>
                  
                  {/* Gatekeeper Actions based on Status */}
                  <div className="flex flex-col space-y-2">
                    {visitor.status === "APPROVED" && (
                      <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700 font-bold" onClick={() => markExited(visitor._id)}>
                        Allow Entry
                      </Button>
                    )}
                    {visitor.status === "ENTERED" && (
                      <Button size="sm" variant="outline" className="rounded-full font-bold text-gray-700" onClick={() => markExited(visitor._id)}>
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
