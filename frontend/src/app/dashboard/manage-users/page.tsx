"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { usersApi } from "@/api/users.api";
import { associationsApi } from "@/api/associations.api";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PlusCircle, ShieldAlert, Users as UsersIcon, Building2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageUsersPage() {
  const { user, isSuperAdmin } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [associations, setAssociations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "ASSOCIATION_ADMIN",
    associationId: ""
  });

  useEffect(() => {
    if (!user) return;
    if (!isSuperAdmin()) {
      toast.error("Unauthorized access");
      router.push("/dashboard");
      return;
    }

    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const [assocRes, usersRes] = await Promise.all([
        associationsApi.getAll(),
        usersApi.getAllUsers()
      ]);
      setAssociations(assocRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      toast.error("Failed to load initial data");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.role !== "SUPER_ADMIN" && !formData.associationId) {
        toast.error("Please select an association for this role");
        setLoading(false);
        return;
      }

      await usersApi.createUser(formData);
      toast.success("User created successfully!");
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "ASSOCIATION_ADMIN",
        associationId: ""
      });
      
      // Refresh user list
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isSuperAdmin()) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-slate-700" />
          Manage Roles & Users
        </h1>
        <p className="text-gray-500 mt-1">
          Create platform users, assign administrative roles, or provision gatekeepers globally.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create User Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm self-start">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-slate-700" />
            Create New User
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="fullName"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="bg-gray-50 border-transparent focus:bg-white"
            />
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-gray-50 border-transparent focus:bg-white"
            />
            
            <Input
              label="Phone Number (Optional)"
              name="phone"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleInputChange}
              className="bg-gray-50 border-transparent focus:bg-white"
            />

            <Input
              label="Initial Password"
              name="password"
              type="password"
              placeholder="password123"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="bg-gray-50 border-transparent focus:bg-white"
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Assign Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full h-12 px-4 rounded-xl border-transparent bg-gray-50 text-gray-900 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all outline-none"
                required
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ASSOCIATION_ADMIN">Association Admin</option>
                <option value="EMPLOYEE">Gatekeeper / Staff</option>
                <option value="RESIDENT">Resident</option>
              </select>
            </div>

            {formData.role !== "SUPER_ADMIN" && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  Target Association
                </label>
                <select
                  name="associationId"
                  value={formData.associationId}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 rounded-xl border-transparent bg-gray-50 text-gray-900 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all outline-none"
                  required
                >
                  <option value="">Select Association...</option>
                  {associations.map(assoc => (
                    <option key={assoc._id} value={assoc._id}>
                      {assoc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button type="submit" isLoading={loading} className="w-full h-12 bg-slate-700 hover:bg-slate-800 rounded-xl mt-4">
              Create User
            </Button>
          </form>
        </div>

        {/* Users List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-slate-700" />
            Platform Users Directory
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-semibold text-gray-500 text-sm">User</th>
                  <th className="pb-3 font-semibold text-gray-500 text-sm">Contact</th>
                  <th className="pb-3 font-semibold text-gray-500 text-sm">Roles / Memberships</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.fullName}</div>
                          {u.isSuperAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                              Super Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm text-gray-600">{u.email}</div>
                      {u.phone && <div className="text-sm text-gray-400">{u.phone}</div>}
                    </td>
                    <td className="py-4">
                      {u.memberships && u.memberships.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {u.memberships.map((m: any, idx: number) => (
                            <div key={idx} className="text-sm flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                m.role === 'ASSOCIATION_ADMIN' ? 'bg-blue-100 text-blue-700' :
                                m.role === 'EMPLOYEE' ? 'bg-amber-100 text-amber-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {m.role.replace('_', ' ')}
                              </span>
                              <span className="text-gray-500 truncate max-w-[150px]" title={m.associationId?.name}>
                                @ {m.associationId?.name || 'Unknown'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No memberships</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      Loading users or no users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
