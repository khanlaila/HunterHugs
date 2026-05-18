import { useMemo, useState } from "react";
import "./Profile.css";

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "Not provided";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not provided";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function readUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function valueOrFallback(value) {
  return value && String(value).trim() ? value : "Not provided";
}

const Profile = () => {
  const user = useMemo(() => readUser(), []);
  const profile = user?.profile || {};
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({
    campus: valueOrFallback(profile.campus) === "Not provided" ? "" : profile.campus,
    enrollmentStatus:
      valueOrFallback(profile.enrollmentStatus) === "Not provided" ? "" : profile.enrollmentStatus,
    address: valueOrFallback(profile.address) === "Not provided" ? "" : profile.address,
    citizenshipStatus:
      valueOrFallback(profile.citizenshipStatus) === "Not provided" ? "" : profile.citizenshipStatus,
    estimatedIncome:
      valueOrFallback(profile.estimatedIncome) === "Not provided" ? "" : String(profile.estimatedIncome),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditableProfile((prev) => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-banner" />
        <div className="profile-info">
          <h2>Profile unavailable</h2>
          <p>Sign in to view your profile details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-banner">
        <div className="profile-avatar">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
            alt="Profile"
          />
        </div>
        <button className="edit-profile-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>
      </div>

      <div className="profile-info">
        <h2>
          {valueOrFallback(user.fullName)} <span className="pronouns">{valueOrFallback(user.email)}</span>
        </h2>
      </div>

      <div className="profile-details">
        <div className="academic-info">
          <table>
            <tbody>
              <tr>
                <td>Student ID</td>
                <td>:</td>
                <td>{valueOrFallback(profile.studentId)}</td>
              </tr>
              <tr>
                <td>Campus</td>
                <td>:</td>
                <td>
                  {isEditing ? (
                    <input name="campus" value={editableProfile.campus} onChange={handleChange} />
                  ) : (
                    valueOrFallback(profile.campus)
                  )}
                </td>
              </tr>
              <tr>
                <td>Enrollment</td>
                <td>:</td>
                <td>
                  {isEditing ? (
                    <input
                      name="enrollmentStatus"
                      value={editableProfile.enrollmentStatus}
                      onChange={handleChange}
                    />
                  ) : (
                    valueOrFallback(profile.enrollmentStatus)
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="personal-details">
          <h3>Personal Details</h3>
          <div className="detail-row">
            <label>Address:</label>
            {isEditing ? (
              <input name="address" value={editableProfile.address} onChange={handleChange} />
            ) : (
              <span>{valueOrFallback(profile.address)}</span>
            )}
          </div>
          <div className="detail-row">
            <label>Citizenship Status:</label>
            {isEditing ? (
              <input
                name="citizenshipStatus"
                value={editableProfile.citizenshipStatus}
                onChange={handleChange}
              />
            ) : (
              <span>{valueOrFallback(profile.citizenshipStatus)}</span>
            )}
          </div>
          <div className="detail-row">
            <label>Estimated Income:</label>
            {isEditing ? (
              <input name="estimatedIncome" value={editableProfile.estimatedIncome} onChange={handleChange} />
            ) : (
              <span>{formatCurrency(profile.estimatedIncome)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;