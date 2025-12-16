import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Users, Calendar, Ticket, TrendingUp, Trash2, Shield, ShieldOff, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [userPage, setUserPage] = useState(1);
    const [eventPage, setEventPage] = useState(1);
    const [userPages, setUserPages] = useState(1);
    const [eventPages, setEventPages] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user?.role !== 'admin') { toast.error('Access denied'); navigate('/'); return; }
        fetchStats();
    }, [user, navigate]);

    useEffect(() => {
        if (tab === 'users') fetchUsers();
        else if (tab === 'events') fetchEvents();
    }, [tab, userPage, eventPage]);

    const fetchStats = async () => {
        try { const { data } = await adminApi.getStats(); setStats(data.stats); }
        catch { toast.error('Failed to load stats'); }
        finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try { const { data } = await adminApi.getUsers({ page: userPage, limit: 10, search }); setUsers(data.users); setUserPages(data.pagination.pages); }
        catch { toast.error('Failed'); }
        finally { setLoading(false); }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try { const { data } = await adminApi.getEvents({ page: eventPage, limit: 10, search }); setEvents(data.events); setEventPages(data.pagination.pages); }
        catch { toast.error('Failed'); }
        finally { setLoading(false); }
    };

    const handleAction = async (action, id, name) => {
        if (action === 'deleteUser' && !window.confirm(`Delete user "${name}"?`)) return;
        if (action === 'deleteEvent' && !window.confirm(`Delete event "${name}"?`)) return;
        setActionLoading(id);
        try {
            if (action === 'deleteUser') { await adminApi.deleteUser(id); fetchUsers(); fetchStats(); }
            else if (action === 'deleteEvent') { await adminApi.deleteEvent(id); fetchEvents(); fetchStats(); }
            else if (action === 'toggleRole') { await adminApi.updateUserRole(id, name === 'admin' ? 'user' : 'admin'); fetchUsers(); }
            toast.success('Done');
        } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
        finally { setActionLoading(null); }
    };

    if (!user || user.role !== 'admin') return <div className="page"><div className="container"><LoadingSpinner /></div></div>;

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: `${color}33`, borderRadius: '0.75rem', color }}><Icon size={24} /></div>
            <div><p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>{value}</p><p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{label}</p></div>
        </div>
    );

    const thStyle = { padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', color: '#9ca3af', background: '#1a1a24' };
    const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.875rem' };

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f9fafb' }}><Shield size={32} style={{ color: '#8b5cf6' }} /> Admin Dashboard</h1>
                    <p style={{ color: '#9ca3af' }}>Manage users, events, and platform activity</p>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {[{ k: 'stats', icon: TrendingUp, l: 'Overview' }, { k: 'users', icon: Users, l: 'Users' }, { k: 'events', icon: Calendar, l: 'Events' }].map(t => (
                        <button key={t.k} className={`tab ${tab === t.k ? 'active' : ''}`} onClick={() => setTab(t.k)}><t.icon size={18} style={{ marginRight: '8px' }} />{t.l}</button>
                    ))}
                </div>

                {/* Stats Tab */}
                {tab === 'stats' && (loading ? <LoadingSpinner /> : stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="#8b5cf6" />
                        <StatCard icon={Calendar} label="Total Events" value={stats.totalEvents} color="#06b6d4" />
                        <StatCard icon={Ticket} label="Total RSVPs" value={stats.totalRsvps} color="#f472b6" />
                        <StatCard icon={TrendingUp} label="Upcoming" value={stats.upcomingEvents} color="#10b981" />
                    </div>
                ))}

                {/* Users Tab */}
                {tab === 'users' && (
                    <>
                        <form onSubmit={(e) => { e.preventDefault(); setUserPage(1); fetchUsers(); }} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
                                <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: '44px' }} />
                            </div>
                            <button type="submit" className="btn btn-primary">Search</button>
                        </form>
                        {loading ? <LoadingSpinner /> : (
                            <div className="glass-card" style={{ overflow: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr>{['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                <td style={tdStyle}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><div className="avatar avatar-sm">{u.name?.charAt(0).toUpperCase()}</div>{u.name}</div></td>
                                                <td style={tdStyle}>{u.email}</td>
                                                <td style={tdStyle}><span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-success'}`}>{u.role}</span></td>
                                                <td style={tdStyle}>{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                                                <td style={tdStyle}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleAction('toggleRole', u._id, u.role)} className="btn btn-secondary btn-sm" disabled={actionLoading === u._id || u._id === user.id}>{u.role === 'admin' ? <ShieldOff size={16} /> : <Shield size={16} />}</button>
                                                        <button onClick={() => handleAction('deleteUser', u._id, u.name)} className="btn btn-danger btn-sm" disabled={actionLoading === u._id || u._id === user.id}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {userPages > 1 && <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem', alignItems: 'center' }}>
                            <button onClick={() => setUserPage(p => p - 1)} disabled={userPage === 1} className="btn btn-secondary btn-sm"><ChevronLeft size={18} /></button>
                            <span style={{ color: '#9ca3af' }}>Page {userPage} of {userPages}</span>
                            <button onClick={() => setUserPage(p => p + 1)} disabled={userPage === userPages} className="btn btn-secondary btn-sm"><ChevronRight size={18} /></button>
                        </div>}
                    </>
                )}

                {/* Events Tab */}
                {tab === 'events' && (
                    <>
                        <form onSubmit={(e) => { e.preventDefault(); setEventPage(1); fetchEvents(); }} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
                                <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: '44px' }} />
                            </div>
                            <button type="submit" className="btn btn-primary">Search</button>
                        </form>
                        {loading ? <LoadingSpinner /> : (
                            <div className="glass-card" style={{ overflow: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr>{['Event', 'Creator', 'Date', 'Attendees', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {events.map(e => (
                                            <tr key={e._id} style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                <td style={tdStyle}><Link to={`/event/${e._id}`} style={{ color: '#a78bfa', fontWeight: 500 }}>{e.title}</Link></td>
                                                <td style={tdStyle}>{e.creator?.name || 'Unknown'}</td>
                                                <td style={tdStyle}><span className={`badge ${new Date(e.date) < new Date() ? 'badge-warning' : 'badge-success'}`}>{format(new Date(e.date), 'MMM d, yyyy')}</span></td>
                                                <td style={tdStyle}>{e.attendeeCount} / {e.capacity}</td>
                                                <td style={tdStyle}><button onClick={() => handleAction('deleteEvent', e._id, e.title)} className="btn btn-danger btn-sm" disabled={actionLoading === e._id}><Trash2 size={16} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {eventPages > 1 && <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem', alignItems: 'center' }}>
                            <button onClick={() => setEventPage(p => p - 1)} disabled={eventPage === 1} className="btn btn-secondary btn-sm"><ChevronLeft size={18} /></button>
                            <span style={{ color: '#9ca3af' }}>Page {eventPage} of {eventPages}</span>
                            <button onClick={() => setEventPage(p => p + 1)} disabled={eventPage === eventPages} className="btn btn-secondary btn-sm"><ChevronRight size={18} /></button>
                        </div>}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
