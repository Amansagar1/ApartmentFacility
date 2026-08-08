import Link from "next/link";
import { Smartphone, LogOut } from "lucide-react";

export default function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Smartphone className="w-10 h-10 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Switch to the App</h1>
        <p className="text-gray-600 mb-8">
          The web dashboard is for administrators only. As a resident or staff member, you have full access to your community through the LiveMitra mobile app.
        </p>

        <div className="space-y-4">
          <button className="w-full bg-black text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center space-x-2 hover:bg-gray-800 transition">
            <span>Download on App Store</span>
          </button>
          
          <button className="w-full bg-black text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center space-x-2 hover:bg-gray-800 transition">
            <span>Get it on Google Play</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
            <LogOut className="w-4 h-4 mr-2" />
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
