"use client";

export function PrintButton() {
  return (
    <div className="mt-12 text-center print:hidden">
      <button 
        onClick={() => window.print()} 
        className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
      >
        Cetak Dokumen (Ctrl+P)
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Gunakan opsi "Save as PDF" di browser Anda. <br/>
        Untuk ukuran F4/Folio, buat custom paper size di pengaturan print browser (215 x 330 mm).
      </p>
    </div>
  );
}
