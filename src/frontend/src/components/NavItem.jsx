import React from "react";
import { Link, useLocation } from "react-router-dom";
export default function NavItem({ to, label }) { const { pathname } = useLocation(); const active = pathname === to || pathname.startsWith(to + "/"); return <Link to={to} className={active ? "active" : ""}>{label}</Link>; }