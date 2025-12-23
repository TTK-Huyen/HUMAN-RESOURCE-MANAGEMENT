import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNotifications, getUnreadCount, markRead } from "../Services/notifications";

export default function NotificationBell({
  userId,
  employeeStatusPath = "/employee/status", // EMP sẽ nhảy về đây
}) {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const [unread, setUnread] = useState(0);

  const role = (localStorage.getItem("role") || "").toUpperCase(); // EMP / HR / MANAGER

  const load = async () => {
    if (!userId) return;
    try {
      const [list, c] = await Promise.all([
        getNotifications(userId),
        getUnreadCount(userId),
      ]);
      setItems(Array.isArray(list) ? list : []);
      setUnread(typeof c === "number" ? c : 0);
    } catch (e) {
      setItems([]);
      setUnread(0);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const toggle = async () => {
    if (!open) await load();

    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const width = 340;
      const top = rect.top - 8;
      const left = Math.min(
        window.innerWidth - width - 12,
        Math.max(12, rect.right - width)
      );
      setPos({ top, left });
    }

    setOpen((v) => !v);
  };

  const handleClickNotification = async (n) => {
    try {
      // 1) mark read nếu chưa đọc
      if (n?.isRead === false && n?.id) {
        await markRead(userId, n.id);
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
        setUnread((u) => Math.max(0, u - 1));
      }

      setOpen(false);

      // 2) Điều hướng theo role
      // MANAGER: phát event để PendingApprovals mở DetailModal (giống bấm con mắt)
      if (role === "MANAGER") {
        window.dispatchEvent(
          new CustomEvent("notification:openRequest", {
            detail: {
              requestId: n?.requestId,
              requestType: n?.requestType,
              notificationId: n?.id,
            },
          })
        );
        return;
      }

      // EMP: nhảy qua trang status (có thể dùng state để trang status biết mở gì)
      if (role === "EMP") {
        navigate(employeeStatusPath, {
          state: {
            fromNotification: {
              requestId: n?.requestId,
              requestType: n?.requestType,
              eventType: n?.eventType,
            },
          },
        });
        return;
      }

      // HR (nếu có): tạm thời cũng về trang status như EMP (bạn đổi route nếu muốn)
      navigate(employeeStatusPath);
    } catch (e) {
      // nếu lỗi mark read vẫn cho phép điều hướng
      setOpen(false);
      if (role === "MANAGER") {
        window.dispatchEvent(
          new CustomEvent("notification:openRequest", {
            detail: { requestId: n?.requestId, requestType: n?.requestType },
          })
        );
      } else {
        navigate(employeeStatusPath);
      }
    }
  };

  const dropdown = open ? (
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: 340,
        maxHeight: 360,
        overflow: "auto",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        zIndex: 999999,
        transform: "translateY(-100%)",
      }}
    >
      <div style={{ padding: 10, borderBottom: "1px solid #e2e8f0", fontWeight: 700 }}>
        Notifications
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 12, color: "#64748b" }}>Không có thông báo</div>
      ) : (
        items.slice(0, 20).map((n, idx) => (
          <div
            key={n.id ?? n.eventId ?? idx}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => handleClickNotification(n)}
            style={{
              padding: 10,
              borderBottom: "1px solid #f1f5f9",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: n.isRead ? 600 : 800 }}>
              {n.eventType} {n.requestType ? `• ${n.requestType}` : ""}
            </div>
            <div style={{ fontSize: 13, color: "#334155", marginTop: 4 }}>
              {n.message}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
              {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
              {!n.isRead && <span style={{ marginLeft: 8, fontWeight: 700 }}>• UNREAD</span>}
            </div>
          </div>
        ))
      )}
    </div>
  ) : null;

  return (
    <div ref={ref} style={{ position: "relative", marginLeft: 8 }}>
      <button
        onClick={toggle}
        title="Thông báo"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#94a3b8",
          position: "relative",
          padding: 6,
          borderRadius: 8,
        }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 999,
              background: "#ef4444",
              color: "white",
              fontSize: 10,
              lineHeight: "16px",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
}
