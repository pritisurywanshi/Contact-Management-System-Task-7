import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();

  const token = localStorage.getItem("jwt_token");

  let userRole = "";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userRole = payload.role;
    } catch (error) {
      console.error("Invalid token");
    }
  }

  const isAdmin = userRole === "ADMIN";

  // =========================
  // STATES
  // =========================

  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [contactId, setContactId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [messageText, setMessageText] = useState("");

  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [activeMenu, setActiveMenu] = useState("dashboard");

  // =========================
  // LOAD CONTACTS
  // =========================

  useEffect(() => {
    loadContacts();
  }, [page]);

  const loadContacts = async () => {
    try {
      const response = await api.get(
        `/contacts?page=${page}&size=${size}&sortBy=id&direction=asc`
      );

      const data = response.data;

      setContacts(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load contacts");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("jwt_token");
    navigate("/login");
  };

  // =========================
  // SAVE / UPDATE CONTACT
  // =========================

  const saveContact = async () => {
  if (name.trim() === "") {
    alert("Name is required");
    return;
  }

  if (email.trim() === "") {
    alert("Email is required");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    alert("Enter valid email");
    return;
  }

  const contact = {
    name,
    email,
    message: messageText,
  };

  try {
    if (contactId !== "") {
      await api.put(`/contacts/${contactId}`, contact);
      alert("Contact updated successfully!");
    } else {
      await api.post("/submit", contact);
      alert("Contact submitted successfully!");
    }

    clearForm();
    loadContacts();

  } catch (error) {
    console.error("Save Contact Error:", error);

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response:", error.response.data);

      setMessage(
        error.response.data?.message ||
        `Unable to save contact (${error.response.status})`
      );
    } else {
      setMessage("Unable to connect to server");
    }
  }
};

  // =========================
  // EDIT CONTACT
  // =========================

  const editContact = async (id) => {
    try {
      const response = await api.get(`/contacts/${id}`);
      const contact = response.data;

      setContactId(contact.id);
      setName(contact.name);
      setEmail(contact.email);
      setMessageText(contact.message || "");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(error);
      setMessage("Unable to load contact");
    }
  };

  // =========================
  // DELETE CONTACT
  // =========================

  const deleteContact = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await api.delete(`/contacts/${id}`);

      alert(response.data || "Contact deleted successfully!");

      loadContacts();
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete contact");
    }
  };

  const resolveContact = async (id) => {
  try {
    await api.put(`/contacts/${id}/status?status=RESOLVED`);

    alert("Contact resolved successfully!");

    loadContacts();
  } catch (error) {
    console.error(error);
    setMessage("Unable to resolve contact");
  }
};

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setContactId("");
    setName("");
    setEmail("");
    setMessageText("");
    setMessage("");
  };

  // =========================
  // MENU HANDLERS
  // =========================

  const openDashboard = () => {
    setActiveMenu("dashboard");
    setSearch("");
    setPage(0);
    clearForm();
  };

  const openMyContacts = () => {
    setActiveMenu("contacts");
    setSearch("");
    setPage(0);
  };

  const openPendingRequests = () => {
  setActiveMenu("pending");
  setSearch("");
  setPage(0);
};

