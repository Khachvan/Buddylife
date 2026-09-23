"use client";

import {
  Archive,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  MapPin,
  QrCode,
  Search,
  Settings2,
  Unlink,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  FormEvent,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type QrStatus = "unassigned" | "active" | "paused" | "retired";
type QrShape = "rectangle" | "circle" | "paw";

const QR_DESIGNS: Record<
  QrShape,
  {
    name: string;
    description: string;
    image: string;
    width: number;
    height: number;
  }
> = {
  rectangle: {
    name: "Rounded rectangle",
    description: "Large-format entrance sign",
    image: "/qr-design-rectangle.png",
    width: 1024,
    height: 1536,
  },
  circle: {
    name: "Circle sticker",
    description: "Compact window or counter sticker",
    image: "/qr-design-circle.png",
    width: 1254,
    height: 1254,
  },
  paw: {
    name: "Paw sticker",
    description: "Signature BuddyLife pet-friendly mark",
    image: "/qr-design-paw.png",
    width: 1254,
    height: 1254,
  },
};

type QrCodeRecord = {
  id: string;
  serial: string;
  publicToken: string;
  publicUrl: string;
  displayName: string;
  status: QrStatus;
  defaultDestination: string;
  designVersion: string;
  batchCode: string;
  visualizationShape: QrShape;
  assignmentId: string | null;
  placementId: string | null;
  venueName: string | null;
  locationLabel: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  assignedAt: string | null;
  scans: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  formOpens: number;
  registrations: number;
  lastScan: string | null;
};

type QrSummary = {
  totalCodes: number;
  activeCodes: number;
  unassignedCodes: number;
  scans: number;
  uniqueVisitors: number;
  formOpens: number;
  registrations: number;
};

type PlacementRecord = {
  id: string;
  name: string;
  venueType: string;
  address: string | null;
  city: string | null;
  province: string | null;
  activeQrCount: number;
};

type QrVisitorRecord = {
  visitorId: string;
  scans: number;
  sessions: number;
  firstScan: string;
  lastScan: string;
  landingPath: string;
  language: string | null;
  referrerHost: string | null;
  deviceClass: string | null;
  registered: boolean;
};

type QrRegistrationRecord = {
  id: string;
  role: "parent" | "business";
  name: string | null;
  petType: string | null;
  businessName: string | null;
  category: string | null;
  social: string | null;
  email: string;
  phone: string;
  city: string | null;
  province: string | null;
  venue: string | null;
  createdAt: string;
  visitorId: string | null;
};

type QrVisitorDetails = {
  code: { serial: string; displayName: string };
  summary: {
    scans: number;
    uniqueVisitors: number;
    uniqueSessions: number;
    formOpens: number;
    registrations: number;
    registeredVisitors: number;
  };
  visitors: QrVisitorRecord[];
  registrations: QrRegistrationRecord[];
  limits: {
    visitors: number;
    registrations: number;
    visitorsTruncated: boolean;
    registrationsTruncated: boolean;
  };
};

const EMPTY_SUMMARY: QrSummary = {
  totalCodes: 0,
  activeCodes: 0,
  unassignedCodes: 0,
  scans: 0,
  uniqueVisitors: 0,
  formOpens: 0,
  registrations: 0,
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function fetchInventory() {
  const response = await fetch("/api/admin-qrs", { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok)
    throw new Error(payload.error || "QR inventory could not be loaded");
  return {
    codes: (payload.codes || []) as QrCodeRecord[],
    placements: (payload.placements || []) as PlacementRecord[],
    summary: { ...EMPTY_SUMMARY, ...(payload.summary || {}) } as QrSummary,
  };
}

export default function QrAdminClient() {
  const [codes, setCodes] = useState<QrCodeRecord[]>([]);
  const [summary, setSummary] = useState<QrSummary>(EMPTY_SUMMARY);
  const [placements, setPlacements] = useState<PlacementRecord[]>([]);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [status, setStatus] = useState<"all" | QrStatus>("all");
  const [managingId, setManagingId] = useState<string | null>(null);
  const [managerPlacementId, setManagerPlacementId] = useState("");
  const [confirmUnassign, setConfirmUnassign] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [detailsByCode, setDetailsByCode] = useState<
    Record<string, QrVisitorDetails>
  >({});
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);
  const [detailsErrorByCode, setDetailsErrorByCode] = useState<
    Record<string, string>
  >({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [recentlyCreatedId, setRecentlyCreatedId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectVisibleRef = useRef<HTMLInputElement>(null);
  const managerCloseRef = useRef<HTMLButtonElement>(null);
  const managerDialogRef = useRef<HTMLElement>(null);
  const workingRef = useRef(working);
  const deferredQuery = useDeferredValue(query);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const inventory = await fetchInventory();
      setCodes(inventory.codes);
      setPlacements(inventory.placements);
      setSummary(inventory.summary);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "QR inventory could not be loaded",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchInventory()
      .then((inventory) => {
        if (cancelled) return;
        setCodes(inventory.codes);
        setPlacements(inventory.placements);
        setSummary(inventory.summary);
      })
      .catch((loadError) => {
        if (!cancelled)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "QR inventory could not be loaded",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleCodes = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return codes.filter((code) => {
      const matchesStatus = status === "all" || code.status === status;
      const haystack = [
        code.serial,
        code.displayName,
        code.venueName,
        code.locationLabel,
        code.city,
        code.province,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [codes, deferredQuery, status]);

  const visibleIds = useMemo(
    () => visibleCodes.map((code) => code.id),
    [visibleCodes],
  );
  const selectedVisibleCount = visibleIds.filter((id) =>
    selectedIds.has(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const hiddenSelectedCount = selectedIds.size - selectedVisibleCount;
  const managedCode = useMemo(
    () => codes.find((code) => code.id === managingId) || null,
    [codes, managingId],
  );

  const closeManager = useCallback(() => {
    const closingId = managingId;
    setManagingId(null);
    setConfirmUnassign(false);
    setMessage("");
    setError("");
    if (closingId) {
      window.requestAnimationFrame(() => {
        document.getElementById(`manage-qr-${closingId}`)?.focus();
      });
    }
  }, [managingId]);

  function openManager(code: QrCodeRecord) {
    setDetailsId(null);
    setManagingId(code.id);
    setManagerPlacementId(code.placementId || "");
    setConfirmUnassign(false);
    setMessage("");
    setError("");
  }

  useEffect(() => {
    workingRef.current = working;
  }, [working]);

  useEffect(() => {
    if (!managingId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    managerCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !workingRef.current) closeManager();
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        managerDialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]",
        ) || [],
      ).filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeManager, managingId]);

  useEffect(() => {
    if (selectVisibleRef.current) {
      selectVisibleRef.current.indeterminate =
        selectedVisibleCount > 0 && !allVisibleSelected;
    }
  }, [allVisibleSelected, selectedVisibleCount]);

  useEffect(() => {
    const existingIds = new Set(codes.map((code) => code.id));
    setSelectedIds((current) => {
      const next = new Set([...current].filter((id) => existingIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [codes]);

  useEffect(() => {
    if (
      !recentlyCreatedId ||
      !codes.some((code) => code.id === recentlyCreatedId)
    )
      return;
    const card = document.getElementById(`qr-card-${recentlyCreatedId}`);
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    card?.focus({ preventScroll: true });
    const timer = window.setTimeout(() => setRecentlyCreatedId(null), 7000);
    return () => window.clearTimeout(timer);
  }, [codes, recentlyCreatedId]);

  async function mutate(body: Record<string, unknown>, successMessage: string) {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin-qrs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "QR update failed");
      setMessage(successMessage);
      setDetailsByCode({});
      await load();
      return payload;
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "QR update failed",
      );
      return null;
    } finally {
      setWorking(false);
    }
  }

  async function createQr(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await mutate(
      {
        action: "create",
        displayName: form.get("displayName"),
        visualizationShape: form.get("visualizationShape"),
        defaultDestination: form.get("defaultDestination"),
      },
      "Your individually tracked Preview QR is ready.",
    );
    if (result?.code?.id) {
      setQuery("");
      setStatus("all");
      setRecentlyCreatedId(String(result.code.id));
      setCreateOpen(false);
    }
  }

  async function updateQr(
    event: FormEvent<HTMLFormElement>,
    code: QrCodeRecord,
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await mutate(
      {
        action: "update",
        qrId: code.id,
        displayName: form.get("displayName"),
        status: form.get("status"),
        visualizationShape: form.get("visualizationShape"),
        defaultDestination: form.get("defaultDestination"),
      },
      `${code.serial} was updated.`,
    );
  }

  async function assignQr(
    event: FormEvent<HTMLFormElement>,
    code: QrCodeRecord,
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await mutate(
      {
        action: "assign",
        qrId: code.id,
        venueName: form.get("venueName"),
        placementId: form.get("placementId"),
        venueType: form.get("venueType"),
        locationLabel: form.get("locationLabel"),
        address: form.get("address"),
        city: form.get("city"),
        province: form.get("province"),
        notes: form.get("notes"),
        destinationPath: form.get("destinationPath"),
      },
      `${code.serial} is now assigned.`,
    );
    if (result?.placementId) setManagerPlacementId(String(result.placementId));
  }

  async function copyLink(code: QrCodeRecord) {
    await navigator.clipboard.writeText(code.publicUrl);
    setMessage(`${code.serial} link copied.`);
  }

  function toggleCodeSelection(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisibleSelection() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function downloadSelected() {
    if (!selectedIds.size || bulkDownloading) return;
    setBulkDownloading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin-qrs/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds] }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(
          payload.error || "Selected QR designs could not be prepared",
        );
      }
      const archive = await response.blob();
      const url = URL.createObjectURL(archive);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `BuddyLife-designed-QRs-${selectedIds.size}.zip`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setMessage(
        `${selectedIds.size} designed QR${selectedIds.size === 1 ? "" : "s"} downloaded in one ZIP file.`,
      );
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Selected QR designs could not be prepared",
      );
    } finally {
      setBulkDownloading(false);
    }
  }

  async function toggleDetails(code: QrCodeRecord) {
    if (detailsId === code.id) {
      setDetailsId(null);
      return;
    }

    setDetailsId(code.id);
    if (detailsByCode[code.id]) return;

    setDetailsLoadingId(code.id);
    setDetailsErrorByCode((current) => ({ ...current, [code.id]: "" }));
    try {
      const response = await fetch(`/api/admin-qrs/${code.id}/visitors`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Visitor details could not be loaded");
      setDetailsByCode((current) => ({
        ...current,
        [code.id]: payload as QrVisitorDetails,
      }));
    } catch (detailsError) {
      setDetailsErrorByCode((current) => ({
        ...current,
        [code.id]:
          detailsError instanceof Error
            ? detailsError.message
            : "Visitor details could not be loaded",
      }));
    } finally {
      setDetailsLoadingId((current) => (current === code.id ? null : current));
    }
  }

  const overallConversion = summary.uniqueVisitors
    ? `${((summary.registrations / summary.uniqueVisitors) * 100).toFixed(1)}%`
    : "—";

  return (
    <main className="adminPage qrAdminPage">
      <div className="adminTop">
        <div>
          <p className="eyebrow">BUDDYLIFE QR TRACKING</p>
          <h1>Tracked QR library</h1>
          <p>
            Create one Preview QR at a time, assign it to a venue and measure
            the complete visitor journey.
          </p>
        </div>
        <div className="adminActions">
          <a className="button secondary" href="/admin">
            CMS overview
          </a>
          <a className="button" href="/api/backoffice-logout">
            Log out
          </a>
        </div>
      </div>

      <section className="adminStats qrStats">
        <article>
          <b>{summary.totalCodes}</b>
          <span>Total QRs</span>
        </article>
        <article>
          <b>{summary.activeCodes}</b>
          <span>Active placements</span>
        </article>
        <article>
          <b>{summary.uniqueVisitors}</b>
          <span>Unique visitors</span>
        </article>
        <article>
          <b>{summary.formOpens}</b>
          <span>Form opens</span>
        </article>
        <article>
          <b>{summary.registrations}</b>
          <span>Registrations</span>
        </article>
        <article>
          <b>{overallConversion}</b>
          <span>Visitor conversion</span>
        </article>
      </section>
      <p className="adminMetricNote">
        Bots and test scans are excluded. Registration conversion uses valid,
        non-test registrations.
      </p>

      {message && (
        <div className="qrNotice" role="status">
          {message}
        </div>
      )}
      {error && (
        <section className="adminServiceError" role="alert">
          <b>QR tracking needs attention</b>
          <p>{error}</p>
        </section>
      )}

      <section className="adminPanel qrCreatePanel">
        <div>
          <p className="eyebrow">PREVIEW-ONLY CREATION</p>
          <h2>Create an individually tracked QR</h2>
          <p>
            Choose its printable shape before creation. The QR matrix stays
            square with its full four-module quiet zone.
          </p>
        </div>
        <button
          className="button"
          type="button"
          onClick={() => setCreateOpen((open) => !open)}
        >
          <QrCode aria-hidden="true" />{" "}
          {createOpen ? "Close creator" : "Create QR"}
        </button>
        {createOpen && (
          <form className="qrCreateForm" onSubmit={createQr} noValidate>
            <label className="qrWideField">
              <span>QR name</span>
              <input
                name="displayName"
                placeholder="Example: Green Bean entrance"
                maxLength={160}
                required
              />
            </label>
            <fieldset className="qrShapePicker">
              <legend>Printable visualization</legend>
              {(["rectangle", "circle", "paw"] as QrShape[]).map((shape) => (
                <label key={shape}>
                  <input
                    type="radio"
                    name="visualizationShape"
                    value={shape}
                    defaultChecked={shape === "rectangle"}
                  />
                  <span className="qrShapePreview" aria-hidden="true">
                    <Image
                      src={QR_DESIGNS[shape].image}
                      alt=""
                      width={QR_DESIGNS[shape].width}
                      height={QR_DESIGNS[shape].height}
                    />
                  </span>
                  <span className="qrShapeCopy">
                    <b>{QR_DESIGNS[shape].name}</b>
                    <small>{QR_DESIGNS[shape].description}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <label className="qrWideField">
              <span>Destination path</span>
              <input
                name="defaultDestination"
                defaultValue="/?join=parent"
                required
              />
            </label>
            <p className="qrPrivacyNote">
              This creates one temporary Preview identity only. It does not
              create the final BL-0001–BL-0100 print batch.
            </p>
            <button className="button" disabled={working} type="submit">
              {working ? "Creating QR…" : "Create tracked QR"}
            </button>
          </form>
        )}
      </section>

      {!loading && codes.length === 0 && !createOpen && (
        <section className="adminPanel qrEmptyState">
          <QrCode aria-hidden="true" />
          <h2>No Preview QRs yet</h2>
          <p>
            Create the first individually tracked QR above when you are ready.
          </p>
        </section>
      )}

      {codes.length > 0 && (
        <>
          <section
            className="adminPanelHead qrToolbar"
            aria-label="QR inventory filters"
          >
            <label className="qrSearchField">
              <span>Find a QR</span>
              <span className="adminSearch">
                <Search aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, serial or venue"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Clear QR search"
                  >
                    <X aria-hidden="true" />
                  </button>
                )}
              </span>
            </label>
            <label className="qrStatusFilter">
              <span>Status</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "all" | QrStatus)
                }
              >
                <option value="all">All</option>
                <option value="unassigned">Unassigned</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="retired">Retired</option>
              </select>
            </label>
            <a
              className="button secondary qrManifestButton"
              href="/api/admin-qrs/export"
            >
              <Download aria-hidden="true" /> Download manifest
            </a>
            <span className="qrVisibleCount">{visibleCodes.length} shown</span>
          </section>

          <section
            className={`qrBulkBar${selectedIds.size ? " isActive" : ""}`}
            aria-label="Select and download QR designs"
          >
            <label className="qrSelectVisible">
              <input
                ref={selectVisibleRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleVisibleSelection}
                disabled={!visibleCodes.length}
              />
              <span>Select all {visibleCodes.length} shown</span>
            </label>
            <div className="qrBulkSummary">
              <Archive aria-hidden="true" />
              <span>
                <b>{selectedIds.size} selected</b>
                <small>
                  {hiddenSelectedCount > 0
                    ? `${hiddenSelectedCount} selected QR${hiddenSelectedCount === 1 ? " is" : "s are"} hidden by filters`
                    : "Download designed SVGs together as one ZIP"}
                </small>
              </span>
            </div>
            <div className="qrBulkActions">
              {selectedIds.size > 0 && (
                <button
                  className="qrClearSelection"
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear selection
                </button>
              )}
              <button
                className="button"
                type="button"
                disabled={!selectedIds.size || bulkDownloading}
                aria-busy={bulkDownloading}
                onClick={downloadSelected}
              >
                <Download aria-hidden="true" />{" "}
                {bulkDownloading
                  ? "Preparing ZIP…"
                  : `Download selected${selectedIds.size ? ` (${selectedIds.size})` : ""}`}
              </button>
            </div>
          </section>

          {visibleCodes.length === 0 && (
            <section className="adminPanel qrNoResults" role="status">
              <Search aria-hidden="true" />
              <h2>No matching QRs</h2>
              <p>Try another name, serial, venue or status.</p>
              <button
                className="button secondary"
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
              >
                Clear filters
              </button>
            </section>
          )}

          <section className="qrInventory" aria-label="QR sticker inventory">
            {visibleCodes.map((code) => {
              const conversion = code.uniqueVisitors
                ? `${((code.registrations / code.uniqueVisitors) * 100).toFixed(1)}%`
                : "—";
              const details = detailsByCode[code.id];
              const detailsOpen = detailsId === code.id;
              return (
                <article
                  id={`qr-card-${code.id}`}
                  tabIndex={-1}
                  className={`qrInventoryCard${selectedIds.has(code.id) ? " isSelected" : ""}${recentlyCreatedId === code.id ? " isNew" : ""}`}
                  key={code.id}
                >
                  <header>
                    <div className="qrCardIdentity">
                      <label className="qrCardSelect">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(code.id)}
                          onChange={() => toggleCodeSelection(code.id)}
                          aria-label={`Select ${code.displayName}`}
                        />
                        <span aria-hidden="true" />
                      </label>
                      <span className="qrShapeMini" aria-hidden="true">
                        <Image
                          src={QR_DESIGNS[code.visualizationShape].image}
                          alt=""
                          width={QR_DESIGNS[code.visualizationShape].width}
                          height={QR_DESIGNS[code.visualizationShape].height}
                        />
                      </span>
                      <div>
                        <h2>{code.displayName}</h2>
                        <p>
                          <b>{code.serial}</b>
                          <span>{code.visualizationShape} design</span>
                        </p>
                      </div>
                    </div>
                    <div className="qrCardTopActions">
                      <span className={`qrStatus qrStatus-${code.status}`}>
                        {code.status}
                      </span>
                      <button
                        className="qrIconButton"
                        type="button"
                        onClick={() => copyLink(code)}
                        aria-label={`Copy link for ${code.displayName}`}
                      >
                        <Copy aria-hidden="true" />
                        <span>Copy link</span>
                      </button>
                    </div>
                  </header>

                  <div className="qrPlacementSummary">
                    <MapPin aria-hidden="true" />
                    <div>
                      <b>{code.venueName || "Not assigned yet"}</b>
                      <span>
                        {[
                          code.locationLabel,
                          code.address,
                          code.city,
                          code.province,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Ready to connect to a venue"}
                      </span>
                    </div>
                  </div>

                  <dl className="qrMetrics">
                    <div>
                      <dt>Scans</dt>
                      <dd>{code.scans}</dd>
                    </div>
                    <div>
                      <dt>Visitors</dt>
                      <dd>{code.uniqueVisitors}</dd>
                    </div>
                    <div>
                      <dt>Form opens</dt>
                      <dd>{code.formOpens}</dd>
                    </div>
                    <div>
                      <dt>Registrations</dt>
                      <dd>{code.registrations}</dd>
                    </div>
                    <div>
                      <dt>Conversion</dt>
                      <dd>{conversion}</dd>
                    </div>
                  </dl>

                  <div className="qrCardActions">
                    <button
                      type="button"
                      aria-expanded={detailsOpen}
                      aria-controls={`qr-visitor-details-${code.id}`}
                      onClick={() => toggleDetails(code)}
                    >
                      <Eye aria-hidden="true" /> Visitor details{" "}
                      {detailsOpen ? (
                        <ChevronUp aria-hidden="true" />
                      ) : (
                        <ChevronDown aria-hidden="true" />
                      )}
                    </button>
                    <a
                      className="qrDesignedDownload"
                      href={`/api/admin-qrs/${code.id}/image`}
                    >
                      <Download aria-hidden="true" /> Download designed SVG
                    </a>
                    <button
                      id={`manage-qr-${code.id}`}
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => openManager(code)}
                    >
                      <Settings2 aria-hidden="true" /> Manage QR
                    </button>
                  </div>

                  {detailsOpen && (
                    <section
                      className="qrVisitorDetails"
                      id={`qr-visitor-details-${code.id}`}
                      aria-label={`${code.serial} visitor details`}
                    >
                      <div className="qrVisitorDetailsHead">
                        <div>
                          <p className="eyebrow">
                            SCAN AND REGISTRATION DETAIL
                          </p>
                          <h3>Visitors from {code.serial}</h3>
                        </div>
                        {details && (
                          <dl>
                            <div>
                              <dt>Visitors</dt>
                              <dd>{details.summary.uniqueVisitors}</dd>
                            </div>
                            <div>
                              <dt>Form opens</dt>
                              <dd>{details.summary.formOpens}</dd>
                            </div>
                            <div>
                              <dt>Registered</dt>
                              <dd>{details.summary.registeredVisitors}</dd>
                            </div>
                            <div>
                              <dt>Scans</dt>
                              <dd>{details.summary.scans}</dd>
                            </div>
                          </dl>
                        )}
                      </div>

                      <p className="qrPrivacyNote">
                        Anonymous visitors are shown with a safe reference only.
                        Names, phone numbers and emails appear only after a
                        person submits the registration form.
                      </p>

                      {detailsLoadingId === code.id && (
                        <p className="qrDetailsState">
                          Loading visitor details…
                        </p>
                      )}
                      {detailsErrorByCode[code.id] && (
                        <p className="qrDetailsError" role="alert">
                          {detailsErrorByCode[code.id]}
                        </p>
                      )}

                      {details && (
                        <>
                          <div className="qrDetailsSectionHead">
                            <h4>Registered people</h4>
                            <span>{details.registrations.length}</span>
                          </div>
                          {details.registrations.length === 0 ? (
                            <p className="qrDetailsState">
                              No attributed registrations from this QR yet.
                            </p>
                          ) : (
                            <div className="qrRegistrationList">
                              {details.registrations.map((registration) => {
                                const personName =
                                  registration.role === "business"
                                    ? registration.businessName
                                    : registration.name;
                                const interest =
                                  registration.role === "business"
                                    ? registration.category
                                    : registration.petType;
                                return (
                                  <article key={registration.id}>
                                    <header>
                                      <div>
                                        <b>
                                          {personName ||
                                            (registration.role === "business"
                                              ? "Business registration"
                                              : "Pet parent")}
                                        </b>
                                        <span>
                                          {registration.role === "business"
                                            ? "Business"
                                            : "Pet parent"}
                                          {interest ? ` · ${interest}` : ""}
                                        </span>
                                      </div>
                                      <time dateTime={registration.createdAt}>
                                        {formatDate(registration.createdAt)}
                                      </time>
                                    </header>
                                    <dl>
                                      <div>
                                        <dt>Email</dt>
                                        <dd>
                                          <a
                                            href={`mailto:${registration.email}`}
                                          >
                                            {registration.email}
                                          </a>
                                        </dd>
                                      </div>
                                      <div>
                                        <dt>Phone</dt>
                                        <dd>
                                          <a href={`tel:${registration.phone}`}>
                                            {registration.phone}
                                          </a>
                                        </dd>
                                      </div>
                                      <div>
                                        <dt>Location</dt>
                                        <dd>
                                          {[
                                            registration.city,
                                            registration.province,
                                          ]
                                            .filter(Boolean)
                                            .join(", ") || "—"}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt>Visitor reference</dt>
                                        <dd>{registration.visitorId || "—"}</dd>
                                      </div>
                                      {registration.social && (
                                        <div>
                                          <dt>Social</dt>
                                          <dd>{registration.social}</dd>
                                        </div>
                                      )}
                                      {registration.venue && (
                                        <div>
                                          <dt>Attributed venue</dt>
                                          <dd>{registration.venue}</dd>
                                        </div>
                                      )}
                                    </dl>
                                  </article>
                                );
                              })}
                            </div>
                          )}

                          <div className="qrDetailsSectionHead">
                            <h4>All recent visitors</h4>
                            <span>
                              {details.visitors.length}
                              {details.limits.visitorsTruncated
                                ? ` of ${details.summary.uniqueVisitors}`
                                : ""}
                            </span>
                          </div>
                          {details.visitors.length === 0 ? (
                            <p className="qrDetailsState">
                              No valid scans have been recorded yet.
                            </p>
                          ) : (
                            <div
                              className="qrVisitorTable"
                              role="table"
                              aria-label={`${code.serial} recent visitors`}
                            >
                              <div
                                className="qrVisitorTableRow qrVisitorTableHead"
                                role="row"
                              >
                                <span role="columnheader">Visitor</span>
                                <span role="columnheader">Activity</span>
                                <span role="columnheader">Latest visit</span>
                                <span role="columnheader">Context</span>
                              </div>
                              {details.visitors.map((visitor) => (
                                <div
                                  className="qrVisitorTableRow"
                                  role="row"
                                  key={visitor.visitorId}
                                >
                                  <span role="cell">
                                    <b>{visitor.visitorId}</b>
                                    <small
                                      className={
                                        visitor.registered
                                          ? "qrRegisteredBadge"
                                          : "qrAnonymousBadge"
                                      }
                                    >
                                      {visitor.registered
                                        ? "Registered"
                                        : "Anonymous"}
                                    </small>
                                  </span>
                                  <span role="cell">
                                    <b>
                                      {visitor.scans} scan
                                      {visitor.scans === 1 ? "" : "s"}
                                    </b>
                                    <small>
                                      {visitor.sessions} session
                                      {visitor.sessions === 1 ? "" : "s"}
                                    </small>
                                  </span>
                                  <span role="cell">
                                    <b>{formatDate(visitor.lastScan)}</b>
                                    <small>
                                      First: {formatDate(visitor.firstScan)}
                                    </small>
                                  </span>
                                  <span role="cell">
                                    <b>
                                      {visitor.deviceClass || "Unknown device"}
                                      {visitor.language
                                        ? ` · ${visitor.language}`
                                        : ""}
                                    </b>
                                    <small>
                                      {visitor.referrerHost || "Direct scan"} ·{" "}
                                      {visitor.landingPath}
                                    </small>
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {(details.limits.visitorsTruncated ||
                            details.limits.registrationsTruncated) && (
                            <p className="qrPrivacyNote">
                              For performance, this view shows the 250 most
                              recent records. Totals above still include all
                              valid records.
                            </p>
                          )}
                        </>
                      )}
                    </section>
                  )}

                  <footer>
                    <code>/q/{code.publicToken}</code>
                    <span>
                      {code.lastScan
                        ? `Last scan ${new Date(code.lastScan).toLocaleString("en-GB")}`
                        : "No scans yet"}
                    </span>
                  </footer>
                </article>
              );
            })}
          </section>
        </>
      )}
      {loading && <p className="adminEmpty">Loading QR inventory…</p>}

      {managedCode && (
        <div className="qrManagerBackdrop">
          <section
            ref={managerDialogRef}
            className="qrManagerDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-manager-title"
          >
            <header className="qrManagerHeader">
              <div>
                <p className="eyebrow">MANAGE TRACKED QR</p>
                <h2 id="qr-manager-title">{managedCode.displayName}</h2>
                <span>
                  {managedCode.serial} ·{" "}
                  {QR_DESIGNS[managedCode.visualizationShape].name}
                </span>
              </div>
              <button
                ref={managerCloseRef}
                className="qrManagerClose"
                type="button"
                onClick={closeManager}
                disabled={working}
                aria-label="Close QR manager"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <div className="qrManagerBody">
              {message && (
                <div className="qrManagerNotice" role="status">
                  {message}
                </div>
              )}
              {error && (
                <div className="qrManagerError" role="alert">
                  {error}
                </div>
              )}

              <section
                className="qrManagerSection"
                aria-labelledby="qr-settings-title"
              >
                <div className="qrManagerSectionHead">
                  <span className="qrManagerSectionIcon">
                    <Settings2 aria-hidden="true" />
                  </span>
                  <div>
                    <h3 id="qr-settings-title">QR identity and settings</h3>
                    <p>
                      Rename the code, control its status, and choose where
                      scans land.
                    </p>
                  </div>
                </div>
                <form
                  key={`${managedCode.id}:${managedCode.displayName}:${managedCode.status}:${managedCode.visualizationShape}:${managedCode.defaultDestination}`}
                  className="qrManagerForm"
                  onSubmit={(event) => updateQr(event, managedCode)}
                >
                  <label>
                    <span>QR name</span>
                    <input
                      name="displayName"
                      defaultValue={managedCode.displayName}
                      maxLength={160}
                      required
                    />
                  </label>
                  <label>
                    <span>Status</span>
                    <select name="status" defaultValue={managedCode.status}>
                      <option
                        value="unassigned"
                        disabled={Boolean(managedCode.assignmentId)}
                      >
                        Unassigned
                        {managedCode.assignmentId
                          ? " — use Unassign venue"
                          : ""}
                      </option>
                      <option
                        value="active"
                        disabled={!managedCode.assignmentId}
                      >
                        Active
                        {!managedCode.assignmentId
                          ? " — assign a venue first"
                          : ""}
                      </option>
                      <option value="paused">Paused</option>
                      <option value="retired">Retired</option>
                    </select>
                  </label>
                  <label>
                    <span>Printable design</span>
                    <select
                      name="visualizationShape"
                      defaultValue={managedCode.visualizationShape}
                    >
                      <option value="rectangle">Rounded rectangle</option>
                      <option value="circle">Circle sticker</option>
                      <option value="paw">Paw sticker</option>
                    </select>
                  </label>
                  <label className="qrWideField">
                    <span>Destination path</span>
                    <input
                      name="defaultDestination"
                      defaultValue={managedCode.defaultDestination}
                      pattern="^/(?!/).*"
                      title="Use a BuddyLife path beginning with one slash, for example /?join=parent"
                      required
                    />
                  </label>
                  <div className="qrFormActions">
                    <button className="button" disabled={working} type="submit">
                      {working ? "Saving…" : "Save QR settings"}
                    </button>
                  </div>
                </form>
              </section>

              <section
                className="qrManagerSection"
                aria-labelledby="qr-venue-title"
              >
                <div className="qrManagerSectionHead">
                  <span className="qrManagerSectionIcon">
                    <MapPin aria-hidden="true" />
                  </span>
                  <div>
                    <h3 id="qr-venue-title">Venue assignment</h3>
                    <p>
                      {managedCode.assignmentId
                        ? `Currently assigned to ${managedCode.venueName || "a venue"}.`
                        : "Assign this QR to an existing venue or create a new one."}
                    </p>
                  </div>
                </div>
                <form
                  key={`${managedCode.id}:${managedCode.assignmentId || "new"}`}
                  className="qrManagerForm"
                  onSubmit={(event) => assignQr(event, managedCode)}
                >
                  <label className="qrWideField">
                    <span>Existing venue</span>
                    <select
                      name="placementId"
                      value={managerPlacementId}
                      onChange={(event) =>
                        setManagerPlacementId(event.target.value)
                      }
                    >
                      <option value="">Create a new venue below</option>
                      {placements.map((placement) => (
                        <option key={placement.id} value={placement.id}>
                          {placement.name}
                          {placement.city ? ` · ${placement.city}` : ""} (
                          {placement.activeQrCount} QR)
                        </option>
                      ))}
                    </select>
                  </label>
                  {managerPlacementId && (
                    <p className="qrManagerFieldNote qrWideField">
                      The saved venue profile will be reused. You can still
                      change the sticker location and destination below.
                    </p>
                  )}
                  <label>
                    <span>New venue name</span>
                    <input
                      name="venueName"
                      placeholder="Required for a new venue"
                      maxLength={160}
                      required={!managerPlacementId}
                      disabled={Boolean(managerPlacementId)}
                    />
                  </label>
                  <label>
                    <span>Venue type</span>
                    <select
                      name="venueType"
                      defaultValue="cafe"
                      disabled={Boolean(managerPlacementId)}
                    >
                      <option value="cafe">Café</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="clinic">Veterinary clinic</option>
                      <option value="shelter">Shelter</option>
                      <option value="event">Event</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label>
                    <span>Sticker location</span>
                    <input
                      name="locationLabel"
                      defaultValue={managedCode.locationLabel || ""}
                      placeholder="Entrance window, table 4…"
                      maxLength={160}
                    />
                  </label>
                  <label>
                    <span>Address</span>
                    <input
                      name="address"
                      defaultValue={
                        managerPlacementId ? "" : managedCode.address || ""
                      }
                      maxLength={240}
                      disabled={Boolean(managerPlacementId)}
                    />
                  </label>
                  <label>
                    <span>City</span>
                    <input
                      name="city"
                      defaultValue={
                        managerPlacementId ? "" : managedCode.city || "Yerevan"
                      }
                      maxLength={120}
                      disabled={Boolean(managerPlacementId)}
                    />
                  </label>
                  <label>
                    <span>Province</span>
                    <input
                      name="province"
                      defaultValue={
                        managerPlacementId ? "" : managedCode.province || ""
                      }
                      maxLength={120}
                      disabled={Boolean(managerPlacementId)}
                    />
                  </label>
                  <label className="qrWideField">
                    <span>Destination path</span>
                    <input
                      name="destinationPath"
                      defaultValue={managedCode.defaultDestination}
                      pattern="^/(?!/).*"
                      title="Use a BuddyLife path beginning with one slash, for example /?join=parent"
                      required
                    />
                  </label>
                  <label className="qrWideField">
                    <span>Internal notes</span>
                    <textarea
                      className="resize-none"
                      name="notes"
                      maxLength={1000}
                      disabled={Boolean(managerPlacementId)}
                    />
                  </label>
                  <div className="qrFormActions qrManagerVenueActions">
                    <button className="button" disabled={working} type="submit">
                      {working
                        ? "Saving…"
                        : managedCode.assignmentId
                          ? "Save or reassign venue"
                          : "Assign venue"}
                    </button>
                    {managedCode.assignmentId && !confirmUnassign && (
                      <button
                        className="button qrManagerDanger"
                        type="button"
                        disabled={working}
                        onClick={() => setConfirmUnassign(true)}
                      >
                        <Unlink aria-hidden="true" /> Unassign venue
                      </button>
                    )}
                  </div>
                  {managedCode.assignmentId && confirmUnassign && (
                    <div className="qrManagerConfirm qrWideField" role="alert">
                      <div>
                        <b>Remove this venue assignment?</b>
                        <span>
                          The QR remains available and returns to Unassigned
                          status.
                        </span>
                      </div>
                      <button
                        className="button qrManagerDanger"
                        type="button"
                        disabled={working}
                        onClick={() =>
                          mutate(
                            { action: "unassign", qrId: managedCode.id },
                            `${managedCode.serial} is unassigned.`,
                          ).then((result) => {
                            if (result) {
                              setManagerPlacementId("");
                              setConfirmUnassign(false);
                            }
                          })
                        }
                      >
                        Confirm unassign
                      </button>
                      <button
                        className="button secondary"
                        type="button"
                        disabled={working}
                        onClick={() => setConfirmUnassign(false)}
                      >
                        Keep assignment
                      </button>
                    </div>
                  )}
                </form>
              </section>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
