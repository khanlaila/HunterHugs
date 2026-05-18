import React, { useMemo, useState } from "react";
import "./Roadmap.css";

const ROADMAP_STORAGE_KEY = "hunterHugsRoadmap";

function getSavedRoadmap() {
  try {
    return JSON.parse(localStorage.getItem(ROADMAP_STORAGE_KEY) || "[]");
  } catch (error) {
    console.error("Failed to read roadmap from localStorage:", error);
    return [];
  }
}

function saveRoadmap(roadmapItems) {
  localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(roadmapItems));
}

function formatDate(dateString) {
  if (!dateString) {
    return "No due date";
  }

  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getProgress(tasks) {
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  return Math.round((completedCount / tasks.length) * 100);
}

const Roadmap = () => {
  const [roadmapItems, setRoadmapItems] = useState(getSavedRoadmap);

  const upcomingTasks = useMemo(() => {
    return roadmapItems
      .flatMap((item) =>
        item.tasks.map((task) => ({
          ...task,
          resourceName: item.resourceName,
          category: item.category,
        }))
      )
      .filter((task) => !task.completed)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 6);
  }, [roadmapItems]);

  const toggleTask = (roadmapItemId, taskId) => {
    const updatedRoadmap = roadmapItems.map((item) => {
      if (item.id !== roadmapItemId) {
        return item;
      }

      return {
        ...item,
        tasks: item.tasks.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          return {
            ...task,
            completed: !task.completed,
          };
        }),
      };
    });

    setRoadmapItems(updatedRoadmap);
    saveRoadmap(updatedRoadmap);
  };

  const removeRoadmapItem = (roadmapItemId) => {
    const updatedRoadmap = roadmapItems.filter(
      (item) => item.id !== roadmapItemId
    );

    setRoadmapItems(updatedRoadmap);
    saveRoadmap(updatedRoadmap);
  };

  const clearRoadmap = () => {
    setRoadmapItems([]);
    saveRoadmap([]);
  };

  return (
    <div className="roadmap-page">
      <section className="roadmap-main">
        <div className="roadmap-heading">
          <p className="roadmap-eyebrow">HunterHugs Roadmap</p>
          <h1>Your Roadmap</h1>
          <p>
            Keep track of the next steps for the resources you added from the
            eligibility engine.
          </p>
        </div>

        {roadmapItems.length === 0 ? (
          <div className="roadmap-empty-state">
            <h2>No roadmap items yet</h2>
            <p>
              Go to the Eligibility Engine, find your recommended resources, and
              click Add to Roadmap.
            </p>
          </div>
        ) : (
          <>
            <div className="roadmap-toolbar">
              <p>
                You have <strong>{roadmapItems.length}</strong> resource
                roadmap{roadmapItems.length === 1 ? "" : "s"}.
              </p>

              <button
                type="button"
                className="clear-roadmap-btn"
                onClick={clearRoadmap}
              >
                Clear Roadmap
              </button>
            </div>

            <div className="roadmap-list">
              {roadmapItems.map((item) => {
                const progress = getProgress(item.tasks);

                return (
                  <article className="roadmap-card" key={item.id}>
                    <div className="roadmap-card-header">
                      <div>
                        <span className="roadmap-category">{item.category}</span>
                        <h2>{item.resourceName}</h2>
                        <p>{item.location}</p>
                      </div>

                      <button
                        type="button"
                        className="remove-roadmap-btn"
                        onClick={() => removeRoadmapItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="progress-row">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span>{progress}% complete</span>
                    </div>

                    <div className="task-list">
                      {item.tasks.map((task) => (
                        <label
                          className={`task-item ${
                            task.completed ? "task-completed" : ""
                          }`}
                          key={task.id}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(item.id, task.id)}
                          />

                          <div>
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <span>Due: {formatDate(task.dueDate)}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    {item.sourceUrl && (
                      <a
                        className="roadmap-resource-link"
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View resource
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <aside className="deadline-panel">
        <div className="deadline-header">
          <h2>Upcoming Deadlines</h2>
          <p>Tasks from your roadmap sorted by due date.</p>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="deadline-empty">
            <p>No upcoming tasks yet.</p>
          </div>
        ) : (
          <div className="deadline-list">
            {upcomingTasks.map((task) => (
              <div className="deadline-card" key={task.id}>
                <span>{formatDate(task.dueDate)}</span>
                <h3>{task.title}</h3>
                <p>{task.resourceName}</p>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
};

export default Roadmap;