"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supportApi } from "@/api/support.api";
import { Loader2, Plus, Search, MessageSquare, ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SupportTicketsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await supportApi.getMyTickets();
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="w-3.5 h-3.5 mr-1.5" />;
      case "IN_PROGRESS":
        return <Clock className="w-3.5 h-3.5 mr-1.5" />;
      case "RESOLVED":
      case "CLOSED":
        return <CheckCircle className="w-3.5 h-3.5 mr-1.5" />;
      default:
        return <Clock className="w-3.5 h-3.5 mr-1.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "IN_PROGRESS":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
      case "RESOLVED":
      case "CLOSED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Support Tickets</h1>
              <p className="text-sm text-slate-500 mt-1">
                {user?.isSuperAdmin ? "Manage all incoming support requests." : "Get help from the LiveMitra team."}
              </p>
            </div>
            {!user?.isSuperAdmin && (
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-medium h-9 px-4 text-sm rounded-md">
                <Plus className="w-4 h-4 mr-1.5" /> Create Ticket
              </Button>
            )}
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <h4 className="font-semibold text-slate-900 text-sm">Active Tickets</h4>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20 space-y-3 h-full">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500 font-medium">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center h-full">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No support tickets</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">You haven't opened any support tickets yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-3">Ticket ID & Subject</th>
                      <th className="px-6 py-3">Priority</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/dashboard/support/${ticket._id}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                              <MessageSquare className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 text-sm max-w-[300px] truncate">{ticket.title}</div>
                              <div className="text-xs text-slate-500 mt-0.5 truncate">#{ticket._id.substring(ticket._id.length - 6)} • {ticket.author?.fullName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                            ticket.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200/60' :
                            ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200/60' :
                            'bg-slate-50 text-slate-700 border-slate-200/60'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-500">
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
