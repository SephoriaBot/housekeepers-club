import React from "react";
import lanternImg from "../../docs/images/Lantern.png";

type LanternProps = {
  size?: number;
  className?: string;
};

export default function Lantern({ size = 80, className = "" }: LanternProps) {
  return (
    <img
      src={lanternImg}
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
