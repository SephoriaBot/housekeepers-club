import React from "react";

type LanternProps = {
  size?: number;
  className?: string;
};

export default function Lantern({ size = 80, className = "" }: LanternProps) {
  return (
    <img
      src="/assets/Lantern.png"
      alt="Lantern decoration"
      className={className}
      style={{
        width: size,
        height: "auto",
        pointerEvents: "none",
      }}
    />
  );
}