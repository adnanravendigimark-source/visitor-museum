import type { Museum } from "@/lib/museums";

export default function MuseumPracticalInfo({ museum }: { museum: Museum }) {
  return (
    <section id="practical" className="bg-[#FAF8F5] py-20 sm:py-24 border-b border-[#EAE6DE]/70">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#E8ECEF] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3EA] text-[#B85D3E] font-bold text-lg mb-4">
            ⏱
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#112338]">{museum.practicalHoursHeading}</h3>
          {museum.practicalHours.length > 0 && (
            <table className="mt-4 w-full text-xs sm:text-sm">
              <tbody>
                {museum.practicalHours.map((row, i) => (
                  <tr key={row.range + i} className="border-b border-[#EDE7D7] last:border-0">
                    <td className="py-2.5 pr-3 text-[#556476]">{row.range}</td>
                    <td className="py-2.5 text-right font-semibold text-[#112338]">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {museum.practicalHoursNote && <p className="mt-3 text-xs text-[#8A9BA8]">{museum.practicalHoursNote}</p>}
        </div>

        <div className="rounded-2xl border border-[#E8ECEF] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F7] text-[#3F5360] font-bold text-lg mb-4">
            📍
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#112338]">{museum.practicalAddressHeading}</h3>
          <p className="mt-4 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-[#556476]">{museum.practicalAddress}</p>
          {museum.practicalGettingThere && (
            <p className="mt-3 text-xs font-semibold text-[#B85D3E]">{museum.practicalGettingThere}</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#E8ECEF] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF9F0] text-[#B85D3E] font-bold text-lg mb-4">
            💡
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#112338]">{museum.practicalBestTimeHeading}</h3>
          <div
            className="rich-content mt-4 text-xs sm:text-sm text-[#556476] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: museum.practicalBestTimeBody }}
          />
        </div>
      </div>
    </section>
  );
}
