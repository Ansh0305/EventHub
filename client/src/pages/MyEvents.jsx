import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, LayoutDashboard, Ticket } from 'lucide-react';
import { eventApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MyEvents = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('created');
    const [created, setCreated] = useState([]);
    const [attending, setAttending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [c, a] = await Promise.all([eventApi.getMyEvents(), eventApi.getAttendingEvents()]);
                setCreated(c.data.events);
                setAttending(a.data.events);
            } catch { console.error('Error'); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const events = tab === 'created' ? created : attending;

    if (loading) return <div className="page"><div className="container"><LoadingSpinner text="Loading..." /></div></div>;

    return (
        <div className="page">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    <div><h1>My Events</h1><p style={{ color: 'var(--color-text-muted)' }}>Welcome, {user?.name}!</p></div>
                    <Link to="/create-event" className="btn btn-primary"><Plus size={18} /> Create Event</Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                    <div className="glass-card" style={{ padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <div style={{ padding: 'var(--space-md)', background: 'rgba(139, 92, 246, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}><LayoutDashboard size={24} /></div>
                        <div><p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{created.length}</p><p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Created</p></div>
                    </div>
                    <div className="glass-card" style={{ padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <div style={{ padding: 'var(--space-md)', background: 'rgba(6, 182, 212, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--color-secondary)' }}><Ticket size={24} /></div>
                        <div><p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{attending.length}</p><p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Attending</p></div>
                    </div>
                </div>

                <div className="tabs">
                    <button className={`tab ${tab === 'created' ? 'active' : ''}`} onClick={() => setTab('created')}><LayoutDashboard size={18} style={{ marginRight: '8px' }} />Created ({created.length})</button>
                    <button className={`tab ${tab === 'attending' ? 'active' : ''}`} onClick={() => setTab('attending')}><Ticket size={18} style={{ marginRight: '8px' }} />Attending ({attending.length})</button>
                </div>

                {events.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={80} style={{ opacity: 0.3, marginBottom: 'var(--space-lg)' }} />
                        <h3>{tab === 'created' ? "No events created" : "Not attending any events"}</h3>
                        <Link to={tab === 'created' ? '/create-event' : '/'} className="btn btn-primary">{tab === 'created' ? <><Plus size={18} /> Create Event</> : 'Browse Events'}</Link>
                    </div>
                ) : (
                    <div className="event-grid">{events.map(e => <EventCard key={e._id} event={e} />)}</div>
                )}
            </div>
        </div>
    );
};

export default MyEvents;
