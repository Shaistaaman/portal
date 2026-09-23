/**
 * Blog types. Admin-only feature (like Experiences/Packages), with a plain
 * active/in_active status and no approval workflow. The add/edit wizard is
 * 2 steps: Identity (banner image, title, subtitle) and Blog Details — the
 * latter reuses the same shape as the Packages wizard's Specifications step
 * (a highlights bullet list + repeating heading/category/image/content
 * blocks).
 */

export type BlogStatus = "active" | "in_active";

/**
 * One content section of a blog — mirrors the Packages "What You Get"
 * inclusion block (heading, category, image, body text).
 */
export interface BlogSection {
  id: string;
  heading: string;
  category: string;
  /** Data-URL of the uploaded image (demo only). */
  image: string;
  content: string;
}

export interface Blog {
  id: string;
  title: string;
  subtitle: string;
  status: BlogStatus;
  /** Banner image (data-URL or remote URL). Also used as the list thumbnail. */
  bannerImage: string;
  /** Top-level highlights bullet list. */
  highlights: string[];
  /** Repeating content sections. */
  sections: BlogSection[];
}

export type BlogFormValues = Pick<
  Blog,
  "title" | "subtitle" | "bannerImage" | "highlights" | "sections"
>;

export function createBlogSection(): BlogSection {
  return {
    id: crypto.randomUUID(),
    heading: "",
    category: "",
    image: "",
    content: "",
  };
}

export const EMPTY_BLOG_FORM_VALUES: BlogFormValues = {
  title: "",
  subtitle: "",
  bannerImage: "",
  highlights: [],
  sections: [createBlogSection()],
};
