const express = require("express");
const Resource = require("../models/Resource");

const router = express.Router();
const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== "string" || !hhmm.includes(":")) return null;
  const [h, m] = hhmm.split(":").map((value) => Number.parseInt(value, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function deriveStatusFromSchedule(resource) {
  const schedules = Array.isArray(resource.schedules) ? resource.schedules : [];
  if (!schedules.length) return "unknown";

  const now = new Date();
  const todayKey = weekdayKeys[now.getDay()];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todaysSlots = schedules.filter((slot) => slot.day === todayKey);

  if (!todaysSlots.length) return "closed";

  const isOpenNow = todaysSlots.some((slot) => {
    const openMinutes = toMinutes(slot.open);
    const closeMinutes = toMinutes(slot.close);
    if (openMinutes === null || closeMinutes === null) return false;
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  });

  return isOpenNow ? "open" : "closed";
}

function withDerivedStatus(resourceDoc) {
  const plain = resourceDoc.toObject ? resourceDoc.toObject() : resourceDoc;
  return {
    ...plain,
    status: deriveStatusFromSchedule(plain),
  };
}

router.get("/", async (req, res) => {
  try {
    const { category, status, campus, q, limit = "50" } = req.query;
    const query = {};

    if (category) query.category = category.toString().trim().toLowerCase();
    if (campus) query.campus = campus.toString().trim();

    if (q && q.toString().trim()) {
      query.$text = { $search: q.toString().trim() };
    }

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    let resources = await Resource.find(query)
      .sort({ name: 1 })
      .limit(safeLimit);
    resources = resources.map(withDerivedStatus);
    if (status) {
      const normalizedStatus = status.toString().trim().toLowerCase();
      resources = resources.filter((resource) => resource.status === normalizedStatus);
    }

    return res.status(200).json({ count: resources.length, resources });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch resources.", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }
    return res.status(200).json({ resource: withDerivedStatus(resource) });
  } catch (error) {
    return res.status(400).json({ message: "Invalid resource ID.", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: "name and category are required." });
    }

    const resource = await Resource.create(req.body);
    return res.status(201).json({ message: "Resource created successfully.", resource });
  } catch (error) {
    return res.status(400).json({ message: "Failed to create resource.", error: error.message });
  }
});

module.exports = router;
