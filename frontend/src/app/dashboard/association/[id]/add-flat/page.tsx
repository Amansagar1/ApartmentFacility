"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, Mail, ArrowLeft, Hash } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { flatsApi } from "@/api/flats.api";
import Link from "next/link";

const addFlatSchema = z.object({
  blockName: z.string().min(1, "Block name is required"),
  flatNumber: z.string().min(1, "Flat number is required"),
  ownerEmail: z.union([z.string().email("Invalid email format"), z.literal("")]).optional(),
  tenantEmail: z.union([z.string().email("Invalid email format"), z.literal("")]).optional(),
});

type AddFlatFormValues = z.infer<typeof addFlatSchema>;

export default function AddFlatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: associationId } = use(params);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddFlatFormValues>({
    resolver: zodResolver(addFlatSchema),
    defaultValues: {
      ownerEmail: "",
      tenantEmail: "",
    }
  });

  const onSubmit = async (data: AddFlatFormValues) => {
    try {
      setServerError("");
      await flatsApi.create({
        ...data,
        associationId,
      });
      // Redirect back to the directory upon success
      router.push(`/dashboard/association/${associationId}`);
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || "Failed to add flat. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-12 px-4 sm:px-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl relative z-10">
        
        <Link href={`/dashboard/association/${associationId}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Link>

        <div className="bg-white/70 backdrop-blur-3xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
          
          <div className="p-10 pb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-3">Add New Flat</h1>
            <p className="text-gray-500 font-medium">Enter the details of the apartment unit to add it to the directory.</p>
          </div>

          <div className="px-10 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {serverError && (
                <div className="p-4 text-sm text-red-600 bg-red-50/80 border border-red-100 rounded-2xl flex items-center">
                  <span className="font-medium">{serverError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Building2 className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                  <Input
                    label="Block / Tower Name"
                    placeholder="e.g. A, Block B, Tower 1"
                    className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900"
                    {...register("blockName")}
                    error={errors.blockName?.message}
                  />
                </div>

                <div className="relative">
                  <Hash className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                  <Input
                    label="Flat Number"
                    placeholder="e.g. 101"
                    className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900"
                    {...register("flatNumber")}
                    error={errors.flatNumber?.message}
                  />
                </div>

                <div className="relative md:col-span-2">
                  <Mail className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                  <Input
                    label="Owner's Email (Optional)"
                    placeholder="owner@aman.com"
                    type="email"
                    className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900"
                    {...register("ownerEmail")}
                    error={errors.ownerEmail?.message}
                  />
                </div>

                <div className="relative md:col-span-2">
                  <Mail className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                  <Input
                    label="Tenant's Email (Optional)"
                    placeholder="tenant@aman.com"
                    type="email"
                    className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900"
                    {...register("tenantEmail")}
                    error={errors.tenantEmail?.message}
                  />
                </div>
              </div>

              <div className="pt-6 mt-4 flex justify-center">
                <Button type="submit" className="h-14 px-12 text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] transition-all w-full md:w-auto" isLoading={isSubmitting}>
                  Add Flat
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
