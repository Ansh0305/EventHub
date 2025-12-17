
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const EventCard = ({ event }) => {
    const capacityPercent = Math.min((event.attendeeCount / event.capacity) * 100, 100);

    return (
        <Link to={`/event/${event._id}`} className="event-card">
            <div className="event-card__image">
                {event.image ? <img src={event.image} alt={event.title} /> : <div className="event-card__placeholder"><Calendar size={40} /></div>}
                <span className="event-card__category">{event.category}</span>
            </div>
            <div className="event-card__content">
                <h3 className="event-card__title">{event.title}</h3>
                <div className="event-card__meta">
                    <span><Calendar size={14} /> {format(new Date(event.date), 'MMM d, yyyy')}</span>
                    <span><Clock size={14} /> {event.time}</span>
                </div>
                <p className="event-card__location"><MapPin size={14} /> {event.location}</p>
                <div className="event-card__footer">
                    <div className="event-card__capacity">
                        <span><Users size={14} /> {event.attendeeCount}/{event.capacity}</span>
                        <div className="capacity-bar"><div className="capacity-bar__fill" style={{ width: `${capacityPercent}%` }} /></div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;
