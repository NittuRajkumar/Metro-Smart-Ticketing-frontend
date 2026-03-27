const AUTH_API_URL = process.env.REACT_APP_API_URL || 'https://metro-smart-ticketing-backend.onrender.com/api/auth';
const METRO_API_URL = AUTH_API_URL.replace(/\/auth$/, '/metro');

const createHeaders = () => ({
  'Content-Type': 'application/json'
});

const request = async (path, options = {}) => {
  const response = await fetch(`${METRO_API_URL}${path}`, {
    ...options,
    headers: {
      ...createHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const getStations = () => request('/stations');

export const getFare = (payload) => request('/fare', {
  method: 'POST',
  body: JSON.stringify(payload)
});

export const bookTicket = (payload) => request('/book', {
  method: 'POST',
  body: JSON.stringify(payload)
});

export const payTicket = (payload) => request('/pay', {
  method: 'POST',
  body: JSON.stringify(payload)
});

export const getMyTickets = () => request('/my-tickets');

export const getTicket = (ticketId) => request(`/ticket/${ticketId}`);