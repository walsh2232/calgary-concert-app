/**
 * api.js
 * Simple wrapper around Axios to communicate with the backend.
 */

import axios from 'axios';

// Point this to your actual backend URL
const BASE_URL = 'http://localhost:4000';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true // so session cookies are included
});
