export const CATEGORIES = [
  "AI",
  "Productivity",
  "Education",
  "Developer Tools",
  "Finance",
  "Health",
  "Social",
  "Design",
  "Entertainment",
  "E-commerce",
  "Utilities",
  "SaaS",
  "Games",
  "Open Source",
  "Student Projects",
  "Experimental",
] as const;

export const TECHNOLOGIES = [
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Svelte",
  "Java",
  "Spring Boot",
  "Node.js",
  "Express",
  "Python",
  "Django",
  "Flask",
  "TypeScript",
  "JavaScript",
  "Firebase",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Supabase",
  "Tailwind CSS",
  "GraphQL",
  "Redis",
  "Docker",
  "AWS",
  "Vercel",
  "Figma",
] as const;

export const PRICING_TYPES = ["Free", "Freemium", "Paid", "Open Source", "Free Trial"] as const;

export const REPORT_REASONS = [
  "Spam",
  "Inappropriate content",
  "Malicious website",
  "Copyright issue",
  "Misleading information",
  "Other",
] as const;

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "views", label: "Most Viewed" },
  { value: "clicks", label: "Most Visited" },
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviewed" },
  { value: "trending", label: "Trending" },
] as const;

export const GRADIENTS = [
  "from-brand-blue to-brand-purple",
  "from-brand-purple to-brand-pink",
  "from-brand-cyan to-brand-blue",
  "from-brand-orange to-brand-pink",
  "from-brand-green to-brand-cyan",
];

export function gradientForSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}
