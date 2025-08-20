import { toast } from "react-toastify";

export function handleOpenAIError(err) {
  if (err.response) {
    const { status } = err.response;
    switch (status) {
      case 200:
        toast.success("✅ API call successful (200 OK)");
        break;
      case 401:
        toast.error("❌ Invalid API Key (401 Unauthorized). Please check your credentials.");
        break;
      case 429:
        toast.error("⚠️ Rate limit exceeded (429). Slow down your requests.");
        break;
      case 500:
        toast.error("🚨 Server error (500). OpenAI servers are experiencing issues.");
        break;
      default:
        toast.error(`Unexpected error (${status})`);
    }
  } else if (err.request) {
    toast.error("❌ No response received from the server. Check your internet connection.");
  } else {
    toast.error(`⚠️ Request failed: ${err.message}`);
  }
}
