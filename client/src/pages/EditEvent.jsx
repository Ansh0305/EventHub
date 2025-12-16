import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Type, AlignLeft, Calendar, Clock, MapPin, Users, Tag, Save, ArrowLeft } from 'lucide-react';
import { eventApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';

const categories = [
    { value: 'conference', label: 'Conference' }, { value: 'workshop', label: 'Workshop' },
    { value: 'meetup', label: 'Meetup' }, { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' }, { value: 'music', label: 'Music' }, { value: 'other', label: 'Other' },
];

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({ title: '', description: '', date: '', time: '', location: '', capacity: '', category: 'meetup' });
    const [currentImage, setCurrentImage] = useState(null);
    const [newImage, setNewImage] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await eventApi.getEvent(id);
                if (data.event.creator?._id !== user?.id) {
                    toast.error('Not authorized');
                    return navigate('/');
                }
                const e = data.event;
                setFormData({
                    title: e.title, description: e.description,
                    date: new Date(e.date).toISOString().split('T')[0],
                    time: e.time, location: e.location, capacity: e.capacity.toString(), category: e.category,
                });
                setCurrentImage(e.image);
            } catch { toast.error('Failed to load'); navigate('/'); }
            finally { setLoading(false); }
        };
        fetchEvent();
    }, [id, user, navigate]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: null }));
    };

    const validate = () => {
        const e = {};
        if (!formData.title.trim()) e.title = 'Required';
        if (!formData.description.trim()) e.description = 'Required';
        if (!formData.date) e.date = 'Required';
        if (!formData.time) e.time = 'Required';
        if (!formData.location.trim()) e.location = 'Required';
        if (!formData.capacity || parseInt(formData.capacity) < 1) e.capacity = 'Min 1';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([k, v]) => data.append(k, v));
            if (newImage) data.append('image', newImage);
            await eventApi.updateEvent(id, data);
            toast.success('Event updated!');
            navigate(`/event/${id}`);
        } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="page"><div className="container"><LoadingSpinner text="Loading..." /></div></div>;

    const iconBoxStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '2rem', color: '#f9fafb' }}>Edit Event</h1>

                    <form onSubmit={handleSubmit}>
                        {/* Image Upload */}
                        <div className="form-group">
                            <label className="form-label">Event Image</label>
                            <ImageUpload
                                image={currentImage}
                                onImageChange={(f) => { setNewImage(f); setCurrentImage(URL.createObjectURL(f)); }}
                                onImageRemove={() => { setNewImage(null); setCurrentImage(null); }}
                            />
                        </div>

                        {/* Title */}
                        <div className="form-group">
                            <label className="form-label">Title *</label>
                            <div style={{ position: 'relative' }}>
                                <Type size={18} style={iconBoxStyle} />
                                <input name="title" type="text" value={formData.title} onChange={handleChange} className="form-input" style={{ paddingLeft: '44px' }} placeholder="Event title" disabled={saving} />
                            </div>
                            {errors.title && <p className="form-error">{errors.title}</p>}
                        </div>

                        {/* Location */}
                        <div className="form-group">
                            <label className="form-label">Location *</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} style={iconBoxStyle} />
                                <input name="location" type="text" value={formData.location} onChange={handleChange} className="form-input" style={{ paddingLeft: '44px' }} placeholder="Event location" disabled={saving} />
                            </div>
                            {errors.location && <p className="form-error">{errors.location}</p>}
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <div style={{ position: 'relative' }}>
                                <AlignLeft size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: '#8b5cf6' }} />
                                <textarea name="description" value={formData.description} onChange={handleChange} className="form-input form-textarea" style={{ paddingLeft: '44px' }} rows={4} placeholder="Describe your event..." disabled={saving} />
                            </div>
                            {errors.description && <p className="form-error">{errors.description}</p>}
                        </div>

                        {/* Date & Time */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} style={iconBoxStyle} />
                                    <input name="date" type="date" value={formData.date} onChange={handleChange} className="form-input" style={{ paddingLeft: '44px' }} disabled={saving} />
                                </div>
                                {errors.date && <p className="form-error">{errors.date}</p>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Time *</label>
                                <div style={{ position: 'relative' }}>
                                    <Clock size={18} style={iconBoxStyle} />
                                    <input name="time" type="time" value={formData.time} onChange={handleChange} className="form-input" style={{ paddingLeft: '44px' }} disabled={saving} />
                                </div>
                                {errors.time && <p className="form-error">{errors.time}</p>}
                            </div>
                        </div>

                        {/* Capacity & Category */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Capacity *</label>
                                <div style={{ position: 'relative' }}>
                                    <Users size={18} style={iconBoxStyle} />
                                    <input name="capacity" type="number" min="1" value={formData.capacity} onChange={handleChange} className="form-input" style={{ paddingLeft: '44px' }} placeholder="50" disabled={saving} />
                                </div>
                                {errors.capacity && <p className="form-error">{errors.capacity}</p>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <div style={{ position: 'relative' }}>
                                    <Tag size={18} style={iconBoxStyle} />
                                    <select name="category" value={formData.category} onChange={handleChange} className="form-input form-select" style={{ paddingLeft: '44px' }} disabled={saving}>
                                        {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={saving} style={{ marginTop: '1.5rem' }}>
                            {saving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditEvent;
