import React from 'react';
import { AWASLogo } from './AWASLogo';
import { CheckCircle2, Printer, ArrowLeft } from 'lucide-react';

export const ApplicationSuccess = ({ application, onBackToForm }) => {
  if (!application) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3 py-1 rounded-full">APPROVED</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 border border-red-300 font-bold text-xs px-3 py-1 rounded-full">REJECTED</span>;
      case 'under_review':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs px-3 py-1 rounded-full">UNDER REVIEW</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs px-3 py-1 rounded-full">PENDING SUBMISSION</span>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Banner */}
        <div className="bg-brand-navy text-white p-6 text-center flex flex-col items-center">
          <AWASLogo size="medium" className="mb-2" />
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold tracking-wide">Application Submitted Successfully!</h2>
          <p className="text-xs text-blue-200 mt-1">AWAS Yojana — Beneficiary Registration Scheme</p>
        </div>

        {/* Application Reference Info */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase block">Form Application Reference</span>
              <strong className="text-xl text-blue-900 font-mono font-extrabold">{application.form_no}</strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold uppercase block mb-1">Status</span>
              {getStatusBadge(application.status)}
            </div>
          </div>

          {/* Details Table Summary */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              Beneficiary Application Summary
            </h3>

            <div className="grid grid-cols-1 sm-grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block uppercase text-xs">Applicant Name</span>
                <span className="font-bold text-slate-900 text-sm">{application.applicant_full_name}</span>
                {application.regional_language_name && (
                  <span className="text-slate-600 block text-xs">({application.regional_language_name})</span>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block uppercase text-xs">Father / Husband Name</span>
                <span className="font-bold text-slate-900 text-sm">{application.father_husband_name}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block uppercase text-xs">Mobile & Aadhaar</span>
                <span className="font-semibold text-slate-800 block">📞 {application.mobile_number}</span>
                <span className="font-mono text-slate-600 block">🆔 Aadhaar: {application.aadhaar_number}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block uppercase text-xs">Address & State</span>
                <span className="font-semibold text-slate-800 block">
                  {application.present_address?.villageTown}, {application.present_address?.district}
                </span>
                <span className="text-slate-600 block">{application.present_address?.state} - {application.present_address?.pinCode}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block uppercase text-xs">Bank Account Details</span>
                <span className="font-bold text-slate-900 block">{application.bank_name}</span>
                <span className="font-mono text-slate-600 block">A/C: {application.bank_account_number} (IFSC: {application.ifsc_code})</span>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block uppercase text-xs">Date & Place of Signing</span>
                <span className="font-semibold text-slate-800 block">📍 {application.signing_place}</span>
                <span className="text-slate-600 block">📅 Date: {application.signing_date}</span>
              </div>
            </div>

            {/* Application Instructions */}
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-4 leading-relaxed">
              <strong className="block font-bold text-amber-900 mb-1">📌 Important Note for Beneficiary:</strong>
              Please keep your Form Number <strong>{application.form_no}</strong> safe for future reference. You can print a copy of your submitted form or track your application status anytime using your registered login credentials.
            </div>

          </div>

          {/* Action Buttons */}
          <div className="no-print pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onBackToForm}
              className="btn-outline text-xs px-4 py-2-5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Fill Another Form</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-primary text-xs px-6 py-2-5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Application Receipt</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
