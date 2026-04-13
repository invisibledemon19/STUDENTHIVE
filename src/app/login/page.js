'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { apiRequest } from '@/lib/client/api';
import { setSession } from '@/lib/client/session';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => { let interval; if (timer > 0) { interval = setInterval(() => setTimer(t => t - 1), 1000); } return () => clearInterval(interval); }, [timer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!fullName.trim() || fullName.trim().length < 2) { setError('Please enter your full name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email.'); return; }
    try {
      setLoading(true);
      const response = await apiRequest('/api/auth/send-otp', { method: 'POST', body: { email } });
      setStep(2);
      setTimer(120);
      setOtp(['', '', '', '', '', '']);
      if (response.demoOtp) {
        alert(`Demo Mode: Your OTP is ${response.demoOtp}`);
      }
    } catch (err) {
      setError(err.message || 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => { if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus(); };

  const handleOtpSubmit = async (e) => {
    e.preventDefault(); setError('');
    const entered = otp.join('');
    if (entered.length !== 6) { setError('Enter the complete 6-digit OTP.'); return; }
    try {
      setLoading(true);
      const response = await apiRequest('/api/auth/verify-otp', {
        method: 'POST',
        body: { email, otp: entered, name: fullName.trim() },
      });

      setSession({
        token: response.token,
        user: response.user,
      });

      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      const response = await apiRequest('/api/auth/send-otp', { method: 'POST', body: { email } });
      setOtp(['','','','','','']);
      setTimer(120);
      setError('');
      if (response.demoOtp) {
        alert(`Demo Mode: Your new OTP is ${response.demoOtp}`);
      }
    } catch (err) {
      setError(err.message || 'Unable to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.ambientBg}><div className={styles.orbOne} /><div className={styles.orbTwo} /><div className={styles.orbThree} /></div>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.logo}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M12 22V9"/><path d="M2 9h20"/></svg></div>
            <h1>Welcome to StudentHive</h1>
            <p>{step === 1 ? 'Enter your details to get started' : 'Verify your identity'}</p>
          </div>
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${step >= 1 ? styles.active : ''}`}><span>1</span></div>
            <div className={`${styles.stepLine} ${step >= 2 ? styles.active : ''}`} />
            <div className={`${styles.stepDot} ${step >= 2 ? styles.active : ''}`}><span>2</span></div>
          </div>
          {error && <div className={styles.errorMsg}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>{error}</div>}
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <div className="input-group">
                <label htmlFor="fullName">Full Name</label>
                <input id="fullName" type="text" className="input" placeholder="e.g. Sajal Agarwal" value={fullName} onChange={e => setFullName(e.target.value)} autoFocus required minLength={2} />
              </div>
              <div className="input-group">
                <label htmlFor="email">University Email</label>
                <input id="email" type="email" className="input" placeholder="your.name@university.edu" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%',marginTop:'8px'}}>{loading ? <><span className="spinner" style={{width:18,height:18}}/>Sending OTP...</> : 'Send OTP →'}</button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className={styles.form}>
              <p className={styles.otpInfo}>Hi <strong>{fullName}</strong>, we sent a 6-digit code to <strong>{email}</strong></p>
              <div className={styles.otpContainer}>{otp.map((digit, i) => (<input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} className={styles.otpInput} value={digit} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} autoFocus={i === 0} />))}</div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%'}}>{loading ? <><span className="spinner" style={{width:18,height:18}}/>Verifying...</> : 'Verify & Sign In'}</button>
              <div className={styles.resendRow}>
                <button type="button" className={`btn btn-ghost ${styles.resendBtn}`} onClick={resendOTP} disabled={timer > 0}>{timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); }}>Change Email</button>
              </div>
            </form>
          )}
          <div className={styles.cardFooter}><p>By signing in, you agree to StudentHive&apos;s Terms of Service.</p></div>
        </div>
      </div>
    </div>
  );
}
