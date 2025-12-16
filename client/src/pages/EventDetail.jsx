import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Users, Tag, Edit, Trash2, UserPlus, UserMinus, ArrowLeft } from 'lucide-react';
import { eventApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rsvpStatus, setRsvpStatus] = useState({ isAttending: false, isCreator: false });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, rsvpRes] = await Promise.all([
                    eventApi.getEvent(id),
                    isAuthenticated ? eventApi.getRsvpStatus(id).catch(() => ({ data: {} })) : Promise.resolve({ data: {} })
                ]);
                setEvent(eventRes.data.event);
                setRsvpStatus(rsvpRes.data);
            } catch { toast.error('Event not found'); navigate('/'); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [id, isAuthenticated, navigate]);

    const handleRsvp = async (action) => {
        if (!isAuthenticated) return navigate('/login');
        setActionLoading(true);
        try {
            const { data } = action === 'join' ? await eventApi.joinEvent(id) : await eventApi.leaveEvent(id);
            setEvent(data.event);
            setRsvpStatus(prev => ({ ...prev, isAttending: action === 'join' }));
            toast.success(action === 'join' ? 'Joined!' : 'Left event');
        } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
        finally { setActionLoading(false); }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await eventApi.deleteEvent(id);
            toast.success('Deleted');
            navigate('/');
        } catch { toast.error('Delete failed'); }
    };

    if (loading) return <div className="page"><div className="container"><LoadingSpinner /></div></div>;
    if (!event) return <div className="page"><div className="container"><p>Not found</p></div></div>;

    const isPast = new Date(event.date) < new Date();
    const isFull = event.attendeeCount >= event.capacity;
    const capacityPercent = Math.min((event.attendeeCount / event.capacity) * 100, 100);

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '900px' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    {/* Event Image */}
                    {event.image ? (
                        <div style={{ height: '300px', overflow: 'hidden' }}>
                            <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ) : (
                        <div style={{ height: '200px', background: 'linear-gradient(135deg, #111118, #1a1a24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={60} style={{ color: '#6b7280' }} />
                        </div>
                    )}

                    {/* Event Content */}
                    <div style={{ padding: '2rem' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <span className="badge" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{event.category}</span>
                                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#f9fafb', margin: 0 }}>{event.title}</h1>
                            </div>
                            {rsvpStatus.isCreator && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link to={`/edit-event/${id}`} className="btn btn-secondary"><Edit size={18} /> Edit</Link>
                                    <button onClick={handleDelete} className="btn btn-danger"><Trash2 size={18} /></button>
                                </div>
                            )}
                        </div>

                        {/* Meta Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(17, 17, 24, 0.5)', borderRadius: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '0.5rem' }}>
                                    <Calendar size={20} style={{ color: '#8b5cf6' }} />
                                </div>
                                <span style={{ color: '#d1d5db' }}>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.2)', borderRadius: '0.5rem' }}>
                                    <Clock size={20} style={{ color: '#06b6d4' }} />
                                </div>
                                <span style={{ color: '#d1d5db' }}>{event.time}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(244, 114, 182, 0.2)', borderRadius: '0.5rem' }}>
                                    <MapPin size={20} style={{ color: '#f472b6' }} />
                                </div>
                                <span style={{ color: '#d1d5db' }}>{event.location}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem' }}>
                                    <Tag size={20} style={{ color: '#10b981' }} />
                                </div>
                                <span style={{ color: '#d1d5db', textTransform: 'capitalize' }}>{event.category}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f9fafb', marginBottom: '0.75rem' }}>About</h3>
                            <p style={{ color: '#9ca3af', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{event.description}</p>
                        </div>

                        {/* Capacity */}
                        <div style={{ padding: '1.5rem', background: 'rgba(17, 17, 24, 0.5)', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1d5db' }}>
                                    <Users size={18} /> Capacity
                                </span>
                                <span style={{ fontWeight: '600', color: '#f9fafb' }}>{event.attendeeCount} / {event.capacity}</span>
                            </div>
                            <div className="capacity-bar">
                                <div className="capacity-bar__fill" style={{ width: `${capacityPercent}%` }} />
                            </div>
                            {isFull && <p style={{ color: '#f87171', marginTop: '0.75rem', fontSize: '0.875rem' }}>⚠️ Event is full</p>}
                        </div>

                        {/* RSVP Button */}
                        {!rsvpStatus.isCreator && !isPast && (
                            <div style={{ marginBottom: '2rem' }}>
                                {rsvpStatus.isAttending ? (
                                    <button onClick={() => handleRsvp('leave')} className="btn btn-secondary btn-lg w-full" disabled={actionLoading}>
                                        <UserMinus size={20} /> {actionLoading ? 'Processing...' : 'Leave Event'}
                                    </button>
                                ) : (
                                    <button onClick={() => handleRsvp('join')} className="btn btn-primary btn-lg w-full" disabled={actionLoading || isFull}>
                                        <UserPlus size={20} /> {isFull ? 'Event Full' : actionLoading ? 'Processing...' : 'Join Event'}
                                    </button>
                                )}
                            </div>
                        )}

                        {isPast && (
                            <div className="badge badge-warning" style={{ marginBottom: '2rem' }}>
                                This event has ended
                            </div>
                        )}

                        {/* Attendees */}
                        {event.attendees?.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#f9fafb', marginBottom: '1rem' }}>
                                    Attendees ({event.attendees.length})
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {event.attendees.slice(0, 12).map(a => (
                                        <div key={a._id} className="avatar" title={a.name}>{a.name?.charAt(0).toUpperCase()}</div>
                                    ))}
                                    {event.attendees.length > 12 && (
                                        <span style={{ alignSelf: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                                            +{event.attendees.length - 12} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
