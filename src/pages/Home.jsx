import { useEffect, useState } from "react";
import About from "../components/About";
import Blogs from "../components/Blogs";
import Contact from "../components/Contact";
import Certifications from "../components/Certifications";
import Experience from "../components/Experience";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Projects from "../components/Projects";
import Skills from "../components/Skills";

const emptyProfile = {
  name: "",
  title: "",
  tagline: "",
  about: "",
  location: "",
  email: "",
  phone: "",
  highlights: [],
  socialLinks: [],
};

export default function Home() {
  const [portfolio, setPortfolio] = useState({
    profile: emptyProfile,
    skills: [],
    experience: [],
    projects: [],
    certifications: [],
    blogs: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPortfolio() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "/api"}/portfolio`,
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!ignore) {
          setPortfolio({
            profile: data.profile || emptyProfile,
            skills: data.skills || [],
            experience: data.experience || [],
            projects: data.projects || [],
            certifications: data.certifications || [],
            blogs: data.blogs || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch portfolio data", error);
        if (!ignore) {
          setError("Failed to load portfolio content.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      ignore = true;
    };
  }, []);

  const hasAbout = Boolean(
    portfolio.profile.about?.trim() || portfolio.profile.highlights?.length,
  );
  const hasSkills = portfolio.skills.length > 0;
  const hasExperience = portfolio.experience.length > 0;
  const hasCertifications = portfolio.certifications.length > 0;
  const hasProjects = portfolio.projects.length > 0;
  const hasBlogs = portfolio.blogs.length > 0;
  const hasContact = Boolean(
    portfolio.profile.location?.trim() ||
      portfolio.profile.email?.trim() ||
      portfolio.profile.phone?.trim() ||
      portfolio.profile.socialLinks?.length,
  );

  const navLinks = [
    hasAbout ? { label: "About", href: "#about" } : null,
    hasSkills ? { label: "Skills", href: "#skills" } : null,
    hasExperience ? { label: "Experience", href: "#experience" } : null,
    hasCertifications ? { label: "Certifications", href: "#certifications" } : null,
    hasProjects ? { label: "Projects", href: "#projects" } : null,
    hasBlogs ? { label: "Blogs", href: "#blogs" } : null,
    hasContact ? { label: "Contact", href: "#contact" } : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)]">
      <Navbar
        brand={portfolio.profile.name || "Portfolio"}
        links={navLinks}
      />
      <main>
        <Hero
          eyebrow={portfolio.profile.name || "Portfolio"}
          title={portfolio.profile.tagline || "Cloud and DevOps engineering focused on reliable platforms."}
          description={
            portfolio.profile.title
              ? `${portfolio.profile.title} with hands-on experience in AWS, Kubernetes, Linux, CI/CD, and production-style cloud operations across internships and engineering roles.`
              : "Portfolio content is loaded dynamically from the backend."
          }
          primaryAction={{ label: "View Experience", href: "#experience" }}
          secondaryAction={{ label: "Contact Me", href: "#contact" }}
        />
        {loading ? (
          <section className="mx-auto max-w-6xl px-6 py-10 text-sm text-[var(--text-subtle)]">
            Loading portfolio content...
          </section>
        ) : null}
        {error ? (
          <section className="mx-auto max-w-6xl px-6 py-4 text-sm text-[var(--error)]">
            {error}
          </section>
        ) : null}
        {hasAbout ? (
          <About
            title="Profile"
            description={portfolio.profile.about}
            highlights={portfolio.profile.highlights}
          />
        ) : null}
        {hasSkills ? <Skills groups={portfolio.skills} /> : null}
        {hasExperience ? <Experience items={portfolio.experience} /> : null}
        {hasCertifications ? <Certifications items={portfolio.certifications} /> : null}
        {hasProjects ? <Projects projects={portfolio.projects} /> : null}
        {hasBlogs ? <Blogs items={portfolio.blogs} /> : null}
        {hasContact ? (
          <Contact
            details={[
              portfolio.profile.location,
              portfolio.profile.email,
              portfolio.profile.phone,
            ].filter(Boolean)}
            links={
              portfolio.profile.socialLinks?.length
                ? portfolio.profile.socialLinks
                : [
                    portfolio.profile.email
                      ? { label: "Email", href: `mailto:${portfolio.profile.email}` }
                      : null,
                    portfolio.profile.phone
                      ? {
                          label: "Phone",
                          href: `tel:${portfolio.profile.phone.replace(/\s+/g, "")}`,
                        }
                      : null,
                  ].filter(Boolean)
            }
          />
        ) : null}
      </main>
      <Footer
        name={portfolio.profile.name || "Portfolio"}
        note={
          portfolio.profile.title
            ? `${portfolio.profile.title} based in ${portfolio.profile.location}.`
            : "Dynamic portfolio content served from MongoDB."
        }
      />
    </div>
  );
}
