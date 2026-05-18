import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
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
function formatCitizenshipStatus(value) {
  if (!value || !String(value).trim()) return "Not provided";
  return String(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const Profile = () => {
  const [user, setUser] = useState(() => readUser());
  const [profileLoadError, setProfileLoadError] = useState("");
  const rawProfile = user?.profile || {};
  const profile = {
    studentId: rawProfile.studentId ?? user?.studentId ?? "",
    campus: rawProfile.campus ?? user?.campus ?? "",
    major: rawProfile.major ?? rawProfile.fieldOfStudy ?? rawProfile.program ?? user?.major ?? "",
    enrollmentStatus: rawProfile.enrollmentStatus ?? user?.enrollmentStatus ?? "",
    address:
      rawProfile.address ??
      rawProfile.homeAddress ??
      rawProfile.streetAddress ??
      user?.address ??
      user?.homeAddress ??
      "",
    citizenshipStatus:
      rawProfile.citizenshipStatus ??
      rawProfile.citizenship ??
      user?.citizenshipStatus ??
      user?.citizenship ??
      "",
    estimatedIncome:
      rawProfile.estimatedIncome ??
      rawProfile.salary ??
      rawProfile.income ??
      user?.estimatedIncome ??
      user?.salary ??
      user?.income ??
      "",
  };
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
  useEffect(() => {
    const token = localStorage.getItem("token");
    const cachedUser = readUser();
    const fallbackEmail = cachedUser?.email || user?.email || "";
    if (!token) return;

    let isMounted = true;
    async function loadCurrentUser() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/me?email=${encodeURIComponent(fallbackEmail)}`,
          {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          }
        );
        if (!response.ok) {
          setProfileLoadError("Could not refresh profile data from server.");
          return;
        }
        const data = await response.json();
        if (!isMounted || !data?.user) return;
        const nextUser = data.user;
        const nextProfile = nextUser.profile || {};
        setProfileLoadError("");
        setUser(nextUser);
        localStorage.setItem("user", JSON.stringify(nextUser));
        setEditableProfile((prev) => ({
          ...prev,
          campus: nextProfile.campus || "",
          enrollmentStatus: nextProfile.enrollmentStatus || "",
          address: nextProfile.address || nextProfile.homeAddress || nextProfile.streetAddress || "",
          citizenshipStatus: nextProfile.citizenshipStatus || nextProfile.citizenship || "",
          estimatedIncome:
            nextProfile.estimatedIncome === undefined || nextProfile.estimatedIncome === null
              ? nextProfile.salary === undefined || nextProfile.salary === null
                ? ""
                : String(nextProfile.salary)
              : String(nextProfile.estimatedIncome),
        }));
      } catch {
        setProfileLoadError("Could not refresh profile data from server.");
      }
    }
    loadCurrentUser();
    return () => {
      isMounted = false;
    };
  }, []);

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
        {profileLoadError ? <p>{profileLoadError}</p> : null}
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
              <tr>
                <td>Major</td>
                <td>:</td>
                <td>{valueOrFallback(profile.major)}</td>
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
              <span>{formatCitizenshipStatus(profile.citizenshipStatus)}</span>
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