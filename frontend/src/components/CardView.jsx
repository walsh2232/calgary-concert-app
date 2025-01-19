import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

function CardView() {
  const [concerts, setConcerts] = useState([]);

  useEffect(() => {
    api.get('/concerts')
      .then(res => setConcerts(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
      {concerts.map(concert => (
        <div key={concert.id} style={{ border: '1px solid #ccc', padding: '1rem', width: '250px' }}>
          <img src={concert.imageUrl} alt={concert.artist} style={{ width: '100%', height: 'auto' }} />
          <h3>{concert.artist}</h3>
          <p><strong>Venue:</strong> {concert.venue}</p>
          <p><strong>Date/Time:</strong> {concert.date} {concert.time}</p>
          {concert.genre && <p><strong>Genre:</strong> {concert.genre}</p>}
          {concert.price && <p><strong>Price:</strong> ${concert.price}</p>}
          {/* Button to "favorite" this concert, etc. */}
        </div>
      ))}
    </div>
  );
}

export default CardView;
