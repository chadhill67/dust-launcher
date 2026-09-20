import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { Auth } from "./pages/auth";
import { Home } from "./pages/home";
import { Library } from "./pages/library";
import { Settings } from "./pages/settings";
import { Shop } from "./pages/shop";

import "./styles/app.css";
import { Frame } from "./components/frame";
import { Sidebar } from "./components/sidebar";
import { CustomToaster } from "./components/toaster";
import { useTheme } from "../hooks/useTheme";
import { useEffect } from "react";
import { api } from "../lib/api";
import { useUserStore } from "../stores/user";
import { useProfileStore } from "../stores/profile";
import { useOnboarding } from "../hooks/useOnboarding";
import { OnboardingModal } from "./components/onboarding/OnboardingModal";
import { useConfigStore } from "../stores/settings";
import { SnowGlobal } from "./components/SnowGlobal";
import { TrailerProvider, useTrailer } from "../hooks/useTrailer";

function AppInner() {
  const auth = useAuth.user();
  const profile = useUserStore();
  const colors = useTheme();
  const onboarding = useOnboarding();
  const minimizeSidebar = useConfigStore((state) => state.minimizeSidebar);
  const sidebarPosition = useConfigStore((state) => state.sidebarPosition);
  const sidebarSize     = useConfigStore((state) => state.sidebarSize);
  const frameHeight     = useConfigStore((state) => state.frameHeight ?? 32);
  const { isOpen: trailerOpen } = useTrailer();

  if (!auth.hydrated) {
    return null;
  }

  async function AttemptLogin() {
    const email = profile.email;
    const password = profile.password;

    if (!email || !password) {
      return;
    }

    try {
      const res = await api.login(email, password);
      if (res.success && res.data && res.data.ok) {
        profile.login({
          accountId: res.data.account_id,
          accessToken: res.data.access_token,
          displayName: res.data.display_name || profile.displayName || email.split("@")[0],
          email,
          password,
        });
      }
    } catch (err) {
      console.warn("Background re-login error (session preserved):", err);
    }
  }

  useEffect(() => {
    if (auth.isValidSession()) {
      if (auth.accessToken && auth.accountId) {
        AttemptLogin();
      }
      if (auth.accessToken && auth.accountId) {
        if (auth.accountId.startsWith("mock-")) {
          useProfileStore.getState().loadMockProfile(auth.accountId);
        } else {
          useProfileStore
            .getState()
            .fetchProfile(auth.accountId, "athena", auth.accessToken);

          useProfileStore
            .getState()
            .fetchProfile(auth.accountId, "common_core", auth.accessToken);
        }
      }
    }
  }, []);

  const isVertical   = sidebarPosition === "left" || sidebarPosition === "right";
  const effectiveSidebarSize = minimizeSidebar && isVertical ? 52 : sidebarSize;

  const getMainStyles = (): React.CSSProperties => {
    const sidebarWidth = trailerOpen ? 0 : effectiveSidebarSize;
    if (sidebarPosition === "top") {
      return {
        position: "fixed",
        top: frameHeight + effectiveSidebarSize,
        bottom: 0,
        left: 0,
        right: 0,
        overflow: "auto",
      };
    }
    if (sidebarPosition === "bottom") {
      return {
        position: "fixed",
        top: frameHeight,
        bottom: effectiveSidebarSize,
        left: 0,
        right: 0,
        overflow: "auto",
      };
    }
    if (sidebarPosition === "left") {
      return {
        position: "fixed",
        top: frameHeight,
        bottom: 0,
        left: sidebarWidth,
        right: 0,
        overflow: "auto",
      };
    }
    // right
    return {
      position: "fixed",
      top: frameHeight,
      bottom: 0,
      left: 0,
      right: sidebarWidth,
      overflow: "auto",
    };
  };
  
  const sidebarStyles: React.CSSProperties = {
    opacity: trailerOpen ? 0 : 1,
    pointerEvents: trailerOpen ? "none" : "auto",
    transform: trailerOpen ? "translateX(-20px)" : "translateX(0)",
    transition: "opacity 0.25s ease, transform 0.25s ease, pointer-events 0.25s ease",
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <BrowserRouter>
        <Frame />
        {!auth.isValidSession() ? (
          <Routes>
            <Route path="*" element={<Auth />} />
          </Routes>
        ) : (
          <>
            {sidebarPosition === "left" || sidebarPosition === "right" ? (
              <Sidebar style={sidebarStyles} />
            ) : (
              <Sidebar />
            )}
            <main
              className={`${colors.current.background.secondary} app-surface`}
              style={getMainStyles()}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <OnboardingModal
              onComplete={onboarding.complete}
            />
          </>
        )}
        <CustomToaster />
        <SnowGlobal />
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <TrailerProvider>
      <AppInner />
    </TrailerProvider>
  );
}

export default App;
