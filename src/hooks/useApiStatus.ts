import { useState, useEffect } from "react";

type Status = "online" | "offline" | "checking";

export function useApiStatus(baseUrl: string, token: string, intervalMs = 30000) {
  const [status, setStatus] = useState<Status>("checking");

  const check = async () => {
    if (!token || !baseUrl) {
      setStatus("offline");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/chatbots`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      setStatus(res.ok ? "online" : "offline");
    } catch {
      setStatus("offline");
    }
  };

  useEffect(() => {
    setStatus("checking");
    check();
    const interval = setInterval(check, intervalMs);
    return () => clearInterval(interval);
  }, [baseUrl, token]);

  return status;
}