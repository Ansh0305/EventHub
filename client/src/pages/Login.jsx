import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return toast.error('All fields required');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            toast.success('Welcome back!');
            navigate(location.state?.from?.pathname || '/');
        } catch (err) { toast.error(err.response?.data?.error || 'Login failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="page auth-page">
            <div className="container">
                <div className="auth-card glass-card">
                    <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>Welcome Back</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--color-text-muted)' }} />
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="form-input" style={{ paddingLeft: '48px' }} placeholder="Enter your email" disabled={loading} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--color-text-muted)' }} />
                                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="form-input" style={{ paddingLeft: '48px' }} placeholder="Enter your password" disabled={loading} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? 'Signing in...' : <><LogIn size={20} /> Sign In</>}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--color-primary-light)' }}>Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
