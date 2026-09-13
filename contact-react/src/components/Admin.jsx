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

  console.log("USER ROLE:", userRole);
  console.log("IS ADMIN:", isAdmin);

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

        alert("Contact added successfully!");
      }

      clearForm();
      loadContacts();
    } catch (error) {
      console.error(error);
      setMessage("Unable to save contact");
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

    return (
      String(contact.id).includes(text) ||
      contact.name?.toLowerCase().includes(text) ||
      contact.email?.toLowerCase().includes(text) ||
      contact.message?.toLowerCase().includes(text) ||
      contact.status?.toLowerCase().includes(text)
    );
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
      <div className="admin-container">

        {/* Header */}
        <header className="dashboard-header">
          <div>
            <p className="welcome-text">
              {isAdmin ? "ADMIN DASHBOARD" : "USER DASHBOARD"}
            </p>

            <h1>Contact Management System</h1>

            <p className="header-subtitle">
              {isAdmin
                ? "Manage and monitor your customer contacts"
                : "View customer contacts"}
            </p>
          </div>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("jwt_token");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </header>

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

        {/* Add / Update Form - ADMIN ONLY */}
        {isAdmin && (
          <section className="card form-card">

            <div className="section-heading">

              <div>
                <p className="section-label">
                  {contactId ? "UPDATE CONTACT" : "NEW CONTACT"}
                </p>

                <h2>
                  {contactId ? "Update Contact" : "Add New Contact"}
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

        {/* Contacts */}
        <section className="card contacts-card">

          <div className="contacts-header">

            <div>
              <p className="section-label">
                CONTACT DIRECTORY
              </p>

              <h2>All Contacts</h2>
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
                            contact.status?.toLowerCase() || "pending"
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

        <footer className="dashboard-footer">
          Smart Contact Management System •{" "}
          {isAdmin ? "Admin Panel" : "User Panel"}
        </footer>

      </div>
    </div>
  );
}

export default Admin;