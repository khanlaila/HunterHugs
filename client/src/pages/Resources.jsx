import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import resourcesData from "../data/resources.json";
import "./Resources.css";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeUrl(url) {
  if (!url) {
    return "";
  }

  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function normalizeResources(items) {
  return items.map((item, index) => {
    const category = item.Category || "Uncategorized";
    const url = normalizeUrl(item.URL);

    return {
      id: `${item.Name || "resource"}-${index}`,
      name: item.Name || "Unnamed Resource",
      category,
      categorySlug: slugify(category),
      campus: item.Campus || "N/A",
      hours: item.Hours || "Contact office for hours",
      eligibility: item.Eligibility || "Eligibility details not listed.",
      requiredDocs: item["Required Docs"] || "Not listed",
      url,
    };
  });
}

function matchesQuery(resource, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    resource.name,
    resource.category,
    resource.campus,
    resource.hours,
    resource.eligibility,
    resource.requiredDocs,
    resource.url,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}
function getTextSizeClass(value) {
  const length = String(value || "").trim().length;
  if (length > 220) return "text-size-xs";
  if (length > 140) return "text-size-sm";
  if (length > 90) return "text-size-md";
  return "text-size-base";
}
function getTitleSizeClass(value) {
  const length = String(value || "").trim().length;
  if (length > 60) return "title-size-xs";
  if (length > 40) return "title-size-sm";
  if (length > 24) return "title-size-md";
  return "title-size-base";
}

function Resources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(() => searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const resources = useMemo(() => normalizeResources(resourcesData), []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(resources.map((item) => item.category))).sort(
      (a, b) => a.localeCompare(b)
    );

    return [
      { label: "All Resources", value: "all" },
      ...uniqueCategories.map((category) => ({
        label: category,
        value: slugify(category),
      })),
    ];
  }, [resources]);

  useEffect(() => {
    setSearchText(searchParams.get("q") || "");
  }, [searchParams]);

  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => selectedCategory === "all" || resource.categorySlug === selectedCategory)
      .filter((resource) => matchesQuery(resource, searchText));
  }, [resources, searchText, selectedCategory]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedQuery = searchText.trim();

    if (trimmedQuery) {
      setSearchParams({ q: trimmedQuery });
    } else {
      setSearchParams({});
    }
  };


  return (
    <main className="resources-page">
      <section className="resources-hero">
        <div className="resources-hero-copy">
          <p className="resources-eyebrow">HunterHugs resource library</p>
          <h1>Find support services that match your needs.</h1>
          <p className="resources-subtitle">
            Browse the resource list, filter by category, and search across campus, eligibility,
            hours, and required documents.
          </p>
        </div>

        <div className="resources-search-shell">
          <SearchBar
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onSubmit={handleSearchSubmit}
            placeholder="Search by name, campus, eligibility, or document"
            buttonLabel="Search"
            formClassName="resources-search"
            inputClassName="resources-search-input"
            buttonClassName="resources-search-button"
          />
        </div>
      </section>

      <section className="resources-toolbar" aria-label="Resource filters">
        <div className="category-chips">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              className={`category-chip ${selectedCategory === category.value ? "active" : ""}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <p className="results-count">
          Showing {filteredResources.length} of {resources.length} resources
        </p>
      </section>

      {filteredResources.length > 0 ? (
        <section className="resources-grid">
          {filteredResources.map((resource) => (
            <article key={resource.id} className="resource-card">
              <div className="resource-card-header">
                <p className="resource-category">{titleCase(resource.category)}</p>
                <h2 className={`resource-title ${getTitleSizeClass(resource.name)}`}>{resource.name}</h2>
              </div>

              <div className="resource-badges">
                <span className="resource-campus-pill">{resource.campus}</span>
              </div>

              <dl className="resource-details">
                <div>
                  <dt>Hours</dt>
                  <dd className={getTextSizeClass(resource.hours)}>{resource.hours}</dd>
                </div>
                <div>
                  <dt>Eligibility</dt>
                  <dd className={`${getTextSizeClass(resource.eligibility)} eligibility-text`}>
                    {resource.eligibility}
                  </dd>
                </div>
                <div>
                  <dt>Required Docs</dt>
                  <dd className={getTextSizeClass(resource.requiredDocs)}>{resource.requiredDocs}</dd>
                </div>
              </dl>

              <div className="resource-card-footer">
                <a href={resource.url} target="_blank" rel="noreferrer">
                  Visit resource
                </a>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="empty-state">
          <h2>No resources found</h2>
          <p>Try a different search term or switch to another category.</p>
        </div>
      )}
    </main>
  );
}

export default Resources;
