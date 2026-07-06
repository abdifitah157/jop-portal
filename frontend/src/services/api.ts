export interface User {
  id: string;
  email: string;
  phone_number?: string;
  role: 'seeker' | 'employer' | 'admin';
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  current_title?: string;
  location?: string;
  summary?: string;
  resume_url?: string;
  profile_score: number;
  metadata?: {
    education: Array<{ degree: string; school: string; grad_year: string }>;
    experience: Array<{ title: string; company: string; duration: string }>;
  };
  skills: Skill[];
  updated_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salary_range?: string;
  status: 'active' | 'closed';
  created_at: string;
  skills: Skill[];
}

export interface Application {
  id: string;
  job_id: string;
  seeker_id: string;
  seeker_name?: string;
  seeker_email?: string;
  status: 'Applied' | 'Shortlisted' | 'Interviewing' | 'Rejected' | 'Offered';
  match_percentage: number;
  cover_letter?: string;
  applied_at: string;
  job_title?: string; // Client helper
  company_name?: string; // Client helper
}

export interface AIAnalysis {
  id: string;
  application_id: string;
  profile_id: string;
  job_id: string;
  score_breakdown?: string;
  skill_gap?: {
    matching_skills: string[];
    missing_skills: string[];
  };
  course_recommendations?: Array<{
    title: string;
    provider: string;
    url: string;
  }>;
  analyzed_at: string;
}

export interface ProfileUpdateInput {
  full_name?: string;
  current_title?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  education?: Array<{ degree: string; school: string; grad_year: string }>;
  experience?: Array<{ title: string; company: string; duration: string }>;
}

class ApiService {
  private baseUrl = '/api';

  setToken(token: string) {
    localStorage.setItem('sh_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('sh_token');
  }

  removeToken() {
    localStorage.removeItem('sh_token');
  }

  setUserRole(role: string) {
    localStorage.setItem('sh_role', role);
  }

  getUserRole(): string | null {
    return localStorage.getItem('sh_role');
  }

  setUserEmail(email: string) {
    localStorage.setItem('sh_email', email);
  }

  getUserEmail(): string | null {
    return localStorage.getItem('sh_email');
  }

  logout() {
    this.removeToken();
    localStorage.removeItem('sh_role');
    localStorage.removeItem('sh_email');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errMsg = 'API Request Failed';
      try {
        const errData = await response.json();
        errMsg = errData.detail || errMsg;
      } catch {
        errMsg = response.statusText || errMsg;
      }
      throw new Error(errMsg);
    }

    return response.json() as Promise<T>;
  }

  // --- AUTH ENDPOINTS ---
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2PasswordRequestForm expects username
    formData.append('password', password);

    const res = await this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: formData,
    });

    // Fetch user details immediately to set role & email
    this.setToken(res.access_token);
    try {
      const user = await this.getCurrentUser();
      this.setUserRole(user.role);
      this.setUserEmail(user.email);
    } catch (e) {
      this.removeToken();
      throw e;
    }

    return res;
  }

  async register(email: string, password: string, phone: string, role: string): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        phone_number: phone,
        role,
      }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // --- PROFILES ENDPOINTS ---
  async getMyProfile(): Promise<Profile> {
    return this.request<Profile>('/profiles/me');
  }

  async updateProfile(data: ProfileUpdateInput): Promise<Profile> {
    return this.request<Profile>('/profiles/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async uploadCV(file: File): Promise<Profile> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new Headers();
    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${this.baseUrl}/profiles/upload-cv`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errMsg = 'Resume upload and parsing failed';
      try {
        const errData = await response.json();
        errMsg = errData.detail || errMsg;
      } catch {
        errMsg = response.statusText || errMsg;
      }
      throw new Error(errMsg);
    }

    return response.json() as Promise<Profile>;
  }

  // --- JOBS ENDPOINTS ---
  async listJobs(): Promise<Job[]> {
    return this.request<Job[]>('/jobs');
  }

  async searchJobs(query: string, location?: string, type?: string): Promise<Job[]> {
    let url = `/jobs/search?q=${encodeURIComponent(query)}`;
    if (location) url += `&location=${encodeURIComponent(location)}`;
    if (type) url += `&type=${encodeURIComponent(type)}`;
    return this.request<Job[]>(url);
  }

  async getJob(id: string): Promise<Job> {
    return this.request<Job>(`/jobs/${id}`);
  }

  async createJob(job: {
    title: string;
    description: string;
    company_name: string;
    location: string;
    type: string;
    salary_range?: string;
    skills: string[];
    mandatory_skills: string[];
  }): Promise<Job> {
    return this.request<Job>('/jobs/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
    });
  }

  // --- APPLICATIONS ENDPOINTS ---
  async submitApplication(jobId: string, coverLetter?: string): Promise<Application> {
    return this.request<Application>('/applications/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        cover_letter: coverLetter,
      }),
    });
  }

  async listApplications(jobId?: string): Promise<Application[]> {
    let url = '/applications/';
    if (jobId) {
      url += `?job_id=${jobId}`;
    }
    return this.request<Application[]>(url);
  }

  async getAIAnalysis(appId: string): Promise<AIAnalysis> {
    return this.request<AIAnalysis>(`/applications/${appId}/analysis`);
  }

  async updateApplicationStatus(appId: string, status: string): Promise<Application> {
    return this.request<Application>(`/applications/${appId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
  }
}

export const api = new ApiService();
