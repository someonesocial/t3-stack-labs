import React from "react";

export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      {/* Layered base gradient (radials + subtle vertical fade) ensures coverage even far below fold */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,hsl(275_85%_18%/0.55),transparent_65%),radial-gradient(circle_at_80%_70%,hsl(310_80%_20%/0.45),transparent_60%),radial-gradient(circle_at_55%_120%,hsl(250_70%_16%/0.5),transparent_60%),linear-gradient(to_bottom,hsl(255_70%_6%),hsl(255_70%_4%))]" />

      {/* Animated blobs (kept on their own layer for motion) */}
      <div className="absolute left-[-10%] top-[-10%] h-[60vmax] w-[60vmax] animate-[blobMove_18s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_center,hsl(280_90%_55%/0.18),transparent_70%)] blur-3xl" />
      <div className="absolute right-[-5%] top-[10%] h-[50vmax] w-[50vmax] animate-[blobMove_22s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_center,hsl(200_90%_60%/0.18),transparent_70%)] blur-3xl" />
      <div className="absolute bottom-[-10%] left-[20%] h-[55vmax] w-[55vmax] animate-[blobMove_26s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_center,hsl(320_90%_60%/0.18),transparent_65%)] blur-3xl" />
      {/* Additional mid / deep scroll support blob */}
      <div className="absolute top-[55%] left-[55%] h-[70vmax] w-[70vmax] animate-[blobMove_32s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_center,hsl(260_90%_55%/0.12),transparent_70%)] blur-[130px]" />

      {/* Soft global veil for readability */}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,hsl(260_70%_6%/.65),hsl(260_70%_4%/.9))] mix-blend-normal" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
}
