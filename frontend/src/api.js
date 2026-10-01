// =========================================================
// HRMS API CONFIGURATION
// =========================================================

const API_BASE_URL = "http://localhost:8000";


// =========================================================
// API FETCH
// =========================================================

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_BASE_URL}${cleanEndpoint}`;


  // =======================================================
  // HEADERS
  // =======================================================

  const headers = {
    ...(options.headers || {}),
  };


  // Add JSON content type only when body exists
  if (options.body !== undefined && options.body !== null) {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
  }


  // =======================================================
  // AUTHORIZATION
  // =======================================================

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }


  // =======================================================
  // REQUEST
  // =======================================================

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("API Network Error:", error);
    console.error("Request URL:", url);

    throw new TypeError(
      `Unable to connect to backend: ${url}`
    );
  }


  // =======================================================
  // RESPONSE TEXT
  // =======================================================

  const responseText = await response.text();

  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }


  // =======================================================
  // ERROR HANDLING
  // =======================================================

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    if (typeof data === "string" && data.trim()) {
      errorMessage = data;
    } else if (data?.detail) {
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            return (
              item?.msg ||
              JSON.stringify(item)
            );
          })
          .join(", ");
      } else {
        errorMessage = String(data.detail);
      }
    } else if (data?.message) {
      errorMessage = String(data.message);
    }

    const error = new Error(errorMessage);

    error.status = response.status;
    error.data = data;

    throw error;
  }


  // =======================================================
  // RETURN
  // =======================================================

  return data;
}


export default apiFetch;