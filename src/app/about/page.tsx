import { SectionHeader } from "../_components/ui/section-header";
import { GlassCard } from "../_components/ui/glass-card";
import Link from "next/link";

export const metadata = { title: "About — Paul Klemm" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 space-y-12">
      <div className="flex items-center justify-end">
        <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/20">← Back to home</Link>
      </div>
      {/* Heading + subtitle only (requested content) */}
      <SectionHeader
        align="center"
        eyebrow="Hello, I&apos;m Paul Klemm! 👋"
        title="Welcome to my Profile!"
        subtitle="I’m an online media student from Germany, passionate about technology and creating innovative digital solutions."
      />

      {/* About Me */}
      <GlassCard title="About Me 👨‍💻" subtitle="Snapshot">
        <ul className="list-disc space-y-1 pl-5 text-white/80">
          <li>🎓 Online media student from Germany</li>
          <li>📱 Software developer</li>
          <li>🎨 Web designer with a focus on minimal design</li>
          <li>🚀 Passionate about pushing the boundaries of what&apos;s possible</li>
        </ul>
      </GlassCard>

      {/* Interests */}
      <GlassCard title="My Interests 🌟" subtitle="What excites me">
        <ul className="list-disc space-y-1 pl-5 text-white/80">
          <li>🤖 AI Technology</li>
          <li>🎨 Minimal Design</li>
          <li>⚙️ Technical Finesse</li>
          <li>❤️ Open Source Software</li>
          <li>🕸️ Web Development</li>
          <li>🔗 Decentralized Web</li>
          <li>🔬 Cutting‑Edge Technologies</li>
        </ul>
      </GlassCard>

      {/* Projects */}
      <GlassCard title="Projects 🛠️" subtitle="Things I build">
        <ul className="list-disc space-y-2 pl-5 text-white/80">
          <li>
            🌐 My personal website:&nbsp;
            <a href="https://paulklemm.de" className="underline underline-offset-2 hover:text-white" target="_blank" rel="noreferrer noopener">
              paulklemm.de
            </a>
            &nbsp;— a physics simulation coded from scratch in TypeScript!
          </li>
          <li>
            📱 Android development projects:
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <a href="https://xnorroid.com" className="underline underline-offset-2 hover:text-white" target="_blank" rel="noreferrer noopener">
                  xnorroid.com
                </a>
              </li>
              <li>
                <a href="https://github.com/xnorroid" className="underline underline-offset-2 hover:text-white" target="_blank" rel="noreferrer noopener">
                  github.com/xnorroid
                </a>
              </li>
            </ul>
          </li>
          <li>📂 Feel free to explore my repositories for more exciting projects!</li>
        </ul>
      </GlassCard>

      {/* Contact */}
      <GlassCard title="Get in Touch 📫" subtitle="Feel free to reach out!">
        <p className="text-white/80">
          ✉️ Email:&nbsp;
          <a href="mailto:info@paulklemm.de" className="underline underline-offset-2 hover:text-white">info@paulklemm.de</a>
        </p>
      </GlassCard>
    </main>
  );
}
