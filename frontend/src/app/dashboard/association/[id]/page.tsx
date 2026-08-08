"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { flatsApi } from "@/api/flats.api";
import { complaintsApi } from "@/api/complaints.api";
import { noticesApi } from "@/api/notices.api";
import { invoicesApi } from "@/api/invoices.api";
import { visitorsApi } from "@/api/visitors.api";
import { associationsApi } from "@/api/associations.api";
import { Building2, Plus, ArrowLeft, Wrench, Tag, Megaphone, Receipt, Trash2, Edit2, Check, X, UserCheck, Shield, Users } from "lucide-react";
import Link from "next/link";

const noticeSchema = z.object({
  title: z.string().min(3, "Title required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  isImportant: z.boolean(),
});

type NoticeFormValues = z.infer<typeof noticeSchema>;

export default function AssociationDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: associationId } = use(params);
  
  const [activeTab, setActiveTab] = useState<"directory" | "helpdesk" | "notices" | "accounting" | "approvals" | "staff" | "visitors">("directory");

  const [flats, setFlats] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingBills, setIsGeneratingBills] = useState(false);
  const [isLoggingVisitor, setIsLoggingVisitor] = useState(false);
  const [selectedFlats, setSelectedFlats] = useState<string[]>([]);

  // Edit States
  const [editingFlatId, setEditingFlatId] = useState<string | null>(null);
  const [editFlatData, setEditFlatData] = useState<any>({});
  
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [editNoticeData, setEditNoticeData] = useState<any>({});
  
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editInvoiceData, setEditInvoiceData] = useState<any>({});

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      isImportant: false
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "directory") {
          const response = await flatsApi.getByAssociationId(associationId);
          setFlats(response.data);
        } else if (activeTab === "helpdesk") {
          const response = await complaintsApi.getAllForAssociation(associationId);
          setComplaints(response.data);
        } else if (activeTab === "notices") {
          const response = await noticesApi.getAllForAssociation(associationId);
          setNotices(response.data);
        } else if (activeTab === "accounting") {
          const [invRes, flatRes] = await Promise.all([
            invoicesApi.getAllForAssociation(associationId),
            flatsApi.getByAssociationId(associationId)
          ]);
          setInvoices(invRes.data);
          setFlats(flatRes.data);
        } else if (activeTab === "approvals" || activeTab === "staff") {
          const response = await associationsApi.getMembers(associationId);
          setMembers(response.data);
        } else if (activeTab === "visitors") {
          const response = await visitorsApi.getAllForAssociation(associationId);
          setVisitorLogs(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (associationId) {
      setIsLoading(true);
      fetchData();
    }
  }, [associationId, activeTab]);

  const updateComplaintStatus = async (id: string, newStatus: string) => {
    try {
      await complaintsApi.updateStatus(id, newStatus);
      setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmitNotice = async (data: NoticeFormValues) => {
    try {
      await noticesApi.create({ ...data, associationId });
      reset();
      const response = await noticesApi.getAllForAssociation(associationId);
      setNotices(response.data);
      alert("Notice published successfully!");
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to publish notice. Please make sure the content is at least 10 characters long.");
    }
  };

  const handleGenerateBills = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    const billingMonth = formData.get("billingMonth") as string;
    const dueDate = formData.get("dueDate") as string;

    if (!amount || !billingMonth || !dueDate) return alert("Please fill all fields");
    
    setIsGeneratingBills(true);
    try {
      await invoicesApi.generate({ associationId, amount, billingMonth, dueDate, flatIds: selectedFlats });
      const response = await invoicesApi.getAllForAssociation(associationId);
      setInvoices(response.data);
      alert(`Invoices generated for ${selectedFlats.length > 0 ? 'selected' : 'all'} flats successfully!`);
      setSelectedFlats([]);
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to generate invoices.");
    } finally {
      setIsGeneratingBills(false);
    }
  };

  // CRUD Handlers
  const handleEditFlat = (flat: any) => { setEditingFlatId(flat._id); setEditFlatData(flat); };
  const handleSaveFlat = async (id: string) => {
    try {
      await flatsApi.update(id, editFlatData);
      setFlats(flats.map(f => f._id === id ? { ...f, ...editFlatData } : f));
      setEditingFlatId(null);
    } catch (e) { alert("Failed to update flat"); }
  };
  const handleDeleteFlat = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flat?")) return;
    try {
      await flatsApi.delete(id);
      setFlats(flats.filter(f => f._id !== id));
    } catch (e) { alert("Failed to delete flat"); }
  };

  const handleEditNotice = (notice: any) => { setEditingNoticeId(notice._id); setEditNoticeData(notice); };
  const handleSaveNotice = async (id: string) => {
    try {
      await noticesApi.update(id, editNoticeData);
      setNotices(notices.map(n => n._id === id ? { ...n, ...editNoticeData } : n));
      setEditingNoticeId(null);
    } catch (e) { alert("Failed to update notice"); }
  };
  const handleDeleteNotice = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    try {
      await noticesApi.delete(id);
      setNotices(notices.filter(n => n._id !== id));
    } catch (e) { alert("Failed to delete notice"); }
  };

  const handleEditInvoice = (invoice: any) => { setEditingInvoiceId(invoice._id); setEditInvoiceData(invoice); };
  const handleSaveInvoice = async (id: string) => {
    try {
      await invoicesApi.update(id, editInvoiceData);
      setInvoices(invoices.map(i => i._id === id ? { ...i, ...editInvoiceData } : i));
      setEditingInvoiceId(null);
    } catch (e) { alert("Failed to update invoice"); }
  };
  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      await invoicesApi.delete(id);
      setInvoices(invoices.filter(i => i._id !== id));
    } catch (e) { alert("Failed to delete invoice"); }
  };

  const handleDeleteComplaint = async (id: string) => {
    if (!confirm("Delete this complaint?")) return;
    try {
      await complaintsApi.delete(id);
      setComplaints(complaints.filter(c => c._id !== id));
    } catch (e) { alert("Failed to delete complaint"); }
  };

  const handleApproveMember = async (userId: string, newStatus: string) => {
    try {
      await associationsApi.updateMembership(associationId, userId, { status: newStatus });
      setMembers(members.map(m => m._id === userId ? { ...m, status: newStatus } : m));
    } catch (e) {
      alert("Failed to update member status");
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await associationsApi.updateMembership(associationId, userId, { role: newRole });
      setMembers(members.map(m => m._id === userId ? { ...m, role: newRole } : m));
    } catch (e) {
      alert("Failed to update role");
    }
  };

  const handleLogVisitor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const visitorName = formData.get("visitorName") as string;
    const purpose = formData.get("purpose") as string;
    const flatId = formData.get("flatId") as string;

    if (!visitorName || !purpose || !flatId) return alert("Please fill all fields");
    
    setIsLoggingVisitor(true);
    try {
      await visitorsApi.logVisitor({ associationId, flatId, visitorName, purpose });
      const response = await visitorsApi.getAllForAssociation(associationId);
      setVisitorLogs(response.data);
      e.currentTarget.reset();
      alert("Visitor logged and request sent to resident!");
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to log visitor.");
    } finally {
      setIsLoggingVisitor(false);
    }
  };

  const handleVisitorStatusChange = async (visitorId: string, newStatus: string) => {
    try {
      await visitorsApi.updateStatus(visitorId, newStatus);
      const response = await visitorsApi.getAllForAssociation(associationId);
      setVisitorLogs(response.data);
    } catch (e) {
      alert("Failed to update visitor status");
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Main Dashboard
        </Link>

        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Association Management</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your flats, resident complaints, and announcements.</p>
          </div>
          {activeTab === "directory" && (
            <Button 
              className="rounded-full px-6 font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] transition-all"
              onClick={() => router.push(`/dashboard/association/${associationId}/add-flat`)}
            >
              <Plus className="w-5 h-5 mr-2" /> Add Flat
            </Button>
          )}
        </div>

        {/* Custom Apple-style Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl w-fit mb-6">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "directory" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Flats Directory
          </button>
          <button
            onClick={() => setActiveTab("helpdesk")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "helpdesk" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Helpdesk Tickets
          </button>
          <button
            onClick={() => setActiveTab("notices")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "notices" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Noticeboard
          </button>
          <button
            onClick={() => setActiveTab("accounting")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "accounting" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Accounting
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "approvals" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Approvals
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "staff" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Staff
          </button>
          <button
            onClick={() => setActiveTab("visitors")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "visitors" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Visitor Logs
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400 animate-pulse font-medium">Loading data...</p>
            </div>
          ) : activeTab === "directory" ? (
            // Flats Directory View
            flats.length === 0 ? (
              <div className="py-20 px-6 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mb-6">
                  <Building2 className="h-10 w-10 text-gray-400 stroke-[1.5]" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">No Flats Added Yet</h3>
                <p className="text-gray-500 max-w-sm mb-6">Start building your directory by adding the first flat or apartment unit.</p>
                <Button onClick={() => router.push(`/dashboard/association/${associationId}/add-flat`)} className="rounded-full px-8 font-medium">
                  Add Your First Flat
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f5f7] text-gray-500 text-sm tracking-wide">
                      <th className="py-4 px-6 font-medium border-b border-gray-100">Block</th>
                      <th className="py-4 px-6 font-medium border-b border-gray-100">Flat No.</th>
                      <th className="py-4 px-6 font-medium border-b border-gray-100">Owner Email</th>
                      <th className="py-4 px-6 font-medium border-b border-gray-100">Tenant Email</th>
                      <th className="py-4 px-6 font-medium border-b border-gray-100 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {flats.map((flat) => (
                      <tr key={flat._id} className="group hover:bg-gray-50 transition-colors">
                        {editingFlatId === flat._id ? (
                          <>
                            <td className="py-4 px-6"><Input value={editFlatData.blockName || ""} onChange={e => setEditFlatData({...editFlatData, blockName: e.target.value})} className="h-8 min-w-[80px]" /></td>
                            <td className="py-4 px-6"><Input value={editFlatData.flatNumber || ""} onChange={e => setEditFlatData({...editFlatData, flatNumber: e.target.value})} className="h-8 min-w-[80px]" /></td>
                            <td className="py-4 px-6"><Input value={editFlatData.ownerEmail || ""} onChange={e => setEditFlatData({...editFlatData, ownerEmail: e.target.value})} className="h-8 min-w-[150px]" /></td>
                            <td className="py-4 px-6"><Input value={editFlatData.tenantEmail || ""} onChange={e => setEditFlatData({...editFlatData, tenantEmail: e.target.value})} className="h-8 min-w-[150px]" /></td>
                            <td className="py-4 px-6 text-right space-x-2 min-w-[100px]">
                              <button onClick={() => handleSaveFlat(flat._id)} className="text-green-600 hover:text-green-800 p-1"><Check className="w-5 h-5"/></button>
                              <button onClick={() => setEditingFlatId(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5"/></button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-4 px-6 font-semibold text-gray-900">{flat.blockName}</td>
                            <td className="py-4 px-6 font-semibold text-gray-900">{flat.flatNumber}</td>
                            <td className="py-4 px-6 text-gray-600">{flat.ownerEmail || <span className="text-gray-400 italic">Not Added</span>}</td>
                            <td className="py-4 px-6 text-gray-600">{flat.tenantEmail || <span className="text-gray-400 italic">N/A</span>}</td>
                            <td className="py-4 px-6 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditFlat(flat)} className="text-blue-500 hover:text-blue-700 transition-colors"><Edit2 className="w-4 h-4"/></button>
                              <button onClick={() => handleDeleteFlat(flat._id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 className="w-4 h-4"/></button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === "helpdesk" ? (
            // Helpdesk Tickets View
            complaints.length === 0 ? (
              <div className="py-20 px-6 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mb-6">
                  <Wrench className="h-10 w-10 text-gray-400 stroke-[1.5]" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">Inbox Zero!</h3>
                <p className="text-gray-500 max-w-sm mb-6">There are no open complaints from your residents.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {complaints.map(complaint => (
                  <div key={complaint._id} className="p-5 bg-[#fbfbfd] rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                          <Tag className="w-3 h-3 mr-1" /> {complaint.category}
                        </span>
                        <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                          complaint.status === 'OPEN' ? 'text-yellow-600 bg-yellow-100' : 
                          complaint.status === 'IN_PROGRESS' ? 'text-purple-600 bg-purple-100' : 
                          'text-green-600 bg-green-100'
                        }`}>
                          {complaint.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-400 font-medium ml-2">By: {complaint.residentId?.fullName}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">{complaint.title}</h4>
                      <p className="text-sm font-medium text-gray-500 mt-1">{complaint.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {complaint.status === "OPEN" && (
                        <Button size="sm" onClick={() => updateComplaintStatus(complaint._id, "IN_PROGRESS")} className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full">
                          Mark In Progress
                        </Button>
                      )}
                      {(complaint.status === "OPEN" || complaint.status === "IN_PROGRESS") && (
                        <Button size="sm" onClick={() => updateComplaintStatus(complaint._id, "RESOLVED")} className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-full">
                          Resolve
                        </Button>
                      )}
                      {complaint.status === "RESOLVED" && (
                        <span className="text-sm text-green-600 font-bold px-4 py-2">Resolved</span>
                      )}
                      <button onClick={() => handleDeleteComplaint(complaint._id)} className="ml-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete Complaint">
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "notices" ? (
            // Noticeboard View
            <div className="p-6">
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-blue-600" /> Broadcast New Notice
                </h3>
                <form onSubmit={handleSubmit(onSubmitNotice)} className="space-y-4">
                  <Input 
                    placeholder="Notice Title (e.g. Water Cut Tomorrow)" 
                    {...register("title")} 
                    className="bg-white"
                  />
                  <textarea 
                    placeholder="Details..." 
                    {...register("content")}
                    className="w-full p-4 border border-gray-200 rounded-xl resize-none h-24 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 cursor-pointer">
                      <input type="checkbox" {...register("isImportant")} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                      <span>Mark as Highly Important (Red Alert)</span>
                    </label>
                    <Button type="submit" isLoading={isSubmitting} className="rounded-full px-6 font-bold bg-blue-600 text-white hover:bg-blue-700">
                      Publish Notice
                    </Button>
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Past Notices</h3>
                {notices.length === 0 ? (
                  <p className="text-gray-500 text-sm">No notices published yet.</p>
                ) : (
                  notices.map(notice => (
                    <div key={notice._id} className={`p-4 rounded-xl border group relative transition-all ${notice.isImportant ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                      {editingNoticeId === notice._id ? (
                        <div className="space-y-3">
                          <Input value={editNoticeData.title || ""} onChange={e => setEditNoticeData({...editNoticeData, title: e.target.value})} className="bg-white font-bold h-9" />
                          <textarea value={editNoticeData.content || ""} onChange={e => setEditNoticeData({...editNoticeData, content: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none h-20 outline-none focus:ring-1 focus:ring-blue-500" />
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => handleSaveNotice(notice._id)} className="text-sm text-green-600 font-bold flex items-center bg-green-50 px-3 py-1.5 rounded-md hover:bg-green-100 transition"><Check className="w-4 h-4 mr-1"/> Save</button>
                            <button onClick={() => setEditingNoticeId(null)} className="text-sm text-gray-500 font-bold flex items-center bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 transition"><X className="w-4 h-4 mr-1"/> Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-bold pr-16 ${notice.isImportant ? 'text-red-800' : 'text-gray-900'}`}>
                              {notice.isImportant && "🚨 "} {notice.title}
                            </h4>
                            <span className="text-xs text-gray-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className={`text-sm ${notice.isImportant ? 'text-red-700/90' : 'text-gray-600'}`}>{notice.content}</p>
                          
                          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm px-2 py-1 rounded-md">
                            <button onClick={() => handleEditNotice(notice)} className="text-blue-500 hover:text-blue-700 transition-colors"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={() => handleDeleteNotice(notice._id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            // Accounting View
            <div className="p-6">
              <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <Receipt className="w-5 h-5 mr-2" /> Generate Maintenance Bills
                </h3>
                <form onSubmit={handleGenerateBills} className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700">Amount (₹)</label>
                      <Input type="number" name="amount" placeholder="e.g. 2000" required className="w-32 bg-white" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700">Billing Month</label>
                      <Input name="billingMonth" placeholder="e.g. August 2026" required className="w-48 bg-white" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700">Due Date</label>
                      <Input type="date" name="dueDate" required className="w-40 bg-white" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 w-full max-w-xl">
                    <label className="text-sm font-medium text-gray-700">Select Specific Flats (Leave empty to generate for ALL flats)</label>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-white flex flex-col gap-1 shadow-inner">
                      {flats.map(flat => (
                        <label key={flat._id} className="flex items-center space-x-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedFlats.includes(flat._id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedFlats([...selectedFlats, flat._id]);
                              else setSelectedFlats(selectedFlats.filter(id => id !== flat._id));
                            }}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" 
                          />
                          <span className="font-semibold text-gray-800 w-24">{flat.blockName}-{flat.flatNumber}</span>
                          <span className="text-gray-400 text-xs ml-auto truncate">{flat.ownerEmail || flat.tenantEmail || "No Email Registered"}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" isLoading={isGeneratingBills} className="rounded-xl px-8 font-bold bg-blue-600 text-white hover:bg-blue-700 h-12 w-fit">
                    {selectedFlats.length > 0 ? `Generate for ${selectedFlats.length} Selected Flats` : "Generate for All Flats"}
                  </Button>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Ledger</h3>
                {invoices.length === 0 ? (
                  <p className="text-gray-500 text-sm">No invoices have been generated yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f5f5f7] text-gray-500 text-xs uppercase tracking-wide">
                          <th className="py-3 px-4 font-semibold rounded-tl-lg">Flat</th>
                          <th className="py-3 px-4 font-semibold">Month</th>
                          <th className="py-3 px-4 font-semibold">Amount</th>
                          <th className="py-3 px-4 font-semibold">Due Date</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                          <th className="py-3 px-4 font-semibold rounded-tr-lg text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {invoices.map((inv) => (
                          <tr key={inv._id} className="group hover:bg-gray-50 transition-colors">
                            {editingInvoiceId === inv._id ? (
                              <>
                                <td className="py-3 px-4 font-semibold text-gray-900">{inv.flatId?.blockName}-{inv.flatId?.flatNumber}</td>
                                <td className="py-3 px-4 text-gray-600">{inv.billingMonth}</td>
                                <td className="py-3 px-4 font-semibold text-gray-900"><Input type="number" value={editInvoiceData.amount || ""} onChange={e => setEditInvoiceData({...editInvoiceData, amount: e.target.value})} className="h-8 w-24" /></td>
                                <td className="py-3 px-4"><Input type="date" value={editInvoiceData.dueDate ? new Date(editInvoiceData.dueDate).toISOString().split('T')[0] : ""} onChange={e => setEditInvoiceData({...editInvoiceData, dueDate: e.target.value})} className="h-8 w-36" /></td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex px-2 py-1 text-xs font-bold rounded-md bg-red-100 text-red-700">{inv.status}</span>
                                </td>
                                <td className="py-3 px-4 text-right space-x-2">
                                  <button onClick={() => handleSaveInvoice(inv._id)} className="text-green-600 hover:text-green-800 p-1"><Check className="w-5 h-5"/></button>
                                  <button onClick={() => setEditingInvoiceId(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5"/></button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 px-4 font-semibold text-gray-900">
                                  {inv.flatId?.blockName}-{inv.flatId?.flatNumber}
                                </td>
                                <td className="py-3 px-4 text-gray-600">{inv.billingMonth}</td>
                                <td className="py-3 px-4 font-semibold text-gray-900">₹{inv.amount}</td>
                                <td className="py-3 px-4 text-gray-500 text-sm">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-md ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex justify-end space-x-2">
                                    {inv.status === 'UNPAID' && (
                                      <button onClick={() => handleEditInvoice(inv)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Edit Invoice"><Edit2 className="w-4 h-4"/></button>
                                    )}
                                    <button onClick={() => handleDeleteInvoice(inv._id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete Invoice"><Trash2 className="w-4 h-4"/></button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === "approvals" && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <UserCheck className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Member Approvals</h2>
              </div>
              <div className="space-y-4">
                {members.filter(m => m.status === 'PENDING').length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending member approvals.</p>
                ) : (
                  members.filter(m => m.status === 'PENDING').map(member => (
                    <div key={member._id} className="p-4 border rounded-xl flex justify-between items-center bg-gray-50">
                      <div>
                        <p className="font-bold">{member.fullName}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-sm mt-1">Requested Role: <span className="font-semibold">{member.role}</span></p>
                      </div>
                      <div className="space-x-2">
                        <Button onClick={() => handleApproveMember(member._id, 'ACTIVE')} className="bg-green-600 hover:bg-green-700 text-white rounded-full">Approve</Button>
                        <Button onClick={() => handleApproveMember(member._id, 'REJECTED')} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 rounded-full">Reject</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Staff Management</h2>
              </div>
              <p className="text-gray-500 mb-6">Manage roles for existing members (e.g. promoting a user to EMPLOYEE or ASSOCIATION_ADMIN).</p>
              <div className="space-y-4">
                {members.map(member => (
                  <div key={member._id} className="p-4 border rounded-xl flex flex-wrap gap-4 justify-between items-center bg-white shadow-sm">
                    <div>
                      <p className="font-bold">{member.fullName} <span className={`text-xs px-2 py-0.5 rounded-md ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{member.status}</span></p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select 
                        value={member.role} 
                        onChange={(e) => handleChangeRole(member._id, e.target.value)}
                        className="border rounded-md px-3 py-1.5 text-sm"
                      >
                        <option value="RESIDENT">Resident</option>
                        <option value="EMPLOYEE">Employee (Gatekeeper)</option>
                        <option value="ASSOCIATION_ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "visitors" && (
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Visitor Logs & Gate Entry</h2>
                </div>
              </div>

              <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h3 className="text-lg font-bold text-indigo-900 mb-4">Log New Visitor</h3>
                <form onSubmit={handleLogVisitor} className="flex flex-wrap items-end gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">Visitor Name</label>
                    <Input name="visitorName" placeholder="e.g. Amazon Delivery" required className="bg-white w-56" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">Purpose</label>
                    <Input name="purpose" placeholder="e.g. Delivery" required className="bg-white w-48" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">Destination Flat</label>
                    <select name="flatId" required className="h-10 px-3 border border-gray-200 rounded-md bg-white w-48 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Flat...</option>
                      {flats.map(flat => (
                        <option key={flat._id} value={flat._id}>{flat.blockName}-{flat.flatNumber}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" isLoading={isLoggingVisitor} className="rounded-xl px-8 font-bold bg-indigo-600 text-white hover:bg-indigo-700 h-10 ml-auto">
                    Log Visitor & Ask Resident
                  </Button>
                </form>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                      <th className="py-3 px-4 font-semibold">Visitor Name</th>
                      <th className="py-3 px-4 font-semibold">Purpose</th>
                      <th className="py-3 px-4 font-semibold">Flat</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Entry / Exit</th>
                      <th className="py-3 px-4 font-semibold text-right">Gate Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visitorLogs.map(visitor => (
                      <tr key={visitor._id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-semibold text-gray-900">{visitor.visitorName}</td>
                        <td className="py-3 px-4 text-gray-600">{visitor.purpose}</td>
                        <td className="py-3 px-4 text-gray-600">{visitor.flatId?.blockName}-{visitor.flatId?.flatNumber}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-md ${
                            visitor.status === 'ENTERED' ? 'bg-green-100 text-green-700' :
                            visitor.status === 'EXITED' ? 'bg-gray-100 text-gray-600' :
                            visitor.status === 'DENIED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {visitor.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                          {visitor.entryTime ? new Date(visitor.entryTime).toLocaleString() : '-'} <br/>
                          {visitor.exitTime ? new Date(visitor.exitTime).toLocaleString() : ''}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            {visitor.status === 'APPROVED' && (
                              <Button size="sm" onClick={() => handleVisitorStatusChange(visitor._id, 'ENTERED')} className="bg-green-600 hover:bg-green-700 text-white text-xs h-8">
                                Mark Entered
                              </Button>
                            )}
                            {visitor.status === 'ENTERED' && (
                              <Button size="sm" onClick={() => handleVisitorStatusChange(visitor._id, 'EXITED')} variant="outline" className="text-gray-600 text-xs h-8">
                                Mark Exited
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
