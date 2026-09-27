export const fetchWithFallback = async (path: string, options?: RequestInit) => {
  const localUrl = `http://localhost:9000${path}`;
  const prodUrl = `https://phone-lost-and-found.vercel.app${path}`;

  // If running in production / deployed domains, use production Vercel backend directly
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return fetch(prodUrl, options);
  }

  // On localhost, attempt local express server first (1.5s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const localOptions = { ...(options || {}), signal: controller.signal };
    
    const response = await fetch(localUrl, localOptions);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    // If local server is not running or timed out, immediately use production backend
    return fetch(prodUrl, options);
  }
};
