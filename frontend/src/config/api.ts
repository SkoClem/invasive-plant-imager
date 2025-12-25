export const getApiBaseUrl = () => {
  // In production, try to use the backend URL from environment
  if (process.env.NODE_ENV === 'production') {
    // If no backend URL is configured, show a helpful error
    if (!process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL.includes('localhost')) {
      console.warn('⚠️ Production backend URL not configured. Please set REACT_APP_API_URL environment variable.');
    }
    // Return configured URL or fallback (which might fail in prod if not set, but safer than localhost)
    return (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
  }
  
  // In development, prefer the environment variable if set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }

  // Development fallback: use current hostname + port 8000
  // This allows access from mobile devices on the same network (e.g. 192.168.x.x)
  // instead of forcing localhost which only works on the host machine
  return `http://${window.location.hostname}:8000`;
};

export const API_BASE_URL = getApiBaseUrl();
