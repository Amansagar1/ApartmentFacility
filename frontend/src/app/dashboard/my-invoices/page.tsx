"use client";

import { useEffect, useState } from "react";
import { invoicesApi } from "@/api/invoices.api";
import { Button } from "@/components/ui/Button";
import { Receipt, CheckCircle, Clock, ArrowLeft, Loader2, Download, Printer, X, CreditCard, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRazorpay } from "react-razorpay";

export default function MyInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
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

      const orderRes = await invoicesApi.createOrder(invoiceId);
      const { order, key_id } = orderRes;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "LiveMitra",
        description: "Maintenance Bill Payment",
        order_id: order.id,
        handler: async (response: any) => {
          try {
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
          color: "#0f172a",
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
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-8 font-sans text-slate-900">
      <div className="max-w-8xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Billing & Invoices</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your flat's maintenance bills and payment history.</p>
            </div>
            <div className="inline-flex items-center text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Secure payments powered by Razorpay
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              <p className="text-sm text-slate-500 font-medium">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                <Receipt className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No invoices found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">You are all caught up. There are no pending or past bills for your flat.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-6 py-4">Invoice Details</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 text-sm">Maintenance - {inv.billingMonth}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Flat {inv.flatId?.blockName}-{inv.flatId?.flatNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">₹{inv.amount.toLocaleString("en-IN")}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Due {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        {inv.status === "PAID" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                            <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {inv.status === "UNPAID" && (
                          <Button
                            onClick={() => handlePay(inv._id)}
                            isLoading={processingId === inv._id}
                            size="sm"
                            className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-medium h-8 px-4 text-xs rounded-md"
                          >
                            Pay Now
                          </Button>
                        )}
                        {inv.status === "PAID" && (
                          <Button
                            onClick={() => setSelectedReceipt(inv)}
                            variant="outline"
                            size="sm"
                            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm font-medium h-8 px-3 text-xs rounded-md"
                          >
                            View Receipt
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal (SaaS Style) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedReceipt(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">

            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Payment Receipt</h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">₹{selectedReceipt.amount.toLocaleString("en-IN")}</div>
                <div className="text-sm text-slate-500 font-medium">Payment Successful</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Invoice Ref</span>
                  <span className="font-mono text-slate-900 text-xs">{selectedReceipt._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Billed To</span>
                  <span className="font-medium text-slate-900">Flat {selectedReceipt.flatId?.blockName}-{selectedReceipt.flatId?.flatNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Description</span>
                  <span className="font-medium text-slate-900">{selectedReceipt.billingMonth}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 h-9 text-xs font-medium rounded-md shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 mr-2" /> Print
              </Button>
              <Button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-9 text-xs font-medium rounded-md shadow-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

