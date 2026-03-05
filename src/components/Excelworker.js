// ─── excelWorker.js ───────────────────────────────────────────────────────────
// Web Worker: Excel (CSV) <-> JSON
// Import: CSV → JSON (array of lead objects)
// Export: JSON (statuses[]) → CSV download

const FIELDS = [
  "statusName",
  "firstName",
  "lastName",
  "phone",
  "extraPhone",
  "budjet",
  "leadSourceId",
  "birthDate",
  "adress",
  "tag",
];

// ── CSV parser — RFC 4180 compliant, handles quotes & commas inside values ───
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];

  const headers = splitCSVRow(lines[0]).map((h) => h.trim().toLowerCase());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVRow(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx].trim() : "";
    });
    rows.push(obj);
  }
  return rows;
}

// Split a single CSV row respecting quoted fields
function splitCSVRow(row) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// Escape a value for CSV output
function escapeCSV(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ── IMPORT: CSV text → lead objects array ────────────────────────────────────
function csvToJson(csvText) {
  const rows = parseCSV(csvText);
  return rows
    .map((row) => {
      // normalize possible header variants
      const get = (...keys) => {
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== "") return row[k];
        }
        return "";
      };

      const lead = {
        firstName: get("firstname", "first_name", "ism"),
        lastName: get("lastname", "last_name", "familiya"),
        phone: get("phone", "telefon"),
        extraPhone: get("extraphone", "extra_phone", "qoshimcha"),
        budjet: get("budjet", "budget", "byudjet"),
        leadSourceId: get("leadsourceid", "lead_source_id", "manba"),
        birthDate: get("birthdate", "birth_date", "tugilgan_sana"),
        adress: get("adress", "address", "manzil"),
        tag: get("tag", "teg"),
      };

      // type coercions
      if (lead.budjet) lead.budjet = Number(lead.budjet) || 0;
      if (lead.leadSourceId)
        lead.leadSourceId = Number(lead.leadSourceId) || "";

      return lead;
    })
    .filter((l) => l.firstName || l.phone); // bo'sh qatorlarni o'tkazib yuborish
}

// ── EXPORT: statuses[] → CSV text ────────────────────────────────────────────
function jsonToCsv(statuses) {
  const headerRow = FIELDS.map(escapeCSV).join(",");
  const dataRows = [];

  for (const status of statuses) {
    const statusName = status.name || "";
    for (const lead of status.leads || []) {
      const row = [
        escapeCSV(statusName),
        escapeCSV(lead.firstName || ""),
        escapeCSV(lead.lastName || ""),
        escapeCSV(lead.phone || ""),
        escapeCSV(lead.extraPhone || ""),
        escapeCSV(lead.budjet ?? ""),
        escapeCSV(lead.leadSourceId ?? ""),
        escapeCSV(lead.birthDate || ""),
        escapeCSV(lead.adress || ""),
        escapeCSV(lead.tag || ""),
      ];
      dataRows.push(row.join(","));
    }
  }

  return [headerRow, ...dataRows].join("\n");
}

// ── Worker message handler ────────────────────────────────────────────────────
self.onmessage = function (e) {
  const { type, payload } = e.data;

  try {
    if (type === "IMPORT") {
      // payload: { csvText: string }
      const leads = csvToJson(payload.csvText);
      self.postMessage({ type: "IMPORT_DONE", leads });
    } else if (type === "EXPORT") {
      // payload: { statuses: StatusWithLeads[] }
      const csvText = jsonToCsv(payload.statuses);
      self.postMessage({ type: "EXPORT_DONE", csvText });
    } else {
      self.postMessage({ type: "ERROR", message: "Noto'g'ri type: " + type });
    }
  } catch (err) {
    self.postMessage({ type: "ERROR", message: err.message });
  }
};
