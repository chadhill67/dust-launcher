"use client";
import { useState } from "react";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { Config } from "../../config";
import { useUserStore } from "../../stores/user";
import { api } from "../../lib/api";
import { showToast } from "../components/toaster";

export function Auth() {
  const profile = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      showToast.error("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (!res.success || !res.data || !res.data.ok) {
        throw new Error(res.error || res.data?.message || "Login failed");
      }
      
      const token = res.data.access_token;
      const accountId = res.data.account_id;
      let displayName = res.data.display_name || email.split("@")[0];

      try {
        const profileRes = await api.postQueryProfile(accountId, "athena", token);
        if (profileRes.success && profileRes.data) {
          const profileData = profileRes.data.profile;
          if (profileData?.stats?.attributes?.displayName) {
            displayName = profileData.stats.attributes.displayName;
          }
        }
      } catch (profileErr) {
        console.warn("Profile query during login skipped:", profileErr);
      }
      
      profile.login({
        accountId,
        accessToken: token,
        displayName,
        email,
        password,
      });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      window.location.href = "/";
    } catch (err: any) {
      showToast.error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px 14px 48px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255, 255, 255, 0.45)",
    pointerEvents: "none",
  };

  // Generate 16 floating snow block / glass cubes
  const snowBlocks = Array.from({ length: 16 }).map((_, i) => ({
    id: i,
    size: 16 + (i % 5) * 12, // 16px to 64px
    left: `${(i * 19) % 94}%`,
    duration: 12 + (i % 4) * 4,
    delay: (i % 6) * 1.5,
    rotate: (i * 45) % 360,
  }));

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans text-white select-none">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={Config.IMAGES.LOGIN_BG || Config.IMAGES.SEASON_X_BG}
          alt=""
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== Config.IMAGES.SEASON_X_BG) {
              target.src = Config.IMAGES.SEASON_X_BG;
            } else {
              target.src = "https://cdn.wallpapersafari.com/1/60/2hUJw3.jpg";
            }
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
          draggable={false}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,10,16,0.72) 0%, rgba(12,15,24,0.55) 50%, rgba(6,8,12,0.85) 100%)" }} />
      </div>

      {/* Floating Snow Blocks / Glass Cubes Effect */}
      <div className="snow-block-container">
        {snowBlocks.map((block) => (
          <div
            key={block.id}
            className="snow-block"
            style={{
              width: block.size,
              height: block.size,
              left: block.left,
              top: "-80px",
              transform: `rotate(${block.rotate}deg)`,
              animation: `snow-fall-mid-global ${block.duration}s linear infinite`,
              animationDelay: `${block.delay}s`,
              opacity: 0.65,
            }}
          />
        ))}
      </div>

      {/* Centered Form Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div style={{ width: "100%", maxWidth: 420 }}>
          
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8" style={{ gap: 12 }}>
            <div style={{
              width: 76,
              height: 76,
              borderRadius: 20,
              background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}>
              <img
                src={Config.IMAGES.APP_ICON}
                alt="Logo"
                style={{ width: 50, height: 50, borderRadius: 12 }}
                draggable={false}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ 
                fontSize: 30, 
                fontWeight: 800, 
                letterSpacing: "-0.02em",
                color: "#fff",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}>
                {Config.NAME}
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                Welcome back! Sign in to jump into the action.
              </p>
            </div>
          </div>

          {/* Card with subtle glowing border */}
          <div style={{
            background: "linear-gradient(180deg, rgba(16, 20, 30, 0.88) 0%, rgba(10, 12, 18, 0.94) 100%)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 22,
            padding: "32px 28px 28px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
            backdropFilter: "blur(24px)",
          }}>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>

              {/* Email field */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ position: "relative" }}>
                  <Mail size={18} style={iconStyle} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    autoComplete="email"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={iconStyle} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  background: "#7aa2f7",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "0.05em",
                  borderRadius: 12,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <span>SIGN IN</span>}
              </button>
            </form>

            {/* Version footer */}
            <div style={{ 
              marginTop: 24, 
              textAlign: "center", 
              fontSize: 11, 
              color: "rgba(255,255,255,0.3)" 
            }}>
              {Config.NAME} v{Config.VERSION} · Season {Config.CURRENT_SEASON}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}