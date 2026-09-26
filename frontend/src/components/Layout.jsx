import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ role = "mr", active = "Dashboard", children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Sidebar.jsx's <aside> is position:fixed. On mobile, instead of trying to
  // slide it off-canvas with a transform (which broke — see note below), we
  // simply don't mount it in the DOM at all when it's closed. When open, it's
  // rendered as a fixed overlay with a backdrop.
  //
  // WHY the old transform approach failed: translateX(-100%) resolves against
  // the transformed element's OWN width. Since the wrapper div's only child
  // was position:fixed (out of normal flow), the wrapper's computed width
  // collapsed to 0 — so translateX(-100%) of 0 = 0px = no movement at all.
  // That's why the sidebar was always visible regardless of open/closed state.
  const desktopSidebarWidth = isSidebarOpen ? 260 : 70;
  const showSidebar = !isMobile || isSidebarOpen;

  return (
    <div
      className="app"
      style={{ display: "flex", minHeight: "100vh", width: "100%", overflowX: "hidden" }}
    >
      {showSidebar && (
        <Sidebar
          role={role}
          isOpen={isMobile ? true : isSidebarOpen} // on mobile, always show the full (open) sidebar when it's mounted
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
      )}

      <main
        style={{
          flex: "1 1 0%",
          minWidth: 0, // prevents flex overflow / horizontal page scroll
          width: "100%",
          marginLeft: isMobile ? 0 : `${desktopSidebarWidth}px`,
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
          background: "#f5f7fa",
         
        }}
      >
        <Header
          role={role}
          onMenuClick={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
        <section
          className="content"
          style={{
            padding: isMobile ? "12px" : "20px",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowX: "auto",
          }}
        >
          {children}
        </section>
      </main>

      {isMobile && isSidebarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}