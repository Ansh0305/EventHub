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

    const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' };

    return (
        <div className="page auth-page">
            <div className="container">
                <div className="auth-card glass-card">
                    <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#f9fafb', fontSize: '1.75rem', fontWeight: '700' }}>Welcome Back</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={iconStyle} />
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="form-input" style={{ paddingLeft: '44px' }} placeholder="Enter your email" disabled={loading} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={iconStyle} />
                                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="form-input" style={{ paddingLeft: '44px' }} placeholder="Enter your password" disabled={loading} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? 'Signing in...' : <><LogIn size={20} /> Sign In</>}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#9ca3af' }}>
                        Don't have an account? <Link to="/signup" style={{ color: '#a78bfa' }}>Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
