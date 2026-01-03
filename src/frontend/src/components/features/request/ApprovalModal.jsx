// import React, { useEffect, useState } from "react";
// // import Modal from "./Modal";
// import StatusBadge from "./StatusBadge";
// // import Field from "./Field";
// export default function ApprovalModal({ open, row, onClose, onAction }) {
// const [note, setNote] = useState("");
// useEffect(() => { setNote(""); }, [row]);
// if (!open || !row) return null;
// const approve = () => onAction(row, "approved", note);
// const reject = () => { if (!note.trim()) { alert("Please provide a rejection reason"); return; } onAction(row, "rejected", note); };
// return (
// <Modal open={open} title={`Request ${row.id}`} onClose={onClose} footer={(<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn danger" onClick={reject}>Reject</button><button className="btn ok" onClick={approve}>Approve</button></>)}>
// <div className="vstack" style={{ gap: 14 }}>
// <div className="hstack" style={{ gap: 28, flexWrap: "wrap" }}>
// <Field label="ID" value={row.id} />
// <Field label="Type" value={row.type} />
// <Field label="Employee" value={row.employee} />
// <Field label="Department" value={row.dept} />
// </div>
// <div className="hstack" style={{ gap: 28, flexWrap: "wrap" }}>
// <Field label="Submitted" value={row.submitted} />
// <Field label="Effective date" value={row.applyDate} />
// <Field label="Approver" value={row.approver} />
// <div className="vstack" style={{ minWidth: 240 }}>
// <span style={{ fontSize: 12, color: "#64748b" }}>Status</span>
// <StatusBadge status={row.status} />
// </div>
// </div>
// <div className="vstack"><span style={{ fontSize: 12, color: "#64748b" }}>Details</span><div className="card" style={{ padding: 12 }}>{row.details}</div></div>
// <div className="vstack"><span style={{ fontSize: 12, color: "#64748b" }}>Notes (optional for approve, required for reject)</span><textarea className="textarea" rows={4} placeholder="Enter note / reason" value={note} onChange={(e) => setNote(e.target.value)} /></div>
// </div>
// </Modal>
// );
// }