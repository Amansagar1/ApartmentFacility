"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, User, Phone, Briefcase, Building2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { visitorsApi } from "@/api/visitors.api";
import { flatsApi } from "@/api/flats.api";
import { useAuthStore } from "@/store/useAuthStore";

const newVisitorSchema = z.object({
  flatId: z.string().min(1, "Please select a flat"),
  visitorName: z.string().min(2, "Name is required"),
  visitorPhone: z.string().min(10, "Phone number required"),
  purpose: z.enum(["Delivery", "Guest", "Service", "Other"]),
});

type NewVisitorFormValues = z.infer<typeof newVisitorSchema>;

export default function NewVisitorPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const associationId = user?.memberships?.[0]?.associationId?._id;

  const [flats, setFlats] = useState<any[]>([]);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewVisitorFormValues>({
    resolver: zodResolver(newVisitorSchema),
    defaultValues: { purpose: "Delivery" }
  });

  useEffect(() => {
    if (associationId) {
      flatsApi.getByAssociationId(associationId).then(res => setFlats(res.data));
    }
  }, [associationId]);

  const onSubmit = async (data: NewVisitorFormValues) => {
    try {
      setServerError("");
      await visitorsApi.logVisitor({
        ...data,
        associationId,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/gatekeeper");
      }, 1500);
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Failed to log visitor.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
        <p className="text-gray-500 text-center max-w-xs font-medium">
          The resident has been notified. Redirecting back to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20 relative overflow-hidden">
      
      {/* Decorative Background Mesh */}
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-indigo-400/10 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-400/10 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="p-4 flex items-center sticky top-0 z-50">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-white hover:scale-105 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 max-w-md mx-auto relative z-10">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Visitor Entry</h1>
          <p className="text-gray-500 font-medium text-sm">Please fill the details below to notify the resident.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {serverError && (
              <div className="p-4 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl font-medium">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Destination Flat</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-[14px] h-5 w-5 text-gray-400" />
                <select 
                  className="w-full h-12 pl-12 pr-4 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none"
                  {...register("flatId")}
                >
                  <option value="">Select flat number...</option>
                  {flats.map(flat => (
                    <option key={flat._id} value={flat._id}>
                      Block {flat.blockName} - Flat {flat.flatNumber}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-[14px] pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              {errors.flatId && <p className="text-xs text-red-500 font-bold ml-1">{errors.flatId.message}</p>}
            </div>

            <div className="relative">
              <User className="absolute left-4 top-[36px] h-5 w-5 text-gray-400" />
              <Input
                label="Full Name"
                placeholder="e.g. Amazon Delivery"
                className="pl-12 h-12 bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm rounded-xl font-medium text-gray-900"
                {...register("visitorName")}
                error={errors.visitorName?.message}
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-[36px] h-5 w-5 text-gray-400" />
              <Input
                label="Phone Number"
                placeholder="e.g. 9876543210"
                type="tel"
                className="pl-12 h-12 bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm rounded-xl font-medium text-gray-900"
                {...register("visitorPhone")}
                error={errors.visitorPhone?.message}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Purpose of Visit</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-[14px] h-5 w-5 text-gray-400" />
                <select 
                  className="w-full h-12 pl-12 pr-4 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none"
                  {...register("purpose")}
                >
                  <option value="Delivery">📦 Delivery (Amazon, Zomato, etc)</option>
                  <option value="Guest">👨‍👩‍👧‍👦 Guest / Relative</option>
                  <option value="Service">🔧 Service (Plumber, Electrician)</option>
                  <option value="Other">📝 Other</option>
                </select>
                <div className="absolute right-4 top-[14px] pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full h-14 text-base font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl shadow-xl shadow-gray-900/10 transition-transform active:scale-[0.98] hover:-translate-y-0.5" isLoading={isSubmitting}>
                Notify Resident
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
