import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, LogOut, CheckCircle, Clock, XCircle, MoreVertical, Database } from 'lucide-react';

interface Submission {
  id: number;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  status: string;
  created_at: string;
}

interface ApiLog {
  id: number;
  provider: string;
  status: string;
  message: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [activeTab, setActiveTab] = useState<'submissions' | 'api'>('submissions');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/submissions');
      if (res.status === 401) {
        navigate('/admin');
        return;
      }
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/sync-logs');
      if (res.status === 401) {
        navigate('/admin');
        return;
      }
      const data = await res.json();
      setApiLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'api') {
      fetchApiLogs();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    navigate('/admin');
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/submissions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchSubmissions();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-primary-500/10 text-gold-primary text-xs font-medium"><CheckCircle className="w-3 h-3" /> Completed</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-text">AVC Admin Panel</h1>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-text-muted hover:text-text transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-white/5">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'submissions' ? 'border-gold-primary text-gold-primary' : 'border-transparent text-text-muted hover:text-text'}`}
          >
            Consultation Requests
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 flex items-center ${activeTab === 'api' ? 'border-gold-primary text-gold-primary' : 'border-transparent text-text-muted hover:text-text'}`}
          >
            <Database className="w-4 h-4 mr-2" />
            API Status
          </button>
        </div>

        {activeTab === 'submissions' && (
          <>
            {/* Stats / Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-text">Consultation Requests</h2>
                <p className="text-text-muted text-sm mt-1">Manage and track your leads</p>
              </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 bg-surface border border-white/5 rounded-lg text-text text-sm focus:outline-none focus:border-gold-primary"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface border border-white/5 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-background/50 text-text-muted border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Interest</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">Loading requests...</td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">No consultation requests found.</td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-text">{sub.name}</div>
                        {sub.message && <div className="text-xs text-text-muted mt-1 truncate max-w-[200px]" title={sub.message}>{sub.message}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-text">{sub.email}</div>
                        <div className="text-text-muted text-xs mt-1">{sub.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-gold-primary/10 text-gold-primary text-xs font-medium">
                          {sub.interest || 'Consultation'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-muted">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select 
                          value={sub.status}
                          onChange={(e) => updateStatus(sub.id, e.target.value)}
                          className="text-xs bg-background border border-white/5 rounded px-2 py-1 focus:outline-none text-text ml-auto"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        {activeTab === 'api' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-text">API Sync Logs</h2>
                <p className="text-text-muted text-sm mt-1">Monitor external API connections and cache updates</p>
              </div>
              <button 
                onClick={fetchApiLogs}
                className="px-4 py-2 bg-surface border border-white/5 rounded-lg text-sm font-medium hover:bg-surface-elevated transition-colors"
              >
                Refresh Logs
              </button>
            </div>

            <div className="bg-surface border border-white/5 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-background/50 text-text-muted border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 font-medium">Provider</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Message</th>
                      <th className="px-6 py-4 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-text">
                    {loadingLogs ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-text-muted">Loading logs...</td>
                      </tr>
                    ) : apiLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-text-muted">No API logs found.</td>
                      </tr>
                    ) : (
                      apiLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-background/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-text">{log.provider}</td>
                          <td className="px-6 py-4">
                            {log.status === 'success' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gold-primary-500/10 text-gold-primary text-xs font-medium">Success</span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">Error</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-text-muted max-w-md truncate">{log.message}</td>
                          <td className="px-6 py-4 text-text-muted text-right">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
      </main>
    </div>
  );
};

export default AdminDashboard;
