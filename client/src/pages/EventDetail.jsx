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
    if (!event) return <div className="page"><div className="container"><p>Event not found</p></div></div>;

    const isPast = new Date(event.date) < new Date();
    const isFull = event.attendeeCount >= event.capacity;
    const capacityPercent = Math.min((event.attendeeCount / event.capacity) * 100, 100);

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '900px' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    {event.image && <img src={event.image} alt={event.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />}

                    <div style={{ padding: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                            <div>
                                <span className="badge" style={{ marginBottom: 'var(--space-sm)' }}>{event.category}</span>
                                <h1>{event.title}</h1>
                            </div>
                            {rsvpStatus.isCreator && (
                                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                    <Link to={`/edit-event/${id}`} className="btn btn-secondary"><Edit size={18} /> Edit</Link>
                                    <button onClick={handleDelete} className="btn btn-danger"><Trash2 size={18} /></button>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                            {[
                                { icon: Calendar, label: format(new Date(event.date), 'EEEE, MMMM d, yyyy') },
                                { icon: Clock, label: event.time },
                                { icon: MapPin, label: event.location },
                                { icon: Tag, label: event.category },
                            ].map(({ icon: Icon, label }, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <Icon size={20} style={{ color: 'var(--color-primary)' }} />
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: 'var(--space-xl)' }}>
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>About</h3>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>
                        </div>

                        {/* Capacity */}
                        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                                <span><Users size={18} style={{ marginRight: '8px' }} />Capacity</span>
                                <span style={{ fontWeight: 600 }}>{event.attendeeCount} / {event.capacity}</span>
                            </div>
                            <div className="capacity-bar"><div className="capacity-bar__fill" style={{ width: `${capacityPercent}%` }} /></div>
                            {isFull && <p style={{ color: 'var(--color-error)', marginTop: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>Event is full</p>}
                        </div>

                        {/* RSVP Button */}
                        {!rsvpStatus.isCreator && !isPast && (
                            <div style={{ marginBottom: 'var(--space-xl)' }}>
                                {rsvpStatus.isAttending ? (
                                    <button onClick={() => handleRsvp('leave')} className="btn btn-secondary btn-lg w-full" disabled={actionLoading}>
                                        <UserMinus size={20} /> Leave Event
                                    </button>
                                ) : (
                                    <button onClick={() => handleRsvp('join')} className="btn btn-primary btn-lg w-full" disabled={actionLoading || isFull}>
                                        <UserPlus size={20} /> {isFull ? 'Event Full' : 'Join Event'}
                                    </button>
                                )}
                            </div>
                        )}

                        {isPast && <div className="badge badge-warning" style={{ display: 'inline-block' }}>This event has ended</div>}

                        {/* Attendees */}
                        {event.attendees?.length > 0 && (
                            <div>
                                <h3 style={{ marginBottom: 'var(--space-md)' }}>Attendees ({event.attendees.length})</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                                    {event.attendees.slice(0, 10).map(a => (
                                        <div key={a._id} className="avatar" title={a.name}>{a.name?.charAt(0).toUpperCase()}</div>
                                    ))}
                                    {event.attendees.length > 10 && <span style={{ alignSelf: 'center' }}>+{event.attendees.length - 10} more</span>}
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
