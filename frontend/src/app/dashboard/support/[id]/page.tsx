"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { supportApi } from "@/api/support.api";
import { Loader2, ArrowLeft, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SupportTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const router = useRouter();

  const { user, isAuthenticated } = useAuthStore();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isAuthenticated && ticketId) {
      fetchTicket();
    }
  }, [isAuthenticated, ticketId]);

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const res = await supportApi.getTicketDetails(ticketId);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
      router.push("/dashboard/support");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setIsSending(true);
      const res = await supportApi.addMessage(ticketId, message);
      setTicket(res.data);
      setMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-8 font-sans text-slate-900">
      <div className="max-w-8xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/support" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Tickets
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{ticket.title}</h1>
                <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  #{ticket._id.substring(ticket._id.length - 6)}
                </span>
              </div>
              <p className="text-sm text-slate-600 max-w-2xl">{ticket.description}</p>
            </div>

            <div className="flex gap-2 shrink-0">
              {ticket.status === 'OPEN' && (
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                  <AlertCircle className="w-4 h-4 mr-1.5" /> Open
                </span>
              )}
              {ticket.status === 'IN_PROGRESS' && (
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Clock className="w-4 h-4 mr-1.5" /> In Progress
                </span>
              )}
              {ticket.status === 'RESOLVED' && (
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <CheckCircle className="w-4 h-4 mr-1.5" /> Resolved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {ticket.messages.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No messages yet. Send a message to start the conversation.
              </div>
            ) : (
              ticket.messages.map((msg: any) => {
                const isMe = msg.sender._id === user?._id;
                const isStaff = msg.sender.isSuperAdmin;

                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1 mx-1">
                      <span className="text-xs font-medium text-slate-700">
                        {isMe ? 'You' : msg.sender.fullName}
                      </span>
                      {isStaff && !isMe && (
                        <span className="text-[10px] uppercase tracking-wide bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                          Staff
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe
                        ? 'bg-slate-900 text-white rounded-tr-sm'
                        : isStaff
                          ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-tl-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Box */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={!message.trim() || isSending || ticket.status === 'RESOLVED'}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-5 h-auto shadow-sm"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
