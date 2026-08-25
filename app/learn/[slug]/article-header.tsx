"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["/features", "Հնարավորություններ"],
  ["/pet-parents", "Կենդանատերերին"],
  ["/for-business", "Բիզնեսին"],
  ["/learn", "Սովորել"],
] as const;

export default function ArticleHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const scrollY = window.scrollY;
    document.documentElement.classList.add("menuOpen");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.documentElement.classList.remove("menuOpen");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  return (
    <header className="nav shell articleNav">
      <Link className="brand" href="/" aria-label="BuddyLife գլխավոր էջ">
        <Image src="/buddylife-logo-clean.webp" alt="BuddyLife" width={132} height={132} priority />
      </Link>
      <nav className="navLinks" aria-label="Գլխավոր նավարկում">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={href === "/learn" ? "active" : ""} aria-current={href === "/learn" ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="navRight">
        <Link className="button buttonSmall" href="/?join=parent">Միանալ մեզ</Link>
        <button className="mobileMenuButton" aria-label="Բացել ընտրացանկը" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>
          <Menu size={22} />
        </button>
      </div>
      {mobileOpen && (
        <div className="mobileDrawer">
          <button className="drawerClose" aria-label="Փակել ընտրացանկը" onClick={() => setMobileOpen(false)}><X /></button>
          <Image src="/buddylife-logo-clean.webp" alt="BuddyLife" width={120} height={120} />
          <nav aria-label="Շարժական նավարկում">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className={href === "/learn" ? "active" : ""}>{label}</Link>
            ))}
          </nav>
          <Link className="button" href="/?join=parent">Միանալ մեզ</Link>
        </div>
      )}
    </header>
  );
}
