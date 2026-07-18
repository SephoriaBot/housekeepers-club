import { useEffect } from "react";
import { useHamsterGrowth } from "./useHamsterGrowth";

export default function HamsterNest() {
  const { loading, points, threshold, progressPct, justHatched, clearJustHatched } = useHamsterGrowth();

  useEffect(() => {
    if (justHatched) {
      const t = setTimeout(clearJustHatched, 3000);
      return () => clearTimeout(t);
    }
  }, [justHatched, clearJustHatched]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: "center", fontSize: 12, color: "var(--ink-muted)" }}>
          checking the nest...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="section-label" style={{ marginBottom: 10 }}>🥚 The Nest</div>

        {justHatched ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <img
              src={justHatched.image}
              alt="a new hamster hatched"
              style={{ width: 96, height: 96, objectFit: "contain", animation: "hatchPop 0.7s ease" }}
            />
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--pink-dark)", marginTop: 6 }}>
              A new hamster hatched! 🎉
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", fontSize: 40, marginBottom: 10 }}>
              {progressPct >= 75 ? "🐣" : "🥚"}
            </div>
            <div style={{ height: 10, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background: "var(--pink-dark)",
                  borderRadius: 99,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 6, textAlign: "center" }}>
              {points.toFixed(0)} / {threshold} — pay bills, chip at debt, finish your day, and it grows
            </div>
          </>
        )}

        <style>{`
          @keyframes hatchPop {
            0% { transform: scale(0.3); opacity: 0; }
            60% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
