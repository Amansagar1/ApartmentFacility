"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Edit3, Type, Tag } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { complaintsApi } from "@/api/complaints.api";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

const newComplaintSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["Plumbing", "Electrical", "Cleanliness", "Security", "Other"]),
});

type NewComplaintFormValues = z.infer<typeof newComplaintSchema>;

export default function NewComplaintPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [serverError, setServerError] = useState("");

  const associationId = user?.memberships?.[0]?.associationId?._id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewComplaintFormValues>({
    resolver: zodResolver(newComplaintSchema),
    defaultValues: { category: "Other" }
  });

  const onSubmit = async (data: NewComplaintFormValues) => {
    if (!associationId) {
      setServerError("You are not part of any association.");
      return;
    }
    try {
      setServerError("");
      await complaintsApi.raiseComplaint({
        ...data,
        associationId,
      });
      router.push("/dashboard");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Failed to submit ticket.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-12 px-4 sm:px-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl relative z-10">
        
        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white/70 backdrop-blur-3xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
          
          <div className="p-10 pb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-3">Raise a Ticket</h1>
            <p className="text-gray-500 font-medium">Describe your issue and we will alert the management immediately.</p>
          </div>

          <div className="px-10 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {serverError && (
                <div className="p-4 text-sm text-red-600 bg-red-50/80 border border-red-100 rounded-2xl flex items-center">
                  <span className="font-medium">{serverError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Category</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-[17px] h-5 w-5 text-gray-400" />
                  <select 
                    className="w-full h-14 pl-12 pr-4 bg-[#f5f5f7] border-transparent rounded-2xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    {...register("category")}
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Type className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                <Input
                  label="Title"
                  placeholder="e.g. Broken elevator on 4th floor"
                  className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-base rounded-2xl font-medium text-gray-900"
                  {...register("title")}
                  error={errors.title?.message}
                />
              </div>

              <div className="relative">
                <Edit3 className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Provide more details about the issue..."
                  className={`w-full pl-12 pr-4 py-4 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900 resize-none h-32 outline-none ${
                    errors.description ? "border-red-500 ring-red-100" : ""
                  }`}
                  {...register("description")}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1 font-medium">{errors.description.message}</p>}
              </div>

              <div className="pt-6 mt-4">
                <Button type="submit" className="w-full h-14 text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] transition-all" isLoading={isSubmitting}>
                  Submit Ticket
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
