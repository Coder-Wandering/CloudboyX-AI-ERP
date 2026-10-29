import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Check, 
  Building, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Zap, 
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export interface UserAccount {
  name: string;
  email: string;
  company: string;
  planType: 'full_suite' | 'modular_custom';
  selectedModules: ('ledger' | 'ingress' | 'procurement')[];
  securityTier?: 'standard' | 'cybershield_pro' | 'cybershield_sovereign';
  billingCycle: 'monthly' | 'annual';
  monthlyPrice: number;
  signedIn: boolean;
  avatarInitials: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  selectedPlan: {
    planType: 'full_suite' | 'modular_custom';
    selectedModules: ('ledger' | 'ingress' | 'procurement')[];
    securityTier?: 'standard' | 'cybershield_pro' | 'cybershield_sovereign';
    billingCycle: 'monthly' | 'annual';
    price: number;
  };
  onAuthSuccess: (user: UserAccount) => void;
  isDarkMode: boolean;
}

async function sha256Browser(str: string): Promise<string> {
  try {
    if (window.crypto && window.crypto.subtle) {
      const enc = new TextEncoder();
      const data = enc.encode(str);
      const hash = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hash));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {}
  // Basic deterministic fallback if subtle crypto is unavailable in test environment
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return 'fallback_' + Math.abs(h).toString(16);
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  selectedPlan,
  onAuthSuccess,
  isDarkMode
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign Up state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const getInitials = (name: string, email: string) => {
    if (name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setIsLoading(true);

    // 1. First try self-hosted server-side zero-cost endpoint
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setIsLoading(false);
        setSuccessMessage('Welcome back! Directing you to your workspace...');
        try {
          localStorage.setItem('cloudboyx_auth_user', JSON.stringify(data.user));
        } catch {}
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 500);
        return;
      } else if (res.status === 401) {
        setIsLoading(false);
        setErrorMessage(data.error || 'Incorrect email or password.');
        return;
      }
    } catch {
      // Server route unreachable (e.g. static site or offline), fallback to local client verification
    }

    // 2. Client-side local cryptographic verification (100% Free / Static hosting / Offline)
    try {
      const localUsers = JSON.parse(localStorage.getItem('cloudboyx_local_users') || '[]');
      const matched = localUsers.find((u: any) => u.email.toLowerCase() === loginEmail.toLowerCase().trim());
      if (matched) {
        const hashed = await sha256Browser(loginPassword + (matched.salt || ''));
        if (hashed === matched.passwordHash) {
          setIsLoading(false);
          setSuccessMessage('Welcome back! Directing you to your workspace...');
          const user: UserAccount = {
            name: matched.name,
            email: matched.email,
            company: matched.company,
            planType: matched.planType,
            selectedModules: matched.selectedModules,
            billingCycle: matched.billingCycle,
            monthlyPrice: matched.monthlyPrice,
            signedIn: true,
            avatarInitials: getInitials(matched.name, matched.email)
          };
          localStorage.setItem('cloudboyx_auth_user', JSON.stringify(user));
          setTimeout(() => {
            onAuthSuccess(user);
            onClose();
          }, 500);
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Incorrect password. Please verify your credentials.');
          return;
        }
      }
    } catch {}

    // Special allowance for demo login
    if (loginEmail.toLowerCase().trim() === 'elena.vance@omniretail.global') {
      setIsLoading(false);
      handleQuickDemoLogin();
      return;
    }

    setIsLoading(false);
    setErrorMessage('No account found with this email. Please check your spelling or sign up.');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid work email.');
      return;
    }
    if (!companyName.trim()) {
      setErrorMessage('Please enter your company or organization name.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);

    const payload = {
      name: fullName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      company: companyName.trim(),
      planType: selectedPlan.planType,
      selectedModules: selectedPlan.selectedModules,
      billingCycle: selectedPlan.billingCycle,
      monthlyPrice: selectedPlan.price
    };

    // 1. Try server-side zero-cost endpoint
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setIsLoading(false);
        setSuccessMessage('Account registered successfully ($0.00 Cloud Cost)!');
        try {
          localStorage.setItem('cloudboyx_auth_user', JSON.stringify(data.user));
          // Also mirror in local storage for offline resilience
          const localUsers = JSON.parse(localStorage.getItem('cloudboyx_local_users') || '[]');
          const salt = Math.random().toString(36).substring(2, 10);
          const passwordHash = await sha256Browser(signupPassword + salt);
          localUsers.push({ ...payload, salt, passwordHash });
          localStorage.setItem('cloudboyx_local_users', JSON.stringify(localUsers));
        } catch {}

        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 500);
        return;
      } else if (!res.ok) {
        setIsLoading(false);
        setErrorMessage(data.error || 'Failed to register account.');
        return;
      }
    } catch {
      // Server endpoint unavailable, proceed with local browser cryptographic registration
    }

    // 2. Client-side local cryptographic registration (Static/Offline zero-cost)
    try {
      const localUsers = JSON.parse(localStorage.getItem('cloudboyx_local_users') || '[]');
      const salt = Math.random().toString(36).substring(2, 10);
      const passwordHash = await sha256Browser(signupPassword + salt);
      localUsers.push({ ...payload, salt, passwordHash });
      localStorage.setItem('cloudboyx_local_users', JSON.stringify(localUsers));

      const user: UserAccount = {
        name: fullName.trim(),
        email: signupEmail.trim(),
        company: companyName.trim(),
        planType: selectedPlan.planType,
        selectedModules: selectedPlan.selectedModules,
        billingCycle: selectedPlan.billingCycle,
        monthlyPrice: selectedPlan.price,
        signedIn: true,
        avatarInitials: getInitials(fullName, signupEmail)
      };

      localStorage.setItem('cloudboyx_auth_user', JSON.stringify(user));
      setIsLoading(false);
      setSuccessMessage('Account created successfully ($0.00 Cloud Cost)! Welcome.');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Error creating account: ' + (err.message || 'Storage error'));
    }
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoUser: UserAccount = {
        name: 'Elena Vance, CPA',
        email: 'elena.vance@omniretail.global',
        company: 'OmniRetail Global Enterprise',
        planType: 'full_suite',
        selectedModules: ['ledger', 'ingress', 'procurement'],
        securityTier: 'cybershield_sovereign',
        billingCycle: 'annual',
        monthlyPrice: 959,
        signedIn: true,
        avatarInitials: 'EV'
      };

      try {
        localStorage.setItem('cloudboyx_auth_user', JSON.stringify(demoUser));
      } catch {}

      setSuccessMessage('Authenticated as Elena Vance, CPA (Demo Profile)');
      setTimeout(() => {
        onAuthSuccess(demoUser);
        onClose();
      }, 400);
    }, 300);
  };

  const moduleNamesMap: Record<string, { name: string; icon: React.ReactNode }> = {
    ledger: { name: 'Module 1: General Ledger', icon: <BookOpen className="w-3 h-3 text-[#979BF3]" /> },
    ingress: { name: 'Module 2: Ingress & AI Hub', icon: <Zap className="w-3 h-3 text-amber-400" /> },
    procurement: { name: 'Module 3: Procurement & AP', icon: <Layers className="w-3 h-3 text-emerald-400" /> }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all text-left ${
          isDarkMode 
            ? 'bg-[#1C1B21] border-slate-800 text-slate-100 shadow-cyan-950/20' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#24232B] text-white p-5 flex items-center justify-between border-b border-[#3B3947]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <ShieldCheck className="w-5 h-5 text-[#979BF3]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-mono tracking-tight">
                {mode === 'signin' ? 'Sign In to CloudboyX' : 'Create Your CloudboyX Account'}
              </h3>
              <p className="text-[11px] text-[#A6A5B2] font-mono">
                {mode === 'signin' 
                  ? 'Access your General Ledger, Ingress & Procurement suite' 
                  : 'Start with the complete suite or customize your modules'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Plan Summary Banner (Shows during Sign Up or Modular Choice) */}
        <div className={`px-5 py-3 border-b text-xs flex items-center justify-between gap-3 ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#979BF3] dark:text-[#979BF3] block">
              Active Configuration
            </span>
            <span className="font-bold font-mono">
              {selectedPlan.planType === 'full_suite' || selectedPlan.selectedModules.length === 3 
                ? 'Complete Enterprise Suite (All 3 Modules)' 
                : `A La Carte Modular Plan (${selectedPlan.selectedModules.length} of 3 Modules)`}
            </span>
          </div>
          <div className="text-right font-mono">
            <span className="text-sm font-extrabold text-[#979BF3] dark:text-[#979BF3]">
              ${selectedPlan.price}
            </span>
            <span className="text-[10px] text-slate-500">/mo {selectedPlan.billingCycle === 'annual' ? '(Annual)' : ''}</span>
          </div>
        </div>

        {/* Selected Modules Badges */}
        <div className={`px-5 py-2 border-b flex flex-wrap gap-1.5 text-[10px] font-mono ${
          isDarkMode ? 'bg-[#080c18] border-slate-800' : 'bg-slate-100/60 border-slate-200'
        }`}>
          {selectedPlan.selectedModules.map(mKey => (
            <span 
              key={mKey}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              {moduleNamesMap[mKey]?.icon}
              <span>{moduleNamesMap[mKey]?.name}</span>
            </span>
          ))}
          {selectedPlan.securityTier && selectedPlan.securityTier !== 'standard' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/15 border border-purple-400/40 text-purple-700 dark:text-purple-300 font-bold">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>{selectedPlan.securityTier === 'cybershield_sovereign' ? 'CyberShield Sovereign' : 'CyberShield Pro'}</span>
            </span>
          )}
        </div>

        {/* Zero-Cost Architecture Guarantee Banner */}
        <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Free Self-Hosted Login ($0.00 Running Cost)</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 font-bold uppercase tracking-wider">
            No Firebase · No GCP Fees
          </span>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="p-5 pb-2">
          <div className={`grid grid-cols-2 p-1 rounded-xl border text-xs font-mono font-bold ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signin' 
                  ? 'bg-white dark:bg-slate-800 text-[#979BF3] dark:text-[#979BF3] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-[#979BF3] text-[#1C1B21] text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up / Create Account</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        <div className="px-5">
          {errorMessage && (
            <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="px-5 pb-5">
          {mode === 'signin' ? (
            /* ──────────────── SIGN IN FORM ──────────────── */
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs font-sans rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#979BF3] dark:focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs font-sans rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#979BF3] dark:focus:border-cyan-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#03045e] hover:to-[#0077b6] active:scale-98 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#48cae4]/50 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                </button>
              </div>

              {/* Quick Demo Login Option */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  disabled={isLoading}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>One-Click Demo Sign In (Elena Vance, CPA)</span>
                </button>
                <div className="mt-2 text-center text-[10px] text-slate-400 font-mono">
                  Self-hosted native auth · Zero Google Cloud & Firebase dependencies
                </div>
              </div>
            </form>
          ) : (
            /* ──────────────── SIGN UP FORM ──────────────── */
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Jane Doe, CPA"
                      className="w-full pl-9 pr-3 py-2 text-xs font-sans rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#979BF3] dark:focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="Retail Corp Inc."
                      className="w-full pl-9 pr-3 py-2 text-xs font-sans rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#979BF3] dark:focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs font-sans rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#979BF3] dark:focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Set Secure Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-9 py-2 text-xs font-sans rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#979BF3] dark:focus:border-cyan-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                <input
                  type="checkbox"
                  id="terms-check"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="rounded border-slate-300 text-[#979BF3] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="terms-check" className="cursor-pointer">
                  I agree to CloudboyX Enterprise Terms and Master Service Agreement.
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#03045e] hover:to-[#0077b6] active:scale-98 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#48cae4]/50 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {isLoading 
                      ? 'Provisioning Workspace...' 
                      : `Start Subscription (${selectedPlan.selectedModules.length} Modules) — $${selectedPlan.price}/mo`}
                  </span>
                </button>
              </div>

              {/* Quick Demo Login Option */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  disabled={isLoading}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Test Drive with Demo Account (Elena Vance, CPA)</span>
                </button>
                <div className="mt-2 text-center text-[10px] text-slate-400 font-mono">
                  100% free local & server-side authentication · No external subscriptions
                </div>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
