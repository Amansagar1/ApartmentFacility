"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, User, Phone, Briefcase } from "lucide-react";

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
      router.push("/gatekeeper"); // Go back to dashboard on success
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Failed to log visitor.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center sticky top-0 bg-white/80 backdrop-blur-lg z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2 text-gray-900">New Visitor</h1>
      </div>

      <div className="p-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {serverError && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl font-medium">
              {serverError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Select Flat</label>
            <select 
              className="w-full h-14 px-4 bg-[#f5f5f7] border-transparent rounded-2xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              {...register("flatId")}
            >
              <option value="">Select a flat...</option>
              {flats.map(flat => (
                <option key={flat._id} value={flat._id}>
                  {flat.blockName} - {flat.flatNumber}
                </option>
              ))}
            </select>
            {errors.flatId && <p className="text-sm text-red-500 font-medium">{errors.flatId.message}</p>}
          </div>

          <div className="relative">
            <User className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
            <Input
              label="Visitor Name"
              placeholder="e.g. Rahul Kumar"
              className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-base rounded-2xl font-medium text-gray-900"
              {...register("visitorName")}
              error={errors.visitorName?.message}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
            <Input
              label="Phone Number"
              placeholder="e.g. 9876543210"
              type="tel"
              className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-base rounded-2xl font-medium text-gray-900"
              {...register("visitorPhone")}
              error={errors.visitorPhone?.message}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Purpose</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-[17px] h-5 w-5 text-gray-400" />
              <select 
                className="w-full h-14 pl-12 pr-4 bg-[#f5f5f7] border-transparent rounded-2xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                {...register("purpose")}
              >
                <option value="Delivery">Delivery (Amazon, Zomato, etc)</option>
                <option value="Guest">Guest / Relative</option>
                <option value="Service">Service (Plumber, Electrician)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-6">
            <Button type="submit" className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-600/20" isLoading={isSubmitting}>
              Send Approval Request
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
