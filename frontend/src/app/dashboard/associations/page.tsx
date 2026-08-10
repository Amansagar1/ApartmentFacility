"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { associationsApi } from "@/api/associations.api";
import { Loader2, Plus, Search, Building2, ArrowLeft, ArrowRight, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function AssociationsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [associations, setAssociations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.isSuperAdmin) {
      fetchAssociations();
    } else if (isAuthenticated && !user?.isSuperAdmin) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const fetchAssociations = async () => {
    try {
      setIsLoading(true);
      const res = await associationsApi.getAll();
      setAssociations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssociations = associations.filter(a =>
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || !user?.isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-8 font-sans text-slate-900">
      <div className="max-w-8xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Registered Associations</h1>
              <p className="text-sm text-slate-500 mt-1">Manage and monitor all associations onboarded to LiveMitra.</p>
            </div>
            <Link href="/dashboard/create-association">
              <Button className="shadow-sm font-medium h-9 px-4 text-sm rounded-md">
                <Plus className="w-4 h-4 mr-1.5" /> Onboard Association
              </Button>
            </Link>
          </div>
        </div>

        {/* Table/List Area */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <h4 className="font-semibold text-slate-900 text-sm">All Associations</h4>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search associations..."
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
                <p className="text-sm text-slate-500 font-medium">Loading associations...</p>
              </div>
            ) : filteredAssociations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center h-full">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No associations found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">No associations match your search or none have been onboarded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-3">Association Details</th>
                      <th className="px-6 py-3">Location / Code</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAssociations.map((assoc) => (
                      <tr key={assoc._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                              <Building2 className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 text-sm max-w-[250px] truncate">{assoc.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5 truncate">{assoc.address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 font-medium">{assoc.city || "N/A"}</div>
                          <div className="text-xs text-slate-500 mt-0.5 font-mono">{assoc.inviteCode || "No Code"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/association/${assoc._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm font-medium h-8 px-3 text-xs rounded-md inline-flex items-center"
                            >
                              <Settings className="w-3.5 h-3.5 mr-1.5" /> Manage
                            </Button>
                          </Link>
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
