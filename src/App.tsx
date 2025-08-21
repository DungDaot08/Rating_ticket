import { useEffect, useState } from "react";

interface TicketFeedbackInfo {
  ticket_number: number;
  status: string;
  finished_at: string;
  can_rate: boolean;
  rating: string | null;
  feedback: string | null;
}

interface TicketRatingUpdate {
  rating: "satisfied" | "neutral" | "needs_improvement";
  feedback?: string;
}

function App() {
  const [ticketInfo, setTicketInfo] = useState<TicketFeedbackInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<TicketRatingUpdate["rating"] | null>(null);
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");

  const API_BASE = "https://detect-seat-we21.onrender.com/app/tickets";

  // lấy query param từ URL
  const params = new URLSearchParams(window.location.search);
  const ticketNumber = params.get("ticket_number");
  const tenxa = params.get("tenxa");

  const fetchTicketInfo = async () => {
    if (!ticketNumber || !tenxa) {
      setMessage("Thiếu thông tin vé.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${ticketNumber}/feedback?tenxa=${tenxa}`);
      if (!res.ok) throw new Error("Không tìm thấy vé hoặc vé chưa hoàn tất");
      const data = await res.json();
      setTicketInfo(data);
      setMessage("");
    } catch (err: any) {
      setMessage(err.message);
      setTicketInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!ticketNumber || !tenxa || !rating) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${ticketNumber}/feedback?tenxa=${tenxa}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback }),
      });
      if (!res.ok) throw new Error("Gửi đánh giá thất bại");
      const data = await res.json();
      setMessage("Đã gửi đánh giá thành công!");
      setTicketInfo(data);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketInfo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Đánh giá dịch vụ</h1>

        {loading && <p>Đang tải...</p>}

        {ticketInfo && (
          <div>
            <p>
              Vé số: <b>{ticketInfo.ticket_number}</b>
            </p>
            <p>Trạng thái: {ticketInfo.status}</p>
            <p>
              Hoàn tất lúc:{" "}
              {new Date(ticketInfo.finished_at).toLocaleString("vi-VN")}
            </p>

            {ticketInfo.can_rate ? (
              <div className="mt-4">
                <p className="font-semibold mb-2">Bạn cảm thấy thế nào?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRating("satisfied")}
                    className={`px-3 py-2 rounded-lg border ${
                      rating === "satisfied" ? "bg-green-500 text-white" : ""
                    }`}
                  >
                    Hài lòng
                  </button>
                  <button
                    onClick={() => setRating("neutral")}
                    className={`px-3 py-2 rounded-lg border ${
                      rating === "neutral" ? "bg-yellow-400 text-white" : ""
                    }`}
                  >
                    Bình thường
                  </button>
                  <button
                    onClick={() => setRating("needs_improvement")}
                    className={`px-3 py-2 rounded-lg border ${
                      rating === "needs_improvement"
                        ? "bg-red-500 text-white"
                        : ""
                    }`}
                  >
                    Cần cải thiện
                  </button>
                </div>

                <textarea
                  placeholder="Ý kiến thêm..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full border rounded-lg p-2 mt-3"
                />

                <button
                  onClick={submitFeedback}
                  disabled={loading || !rating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-3 w-full"
                >
                  Gửi đánh giá
                </button>
              </div>
            ) : (
              <p className="mt-3 text-gray-600">
                {ticketInfo.rating
                  ? `Bạn đã đánh giá: ${ticketInfo.rating}`
                  : "Đã hết hạn đánh giá."}
              </p>
            )}
          </div>
        )}

        {message && <p className="mt-3 text-red-500">{message}</p>}
      </div>
    </div>
  );
}

export default App;
