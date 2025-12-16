import { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { eventApi } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const categories = ['all', 'conference', 'workshop', 'meetup', 'social', 'sports', 'music', 'other'];

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    useEffect(() => { fetchEvents(); }, [category]);

    const fetchEvents = async (searchQuery = '') => {
        setLoading(true);
        try {
            const { data } = await eventApi.getEvents({ search: searchQuery, category: category !== 'all' ? category : '' });
            setEvents(data.events);
        } catch { console.error('Failed to fetch events'); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); fetchEvents(search); };

    return (
        <div className="page">
            <div className="container">
                <section className="hero">
                    <h1 className="hero__title">Discover Amazing Events</h1>
                    <p className="hero__subtitle">Find and join events happening around you</p>
                    <form onSubmit={handleSearch} className="search-bar" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <Search size={20} className="search-bar__icon" />
                        <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-bar__input" />
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                </section>

                <div className="filter-bar">
                    {categories.map((cat) => (
                        <button key={cat} className={`filter-btn ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? <LoadingSpinner text="Loading events..." /> : events.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon"><Calendar size={80} /></div>
                        <h3>No events found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="event-grid">{events.map((event) => <EventCard key={event._id} event={event} />)}</div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
