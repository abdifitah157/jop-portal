import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Profile, Job, Application, AIAnalysis } from '../services/api';
import { 
  Search, MapPin, DollarSign, Clock, FileText, Upload, 
  Compass, GraduationCap, Briefcase, Award, 
  CheckCircle2, XCircle, AlertCircle, ExternalLink, BookOpen, User, Star, Loader2
} from 'lucide-react';

interface SeekerDashboardProps {
  userEmail: string;
}

export const SeekerDashboard: React.FC<SeekerDashboardProps> = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'profile'>('jobs');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoc, setSearchLoc] = useState('');
  const [searchType, setSearchType] = useState('');
  
  // Selections
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  // Statuses
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile Edit fields
  const [fullName, setFullName] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [skillsStr, setSkillsStr] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try to load profile
      let userProfile: Profile | null = null;
      try {
        userProfile = await api.getMyProfile();
        setProfile(userProfile);
        populateProfileFields(userProfile);
      } catch (err: any) {
        // Profile might not exist yet, which is fine
        console.log("No profile found yet:", err.message);
      }

      // 2. Load Jobs
      const activeJobs = await api.listJobs();
      setJobs(activeJobs);

      // 3. Load applications if profile exists
      if (userProfile) {
        const apps = await api.listApplications();
        // Enrich apps with job title and company
        const enrichedApps = apps.map(app => {
          const matchedJob = activeJobs.find(j => j.id === app.job_id);
          return {
            ...app,
            job_title: matchedJob ? matchedJob.title : 'Position',
            company_name: matchedJob ? matchedJob.company_name : 'Company'
          };
        });
        setApplications(enrichedApps);
      }
    } catch (err: any) {
      setError('Ku guuldareystay soo dejinta xogta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const populateProfileFields = (p: Profile) => {
    setFullName(p.full_name || '');
    setCurrentTitle(p.current_title || '');
    setLocation(p.location || '');
    setSummary(p.summary || '');
    setSkillsStr(p.skills?.map(s => s.name).join(', ') || '');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let results: Job[];
      if (searchQuery.trim() || searchLoc || searchType) {
        results = await api.searchJobs(searchQuery, searchLoc, searchType);
      } else {
        results = await api.listJobs();
      }
      setJobs(results);
    } catch (err: any) {
      setError('Baaritaanka wuu fashilmay: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!profile) {
      setError('Fadlan marka hore dhameystir profile-kaaga adoo soo galinaya CV.');
      setSelectedJob(null);
      return;
    }

    setSubmittingApp(true);
    setError(null);
    setSuccess(null);
    try {
      await api.submitApplication(selectedJob.id, coverLetter);
      setSuccess(`Codsigaaga booska '${selectedJob.title}' waa la gudbiyay!`);
      setCoverLetter('');
      setSelectedJob(null);
      
      // Reload applications and profile
      await loadInitialData();
    } catch (err: any) {
      setError('Codsiga wuu guuldareystay: ' + err.message);
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleViewAnalysis = async (app: Application) => {
    setSelectedApp(app);
    setSelectedAnalysis(null);
    setError(null);
    try {
      const analysis = await api.getAIAnalysis(app.id);
      setSelectedAnalysis(analysis);
    } catch (err: any) {
      setError('Falanqaynta AI lama heli karo: ' + err.message);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedProfile = await api.uploadCV(file);
      setProfile(updatedProfile);
      populateProfileFields(updatedProfile);
      setSuccess('Resume-gaaga waa la farsameeyay, profile-kaagana waa la cusbooneysiiyay!');
      
      // Reload data
      await loadInitialData();
    } catch (err: any) {
      setError('Soo gelinta CV way fashilantay: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
      const updated = await api.updateProfile({
        full_name: fullName,
        current_title: currentTitle,
        location,
        summary,
        skills: skillsArray
      });
      setProfile(updated);
      populateProfileFields(updated);
      setSuccess('Profile-kaaga si guul leh ayaa loo cusbooneysiiyay!');
    } catch (err: any) {
      setError('Cusbooneysiinta wey guuldareysatay: ' + err.message);
    } finally {
      setLoading(false);
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

  const getCompletenessColor = (score: number) => {
    if (score >= 80) return 'var(--accent-emerald)';
    if (score >= 50) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  return (
    <div className="dashboard-grid">
      {/* Sidebar Navigation */}
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
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userEmail}
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            onClick={() => { setActiveTab('jobs'); setSelectedJob(null); }}
            className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', width: '100%' }}
          >
            <Compass size={18} />
            <span>Raadi Shaqooyin</span>
          </button>

          <button 
            onClick={() => { setActiveTab('applications'); setSelectedApp(null); }}
            className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', width: '100%' }}
          >
            <FileText size={18} />
            <span>Codsiyadayda ({applications.length})</span>
          </button>

          <button 
            onClick={() => { setActiveTab('profile'); }}
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', width: '100%' }}
          >
            <User size={18} />
            <span>Profile-kayga ({profile ? Math.round(profile.profile_score) : 0}%)</span>
          </button>
        </nav>

        {/* Profile score card widget */}
        {profile && (
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completeness</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: getCompletenessColor(profile.profile_score) }}>
                {Math.round(profile.profile_score)}%
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${profile.profile_score}%`, 
                height: '100%', 
                background: getCompletenessColor(profile.profile_score),
                transition: 'width 0.5s ease-out'
              }}></div>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.3' }}>
              {profile.profile_score < 70 ? 'Cusbooneysii profile-kaaga si AI-ga uu kuu helo shaqo fiican.' : 'Profile-kaaga aad ayuu u dhameystiranyahay!'}
            </p>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main style={{ padding: '40px', overflowY: 'auto', position: 'relative' }}>
        <div className="gradient-blob" style={{ top: '20%', right: '10%' }}></div>

        {/* Success/Error Alerts */}
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

        {/* --- TAB: SEARCH JOBS --- */}
        {activeTab === 'jobs' && !selectedJob && (
          <section className="animate-fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' }}>Shaqooyin AI-ku Falanqeeyay</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Ku raadi shaqooyinka ugu fiican Soomaaliya adoo adeegsanaya semantic iyo vector search.</p>
            </div>

            {/* Advanced Search Form */}
            <form onSubmit={handleSearch} className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 200px 180px auto', gap: '16px', alignItems: 'end', marginBottom: '32px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Search Query (Title, Skill, Description)</label>
                <div className="search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Tusaale: Python, Project Manager..." 
                    className="form-input search-input" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location (Magaalada)</label>
                <input 
                  type="text" 
                  placeholder="Mogadishu, Hargeisa..." 
                  className="form-input" 
                  value={searchLoc}
                  onChange={(e) => setSearchLoc(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Job Type</label>
                <select 
                  className="form-input" 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="">Dhammaan</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ height: '45px', padding: '0 24px' }}>
                Falanqee & Raadi
              </button>
            </form>

            {/* Jobs Listing */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-panel skeleton" style={{ height: '220px' }}></div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                <Briefcase size={40} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
                <h3>Wax shaqo ah lama helin</h3>
                <p>Isku day inaad bedesho ereyada aad baarayso ama shaandhada.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {jobs.map(job => (
                  <div 
                    key={job.id} 
                    className="glass-panel glass-panel-hover" 
                    style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '260px' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span className="badge badge-blue">{job.type}</span>
                        {job.salary_range && <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>{job.salary_range}</span>}
                      </div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</h3>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{job.company_name}</h4>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <div>
                      {/* Show top 3 skills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {job.skills?.slice(0, 3).map(sk => (
                          <span key={sk.id} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                            {sk.name}
                          </span>
                        ))}
                        {job.skills?.length > 3 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{job.skills.length - 3} more</span>}
                      </div>

                      <button 
                        onClick={() => { setSelectedJob(job); setCoverLetter(''); }}
                        className="btn btn-secondary" 
                        style={{ width: '100%', fontSize: '0.8rem', padding: '8px 16px' }}
                      >
                        Arag Faahfaahinta & Codso
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* --- DETAILED VIEW: JOB APPLY DRAWER --- */}
        {activeTab === 'jobs' && selectedJob && (
          <section className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn btn-ghost" onClick={() => setSelectedJob(null)} style={{ marginBottom: '24px' }}>
              ← Ku laabo liiska shaqooyinka
            </button>

            <div className="glass-panel" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{selectedJob.title}</h2>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{selectedJob.company_name}</h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <MapPin size={16} />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Clock size={16} />
                      <span>{selectedJob.type}</span>
                    </div>
                    {selectedJob.salary_range && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '0.85rem', fontWeight: '600' }}>
                        <DollarSign size={16} />
                        <span>{selectedJob.salary_range}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="badge badge-blue" style={{ fontSize: '0.9rem', padding: '6px 16px' }}>{selectedJob.status}</span>
              </div>

              {/* Skills Required */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Required Skills (Xirfadaha loo baahanyahay)</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedJob.skills?.map(sk => (
                    <span 
                      key={sk.id} 
                      className="badge badge-purple" 
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div style={{ marginBottom: '40px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Job Description (Faahfaahinta Shaqada)</h4>
                <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  {selectedJob.description}
                </div>
              </div>

              {/* Apply Form */}
              <form onSubmit={handleApply} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>U soo gudbi codsigaaga (Apply)</h3>
                
                {!profile ? (
                  <div style={{ background: 'var(--accent-amber-glow)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '16px', borderRadius: '10px', fontSize: '0.9rem' }}>
                    <AlertCircle size={18} style={{ float: 'left', marginRight: '10px', marginTop: '2px' }} />
                    Miyeydnan wali dhameystirin Profile-kaaga? Fadlan marka hore ku soo upload-garee CV-gaaga tabka <strong>Profile</strong> si shaqadaan aad u codsato loona xisaabiyo is-barbarkiina adiga iyo shaqada.
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Cover Letter (Warqadda Codsiga - Optional)</label>
                      <textarea 
                        className="form-input" 
                        style={{ minHeight: '140px', resize: 'vertical' }} 
                        placeholder="Ku qor halkan sababta aad u rabto shaqadaan iyo sababta aad ugu qalanto..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setSelectedJob(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={submittingApp}>
                        {submittingApp ? 'Gudbinayaa...' : 'Gudbi Codsiga (Apply Now)'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </section>
        )}

        {/* --- TAB: APPLICATIONS LIST --- */}
        {activeTab === 'applications' && !selectedApp && (
          <section className="animate-fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' }}>Codsiyadaada Shaqo</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Halkan kala soco dhammaan shaqooyinkii aad codsatay iyo heerarkooda kala duwan.</p>
            </div>

            {applications.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>Wali wax codsi shaqo ah ma gudbin</h3>
                <p style={{ marginBottom: '20px' }}>Booqo tabka 'Raadi Shaqooyin' si aad u codsato shaqooyinka jira.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('jobs')}>Raadi Shaqooyin</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {applications.map(app => (
                  <div 
                    key={app.id} 
                    className="glass-panel glass-panel-hover" 
                    style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>{app.job_title}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{app.company_name}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Waxaad codsatay: {new Date(app.applied_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Match Rate</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: getCompletenessColor(app.match_percentage) }}>
                          {app.match_percentage}%
                        </div>
                      </div>

                      <button 
                        onClick={() => handleViewAnalysis(app)}
                        className="btn btn-secondary"
                        style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', display: 'flex', gap: '8px' }}
                      >
                        <Award size={16} />
                        Falanqaynta AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* --- DETAILED VIEW: AI ANALYSIS DRAWER --- */}
        {activeTab === 'applications' && selectedApp && (
          <section className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn btn-ghost" onClick={() => setSelectedApp(null)} style={{ marginBottom: '24px' }}>
              ← Ku laabo liiska codsiyada
            </button>

            <div className="glass-panel" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>AI Match Dashboard</h2>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    Codsigaaga ku socda: {selectedApp.job_title} ({selectedApp.company_name})
                  </h3>
                </div>

                <div className="circle-progress-container" style={{ width: '80px', height: '80px' }}>
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="var(--bg-tertiary)" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke={getCompletenessColor(selectedApp.match_percentage)} 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * selectedApp.match_percentage) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="circle-progress-text" style={{ fontSize: '1.2rem', color: getCompletenessColor(selectedApp.match_percentage) }}>
                    {Math.round(selectedApp.match_percentage)}%
                  </span>
                </div>
              </div>

              {!selectedAnalysis ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="skeleton" style={{ height: '100px' }}></div>
                  <div className="skeleton" style={{ height: '80px' }}></div>
                  <div className="skeleton" style={{ height: '120px' }}></div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Skill Gap Section */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={18} style={{ color: 'var(--accent-purple)' }} />
                      Skill Gap Analysis (Falanqaynta Xirfadaha)
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* Matching */}
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.01)', borderColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '600', fontSize: '0.85rem', marginBottom: '12px' }}>
                          <CheckCircle2 size={16} />
                          Xirfadaha aad leedahay ({selectedAnalysis.skill_gap?.matching_skills?.length || 0})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {selectedAnalysis.skill_gap?.matching_skills?.map((sk, idx) => (
                            <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>{sk}</span>
                          )) || <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ma jiraan</span>}
                        </div>
                      </div>

                      {/* Missing */}
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.01)', borderColor: 'rgba(244, 63, 94, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: '600', fontSize: '0.85rem', marginBottom: '12px' }}>
                          <XCircle size={16} />
                          Xirfadaha ka dhiman ({selectedAnalysis.skill_gap?.missing_skills?.length || 0})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {selectedAnalysis.skill_gap?.missing_skills?.map((sk, idx) => (
                            <span key={idx} className="badge badge-rose" style={{ fontSize: '0.75rem' }}>{sk}</span>
                          )) || <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ma jiraan</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Career Coaching Breakdown */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star size={18} style={{ color: 'var(--accent-amber)' }} />
                      AI Career Guidance (Talooyinka AI-ga)
                    </h4>
                    <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {selectedAnalysis.score_breakdown}
                    </div>
                  </div>

                  {/* Course Recommendations */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ExternalLink size={18} style={{ color: 'var(--accent-primary)' }} />
                      Recommended Courses (Koorsooyin laguu soo jeediyey)
                    </h4>
                    
                    {!selectedAnalysis.course_recommendations || selectedAnalysis.course_recommendations.length === 0 ? (
                      <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Uma baahnid koorsooyin hadda, dhammaan xirfadaha shaqadan waa kuwo aad leedahay!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {selectedAnalysis.course_recommendations.map((course, idx) => (
                          <div 
                            key={idx} 
                            className="glass-panel" 
                            style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '2px' }}>{course.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Provider: {course.provider}</div>
                            </div>
                            <a 
                              href={course.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', gap: '6px', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                            >
                              Baro Hadda (Learn)
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* --- TAB: PROFILE MANAGEMENT --- */}
        {activeTab === 'profile' && (
          <section className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' }}>Maamul Profile-kaaga</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Ku shubo CV-gaaga si toos ah si AI-gu ugu farsameeyo profile-kaaga, ama ku sax gacantaada.</p>
            </div>

            {/* Resume Upload Dropzone */}
            <div className="glass-panel" style={{ padding: '30px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '14px' }}>Ku soo upload-garee CV / Resume</h3>
              
              <div className="upload-zone" style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  accept=".pdf,.docx,.doc,.txt" 
                  id="cv-upload-input"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  onChange={handleCVUpload}
                  disabled={uploading}
                />
                
                {uploading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <Loader2 size={32} className="spin" style={{ animation: 'spin-slow 1s linear infinite', color: 'var(--accent-primary)' }} />
                    <div style={{ fontWeight: '600' }}>AI-ga ayaa falanqeynaya CV-gaaga...</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fadlan sug, waxaan soo saareynaa xirfadaha iyo taariikhdaada waxbarasho.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                    <div style={{ fontWeight: '600' }}>Dooro File (PDF, DOCX, TXT)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ama halkan ku soo jiid si toos ah</div>
                  </div>
                )}
              </div>

              {profile?.resume_url && (
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>CV loaded: {profile.resume_url.split('_').slice(1).join('_')}</span>
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                    Arag CV-ga
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Profile Fields Editor */}
            <form onSubmit={handleProfileUpdate} className="glass-panel" style={{ padding: '36px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Macluumaadkaaga shaqsiga ah (Manual Edit)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Magacaaga oo Dhameystiran (Full Name)</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Magacaaga geli"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Booska Shaqo ee Hadda (Current Title)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Tusaale: Python Engineer, Accountant..."
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location (Goobtaada - Magaalada & Dalka)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Tusaale: Mogadishu, Somalia"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Summary (Faahfaahin Kooban)</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Geli 2-3 weedho oo koobaya khibradaada..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Skills (Xirfadaha - Ku kala saar koomo ",")</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Tusaale: Python, SQL, Project Management, Customer Service"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                />
              </div>

              {/* Education History & Experience Lists (Display Only parsed details for simplicity) */}
              {profile?.metadata && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginBottom: '24px' }}>
                  {/* Education */}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GraduationCap size={16} />
                      Education History
                    </h4>
                    {profile.metadata.education?.map((edu, idx) => (
                      <div key={idx} className="glass-panel" style={{ padding: '12px', marginBottom: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ fontWeight: '600' }}>{edu.degree}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>{edu.school} ({edu.grad_year})</div>
                      </div>
                    )) || <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ma jiro macluumaad waxbarasho oo ku jira CV-ga.</p>}
                  </div>

                  {/* Experience */}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={16} />
                      Work Experience
                    </h4>
                    {profile.metadata.experience?.map((exp, idx) => (
                      <div key={idx} className="glass-panel" style={{ padding: '12px', marginBottom: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ fontWeight: '600' }}>{exp.title}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>{exp.company} • {exp.duration}</div>
                      </div>
                    )) || <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ma jiro macluumaad khibradeed oo ku jira CV-ga.</p>}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Cusbooneysiinayaa...' : 'Keydi Isbedelada'}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};
