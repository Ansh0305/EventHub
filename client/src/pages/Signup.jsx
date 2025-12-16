import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) return toast.error('All fields required');
        if (formData.password !== formData.confirmPassword) return toast.error('Passwords must match');
        if (formData.password.length < 6) return toast.error('Password min 6 chars');
        setLoading(true);
        try {
            await signup(formData.name, formData.email, formData.password);
            toast.success('Account created!');
            navigate('/');
        } catch (err) { toast.error(err.response?.data?.error || 'Signup failed'); }
        finally { setLoading(false); }
    };

    const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' };
    const fields = [
        { name: 'name', label: 'Name', type: 'text', icon: User, placeholder: 'Your name' },
        { name: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'Your email' },
        { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Create password' },
        { name: 'confirmPassword', label: 'Confirm Password', type: 'password', icon: Lock, placeholder: 'Confirm password' },
    ];

    return (
        <div className="page auth-page">
            <div className="container">
                <div className="auth-card glass-card">
                    <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#f9fafb', fontSize: '1.75rem', fontWeight: '700' }}>Create Account</h1>
                    <form onSubmit={handleSubmit}>
                        {fields.map(({ name, label, type, icon: Icon, placeholder }) => (
                            <div className="form-group" key={name}>
                                <label className="form-label">{label}</label>
                                <div style={{ position: 'relative' }}>
                                    <Icon size={18} style={iconStyle} />
                                    <input type={type} value={formData[name]} onChange={(e) => setFormData({ ...formData, [name]: e.target.value })} className="form-input" style={{ paddingLeft: '44px' }} placeholder={placeholder} disabled={loading} />
                                </div>
                            </div>
                        ))}
                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? 'Creating...' : <><UserPlus size={20} /> Create Account</>}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#9ca3af' }}>
                        Already have an account? <Link to="/login" style={{ color: '#a78bfa' }}>Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
