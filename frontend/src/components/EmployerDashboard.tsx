import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Job, Application, AIAnalysis } from '../services/api';
import { 
  Plus, Briefcase, MapPin, Clock, 
  Users, ArrowLeft, AlertCircle, CheckCircle2, 
  Mail, RefreshCw
} from 'lucide-react';

interface EmployerDashboardProps {
  userEmail: string;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'post-job'>('jobs');
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Applicant management
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Job Form State
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [mandatorySkills, setMandatorySkills] = useState('');

  useEffect(() => {
    fetchEmployerInfoAndJobs();
  }, []);

  const fetchEmployerInfoAndJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user details to get user ID
      const user = await api.getCurrentUser();

      // Get all jobs and filter by this employer ID
      const allJobs = await api.listJobs();
      const filtered = allJobs.filter(j => j.employer_id === user.id);
      setEmployerJobs(filtered);
    } catch (err: any) {
      setError('Ku guuldareystay soo dejinta macluumaadka: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const mandatoryArray = mandatorySkills.split(',').map(s => s.trim()).filter(Boolean);

      await api.createJob({
        title,
        company_name: companyName,
        location,
        type,
        salary_range: salaryRange || undefined,
        description,
        skills: skillsArray,
        mandatory_skills: mandatoryArray
      });

      setSuccess('Shaqadaada cusub si guul leh ayaa loo daabacay!');
      // Reset form
      setTitle('');
      setCompanyName('');
      setLocation('');
      setSalaryRange('');
      setDescription('');
      setSkills('');
      setMandatorySkills('');

      // Refresh list and redirect
      await fetchEmployerInfoAndJobs();
      setActiveTab('jobs');
    } catch (err: any) {
      setError('Guuldaro markii shaqada la daabacayay: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplicants = async (job: Job) => {
    setSelectedJob(job);
    setApplicants([]);
    setSelectedApp(null);
    setSelectedAnalysis(null);
    setLoading(true);
    setError(null);
    try {
      const list = await api.listApplications(job.id);
      setApplicants(list);
    } catch (err: any) {
      setError('Ku guuldareystay keenista musharaxiintada: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApplicant = async (app: Application) => {
    setSelectedApp(app);
    setSelectedAnalysis(null);
    setLoading(true);
    try {
      const analysis = await api.getAIAnalysis(app.id);
      setSelectedAnalysis(analysis);
    } catch (err: any) {
      console.log('Falanqaynta AI lama heli karo musharaxan:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedApp || !selectedJob) return;
    setUpdatingStatus(true);
    setError(null);
    try {
      const updated = await api.updateApplicationStatus(selectedApp.id, newStatus);
      setSelectedApp(updated);
      setSuccess('Heerka codsadaha waa la cusbooneysiiyay!');
      
      // Refresh applicants list
      const list = await api.listApplications(selectedJob.id);
      setApplicants(list);
    } catch (err: any) {
      setError('Fashil markii heerka la cusbooneysiinayay: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied': return <span className="badge badge-blue">Codsadey</span>;
      case 'Shortlisted': return <span className="badge badge-blue" style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd' }}>Shortlisted</span>;
      case 'Interviewing': return <span className="badge badge-amber">Wareysi (Interview)</span>;
      case 'Offered': return <span className="badge badge-emerald">Shaqo la Siiyey</span>;
      case 'Rejected': return <span className="badge badge-rose">Loo Diiday</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'var(--accent-emerald)';
    if (score >= 50) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  return (
    <div className="dashboard-grid">
      {/* Sidebar */}
      <aside className="glass-panel" style={{
        borderRadius: '0px',
        borderRight: '1px solid var(--border-color)',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
            ShaqoDooon
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Kaalinta: Shaqo Bixiye
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
            {userEmail}
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            onClick={() => { setActiveTab('jobs'); setSelectedJob(null); setSelectedApp(null); }}
            className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', width: '100%' }}
          >
            <Briefcase size={18} />
            <span>Boosaska furan ({employerJobs.length})</span>
          </button>

          <button 
            onClick={() => { setActiveTab('post-job'); setSelectedJob(null); setSelectedApp(null); }}
            className={`btn ${activeTab === 'post-job' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', width: '100%' }}
          >
            <Plus size={18} />
            <span>Daabac Shaqo cusub</span>
          </button>
        </nav>
      </aside>

      {/* Main Area */}
      <main style={{ padding: '40px', overflowY: 'auto', position: 'relative' }}>
        <div className="gradient-blob" style={{ bottom: '20%', left: '10%' }}></div>

        {/* Status Alerts */}
        {error && (
          <div className="glass-panel animate-fade-in" style={{ padding: '16px', borderLeft: '4px solid var(--accent-rose)', background: 'var(--accent-rose-glow)', color: '#f87171', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <AlertCircle size={20} />
            <div>{error}</div>
          </div>
        )}
        {success && (
          <div className="glass-panel animate-fade-in" style={{ padding: '16px', borderLeft: '4px solid var(--accent-emerald)', background: 'var(--accent-emerald-glow)', color: '#34d399', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <CheckCircle2 size={20} />
            <div>{success}</div>
          </div>
        )}

        {/* --- VIEW: LIST MY JOBS --- */}
        {activeTab === 'jobs' && !selectedJob && (
          <section className="animate-fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' }}>Shaqooyinka aad Daabacday</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Kala soso codsiyada shaqo iyo isku-dheelitirka musharixiinta ee AI-gu falanqeeyey.</p>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {[1, 2].map(i => (
                  <div key={i} className="glass-panel skeleton" style={{ height: '200px' }}></div>
                ))}
              </div>
            ) : employerJobs.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>Wali wax shaqo ah ma daabicin</h3>
                <p style={{ marginBottom: '20px' }}>Ku bilow adoo raacaya tabka 'Daabac Shaqo cusub' si shaqadaadu u muuqato.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('post-job')}>Daabac Shaqo</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {employerJobs.map(job => (
                  <div 
                    key={job.id} 
                    className="glass-panel glass-panel-hover" 
                    style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '220px' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span className="badge badge-blue">{job.type}</span>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <MapPin size={12} />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleViewApplicants(job)}
                      className="btn btn-secondary" 
                      style={{ width: '100%', fontSize: '0.8rem', padding: '8px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}
                    >
                      <Users size={14} />
                      Codsiyada (View Applicants)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* --- VIEW: APPLICANTS LIST FOR SELECTED JOB --- */}
        {activeTab === 'jobs' && selectedJob && !selectedApp && (
          <section className="animate-fade-in">
            <button className="btn btn-ghost" onClick={() => setSelectedJob(null)} style={{ marginBottom: '24px' }}>
              <ArrowLeft size={16} />
              Ku laabo shaqooyinkayga
            </button>

            <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Codsiyada: {selectedJob.title}</h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {selectedJob.company_name} • {selectedJob.location}
                </div>
              </div>
              <button 
                onClick={() => handleViewApplicants(selectedJob)} 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', gap: '6px' }}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="skeleton" style={{ height: '70px' }}></div>
                <div className="skeleton" style={{ height: '70px' }}></div>
              </div>
            ) : applicants.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Users size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>Wali ma jiraan dad codsaday</h3>
                <p>Booskaan shaqo wali ma helin wax codsi ah. Mar kale hubi hadhow.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0 24px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  <div>Name & Contact</div>
                  <div style={{ textAlign: 'center' }}>AI Match Score</div>
                  <div style={{ textAlign: 'center' }}>Status</div>
                  <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {applicants.map(app => (
                  <div 
                    key={app.id} 
                    className="glass-panel glass-panel-hover" 
                    style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{app.seeker_name || 'Codsade'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{app.seeker_email}</div>
                    </div>
                    
                    <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '1.2rem', color: getMatchColor(app.match_percentage) }}>
                      {app.match_percentage}%
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      {getStatusBadge(app.status)}
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleSelectApplicant(app)}
                        className="btn btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        U kuur gal (Review)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* --- VIEW: APPLICANT REVIEW BOARD (DETAILED CANDIDATE VIEW) --- */}
        {activeTab === 'jobs' && selectedJob && selectedApp && (
          <section className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <button className="btn btn-ghost" onClick={() => setSelectedApp(null)} style={{ marginBottom: '24px' }}>
              <ArrowLeft size={16} />
              Ku laabo liiska codsiyada
            </button>

            <div className="glass-panel" style={{ padding: '40px' }}>
              {/* Applicant Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{selectedApp.seeker_name || 'Musharax'}</h2>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <Mail size={14} />
                      <span>{selectedApp.seeker_email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <Clock size={14} />
                      <span>Codsaday: {new Date(selectedApp.applied_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Compatibility</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: getMatchColor(selectedApp.match_percentage) }}>
                    {selectedApp.match_percentage}%
                  </div>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Current Status</span>
                  <strong>{getStatusBadge(selectedApp.status)}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Beddel heerka (Change Status):</label>
                  <select 
                    className="form-input" 
                    style={{ width: '180px', height: '40px', padding: '0 12px' }}
                    value={selectedApp.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApp.cover_letter && (
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Cover Letter (Warqadda Codsiga)</h4>
                  <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.01)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {selectedApp.cover_letter}
                  </div>
                </div>
              )}

              {/* AI Analysis Integration */}
              {!selectedAnalysis ? (
                <div className="skeleton" style={{ height: '140px', borderRadius: '12px' }}></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Skill Gap Analysis */}
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>AI Skill Gap Analysis</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.01)' }}>
                        <div style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>Xirfadaha u dhigma shaqada:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {selectedAnalysis.skill_gap?.matching_skills?.map((sk, idx) => (
                            <span key={idx} className="badge badge-emerald">{sk}</span>
                          )) || <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ma jiraan</span>}
                        </div>
                      </div>

                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.01)' }}>
                        <div style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>Xirfadaha ka dhiman musharaxa:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {selectedAnalysis.skill_gap?.missing_skills?.map((sk, idx) => (
                            <span key={idx} className="badge badge-rose">{sk}</span>
                          )) || <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ma jiraan</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation breakdown */}
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>AI Match Breakdown</h4>
                    <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      {selectedAnalysis.score_breakdown}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* --- VIEW: POST A NEW JOB --- */}
        {activeTab === 'post-job' && (
          <section className="animate-fade-in" style={{ maxWidth: '750px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' }}>Daabac Boos Shaqo cusub</h2>
              <p style={{ color: 'var(--text-secondary)' }}>U qor faahfaahinta shaqada, geli xirfadaha loo baahanyahay, AI-ga ayaa kala saari doona musharixiinta ku habboon.</p>
            </div>

            <form onSubmit={handlePostJob} className="glass-panel" style={{ padding: '36px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Job Title (Magaca booska shaqada)</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Tusaale: Senior Accountant, React Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Name (Shirkadda)</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Tusaale: Hormuud Telecom"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Location (Goobta shaqada)</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Mogadishu, Hargeisa, Garowe..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salary Range (Mushaharka - Optional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Tusaale: $800 - $1200 / Month"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select 
                    className="form-input" 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              {/* Skills configurations */}
              <div className="form-group">
                <label className="form-label">Mandatory Skills (Xirfadaha khasabka ah - Ku kala saar koomo ",")</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Tusaale: Python, FastAPI (musharaxiinta aan lahayn match score-kooda wuu hooseyn doonaa)"
                  value={mandatorySkills}
                  onChange={(e) => setMandatorySkills(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Optional Skills (Xirfadaha dheeraadka ah - Ku kala saar koomo ",")</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Tusaale: SQL, Git, Docker"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description (Faahfaahinta shaqada)</label>
                <textarea 
                  required
                  className="form-input" 
                  style={{ minHeight: '180px', resize: 'vertical' }}
                  placeholder="Qor mas'uuliyadaha iyo shuruudaha booskan shaqo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('jobs')}>
                  Ka noqo
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Daabacayaa...' : 'Daabac Shaqada'}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};
