import React from "react";
import Svg, { Ellipse, Path } from "react-native-svg";

export function ButterflyIcon({ color }: { color: string }) {
  return (
    <Svg width={30} height={24} viewBox="0 0 30 24">
      <Ellipse
        cx={9.2}
        cy={8.2}
        rx={5.3}
        ry={6.2}
        fill={color}
        transform="rotate(-32 9.2 8.2)"
      />
      <Ellipse
        cx={20.8}
        cy={8.2}
        rx={5.3}
        ry={6.2}
        fill={color}
        transform="rotate(32 20.8 8.2)"
      />
      <Ellipse
        cx={9.8}
        cy={16.2}
        rx={4.1}
        ry={4.7}
        fill={color}
        opacity={0.9}
        transform="rotate(30 9.8 16.2)"
      />
      <Ellipse
        cx={20.2}
        cy={16.2}
        rx={4.1}
        ry={4.7}
        fill={color}
        opacity={0.9}
        transform="rotate(-30 20.2 16.2)"
      />
      <Path
        d="M15 7.6c1.3 1.7 1.3 6.6 0 8.4-1.3-1.8-1.3-6.7 0-8.4Z"
        fill="#20212B"
        opacity={0.88}
      />
    </Svg>
  );
}
