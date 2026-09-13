import { Link } from "react-router-dom";
import { Code2, Share2, Link2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-grad-primary text-sm font-black text-white">
                W
              </span>
              <span className="text-lg font-extrabold text-ink">
                Web<span className="text-gradient">Store</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink/50">
              Discover developer-built products — websites, tools and experiments launched by builders around the world.
            </p>
            <div className="mt-4 flex gap-3 text-ink/40">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink" aria-label="GitHub">
                <Code2 size={17} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink" aria-label="Twitter">
                <Share2 size={17} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink" aria-label="LinkedIn">
                <Link2 size={17} />
              </a>
            </div>
          </div>

          <FooterCol
            title="Explore"
            links={[
              ["Products", "/discover"],
              ["Categories", "/categories"],
              ["Developers", "/developers"],
              ["Trending", "/trending"],
            ]}
          />
          <FooterCol
            title="Community"
            links={[
              ["Launch a Product", "/product/new"],
              ["Developers", "/developers"],
              ["Saved", "/saved"],
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              ["Privacy", "/legal/privacy"],
              ["Terms", "/legal/terms"],
              ["Community Guidelines", "/legal/guidelines"],
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} WebStore. All rights reserved.</p>
          <p>
            Built by <span className="font-semibold text-ink/60">Vedant Vaidhekar</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-ink/50 hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
