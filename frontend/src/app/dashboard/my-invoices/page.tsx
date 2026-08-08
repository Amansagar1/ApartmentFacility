"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { invoicesApi } from "@/api/invoices.api";
import { Button } from "@/components/ui/Button";
import { Receipt, CheckCircle, Clock, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRazorpay } from "react-razorpay";

export default function MyInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { Razorpay } = useRazorpay();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await invoicesApi.getMyInvoices();
      setInvoices(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (invoiceId: string) => {
    try {
      setProcessingId(invoiceId);
      
      // 1. Create order on the backend
      const orderRes = await invoicesApi.createOrder(invoiceId);
      const { order, key_id } = orderRes;

      // 2. Initialize Razorpay Checkout
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "LiveMitra",
        description: "Maintenance Bill Payment",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 3. Verify payment on backend
            await invoicesApi.verifyPayment(invoiceId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert("Payment successful!");
            fetchInvoices();
          } catch (verifyErr) {
            console.error(verifyErr);
            alert("Payment verification failed.");
          }
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + response.error.description);
      });
      
      rzp.open();

    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-end pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 flex items-center">
              <Receipt className="w-8 h-8 mr-3 text-blue-600" />
              My Invoices
            </h1>
            <p className="text-gray-500 font-medium mt-2">Manage and pay your society maintenance bills securely.</p>
          </div>
          <div className="flex items-center text-sm text-green-700 bg-green-50 px-4 py-2 rounded-full font-medium">
            <ShieldCheck className="w-4 h-4 mr-2" />
            100% Secure Payments
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Invoices Yet</h3>
              <p className="text-gray-500">You are all caught up! There are no pending bills for your flat.</p>
            </div>
          ) : (
            invoices.map((inv) => (
              <div key={inv._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-bold text-gray-500 tracking-wider uppercase">
                      {inv.billingMonth}
                    </span>
                    {inv.status === "PAID" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    ₹{inv.amount.toLocaleString("en-IN")}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Due by {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Flat {inv.flatId?.blockName}-{inv.flatId?.flatNumber}
                  </p>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-3">
                  {inv.status === "UNPAID" && (
                    <Button 
                      onClick={() => handlePay(inv._id)}
                      isLoading={processingId === inv._id}
                      className="w-full md:w-40 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-12"
                    >
                      Pay Now
                    </Button>
                  )}
                  {inv.status === "PAID" && (
                    <Button variant="outline" className="w-full md:w-40 rounded-xl font-medium h-12 text-gray-600 border-gray-200 pointer-events-none">
                      Receipt
                    </Button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
