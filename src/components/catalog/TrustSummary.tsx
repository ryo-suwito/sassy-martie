import React from 'react';
import { AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { QAStatus } from '@/types/read-models';

interface TrustSummaryProps {
  status: QAStatus;
  deadline: string | null;
}

export default function TrustSummary({ status, deadline }: TrustSummaryProps) {
  const getDisplay = () => {
    switch (status) {
      case 'passing':
        return (
          <div className="flex items-center gap-2 text-green-600 font-ui text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" />
            Verified & Healthy
          </div>
        );
      case 'grace_period':
        return (
          <div className="bg-brand-peach/20 border border-brand-red/20 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 text-brand-red font-ui text-sm font-bold">
              <AlertCircle className="w-5 h-5" />
              GRACE PERIOD ACTIVE
            </div>
            <p className="text-xs text-brand-charcoal/80 leading-relaxed font-ui">
              This tool has failed a health check. The builder has been notified and has until the deadline below to resolve the issue before badges are revoked.
            </p>
            {deadline && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-brand-grey font-ui uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Expires: {new Date(deadline).toLocaleString()}
              </div>
            )}
          </div>
        );
      case 'failing':
        return (
          <div className="flex items-center gap-2 text-brand-red font-ui text-sm font-bold">
            <XCircle className="w-4 h-4" />
            Health Check Failed
          </div>
        );
      case 'revoked':
        return (
          <div className="flex items-center gap-2 text-brand-grey font-ui text-sm font-bold">
            <XCircle className="w-4 h-4" />
            Trust Revoked by Admin
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-brand-grey font-ui text-sm font-bold italic">
            <Clock className="w-4 h-4" />
            Verification Pending
          </div>
        );
    }
  };

  return <div className="my-4">{getDisplay()}</div>;
}
