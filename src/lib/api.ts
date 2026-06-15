/**
 * A resilient wrapper around the global fetch API that implements automatic retries
 * upon encountering transient network errors or timeouts.
 *
 * @param url The resource URL to fetch
 * @param options Request options
 * @param retries Number of retry attempts remaining
 * @param delay Milliseconds to wait before the next attempt (increases exponentially)
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      console.warn(`Fetch failed for ${url}. Retrying in ${delay}ms...`, err);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw err;
  }
}
