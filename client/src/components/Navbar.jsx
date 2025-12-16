import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Menu, X, Plus, LogOut, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="navbar">
                <div className="container navbar__container">
                    <Link to="/" className="navbar__brand">
                        <span className="navbar__brand-icon"><Calendar size={20} /></span>
                        EventHub
                    </Link>

                    <div className="navbar__nav">
                        <Link to="/" className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}>Events</Link>
                        {isAuthenticated && <Link to="/my-events" className={`navbar__link ${isActive('/my-events') ? 'navbar__link--active' : ''}`}>My Events</Link>}
                    </div>

                    <div className="navbar__actions">
                        {isAuthenticated ? (
                            <>
                                <Link to="/create-event" className="btn btn-primary btn-sm hide-mobile"><Plus size={18} /> Create</Link>
                                {user?.role === 'admin' && <Link to="/admin" className="btn btn-secondary btn-sm hide-mobile" title="Admin"><Shield size={18} /></Link>}
                                <div className="avatar hide-mobile" title={user?.name}>{user?.name?.charAt(0).toUpperCase()}</div>
                                <button onClick={handleLogout} className="btn btn-secondary btn-sm hide-mobile"><LogOut size={18} /></button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary btn-sm hide-mobile">Login</Link>
                                <Link to="/signup" className="btn btn-primary btn-sm hide-mobile">Sign Up</Link>
                            </>
                        )}
                        <button className="navbar__menu-btn" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
                    </div>
                </div>
            </nav>

            <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
                <nav className="mobile-menu__nav">
                    <Link to="/" className="mobile-menu__link" onClick={() => setMenuOpen(false)}>Events</Link>
                    {isAuthenticated ? (
                        <>
                            <Link to="/my-events" className="mobile-menu__link" onClick={() => setMenuOpen(false)}><LayoutDashboard size={20} /> My Events</Link>
                            <Link to="/create-event" className="mobile-menu__link" onClick={() => setMenuOpen(false)}><Plus size={20} /> Create Event</Link>
                            {user?.role === 'admin' && <Link to="/admin" className="mobile-menu__link" onClick={() => setMenuOpen(false)}><Shield size={20} /> Admin</Link>}
                            <button onClick={handleLogout} className="mobile-menu__link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}><LogOut size={20} /> Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-menu__link" onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link to="/signup" className="mobile-menu__link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                        </>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Navbar;
