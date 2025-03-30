const BASE_URL = import.meta.env.VITE_API_URL;

export const request = async ({
  endpoint,
  method = "GET",
  body,
  contentType = "application/json",
  onSuccess,
  onFailure,
}) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  if (contentType === "application/json") {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      if (response.status === 401 && !window.location.pathname.includes("authentication")) {
        window.location.href = "/authentication/login";
        return;
      }

      const { message } = await response.json();
      throw new Error(message);
    }

    const data = await response.json();
    onSuccess(data);
  } catch (error) {
    if (error instanceof Error) {
      onFailure(error.message);
    } else {
      onFailure("An error occurred. Please try again later.");
    }
  }
};
