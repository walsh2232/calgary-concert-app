import React, { useState } from 'react';
import { api } from '../services/api';

function AdminPage() {
  const [artist, setArtist] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');

  const handleAddConcert = (e) => {
    e.preventDefault();
    api.post('/admin/concerts', { artist, venue, date, time, genre, price, imageUrl })
      .then(res => setMessage('Concert added successfully!'))
      .catch(err => setMessage('Error adding concert.'));
  };

  return (
    <div>
      <h2>Admin - Add a Concert</h2>
      <form onSubmit={handleAddConcert}>
        <label>Artist: <input value={artist} onChange={e => setArtist(e.target.value)} /></label><br />
        <label>Venue: <input value={venue} onChange={e => setVenue(e.target.value)} /></label><br />
        <label>Date: <input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><br />
        <label>Time: <input type="time" value={time} onChange={e => setTime(e.target.value)} /></label><br />
        <label>Genre: <input value={genre} onChange={e => setGenre(e.target.value)} /></label><br />
        <label>Price: <input type="number" value={price} onChange={e => setPrice(e.target.value)} /></label><br />
        <label>Image URL: <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} /></label><br />
        <button type="submit">Add Concert</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default AdminPage;
