import React from 'react';
import AdminNavbar from '../components/AdminNavbar';

export default function AdminPage() {
  return (
    <div>
      <AdminNavbar />
      <main style={{ padding: 20 }}>
        <h1>Admin Dashboard</h1>
        <p>Welcome! This is the admin section.</p>
      </main>
    </div>
  );
}
