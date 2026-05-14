import React, { useState } from "react";
import "./Profile.css";
const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
      name: "Albert Einstein",
      pronouns: "He/Him",
      major: "Mathematics, Physics",
      grade: "Alumni",
      age: "76",
      studentId: "1234566789",
      address: "",
      isNYResident: "Y",
      estimatedIncome: "",
    });
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
      };
      return (
        <div className="profile-container">
          <div className="profile-banner">
            <div className="profile-avatar">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg" alt="Profile" />
            </div>
            <button className="edit-profile-btn" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
    
          <div className="profile-info">
            <h2>{profile.name} <span className="pronouns">{profile.pronouns}</span></h2>
          </div>
    
          <div className="profile-details">
            <div className="academic-info">
              <table>
                <tbody>
                  <tr><td>Major</td><td>:</td><td>{isEditing ? <input name="major" value={profile.major} onChange={handleChange} /> : profile.major}</td></tr>
                  <tr><td>Grade</td><td>:</td><td>{isEditing ? <input name="grade" value={profile.grade} onChange={handleChange} /> : profile.grade}</td></tr>
                  <tr><td>Age</td><td>:</td><td>{isEditing ? <input name="age" value={profile.age} onChange={handleChange} /> : profile.age}</td></tr>
                  <tr><td>Student ID</td><td>:</td><td>{isEditing ? <input name="studentId" value={profile.studentId} onChange={handleChange} /> : profile.studentId}</td></tr>
                </tbody>
              </table>
            </div>
    
            <div className="personal-details">
              <h3>Personal Details</h3>
              <div className="detail-row">
                <label>Address:</label>
                {isEditing ? <input name="address" value={profile.address} onChange={handleChange} /> : <span>{profile.address || "Not provided"}</span>}
              </div>
              <div className="detail-row">
                <label>Are you a New York Resident? (Y/N)</label>
                {isEditing ? <input name="isNYResident" value={profile.isNYResident} onChange={handleChange} /> : <span>{profile.isNYResident}</span>}
              </div>
              <div className="detail-row">
                <label>Estimated Income:</label>
                {isEditing ? <input name="estimatedIncome" value={profile.estimatedIncome} onChange={handleChange} /> : <span>{profile.estimatedIncome || "Not provided"}</span>}
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    export default Profile;