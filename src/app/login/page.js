'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => { let interval; if (timer > 0) { interval = setInterval(() => setTimer(t => t - 1), 1000); } return () => clearInterval(interval); }, [timer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const newOTP = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOTP(newOTP); setLoading(false); setStep(2); setTimer(120);
    console.log(`[StudentHive] OTP: ${newOTP}`);
    alert(`Demo Mode: Your OTP is ${newOTP}`);
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
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (entered === generatedOTP) {
      localStorage.setItem('studenthive_user', JSON.stringify({ email, name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()), verified: true, loginTime: new Date().toISOString() }));
      router.push('/dashboard');
    } else { setError('Invalid OTP. Please try again.'); setLoading(false); }
  };

  const resendOTP = () => {
    if (timer > 0) return;
    const newOTP = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOTP(newOTP); setOtp(['','','','','','']); setTimer(120); setError('');
    alert(`Demo Mode: Your new OTP is ${newOTP}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.ambientBg}><div className={styles.orbOne} /><div className={styles.orbTwo} /><div className={styles.orbThree} /></div>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.logo}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M12 22V9"/><path d="M2 9h20"/></svg></div>
            <h1>Welcome to StudentHive</h1>
            <p>{step === 1 ? 'Sign in with your university email' : 'Verify your identity'}</p>
          </div>
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${step >= 1 ? styles.active : ''}`}><span>1</span></div>
            <div className={`${styles.stepLine} ${step >= 2 ? styles.active : ''}`} />
            <div className={`${styles.stepDot} ${step >= 2 ? styles.active : ''}`}><span>2</span></div>
          </div>
          {error && <div className={styles.errorMsg}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>{error}</div>}
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <div className="input-group"><label htmlFor="email">University Email</label><input id="email" type="email" className="input" placeholder="your.name@university.edu" value={email} onChange={e => setEmail(e.target.value)} autoFocus required /></div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%',marginTop:'8px'}}>{loading ? <><span className="spinner" style={{width:18,height:18}}/>Sending OTP...</> : 'Send OTP →'}</button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className={styles.form}>
              <p className={styles.otpInfo}>We sent a 6-digit code to <strong>{email}</strong></p>
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
