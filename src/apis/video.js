const BASE_URL = "http://localhost:5000/api/videos";

export async function toggleLike() {
  try {
    const response = await fetch("http://localhost:5000/api/videos/likevideo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const message = await response.json();
    return message;
  } catch (error) {
    console.error(error);
  }
}
