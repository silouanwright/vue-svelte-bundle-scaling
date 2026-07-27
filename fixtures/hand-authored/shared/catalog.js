export const activities = [
  { id: 1, label: "Imported source archive", kind: "import", minutes: 7 },
  { id: 2, label: "Reviewed search annotations", kind: "review", minutes: 19 },
  { id: 3, label: "Published research packet", kind: "publish", minutes: 42 },
  { id: 4, label: "Updated document metadata", kind: "edit", minutes: 68 },
];

export const searchRecords = [
  { id: "R-104", title: "Architecture Decision Log", type: "Document", score: 0.98 },
  { id: "R-228", title: "Indexing Failure Notes", type: "Note", score: 0.91 },
  { id: "R-351", title: "Reader Interaction Study", type: "Document", score: 0.87 },
  { id: "R-490", title: "Release Verification", type: "Checklist", score: 0.79 },
];

export const tableRecords = [
  { id: "DOC-18", title: "Collected Homilies", owner: "Library", status: "Ready", pages: 482 },
  { id: "DOC-27", title: "Council Records", owner: "Research", status: "Review", pages: 116 },
  { id: "DOC-39", title: "Correspondence", owner: "Archive", status: "Ready", pages: 204 },
  { id: "DOC-44", title: "Field Notes", owner: "Research", status: "Draft", pages: 73 },
];

export const readerSections = [
  { id: "introduction", label: "Introduction", words: 842 },
  { id: "method", label: "Method", words: 1380 },
  { id: "evidence", label: "Evidence", words: 2145 },
  { id: "conclusion", label: "Conclusion", words: 624 },
];

export const revisions = [
  { id: 5, author: "Mara", summary: "Clarified benchmark limits", time: "09:14" },
  { id: 4, author: "Jon", summary: "Added route-size table", time: "08:32" },
  { id: 3, author: "Mara", summary: "Reworked introduction", time: "Yesterday" },
];

export const notifications = [
  { id: 11, channel: "Indexing", title: "Three sources completed", read: false },
  { id: 12, channel: "Review", title: "Packet ready for approval", read: false },
  { id: 13, channel: "System", title: "Backup verified", read: true },
];

export const librarySources = [
  { id: "LIB-A", title: "Primary Library", documents: 1842, connected: true },
  { id: "LIB-B", title: "Research Notes", documents: 327, connected: true },
  { id: "LIB-C", title: "Removable Archive", documents: 608, connected: false },
];
