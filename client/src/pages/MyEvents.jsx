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
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ color: '#f9fafb', marginBottom: '0.25rem' }}>My Events</h1>
                        <p style={{ color: '#9ca3af' }}>Welcome, {user?.name}!</p>
                    </div>
                    <Link to="/create-event" className="btn btn-primary"><Plus size={18} /> Create Event</Link>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '0.75rem', color: '#8b5cf6' }}><LayoutDashboard size={24} /></div>
                        <div><p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>{created.length}</p><p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Created</p></div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(6, 182, 212, 0.2)', borderRadius: '0.75rem', color: '#06b6d4' }}><Ticket size={24} /></div>
                        <div><p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>{attending.length}</p><p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Attending</p></div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button className={`tab ${tab === 'created' ? 'active' : ''}`} onClick={() => setTab('created')}><LayoutDashboard size={18} style={{ marginRight: '8px' }} />Created ({created.length})</button>
                    <button className={`tab ${tab === 'attending' ? 'active' : ''}`} onClick={() => setTab('attending')}><Ticket size={18} style={{ marginRight: '8px' }} />Attending ({attending.length})</button>
                </div>

                {/* Events */}
                {events.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={80} style={{ opacity: 0.3, marginBottom: '1.5rem', color: '#6b7280' }} />
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
