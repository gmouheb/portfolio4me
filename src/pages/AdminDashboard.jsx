import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpenText,
  BriefcaseBusiness,
  Mail,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Search,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Field from "../components/admin/Field";
import ThemeToggle from "../components/ThemeToggle";
import { ADMIN_LOGIN_PATH } from "../lib/admin";
import { apiRequest } from "../lib/api";

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "experience", label: "Experience", icon: BriefcaseBusiness },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "blogs", label: "Blogs", icon: BookOpenText },
  { id: "messages", label: "Messages", icon: Mail },
];

const initialFilters = {
  skills: "",
  experience: "",
  certifications: "",
  projects: "",
  blogs: "",
  messages: "",
};

function normalizeList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function SidebarLink({ id, label, icon: Icon }) {
  return (
    <a
      href={`#${id}`}
      className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[color:var(--bg-card)] px-4 py-3 text-sm text-[var(--text-muted)] transition hover:border-[var(--secondary)] hover:text-[var(--text-main)]"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </a>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[color:var(--bg-card)] p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-subtle)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--text-main)]">{value}</p>
    </div>
  );
}

function TableShell({ id, title, description, toolbar, children }) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[color:var(--bg-card)] shadow-xl shadow-slate-200/30 dark:shadow-slate-950/40"
    >
      <div className="flex flex-col gap-4 border-b border-[var(--border)] px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-main)]">{title}</h2>
            <p className="mt-1 text-sm text-[var(--text-subtle)]">{description}</p>
          </div>
          {toolbar}
        </div>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function TableActionButton({ children, tone = "primary", ...props }) {
  const toneClass =
    tone === "danger"
      ? "border-[var(--error)]/30 text-[var(--error)] hover:border-[var(--error)]"
      : tone === "ghost"
        ? "border-[var(--border)] text-[var(--text-main)] hover:border-[var(--secondary)]"
        : "border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]";

  return (
    <button
      type="button"
      {...props}
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${toneClass}`}
    >
      {children}
    </button>
  );
}

function SearchField({ value, onChange, placeholder }) {
  return (
    <label className="relative block min-w-[220px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-[var(--border)] bg-[color:var(--bg-elevated)] py-2 pl-9 pr-4 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--secondary)]"
      />
    </label>
  );
}

function Toast({ message, onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex max-w-sm items-start gap-3 rounded-2xl border border-[var(--secondary)]/25 bg-[color:var(--bg-card)] px-4 py-4 text-sm text-[var(--text-main)] shadow-2xl shadow-slate-200/40 backdrop-blur dark:shadow-slate-950/60">
      <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--secondary)]" />
      <p className="flex-1 leading-6">{message}</p>
      <button type="button" onClick={onClose} className="text-[var(--text-subtle)] transition hover:text-[var(--text-main)]">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ConfirmDialog({ state, onCancel, onConfirm }) {
  if (!state) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--border)] bg-[color:var(--bg-card)] p-6 shadow-2xl shadow-slate-200/40 dark:shadow-slate-950/60">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--secondary)]">{state.intent}</p>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--text-main)]">{state.title}</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--text-subtle)]">{state.message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <TableActionButton tone="ghost" onClick={onCancel}>
            Cancel
          </TableActionButton>
          <TableActionButton tone={state.tone} onClick={onConfirm}>
            Confirm
          </TableActionButton>
        </div>
      </div>
    </div>
  );
}

function tableInputClass(extra = "") {
  return `w-full rounded-xl border border-[var(--border)] bg-[color:var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--secondary)] ${extra}`;
}

function ImagePreview({ src, alt }) {
  if (!src) {
    return <div className="text-xs text-[var(--text-subtle)]">No image</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-16 w-24 rounded-xl border border-[var(--border)] object-cover"
      loading="lazy"
    />
  );
}

function useAuthGuard(navigate, setToast, setPortfolio, setUsername) {
  useEffect(() => {
    async function loadAdminData() {
      try {
        const [session, data] = await Promise.all([
          apiRequest("/auth/me"),
          apiRequest("/admin/portfolio"),
        ]);
        setUsername(session.user.username);
        setPortfolio(data);
      } catch (error) {
        if (error.message === "Unauthorized" || error.message === "Invalid token") {
          navigate(ADMIN_LOGIN_PATH, { replace: true });
          return;
        }

        setToast(error.message);
      }
    }

    loadAdminData();
  }, [navigate, setPortfolio, setToast, setUsername]);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [toast, setToast] = useState("");
  const [confirmState, setConfirmState] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pendingUploads, setPendingUploads] = useState({});

  useAuthGuard(navigate, setToast, setPortfolio, setUsername);

  const filteredSkills = useMemo(() => {
    if (!portfolio) {
      return [];
    }

    const query = filters.skills.trim().toLowerCase();
    if (!query) {
      return portfolio.skills;
    }

    return portfolio.skills.filter((group) =>
      `${group.title} ${group.items.join(" ")}`.toLowerCase().includes(query),
    );
  }, [filters.skills, portfolio]);

  const filteredExperience = useMemo(() => {
    if (!portfolio) {
      return [];
    }

    const query = filters.experience.trim().toLowerCase();
    if (!query) {
      return portfolio.experience;
    }

    return portfolio.experience.filter((item) =>
      `${item.role} ${item.company} ${item.period} ${item.highlights.join(" ")}`.toLowerCase().includes(query),
    );
  }, [filters.experience, portfolio]);

  const filteredProjects = useMemo(() => {
    if (!portfolio) {
      return [];
    }

    const query = filters.projects.trim().toLowerCase();
    if (!query) {
      return portfolio.projects;
    }

    return portfolio.projects.filter((item) =>
      `${item.title} ${item.description} ${item.stack.join(" ")}`.toLowerCase().includes(query),
    );
  }, [filters.projects, portfolio]);

  const filteredCertifications = useMemo(() => {
    if (!portfolio) {
      return [];
    }

    const query = filters.certifications.trim().toLowerCase();
    if (!query) {
      return portfolio.certifications;
    }

    return portfolio.certifications.filter((item) =>
      `${item.name} ${item.issuer} ${item.date}`.toLowerCase().includes(query),
    );
  }, [filters.certifications, portfolio]);

  const filteredMessages = useMemo(() => {
    if (!portfolio) {
      return [];
    }

    const query = filters.messages.trim().toLowerCase();
    if (!query) {
      return portfolio.messages || [];
    }

    return (portfolio.messages || []).filter((item) =>
      `${item.name} ${item.email} ${item.subject} ${item.message}`.toLowerCase().includes(query),
    );
  }, [filters.messages, portfolio]);

  const filteredBlogs = useMemo(() => {
    if (!portfolio) {
      return [];
    }

    const query = filters.blogs.trim().toLowerCase();
    if (!query) {
      return portfolio.blogs || [];
    }

    return (portfolio.blogs || []).filter((item) =>
      `${item.title} ${item.excerpt} ${item.publishedAt}`.toLowerCase().includes(query),
    );
  }, [filters.blogs, portfolio]);

  function requestConfirmation(config, action) {
    setConfirmState({
      ...config,
      action,
    });
  }

  async function handleConfirm() {
    if (!confirmState?.action) {
      return;
    }

    const action = confirmState.action;
    setConfirmState(null);
    await action();
  }

  async function logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout transport failures and still drop the local view.
    } finally {
      navigate(ADMIN_LOGIN_PATH, { replace: true });
    }
  }

  function updateProfileField(field, value) {
    setPortfolio((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }));
  }

  async function saveProfile() {
    requestConfirmation(
      {
        intent: "Save Changes",
        title: "Update profile?",
        message: "This will overwrite the current profile content shown on the public portfolio.",
        tone: "primary",
      },
      async () => {
        const updated = await apiRequest(`/admin/profile/${portfolio.profile._id}`, {
          method: "PUT",
          body: JSON.stringify(portfolio.profile),
        });
        setPortfolio((current) => ({ ...current, profile: updated }));
        setToast("Profile saved.");
      },
    );
  }

  function saveDocument(section, item) {
    requestConfirmation(
      {
        intent: "Save Record",
        title: `Save this ${section.slice(0, -1)} entry?`,
        message: "The current row values will be persisted to MongoDB.",
        tone: "primary",
      },
      async () => {
        const basePath = `/admin/${section}`;
        const path = item._id ? `${basePath}/${item._id}` : basePath;
        const method = item._id ? "PUT" : "POST";
        const payload = await apiRequest(path, {
          method,
          body: JSON.stringify(item),
        });

        setPortfolio((current) => ({
          ...current,
          [section]: item._id
            ? current[section].map((entry) => (entry._id === payload._id ? payload : entry))
            : [...current[section], payload],
        }));
        setToast(`${section.slice(0, -1)} saved.`);
      },
    );
  }

  function deleteDocument(section, id) {
    requestConfirmation(
      {
        intent: "Delete Record",
        title: `Delete this ${section.slice(0, -1)} entry?`,
        message: "This action cannot be undone. The selected row will be removed from MongoDB.",
        tone: "danger",
      },
      async () => {
        await apiRequest(`/admin/${section}/${id}`, {
          method: "DELETE",
        });

        setPortfolio((current) => ({
          ...current,
          [section]: current[section].filter((item) => item._id !== id),
        }));
        setToast(`${section.slice(0, -1)} deleted.`);
      },
    );
  }

  function updateSectionItem(section, index, field, value) {
    setPortfolio((current) => ({
      ...current,
      [section]: current[section].map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }));
  }

  function getUploadKey(section, index) {
    return `${section}-${index}`;
  }

  function setPendingFile(section, index, file) {
    const key = getUploadKey(section, index);
    setPendingUploads((current) => ({
      ...current,
      [key]: file || null,
    }));
  }

  async function uploadImage(section, index) {
    const key = getUploadKey(section, index);
    const file = pendingUploads[key];

    if (!file) {
      setToast("Select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const payload = await apiRequest("/admin/uploads/image", {
      method: "POST",
      body: formData,
    });

    updateSectionItem(section, index, "imageUrl", payload.imageUrl);
    setPendingUploads((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setToast("Image uploaded.");
  }

  function addSkillGroup() {
    setPortfolio((current) => ({
      ...current,
      skills: [...current.skills, { title: "", items: [], order: current.skills.length + 1 }],
    }));
    setToast("New skill group row added.");
  }

  function addExperience() {
    setPortfolio((current) => ({
      ...current,
      experience: [
        ...current.experience,
        { company: "", role: "", period: "", highlights: [], order: current.experience.length + 1 },
      ],
    }));
    setToast("New experience row added.");
  }

  function addProject() {
    setPortfolio((current) => ({
      ...current,
      projects: [
        ...current.projects,
        { title: "", description: "", stack: [], githubUrl: "", liveUrl: "", imageUrl: "" },
      ],
    }));
    setToast("New project row added.");
  }

  function addCertification() {
    setPortfolio((current) => ({
      ...current,
      certifications: [
        ...current.certifications,
        { name: "", issuer: "", date: "", credentialUrl: "", imageUrl: "", order: current.certifications.length + 1 },
      ],
    }));
    setToast("New certification row added.");
  }

  function addBlog() {
    setPortfolio((current) => ({
      ...current,
      blogs: [
        ...(current.blogs || []),
        { title: "", excerpt: "", content: "", linkUrl: "", imageUrl: "", publishedAt: "", order: (current.blogs || []).length + 1 },
      ],
    }));
    setToast("New blog row added.");
  }

  function updateMessageItem(index, field, value) {
    setPortfolio((current) => ({
      ...current,
      messages: current.messages.map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }));
  }

  if (!portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-[var(--text-subtle)]">
        Loading control room...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-transparent text-[var(--text-main)]">
        <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 md:px-6">
          <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[color:var(--bg-card)] p-5 shadow-2xl shadow-slate-200/40 dark:shadow-slate-950/60 lg:flex lg:flex-col">
            <div className="border-b border-[var(--border)] pb-5">
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--secondary)]">Control Room</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold text-[var(--text-main)]">Admin Console</h1>
                <ThemeToggle compact />
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--text-subtle)]">
                Tables for each entity, faster edits, cleaner filters, and safer actions.
              </p>
            </div>

            <nav className="mt-5 space-y-3">
              {sections.map((section) => (
                <SidebarLink key={section.id} {...section} />
              ))}
            </nav>

            <div className="mt-auto rounded-[1.5rem] border border-[var(--border)] bg-[color:var(--bg-main)] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[color:color-mix(in_srgb,var(--secondary)_18%,transparent)] p-3 text-[var(--secondary)]">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-main)]">{username}</p>
                  <p className="text-xs text-[var(--text-subtle)]">Authenticated editor</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <TableActionButton tone="ghost" onClick={() => navigate("/")}>
                  View site
                </TableActionButton>
                <TableActionButton tone="danger" onClick={logout}>
                  <span className="inline-flex items-center gap-1">
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </span>
                </TableActionButton>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-6">
            <section
              id="overview"
              className="rounded-[2rem] border border-[var(--border)] bg-[color:var(--bg-card)] px-6 py-6 shadow-xl shadow-slate-200/30 dark:shadow-slate-950/40"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--secondary)]">Workspace</p>
                  <h2 className="mt-3 text-3xl font-semibold text-[var(--text-main)] md:text-4xl">
                    Portfolio management dashboard
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--text-subtle)]">
                    Each content entity has its own editable table. Search inside each dataset, save rows individually,
                    and confirm every destructive or persistent action before it runs.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[480px]">
                  <StatTile label="Profile Fields" value="7" />
                  <StatTile label="Skill Groups" value={portfolio.skills.length} />
                  <StatTile label="Certifications" value={portfolio.certifications.length} />
                  <StatTile label="Projects" value={portfolio.projects.length} />
                  <StatTile label="Blogs" value={(portfolio.blogs || []).length} />
                  <StatTile label="Messages" value={(portfolio.messages || []).length} />
                </div>
              </div>
            </section>

            <TableShell
              id="profile"
              title="Profile"
              description="Single-record identity and about section shown across the portfolio."
              toolbar={<TableActionButton onClick={saveProfile}>Save Profile</TableActionButton>}
            >
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <Field label="Name" value={portfolio.profile.name} onChange={(event) => updateProfileField("name", event.target.value)} />
                <Field label="Title" value={portfolio.profile.title} onChange={(event) => updateProfileField("title", event.target.value)} />
                <Field label="Tagline" value={portfolio.profile.tagline} onChange={(event) => updateProfileField("tagline", event.target.value)} />
                <Field label="Location" value={portfolio.profile.location} onChange={(event) => updateProfileField("location", event.target.value)} />
                <Field label="Email" value={portfolio.profile.email} onChange={(event) => updateProfileField("email", event.target.value)} />
                <Field label="Phone" value={portfolio.profile.phone} onChange={(event) => updateProfileField("phone", event.target.value)} />
                <div className="md:col-span-2">
                  <Field label="About" as="textarea" rows="5" value={portfolio.profile.about} onChange={(event) => updateProfileField("about", event.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Field
                    label="Highlights"
                    value={portfolio.profile.highlights.join(", ")}
                    onChange={(event) => updateProfileField("highlights", normalizeList(event.target.value))}
                    placeholder="AWS and Kubernetes, Terraform and CI/CD"
                  />
                </div>
              </div>
            </TableShell>

            <TableShell
              id="skills"
              title="Skills"
              description="Each row is a skill group with a title, comma-separated items, and display order."
              toolbar={
                <div className="flex flex-wrap gap-3">
                  <SearchField
                    value={filters.skills}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, skills: event.target.value }))
                    }
                    placeholder="Search skill groups"
                  />
                  <TableActionButton tone="ghost" onClick={addSkillGroup}>
                    Add Skill Group
                  </TableActionButton>
                </div>
              }
            >
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="sticky top-0 z-10 bg-[color:var(--bg-elevated)] text-left text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  <tr>
                    <th className="px-4 py-4">Title</th>
                    <th className="px-4 py-4">Items</th>
                    <th className="px-4 py-4">Order</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredSkills.map((group) => {
                    const index = portfolio.skills.findIndex((entry) => entry === group);

                    return (
                      <tr key={group._id || `skill-${index}`} className="align-top">
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass()}
                            value={group.title}
                            onChange={(event) => updateSectionItem("skills", index, "title", event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <textarea
                            rows="3"
                            className={tableInputClass("min-w-[320px]")}
                            value={group.items.join(", ")}
                            onChange={(event) =>
                              updateSectionItem("skills", index, "items", normalizeList(event.target.value))
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            className={tableInputClass("w-24")}
                            value={group.order ?? index + 1}
                            onChange={(event) =>
                              updateSectionItem("skills", index, "order", Number(event.target.value))
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <TableActionButton onClick={() => saveDocument("skills", group)}>
                              Save
                            </TableActionButton>
                            {group._id ? (
                              <TableActionButton tone="danger" onClick={() => deleteDocument("skills", group._id)}>
                                Delete
                              </TableActionButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableShell>

            <TableShell
              id="experience"
              title="Experience"
              description="Career timeline rows with role, company, period, highlights, and sort order."
              toolbar={
                <div className="flex flex-wrap gap-3">
                  <SearchField
                    value={filters.experience}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, experience: event.target.value }))
                    }
                    placeholder="Search experience"
                  />
                  <TableActionButton tone="ghost" onClick={addExperience}>
                    Add Experience
                  </TableActionButton>
                </div>
              }
            >
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="sticky top-0 z-10 bg-[color:var(--bg-elevated)] text-left text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  <tr>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Company</th>
                    <th className="px-4 py-4">Period</th>
                    <th className="px-4 py-4">Highlights</th>
                    <th className="px-4 py-4">Order</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredExperience.map((item) => {
                    const index = portfolio.experience.findIndex((entry) => entry === item);

                    return (
                      <tr key={item._id || `experience-${index}`} className="align-top">
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[180px]")}
                            value={item.role}
                            onChange={(event) => updateSectionItem("experience", index, "role", event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[180px]")}
                            value={item.company}
                            onChange={(event) =>
                              updateSectionItem("experience", index, "company", event.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[140px]")}
                            value={item.period}
                            onChange={(event) =>
                              updateSectionItem("experience", index, "period", event.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <textarea
                            rows="4"
                            className={tableInputClass("min-w-[320px]")}
                            value={item.highlights.join(", ")}
                            onChange={(event) =>
                              updateSectionItem("experience", index, "highlights", normalizeList(event.target.value))
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            className={tableInputClass("w-24")}
                            value={item.order ?? index + 1}
                            onChange={(event) =>
                              updateSectionItem("experience", index, "order", Number(event.target.value))
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <TableActionButton onClick={() => saveDocument("experience", item)}>
                              Save
                            </TableActionButton>
                            {item._id ? (
                              <TableActionButton tone="danger" onClick={() => deleteDocument("experience", item._id)}>
                                Delete
                              </TableActionButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableShell>

            <TableShell
              id="certifications"
              title="Certifications"
              description="Credential rows with issuer, date, optional verification link, and display order."
              toolbar={
                <div className="flex flex-wrap gap-3">
                  <SearchField
                    value={filters.certifications}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, certifications: event.target.value }))
                    }
                    placeholder="Search certifications"
                  />
                  <TableActionButton tone="ghost" onClick={addCertification}>
                    Add Certification
                  </TableActionButton>
                </div>
              }
            >
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="sticky top-0 z-10 bg-[color:var(--bg-elevated)] text-left text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  <tr>
                    <th className="px-4 py-4">Image</th>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Issuer</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Credential URL</th>
                    <th className="px-4 py-4">Order</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredCertifications.map((item) => {
                    const index = portfolio.certifications.findIndex((entry) => entry === item);

                    return (
                      <tr key={item._id || `certification-${index}`} className="align-top">
                        <td className="px-4 py-4">
                          <div className="space-y-3">
                            <ImagePreview src={item.imageUrl} alt={item.name || "Certification image"} />
                            <input
                              type="file"
                              accept="image/*"
                              className="block w-full text-xs text-[var(--text-subtle)]"
                              onChange={(event) => setPendingFile("certifications", index, event.target.files?.[0] || null)}
                            />
                            <TableActionButton tone="ghost" onClick={() => uploadImage("certifications", index)}>
                              Upload
                            </TableActionButton>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[220px]")}
                            value={item.name}
                            onChange={(event) =>
                              updateSectionItem("certifications", index, "name", event.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[200px]")}
                            value={item.issuer}
                            onChange={(event) =>
                              updateSectionItem("certifications", index, "issuer", event.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[140px]")}
                            value={item.date}
                            onChange={(event) =>
                              updateSectionItem("certifications", index, "date", event.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[260px]")}
                            value={item.credentialUrl || ""}
                            onChange={(event) =>
                              updateSectionItem("certifications", index, "credentialUrl", event.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            className={tableInputClass("w-24")}
                            value={item.order ?? index + 1}
                            onChange={(event) =>
                              updateSectionItem("certifications", index, "order", Number(event.target.value))
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <TableActionButton onClick={() => saveDocument("certifications", item)}>
                              Save
                            </TableActionButton>
                            {item._id ? (
                              <TableActionButton tone="danger" onClick={() => deleteDocument("certifications", item._id)}>
                                Delete
                              </TableActionButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableShell>

            <TableShell
              id="projects"
              title="Projects"
              description="Project records with stack, description, and external links."
              toolbar={
                <div className="flex flex-wrap gap-3">
                  <SearchField
                    value={filters.projects}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, projects: event.target.value }))
                    }
                    placeholder="Search projects"
                  />
                  <TableActionButton tone="ghost" onClick={addProject}>
                    Add Project
                  </TableActionButton>
                </div>
              }
            >
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="sticky top-0 z-10 bg-[color:var(--bg-elevated)] text-left text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  <tr>
                    <th className="px-4 py-4">Image</th>
                    <th className="px-4 py-4">Title</th>
                    <th className="px-4 py-4">Stack</th>
                    <th className="px-4 py-4">Description</th>
                    <th className="px-4 py-4">GitHub</th>
                    <th className="px-4 py-4">Live URL</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredProjects.map((item) => {
                    const index = portfolio.projects.findIndex((entry) => entry === item);

                    return (
                      <tr key={item._id || `project-${index}`} className="align-top">
                        <td className="px-4 py-4">
                          <div className="space-y-3">
                            <ImagePreview src={item.imageUrl} alt={item.title || "Project image"} />
                            <input
                              type="file"
                              accept="image/*"
                              className="block w-full text-xs text-[var(--text-subtle)]"
                              onChange={(event) => setPendingFile("projects", index, event.target.files?.[0] || null)}
                            />
                            <TableActionButton tone="ghost" onClick={() => uploadImage("projects", index)}>
                              Upload
                            </TableActionButton>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[180px]")}
                            value={item.title}
                            onChange={(event) => updateSectionItem("projects", index, "title", event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <textarea
                            rows="3"
                            className={tableInputClass("min-w-[220px]")}
                            value={item.stack.join(", ")}
                            onChange={(event) =>
                              updateSectionItem("projects", index, "stack", normalizeList(event.target.value))
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <textarea
                            rows="4"
                            className={tableInputClass("min-w-[320px]")}
                            value={item.description}
                            onChange={(event) =>
                              updateSectionItem("projects", index, "description", event.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[220px]")}
                            value={item.githubUrl}
                            onChange={(event) =>
                              updateSectionItem("projects", index, "githubUrl", event.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[220px]")}
                            value={item.liveUrl}
                            onChange={(event) =>
                              updateSectionItem("projects", index, "liveUrl", event.target.value)
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <TableActionButton onClick={() => saveDocument("projects", item)}>
                              Save
                            </TableActionButton>
                            {item._id ? (
                              <TableActionButton tone="danger" onClick={() => deleteDocument("projects", item._id)}>
                                Delete
                              </TableActionButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableShell>

            <TableShell
              id="blogs"
              title="Blogs"
              description="Writing entries with excerpt, optional full content, published date, image, and external link."
              toolbar={
                <div className="flex flex-wrap gap-3">
                  <SearchField
                    value={filters.blogs}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, blogs: event.target.value }))
                    }
                    placeholder="Search blogs"
                  />
                  <TableActionButton tone="ghost" onClick={addBlog}>
                    Add Blog
                  </TableActionButton>
                </div>
              }
            >
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="sticky top-0 z-10 bg-[color:var(--bg-elevated)] text-left text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  <tr>
                    <th className="px-4 py-4">Image</th>
                    <th className="px-4 py-4">Title</th>
                    <th className="px-4 py-4">Excerpt</th>
                    <th className="px-4 py-4">Content</th>
                    <th className="px-4 py-4">Link</th>
                    <th className="px-4 py-4">Published</th>
                    <th className="px-4 py-4">Order</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredBlogs.map((item) => {
                    const index = portfolio.blogs.findIndex((entry) => entry === item);

                    return (
                      <tr key={item._id || `blog-${index}`} className="align-top">
                        <td className="px-4 py-4">
                          <div className="space-y-3">
                            <ImagePreview src={item.imageUrl} alt={item.title || "Blog image"} />
                            <input
                              type="file"
                              accept="image/*"
                              className="block w-full text-xs text-[var(--text-subtle)]"
                              onChange={(event) => setPendingFile("blogs", index, event.target.files?.[0] || null)}
                            />
                            <TableActionButton tone="ghost" onClick={() => uploadImage("blogs", index)}>
                              Upload
                            </TableActionButton>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[220px]")}
                            value={item.title}
                            onChange={(event) => updateSectionItem("blogs", index, "title", event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <textarea
                            rows="3"
                            className={tableInputClass("min-w-[260px]")}
                            value={item.excerpt}
                            onChange={(event) => updateSectionItem("blogs", index, "excerpt", event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <textarea
                            rows="4"
                            className={tableInputClass("min-w-[320px]")}
                            value={item.content || ""}
                            onChange={(event) => updateSectionItem("blogs", index, "content", event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[240px]")}
                            value={item.linkUrl || ""}
                            onChange={(event) => updateSectionItem("blogs", index, "linkUrl", event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[140px]")}
                            value={item.publishedAt || ""}
                            onChange={(event) => updateSectionItem("blogs", index, "publishedAt", event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            className={tableInputClass("w-24")}
                            value={item.order ?? index + 1}
                            onChange={(event) => updateSectionItem("blogs", index, "order", Number(event.target.value))}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <TableActionButton onClick={() => saveDocument("blogs", item)}>
                              Save
                            </TableActionButton>
                            {item._id ? (
                              <TableActionButton tone="danger" onClick={() => deleteDocument("blogs", item._id)}>
                                Delete
                              </TableActionButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableShell>

            <TableShell
              id="messages"
              title="Contact Messages"
              description="Messages submitted from the public contact form."
              toolbar={
                <SearchField
                  value={filters.messages}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, messages: event.target.value }))
                  }
                  placeholder="Search messages"
                />
              }
            >
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="sticky top-0 z-10 bg-[color:var(--bg-elevated)] text-left text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  <tr>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Subject</th>
                    <th className="px-4 py-4">Message</th>
                    <th className="px-4 py-4">Read</th>
                    <th className="px-4 py-4">Received</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredMessages.map((item) => {
                    const index = portfolio.messages.findIndex((entry) => entry === item);

                    return (
                      <tr key={item._id || `message-${index}`} className="align-top">
                        <td className="px-4 py-4">
                          <div className="min-w-[160px] text-sm text-[var(--text-main)]">{item.name}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="min-w-[220px] text-sm text-[var(--text-muted)]">{item.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            className={tableInputClass("min-w-[200px]")}
                            value={item.subject || ""}
                            onChange={(event) => updateMessageItem(index, "subject", event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <textarea
                            rows="4"
                            className={tableInputClass("min-w-[340px]")}
                            value={item.message}
                            onChange={(event) => updateMessageItem(index, "message", event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <label className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <input
                              type="checkbox"
                              checked={Boolean(item.read)}
                              onChange={(event) => updateMessageItem(index, "read", event.target.checked)}
                            />
                            Read
                          </label>
                        </td>
                        <td className="px-4 py-4">
                          <div className="min-w-[140px] text-sm text-[var(--text-subtle)]">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <TableActionButton onClick={() => saveDocument("messages", item)}>
                              Save
                            </TableActionButton>
                            {item._id ? (
                              <TableActionButton tone="danger" onClick={() => deleteDocument("messages", item._id)}>
                                Delete
                              </TableActionButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableShell>
          </main>
        </div>
      </div>

      <ConfirmDialog state={confirmState} onCancel={() => setConfirmState(null)} onConfirm={handleConfirm} />
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}
