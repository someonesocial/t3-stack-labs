import React from "react";

export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      <div className="absolute left-[-10%] top-[-10%] h-[60vmax] w-[60vmax] animate-[blobMove_18s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_center,hsl(280_90%_50%/0.18),transparent_70%)] blur-3xl" />
      <div className="absolute right-[-5%] top-[10%] h-[50vmax] w-[50vmax] animate-[blobMove_22s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_center,hsl(200_90%_55%/0.18),transparent_70%)] blur-3xl" />
      <div className="absolute bottom-[-10%] left-[20%] h-[55vmax] w-[55vmax] animate-[blobMove_26s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_center,hsl(320_90%_55%/0.18),transparent_65%)] blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,hsl(260_70%_6%/.8),hsl(260_70%_4%/.9))]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
}
