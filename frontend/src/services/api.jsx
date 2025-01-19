/**
 * api.js
 * Simple wrapper around Axios to communicate with the backend.
 */

import axios from 'axios';

// Point this to your actual backend URL
const BASE_URL = 'https://calgary-concert-app.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true // so session cookies are included
});
