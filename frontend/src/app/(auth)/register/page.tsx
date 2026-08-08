"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/useAuthStore";

const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerError("");
      const res = await authApi.register(data);
      
      // Save user to global state
      setUser(res.user);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "An error occurred during registration");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50/50 py-10">
      
      {/* Animated Ambient Background */}
      <div className="absolute top-[10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-[80px]"></div>

      {/* Glassmorphic Centered Card */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 mx-4 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/50">
        
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-2">
             <span className="text-2xl font-bold text-white">LM</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Create Account</h2>
          <p className="text-sm text-gray-500">Join the LiveMitra network today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {serverError && (
            <div className="p-4 text-sm text-red-600 bg-red-50/80 border border-red-100 rounded-xl flex items-center">
              <span className="font-medium">{serverError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3.5 top-[38px] h-5 w-5 text-gray-400" />
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                className="pl-11 h-12 bg-gray-50/80 border-gray-200/80 focus:bg-white transition-all text-base rounded-xl"
                {...register("fullName")}
                error={errors.fullName?.message}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-[38px] h-5 w-5 text-gray-400" />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                className="pl-11 h-12 bg-gray-50/80 border-gray-200/80 focus:bg-white transition-all text-base rounded-xl"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-[38px] h-5 w-5 text-gray-400" />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                className="pl-11 h-12 bg-gray-50/80 border-gray-200/80 focus:bg-white transition-all text-base rounded-xl"
                {...register("password")}
                error={errors.password?.message}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold shadow-md shadow-blue-500/20 mt-8 rounded-xl" isLoading={isSubmitting}>
            Register
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
