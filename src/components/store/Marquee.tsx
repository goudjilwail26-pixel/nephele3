export default function Marquee({ text }: { text: string }) {
  // Duplicate text to ensure smooth infinite scroll
  const repeatedText = Array(10).fill(text)

  return (
    <div className="w-full overflow-hidden bg-nephele-white text-nephele-black border-y border-nephele-border py-2 flex relative">
      <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap">
        {repeatedText.map((t, i) => (
          <span key={i} className="text-xs uppercase tracking-[0.2em] px-8 font-mono font-medium">
            {t}
          </span>
        ))}
      </div>
      {/* Second identical div for seamless loop */}
      <div className="flex absolute top-2 animate-[marquee_20s_linear_infinite] whitespace-nowrap" style={{ animationDelay: '-10s' }} aria-hidden="true">
         {repeatedText.map((t, i) => (
          <span key={i} className="text-xs uppercase tracking-[0.2em] px-8 font-mono font-medium">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
