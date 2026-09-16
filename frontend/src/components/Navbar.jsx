import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">📖 Attendance Tracker</div>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Dashboard
        </NavLink>
        <NavLink to="/students" className={({ isActive }) => (isActive ? 'active' : '')}>
          Students
        </NavLink>
        <NavLink to="/lectures" className={({ isActive }) => (isActive ? 'active' : '')}>
          Lectures
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
          Reports
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;