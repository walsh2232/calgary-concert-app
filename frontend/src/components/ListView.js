import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

function ListView() {
  const [chosenConcerts, setChosenConcerts] = useState([]);

  useEffect(() => {
    // Mock logic: in a real app, fetch user’s saved favorites from backend
    // For now, let's retrieve all for demonstration
    api.get('/concerts')
      .then(res => {
        // Sort by date/time (assuming date/time is easily sortable or stored in ISO)
        const sorted = res.data.sort((a, b) => (a.date > b.date ? 1 : -1));
        setChosenConcerts(sorted);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>My Chosen Concerts (Sorted by Date)</h2>
      <ul>
        {chosenConcerts.map(concert => (
          <li key={concert.id}>
            {concert.date} {concert.time} - {concert.artist} @ {concert.venue}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListView;
