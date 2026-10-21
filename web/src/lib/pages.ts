export interface SitePage {
  path: string;
  title: string;
}

export const PAGES: SitePage[] = [
  { path: "/thoughts", title: "Thoughts" },
  { path: "/teams", title: "Teams I've worked with" },
  { path: "/projects", title: "Projects" },
  { path: "/research", title: "Research" },
  { path: "/images", title: "Images" },
  { path: "/art", title: "Art" },
  { path: "/mountains", title: "Mountains" },
  { path: "/essays", title: "Essays" },
  { path: "/contact", title: "Contact" },
];
