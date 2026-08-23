import React, { useState, useEffect } from 'react';
import { AWASLogo } from './AWASLogo';
import { Search, FileText, Eye } from 'lucide-react';
import { dbService } from '../lib/db';

export const StatusTracker = ({ currentUser, onViewApplication }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [currentUser]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await dbService.getApplications();
      if (data) {
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter(app => 
    !searchTerm.trim() ||
    app.form_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicant_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.aadhaar_number?.includes(searchTerm)
  );

  const getStatusPill = (status) => {
    switch (status) {
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs px-2-5 py-0-5 rounded-full font-bold">APPROVED</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 border border-red-300 text-xs px-2-5 py-0-5 rounded-full font-bold">REJECTED</span>;
      case 'under_review':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs px-2-5 py-0-5 rounded-full font-bold">UNDER REVIEW</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-xs px-2-5 py-0-5 rounded-full font-bold">PENDING</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-brand-navy text-white p-6 text-center flex flex-col items-center">
          <AWASLogo size="medium" className="mb-2" />
          <h2 className="text-lg font-extrabold uppercase tracking-wide">Track Application Status</h2>
          <p className="text-xs text-blue-200 mt-1">Check progress of your AWAS Yojana Beneficiary Application</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3-5 top-1-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Form No (e.g. AWI-2026-877526), Name, or Aadhaar..."
              className="awas-input pl-10 py-2-5 text-sm"
            />
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-500 font-semibold">
              Loading applications...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg text-slate-500">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700">No Applications Found</p>
              <p className="text-xs text-slate-500 mt-1">You haven't submitted any beneficiary forms yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(app => (
                <div key={app.id || app.form_no} className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-lg p-4 transition-all flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-blue-900 text-sm">{app.form_no}</span>
                      {getStatusPill(app.status)}
                    </div>
                    <div className="text-xs font-bold text-slate-800">{app.applicant_full_name}</div>
                    <div className="text-xs text-slate-500">
                      Submitted on: {app.application_date || 'Recent'} | Aadhaar: {app.aadhaar_number}
                    </div>
                  </div>

                  <button
                    onClick={() => onViewApplication(app)}
                    className="btn-outline text-xs px-3-5 py-1-5 flex items-center gap-1-5"
                  >
                    <Eye className="w-3-5 h-3-5" />
                    <span>View Receipt</span>
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
