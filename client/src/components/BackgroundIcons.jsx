import React, { useMemo } from "react";
import { FaCut } from "react-icons/fa";
import { GiComb } from "react-icons/gi";

const DEFAULT_COUNT = 8;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// return true if two circles overlap
function overlap(a, b, padding = 8) {
  const dx = a.left - b.left;
  const dy = a.top - b.top;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < a.radius + b.radius + padding;
}

const BackgroundIcons = ({ count = DEFAULT_COUNT }) => {
  const icons = useMemo(() => {
    const placed = [];
    const attemptsLimit = 300;

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let placedIcon = null;

      while (attempts < attemptsLimit && !placedIcon) {
        attempts += 1;
        const size = rand(48, 140); // px
        // we'll position using percentage of container dimensions
        const left = rand(8, 92); // avoid edges
        const top = rand(8, 92);
        // approximate radius in percentage-space: convert size(px) to % by assuming 1200px container width height
        const approxContainer = 1200; // heuristic
        const radius = (size / 2 / approxContainer) * 100;

        const candidate = {
          id: i,
          type: Math.random() > 0.5 ? "comb" : "scissors",
          left,
          top,
          size,
          opacity: rand(0.06, 0.16),
          rotate: Math.floor(rand(0, 360)),
          radius,
        };

        let collides = false;
        for (const other of placed) {
          if (overlap(candidate, other, 1.5)) {
            collides = true;
            break;
          }
        }

        if (!collides) placedIcon = candidate;
      }

      // if couldn't place without collision, place anyway (last attempt)
      if (!placedIcon) {
        const size = rand(48, 140);
        const left = rand(6, 94);
        const top = rand(6, 94);
        const radius = (size / 2 / 1200) * 100;
        placedIcon = {
          id: i,
          type: Math.random() > 0.5 ? "comb" : "scissors",
          left,
          top,
          size,
          opacity: rand(0.06, 0.16),
          rotate: Math.floor(rand(0, 360)),
          radius,
        };
      }

      placed.push(placedIcon);
    }

    return placed;
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {icons.map((ic) => {
        const style = {
          left: `${ic.left}%`,
          top: `${ic.top}%`,
          fontSize: `${ic.size}px`,
          opacity: ic.opacity,
          transform: `translate(-50%, -50%) rotate(${ic.rotate}deg)`,
          color: "rgba(255,255,255,1)",
        };

        return (
          <div key={ic.id} style={style} className="absolute -translate-x-1/2 -translate-y-1/2">
            {ic.type === "comb" ? <GiComb /> : <FaCut />}
          </div>
        );
      })}
    </div>
  );
};

export default BackgroundIcons;
