import React from "react";

export default function Table({ columns, data, emptyText = "No data" }) {
return (
<div className="card">
<table className="table">
<thead>
  <tr>
    {columns.map((c) => (
      <th 
        key={c.key || c.title}
        // 👇 ADD THIS LINE TO GET WIDTH 👇
        style={c.width ? { width: c.width } : {}} 
        className={c.className || ""}
      >
        {c.title}
      </th>
    ))}
  </tr>
</thead>
<tbody>
{data.length === 0 ? (
<tr><td colSpan={columns.length} style={{ color: "#64748b", padding: 24, textAlign: "center" }}>{emptyText}</td></tr>
) : (
data.map((row) => (
<tr key={row.id ?? row.TransactionId ?? row.transactionId}>
{columns.map((c) => (<td key={c.key || c.title}>{c.render ? c.render(row) : row[c.dataIndex]}</td>))}
</tr>
))
)}
</tbody>
</table>
</div>
);
}