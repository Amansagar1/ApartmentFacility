"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, MapPin, Map, Hash, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { associationsApi } from "@/api/associations.api";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

const createAssociationSchema = z.object({
  name: z.string().min(3, "Association name must be at least 3 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Pincode is required"),
  totalUnits: z.coerce.number().int().positive("Must be a positive number"),
});

type CreateAssociationFormValues = z.infer<typeof createAssociationSchema>;

export default function CreateAssociationPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAssociationFormValues>({
    resolver: zodResolver(createAssociationSchema),
  });

  const onSubmit = async (data: CreateAssociationFormValues) => {
    try {
      setServerError("");
      // 1. Create the association on the backend
      await associationsApi.create(data);

      // 2. Fetch the newly updated user profile (which now has the new membership)
      const freshUser = await authApi.getMe();
      setUser(freshUser.data);

      // 3. Go back to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || "Failed to create association. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-6 px-4 sm:px-6 lg:px-6 flex justify-center">

      <div className="w-full max-w-6xl relative z-10">

        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white/70 backdrop-blur-3xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">

          <div className="p-10 pb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-3">Create Association</h1>
            <p className="text-gray-500 font-medium">Set up your apartment complex to begin management.</p>
          </div>

          <div className="px-10 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {serverError && (
                <div className="p-4 text-sm text-red-600 bg-red-50/80 border border-red-100 rounded-xl flex items-center">
                  <span className="font-medium">{serverError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative md:col-span-2">
                  <Building2 className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                  <Input
                    label="Association Name"
                    placeholder="e.g. Sunset Apartments"
                    className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900"
                    {...register("name")}
                    error={errors.name?.message}
                  />
                </div>

                <div className="relative md:col-span-2">
                  <MapPin className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                  <Input
                    label="Full Address"
                    placeholder="123 Main St, Sector 4"
                    className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900"
                    {...register("address")}
                    error={errors.address?.message}
                  />
                </div>

                <div className="relative">
                  <Map className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                  <Input
                    label="City"
                    placeholder="Mumbai"
                    className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900"
                    {...register("city")}
                    error={errors.city?.message}
                  />
                </div>

                <div className="relative">
                  <Map className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                  <Input
                    label="State"
                    placeholder="Maharashtra"
                    className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900"
                    {...register("state")}
                    error={errors.state?.message}
                  />
                </div>

                <div className="relative">
                  <Hash className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                  <Input
                    label="Pincode"
                    placeholder="400001"
                    className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900"
                    {...register("pincode")}
                    error={errors.pincode?.message}
                  />
                </div>

                <div className="relative">
                  <Building2 className="absolute left-4 top-[38px] h-5 w-5 text-gray-400" />
                  <Input
                    label="Total Units/Flats"
                    type="number"
                    placeholder="100"
                    className="pl-12 h-14 bg-[#f5f5f7] border-transparent focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-base rounded-2xl font-medium text-gray-900"
                    {...register("totalUnits")}
                    error={errors.totalUnits?.message}
                  />
                </div>
              </div>

              <div className="pt-6 mt-4 flex justify-center">
                <Button type="submit" className="h-14 px-12 text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] transition-all w-full md:w-auto" isLoading={isSubmitting}>
                  Create Association
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
