import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import "./Home.css";

function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedQuery = search.trim();
    const target = trimmedQuery ? `/resources?q=${encodeURIComponent(trimmedQuery)}` : "/resources";
    navigate(target);
  };

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <p className="home-eyebrow">Hunter College resource club</p>
            <h1>Find the support you need, fast.</h1>
            <p className="home-subtitle">
              Food, housing, mental health, financial aid and more, all in one place.
            </p>
          </div>

          <div className="home-stats">
            <div className="home-stat-card">
              <span>Free</span>
              <p>services</p>
            </div>
            <div className="home-stat-card">
              <span>40+</span>
              <p>resources</p>
            </div>
            <div className="home-stat-card">
              <span>6</span>
              <p>different categories</p>
            </div>
          </div>

          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSubmit={handleSearchSubmit}
            placeholder="search resources, programs services..."
            buttonLabel="search"
            formClassName="home-search"
            inputClassName="home-search-input"
            buttonClassName="home-search-button"
          />
        </div>
      </section>
    </main>
  );
}

export default Home;
