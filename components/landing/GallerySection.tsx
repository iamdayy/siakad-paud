import Image from "next/image";

const galleryItems = [
  {
    src: "/gallery-1.png",
    alt: "Kegiatan belajar kreatif di kelas",
    label: "Belajar Kreatif",
  },
  {
    src: "/gallery-2.png",
    alt: "Anak-anak bermain di taman bermain outdoor",
    label: "Bermain Outdoor",
  },
  {
    src: "/gallery-3.png",
    alt: "Makan siang bersama di sekolah",
    label: "Makan Bersama",
  },
  {
    src: "/gallery-4.png",
    alt: "Kegiatan seni dan melukis",
    label: "Seni & Kreasi",
  },
  {
    src: "/gallery-5.png",
    alt: "Pentas seni dan wisuda",
    label: "Pentas & Wisuda",
  },
  {
    src: "/gallery-6.png",
    alt: "Kelas musik dan bernyanyi",
    label: "Musik & Lagu",
  },
];

export function GallerySection() {
  return (
    <section
      id="galeri"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Galeri Kegiatan
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Momen Berharga di Sekolah Kami
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Setiap hari adalah petualangan baru. Lihat keseruan anak-anak
            belajar, bermain, dan berkreasi di PAUD Ceria Bintang.
          </p>
        </div>

        {/* Gallery grid */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-[1.5rem] border bg-card shadow-sm"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={600}
                  height={450}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              {/* Overlay with label */}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="w-full px-5 pb-5 text-sm font-semibold text-white">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
