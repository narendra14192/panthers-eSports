/**
 * Panthers Esports Backend API Client
 * Configured to connect to Render backend in production and localhost:5069 in development.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'https://panthers-esports-api.onrender.com' 
    : 'http://localhost:5069'
);

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export const api = {
  getTournaments: () => fetchApi('/api/Tournaments'),
  getTournament: (id) => fetchApi(`/api/Tournaments/${id}`),
  getSlots: (tournamentId) => fetchApi(`/api/Tournaments/${tournamentId}/slots`),
  bookSlot: (tournamentId, slotData) => fetchApi(`/api/Tournaments/${tournamentId}/slots/book`, {
    method: 'POST',
    body: JSON.stringify(slotData),
  }),
  getLeaderboard: (tournamentId) => fetchApi(tournamentId ? `/api/Leaderboard?tournamentId=${tournamentId}` : '/api/Leaderboard'),
  checkHealth: () => fetchApi('/health'),
};

export default api;
