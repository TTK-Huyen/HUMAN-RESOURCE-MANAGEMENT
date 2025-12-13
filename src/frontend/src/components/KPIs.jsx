import React, { useMemo } from "react";
export default function KPIs({ pending, history }) {
const total = useMemo(() => history.length + pending.length, [pending, history]);
const approved = history.filter((x) => x.status === "approved").length;
const rejected = history.filter((x) => x.status === "rejected").length;
return (
<div className="kpis">
<div className="kpi vstack"><h3>Total requests (demo)</h3><strong>{total}</strong></div>
<div className="kpi vstack"><h3>Pending</h3><strong>{pending.length}</strong></div>
<div className="kpi vstack"><h3>Approved</h3><strong>{approved}</strong></div>
<div className="kpi vstack"><h3>Rejected</h3><strong>{rejected}</strong></div>
</div>
);
}