const openResolvedRequests = () => {
  setActiveMenu("resolved");
  setSearch("");
  setPage(0);
};

  // =========================
  // PAGINATION
  // =========================

  const previousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const nextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredContacts = contacts.filter((contact) => {
  const text = search.toLowerCase();

  const matchesSearch =
    String(contact.id).includes(text) ||
    contact.name?.toLowerCase().includes(text) ||
    contact.email?.toLowerCase().includes(text) ||
    contact.message?.toLowerCase().includes(text) ||
    contact.status?.toLowerCase().includes(text);

  if (activeMenu === "pending") {
    return (
      contact.status?.toUpperCase() === "PENDING" &&
      matchesSearch
    );
  }

  if (activeMenu === "resolved") {
    return (
      contact.status?.toUpperCase() === "RESOLVED" &&
      matchesSearch
    );
  }

  return matchesSearch;
});

  // =========================
  // STATISTICS
  // =========================

  const totalContacts = contacts.length;

  const pendingContacts = contacts.filter(
    (contact) => contact.status?.toUpperCase() === "PENDING"
  ).length;

  const resolvedContacts = contacts.filter(
    (contact) => contact.status?.toUpperCase() === "RESOLVED"
  ).length;

  // =========================
  // UI
  // =========================

  return (
    <div className="admin-page">
      <div className="app-layout">

        {/* ================= SIDEBAR ================= */}

        <aside className="sidebar">

          {/* Logo */}

          <div className="sidebar-logo">
            <div className="logo-icon">CM</div>

            <div className="logo-text">
              <h2>Contact Management System</h2>
              <span>Smart Contact Platform</span>
            </div>
          </div>

          {/* User Profile */}

          <div className="sidebar-user">
            <div className="user-avatar">
              {isAdmin ? "A" : "U"}
            </div>

            <div className="user-info">
              <h4>{isAdmin ? "Administrator" : "User"}</h4>

              <span>
                {isAdmin ? "Admin Account" : "User Account"}
              </span>
            </div>
          </div>

          {/* Navigation */}

          <nav className="sidebar-menu">

            {/* Dashboard */}

            <button
              className={`menu-item ${
                activeMenu === "dashboard" ? "active" : ""
              }`}
              onClick={openDashboard}
            >
              <span className="menu-icon">▦</span>
              <span>Dashboard</span>
            </button>

            {/* Contacts */}

            <button
              className={`menu-item ${
                activeMenu === "contacts" ? "active" : ""
              }`}
              onClick={openMyContacts}
            >
              <span className="menu-icon">👥</span>
              <span>{isAdmin ? "All Contacts" : "My Contacts"}</span>
            </button>

            {!isAdmin && (
  <button
    className={`menu-item ${
      activeMenu === "submit" ? "active" : ""
    }`}
    onClick={() => {
      setActiveMenu("submit");
      setSearch("");
      clearForm();
    }}
  >
    <span className="menu-icon">✉️</span>
    <span>Submit Contact</span>
  </button>
)}

            {/* File Upload */}

            <button
              className="menu-item"
              onClick={() => navigate("/upload")}
            >
              <span className="menu-icon">📁</span>
              <span>File Upload</span>
            </button>

            {/* Admin Only Menu */}

            {isAdmin && (
              <>
                <div className="menu-section-title">
                  ADMINISTRATION
                </div>

                <button
                  className={`menu-item ${
                    activeMenu === "pending" ? "active" : ""
                  }`}
                  onClick={openPendingRequests}
                >
                  <span className="menu-icon">⏳</span>
                  <span>Pending Requests</span>
                </button>

                <button
                  className={`menu-item ${
                    activeMenu === "resolved" ? "active" : ""
                  }`}
                  onClick={openResolvedRequests}
                >
                  <span className="menu-icon">✅</span>
                  <span>Resolved Requests</span>
                </button>
              </>
            )}
          </nav>

          {/* Logout */}

          <div className="sidebar-bottom">
            <button
              className="menu-item logout-menu"
              onClick={logout}
            >
              <span className="menu-icon">↪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}

        <main className="main-content">

          {/* Header */}

          <header className="dashboard-header">
            <div>
              <p className="welcome-text">
                {isAdmin ? "ADMIN DASHBOARD" : "USER DASHBOARD"}
              </p>

              <h1>
                {activeMenu === "pending"
                  ? "Pending Requests"
                  : activeMenu === "resolved"
                  ? "Resolved Requests"
                  : activeMenu === "contacts"
                  ? isAdmin
                    ? "All Contacts"
                    : "My Contacts"
                  : "Dashboard"}
              </h1>

              <p className="header-subtitle">
                {isAdmin
                  ? "Manage and monitor your contacts from one place."
                  : "View and manage your contacts easily."}
              </p>
            </div>

            
          </header>

          {/* ================= DASHBOARD OVERVIEW ================= */}

          {activeMenu === "dashboard" && (
            <>
              <section className="dashboard-overview">

                <div className="card overview-card">
                  <h2>
                    {isAdmin
                      ? "Welcome to Admin Dashboard"
                      : "Welcome to Your Dashboard"}
                  </h2>

                  <p>
                    {isAdmin
                      ? "Here you can manage all contacts, monitor requests, and control the contact management system."
                      : "Here you can access your contact information and upload files easily."}
                  </p>
                </div>

                

              </section>

              {/* Statistics */}

              <div className="stats-grid">

                <div className="stat-card">
                  <div className="stat-icon">👥</div>

                  <div>
                    <p>Total Contacts</p>
                    <h2>{totalContacts}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⏳</div>

                  <div>
                    <p>Pending</p>
                    <h2>{pendingContacts}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✓</div>

                  <div>
                    <p>Resolved</p>
                    <h2>{resolvedContacts}</h2>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ================= ADMIN ADD / UPDATE FORM ================= */}
{activeMenu === "submit" && !isAdmin && (
  <section className="card form-card">

    <div className="section-heading">
      <div>
        <p className="section-label">CONTACT REQUEST</p>
        <h2>Submit Contact</h2>
      </div>
    </div>

    <div className="form-grid">

      <div className="form-group">
        <label>Name</label>

        <input
          type="text"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Email</label>

        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

    </div>

    <div className="form-group">
      <label>Message</label>

      <textarea
        placeholder="Enter your message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        rows="4"
      />
    </div>

    <div className="form-actions">

      <button
        className="primary-btn"
        onClick={saveContact}
      >
        Submit Contact
      </button>

      <button
        className="secondary-btn"
        onClick={clearForm}
      >
        Clear
      </button>

    </div>

    {message && (
      <p className="error-message">
        {message}
      </p>
    )}

  </section>
)}
          {isAdmin && activeMenu === "contacts" && (
            <section className="card form-card">

              <div className="section-heading">
                <div>
                  <p className="section-label">
                    {contactId ? "UPDATE CONTACT" : "NEW CONTACT"}
                  </p>

                  <h2>
                    {contactId
                      ? "Update Contact"
                      : "Add New Contact"}
                  </h2>
                </div>

                {contactId && (
                  <button
                    className="cancel-btn"
                    onClick={clearForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label>Name</label>

                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

              </div>

              <div className="form-group">
                <label>Message</label>

                <textarea
                  placeholder="Enter contact message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows="4"
                />
              </div>

              <div className="form-actions">

                <button
                  className="primary-btn"
                  onClick={saveContact}
                >
                  {contactId ? "Update Contact" : "Save Contact"}
                </button>

                <button
                  className="secondary-btn"
                  onClick={clearForm}
                >
                  Clear
                </button>

              </div>

              {message && (
                <p className="error-message">
                  {message}
                </p>
              )}

            </section>
          )}

          {/* ================= CONTACTS SECTION ================= */}

          {(activeMenu === "contacts" ||
            activeMenu === "pending" ||
            activeMenu === "resolved") && (
            <section className="card contacts-card">

              <div className="contacts-header">

                <div>
                  <p className="section-label">
                    CONTACT DIRECTORY
                  </p>

                  <h2>
                    {activeMenu === "pending"
                      ? "Pending Requests"
                      : activeMenu === "resolved"
                      ? "Resolved Requests"
                      : isAdmin
                      ? "All Contacts"
                      : "My Contacts"}
                  </h2>
                </div>

                <div className="search-box">
                  <span>🔍</span>

                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

              </div>

              <div className="table-wrapper">
                <table>

                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>CONTACT</th>
                      <th>EMAIL</th>
                      <th>MESSAGE</th>
                      <th>STATUS</th>

                      {isAdmin && <th>ACTIONS</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredContacts.length > 0 ? (
                      filteredContacts.map((contact) => (
                        <tr key={contact.id}>

                          <td>
                            <span className="contact-id">
                              #{contact.id}
                            </span>
                          </td>

                          <td>
                            <div className="contact-name">
                              {contact.name}
                            </div>
                          </td>

                          <td>
                            <span className="email-text">
                              {contact.email}
                            </span>
                          </td>

                          <td>
                            <span className="message-text">
                              {contact.message || "-"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                contact.status?.toLowerCase() ||
                                "pending"
                              }`}
                            >
                              {contact.status || "PENDING"}
                            </span>
                          </td>

                          {isAdmin && (
                            <td>
                              <div className="action-buttons">

                                <button
                                  className="edit-btn"
                                  onClick={() =>
                                    editContact(contact.id)
                                  }
                                >
                                  Edit
                                </button>

                                {contact.status?.toUpperCase() === "PENDING" && (
  <button
    className="resolve-btn"
    onClick={() => resolveContact(contact.id)}
  >
    Resolve
  </button>
)}

                                <button
                                  className="delete-btn"
                                  onClick={() =>
                                    deleteContact(contact.id)
                                  }
                                >
                                  Delete
                                </button>

                              </div>
                            </td>
                          )}

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={isAdmin ? 6 : 5}
                          className="empty-state"
                        >
                          No contacts found
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>

              {/* Pagination */}

              <div className="pagination">

                <button
                  onClick={previousPage}
                  disabled={page === 0}
                >
                  ← Previous
                </button>

                <div className="page-number">
                  Page <strong>{page + 1}</strong>

                  {totalPages > 0 && (
                    <>
                      {" "}of{" "}
                      <strong>{totalPages}</strong>
                    </>
                  )}
                </div>

                <button
                  onClick={nextPage}
                  disabled={page >= totalPages - 1}
                >
                  Next →
                </button>

              </div>

            </section>
          )}

          {/* ================= FOOTER ================= */}

          <footer className="dashboard-footer">
            Smart Contact Management System •{" "}
            {isAdmin ? "Admin Panel" : "User Panel"}
          </footer>

        </main>
      </div>
    </div>
  );
}

export default Admin;