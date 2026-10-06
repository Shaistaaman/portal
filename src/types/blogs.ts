import { uuid } from "@/utils/uuid";

/**
 * Blog types. Admin-only feature (like Experiences/Packages), with a plain
 * active/inactive status and no approval workflow. The add/edit wizard is
 * 2 steps: Identity (banner image, title, subtitle) and Blog Details — the
 * latter reuses the same shape as the Packages wizard's Specifications step
 * (a highlights bullet list + repeating heading/category/image/content
 * blocks).
 */

export type BlogStatus = "active" | "inactive";

/**
 * Status a newly created blog post is saved with.
 *
 * New posts are drafts. `publishedAt` stays unset until the post is first
 * switched to "active" — "published" means publicly visible, so the
 * timestamp records the moment it actually went live, not the moment it was
 * drafted. Re-activating a post after it was switched off does not move the
 * original timestamp.
 */
export const BLOG_CREATION_STATUS: BlogStatus = "inactive";

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
  /**
   * ISO timestamp of when this post first went live, or null while it has
   * never been activated. Set on the first "inactive" → "active" switch and
   * left alone thereafter, so switching a post off and on again does not
   * rewrite its original publication date. Mirrors `blogs.published_at` in
   * Documents/database-design.md §4.4.
   */
  publishedAt: string | null;
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
    id: uuid(),
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
