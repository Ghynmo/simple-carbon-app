import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

// Data dummy untuk tingkat penyerapan tanaman (nilai ini adalah ilustratif)
// Carbon rate dalam gram CO2 per tahun per tanaman
// VOC rate dalam unit arbitrer per tahun per tanaman
const plantData = [
  { 
    name: 'Lidah Mertua (Sansevieria)', 
    carbonRate: 500, 
    vocRate: 1000,
    icon: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="35" y="20" width="8" height="60" fill="#2d5016" rx="4"/>
        <rect x="45" y="15" width="8" height="70" fill="#4a7c59" rx="4"/>
        <rect x="55" y="25" width="8" height="55" fill="#2d5016" rx="4"/>
        <rect x="30" y="80" width="40" height="15" fill="#8b4513" rx="5"/>
        <path d="M39 20 Q41 10 43 20" fill="#6b8e23"/>
        <path d="M49 15 Q51 5 53 15" fill="#9acd32"/>
        <path d="M59 25 Q61 15 63 25" fill="#6b8e23"/>
      </svg>
    )
  },
  { 
    name: 'Spider Plant (Chlorophytum comosum)', 
    carbonRate: 400, 
    vocRate: 800,
    icon: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <ellipse cx="50" cy="85" rx="25" ry="10" fill="#8b4513"/>
        <path d="M25 75 Q30 40 35 75" fill="#228b22" stroke="#006400" strokeWidth="1"/>
        <path d="M35 75 Q40 35 45 75" fill="#32cd32" stroke="#228b22" strokeWidth="1"/>
        <path d="M45 75 Q50 30 55 75" fill="#228b22" stroke="#006400" strokeWidth="1"/>
        <path d="M55 75 Q60 35 65 75" fill="#32cd32" stroke="#228b22" strokeWidth="1"/>
        <path d="M65 75 Q70 40 75 75" fill="#228b22" stroke="#006400" strokeWidth="1"/>
        <path d="M40 60 Q20 50 15 40" fill="none" stroke="#228b22" strokeWidth="2"/>
        <path d="M60 60 Q80 50 85 40" fill="none" stroke="#228b22" strokeWidth="2"/>
        <circle cx="15" cy="40" r="3" fill="#32cd32"/>
        <circle cx="85" cy="40" r="3" fill="#32cd32"/>
      </svg>
    )
  },
  { 
    name: 'Peace Lily (Spathiphyllum)', 
    carbonRate: 300, 
    vocRate: 1200,
    icon: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <ellipse cx="50" cy="85" rx="20" ry="8" fill="#8b4513"/>
        <path d="M30 75 Q35 45 40 75" fill="#006400" stroke="#004d00" strokeWidth="1"/>
        <path d="M40 75 Q45 40 50 75" fill="#228b22" stroke="#006400" strokeWidth="1"/>
        <path d="M50 75 Q55 40 60 75" fill="#006400" stroke="#004d00" strokeWidth="1"/>
        <path d="M60 75 Q65 45 70 75" fill="#228b22" stroke="#006400" strokeWidth="1"/>
        <path d="M45 50 Q35 30 25 35 Q30 20 45 25 Q55 20 70 25 Q75 30 65 35 Q55 30 45 50" fill="#ffffff" stroke="#e6e6e6" strokeWidth="1"/>
        <path d="M45 45 L48 35" stroke="#ffff99" strokeWidth="2"/>
      </svg>
    )
  },
  { 
    name: 'Palem Areca (Dypsis lutescens)', 
    carbonRate: 600, 
    vocRate: 700,
    icon: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="45" y="60" width="10" height="25" fill="#8b4513"/>
        <ellipse cx="50" cy="85" rx="15" ry="8" fill="#654321"/>
        <path d="M50 60 Q30 20 25 15 Q35 10 50 40" fill="#228b22"/>
        <path d="M50 60 Q40 25 35 20 Q45 15 50 45" fill="#32cd32"/>
        <path d="M50 60 Q50 20 50 15 Q55 15 50 45" fill="#228b22"/>
        <path d="M50 60 Q60 25 65 20 Q55 15 50 45" fill="#32cd32"/>
        <path d="M50 60 Q70 20 75 15 Q65 10 50 40" fill="#228b22"/>
        <path d="M50 60 Q35 30 30 25 Q40 20 50 50" fill="#9acd32"/>
        <path d="M50 60 Q65 30 70 25 Q60 20 50 50" fill="#9acd32"/>
      </svg>
    )
  },
  { 
    name: 'Sirih Gading (Pothos)', 
    carbonRate: 350, 
    vocRate: 900,
    icon: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <ellipse cx="50" cy="85" rx="20" ry="8" fill="#8b4513"/>
        <path d="M50 75 Q30 60 20 45 Q25 40 35 50 Q45 55 50 65" fill="#228b22"/>
        <path d="M50 75 Q40 55 35 40 Q40 35 50 45 Q55 50 50 65" fill="#32cd32"/>
        <path d="M50 75 Q50 50 50 35 Q55 30 60 40 Q55 50 50 65" fill="#228b22"/>
        <path d="M50 75 Q60 55 65 40 Q70 35 75 45 Q65 55 50 65" fill="#32cd32"/>
        <path d="M50 75 Q70 60 80 45 Q75 40 65 50 Q55 55 50 65" fill="#228b22"/>
        <circle cx="35" cy="45" r="2" fill="#ffff99"/>
        <circle cx="50" cy="40" r="2" fill="#ffff99"/>
        <circle cx="65" cy="45" r="2" fill="#ffff99"/>
      </svg>
    )
  },
  { 
    name: 'Monstera Deliciosa', 
    carbonRate: 550, 
    vocRate: 600,
    icon: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <ellipse cx="50" cy="85" rx="18" ry="8" fill="#8b4513"/>
        <path d="M50 75 Q35 45 30 30 Q40 25 50 40 Q60 25 70 30 Q65 45 50 75" fill="#228b22"/>
        <path d="M50 75 Q45 55 40 40 Q50 35 60 40 Q55 55 50 75" fill="#32cd32"/>
        <ellipse cx="45" cy="50" rx="3" ry="8" fill="#2d5016"/>
        <ellipse cx="55" cy="50" rx="3" ry="8" fill="#2d5016"/>
        <ellipse cx="50" cy="45" rx="2" ry="5" fill="#2d5016"/>
        <circle cx="42" cy="40" r="2" fill="#2d5016"/>
        <circle cx="58" cy="40" r="2" fill="#2d5016"/>
        <path d="M35 35 Q30 30 25 35" fill="none" stroke="#228b22" strokeWidth="2"/>
        <path d="M65 35 Q70 30 75 35" fill="none" stroke="#228b22" strokeWidth="2"/>
      </svg>
    )
  },
];

const App = () => {
  const [plants, setPlants] = useState([]);
  const [selectedPlants, setSelectedPlants] = useState([]); // Tanaman yang dipilih dari list
  const [carbonAbsorbed, setCarbonAbsorbed] = useState(0);
  const [vocsAbsorbed, setVocsAbsorbed] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [message, setMessage] = useState('');
  const [environmentalSummary, setEnvironmentalSummary] = useState('');
  const [plantCareTips, setPlantCareTips] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [showPlantSelector, setShowPlantSelector] = useState(false); // State untuk menampilkan list tanaman
  
  // State untuk tanaman kustom
  const [customPlants, setCustomPlants] = useState([]);
  const [showAddCustomPlant, setShowAddCustomPlant] = useState(false);
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantCarbonRate, setNewPlantCarbonRate] = useState('');
  const [newPlantVocRate, setNewPlantVocRate] = useState('');

  // Referensi untuk elemen laporan yang akan dikonversi ke PDF
  const reportRef = useRef(null);
  
  // Menggabungkan tanaman preset dengan tanaman kustom
  const getAllPlants = () => {
    return [...plantData, ...customPlants];
  };

  // Fungsi untuk menambahkan tanaman dari list ke selected plants
  const handleSelectPlantFromList = (plantName) => {
    const existingPlant = selectedPlants.find(p => p.type === plantName);
    if (existingPlant) {
      // Jika tanaman sudah ada, tambah quantity
      setSelectedPlants(selectedPlants.map(p => 
        p.type === plantName ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      // Jika tanaman belum ada, tambahkan baru
      setSelectedPlants([...selectedPlants, { type: plantName, quantity: 1 }]);
    }
    resetOutputs();
  };

  // Fungsi untuk mengubah quantity tanaman yang dipilih
  const handleQuantityChange = (plantName, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0;
    if (quantity <= 0) {
      // Hapus tanaman jika quantity 0 atau kurang
      setSelectedPlants(selectedPlants.filter(p => p.type !== plantName));
    } else {
      setSelectedPlants(selectedPlants.map(p => 
        p.type === plantName ? { ...p, quantity } : p
      ));
    }
    resetOutputs();
  };

  // Fungsi untuk menghapus tanaman dari selected plants
  const handleRemoveSelectedPlant = (plantName) => {
    setSelectedPlants(selectedPlants.filter(p => p.type !== plantName));
    resetOutputs();
  };

  // Fungsi untuk menambahkan tanaman kustom
  const handleAddCustomPlant = () => {
    if (!newPlantName.trim() || !newPlantCarbonRate || !newPlantVocRate) {
      setMessage('Harap isi semua field untuk tanaman kustom.');
      return;
    }

    const carbonRate = parseFloat(newPlantCarbonRate);
    const vocRate = parseFloat(newPlantVocRate);

    if (carbonRate < 0 || vocRate < 0) {
      setMessage('Nilai penyerapan tidak boleh negatif.');
      return;
    }

    // Cek apakah nama tanaman sudah ada
    const allPlants = getAllPlants();
    if (allPlants.some(plant => plant.name.toLowerCase() === newPlantName.trim().toLowerCase())) {
      setMessage('Nama tanaman sudah ada. Gunakan nama yang berbeda.');
      return;
    }

    const newCustomPlant = {
      name: newPlantName.trim(),
      carbonRate: carbonRate,
      vocRate: vocRate
    };

    setCustomPlants([...customPlants, newCustomPlant]);
    setNewPlantName('');
    setNewPlantCarbonRate('');
    setNewPlantVocRate('');
    setShowAddCustomPlant(false);
    setMessage('Tanaman kustom berhasil ditambahkan!');
    
    // Hapus pesan sukses setelah 3 detik
    setTimeout(() => {
      if (message === 'Tanaman kustom berhasil ditambahkan!') {
        setMessage('');
      }
    }, 3000);
  };

  // Fungsi untuk menghapus tanaman kustom
  const handleRemoveCustomPlant = (plantName) => {
    setCustomPlants(customPlants.filter(plant => plant.name !== plantName));
    // Hapus tanaman kustom dari daftar selectedPlants yang sedang dipilih
    setSelectedPlants(selectedPlants.filter(plant => plant.type !== plantName));
    resetOutputs();
  };
  
  // Referensi untuk elemen laporan yang akan dikonversi ke PDF

  // Fungsi untuk mereset laporan dan konten yang dihasilkan LLM
  const resetOutputs = () => {
    setShowReport(false);
    setMessage('');
    setEnvironmentalSummary('');
    setPlantCareTips('');
  };

  // Fungsi untuk menghasilkan dan mengunduh PDF
  const generatePDF = async () => {
    if (!reportRef.current) {
      setMessage('Tidak dapat menghasilkan PDF. Silakan coba lagi.');
      return;
    }

    try {
      setMessage('Sedang membuat PDF, harap tunggu...');
      
      const element = reportRef.current;
      if (!element) {
        throw new Error('Element report tidak ditemukan');
      }

      // Konfigurasi html2canvas yang sederhana dan reliable
      const canvas = await html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight
      });

      // Validasi canvas
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Gagal membuat canvas dari elemen');
      }

      // Konversi canvas ke image data
      const imgData = canvas.toDataURL('image/png');
      
      // Buat PDF dengan ukuran A4
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      // Dapatkan dimensi halaman PDF
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Hitung dimensi gambar dengan margin
      const margin = 10;
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Jika gambar terlalu tinggi untuk satu halaman, bagi menjadi beberapa halaman
      if (imgHeight > pageHeight - (2 * margin)) {
        const pageContentHeight = pageHeight - (2 * margin);
        const totalPages = Math.ceil(imgHeight / pageContentHeight);
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          const sourceY = (i * pageContentHeight * canvas.height) / imgHeight;
          const sourceHeight = Math.min(
            (pageContentHeight * canvas.height) / imgHeight,
            canvas.height - sourceY
          );
          
          // Buat canvas untuk bagian halaman ini
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          
          const pageCtx = pageCanvas.getContext('2d');
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png');
          const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
          
          pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, pageImgHeight);
        }
      } else {
        // Gambar muat dalam satu halaman
        const yPosition = margin;
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      }

      // Download PDF
      const fileName = `Laporan_Penyerapan_Karbon_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
      setMessage('PDF berhasil dibuat dan diunduh!');
      
      // Menghapus pesan sukses setelah 3 detik
      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
      
      // Tampilkan pesan error yang lebih spesifik untuk debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Error details:', error.message, error.stack);
      }
    }
  };

  // Melakukan kalkulasi total penyerapan karbon dan VOCs
  const calculateAbsorption = () => {
    if (selectedPlants.length === 0) {
      setMessage('Pilih minimal satu tanaman untuk dihitung.');
      setShowReport(false);
      return;
    }

    let totalCarbon = 0;
    let totalVocs = 0;
    let hasInvalidInput = false;
    const allPlants = getAllPlants();

    selectedPlants.forEach(plant => {
      const selectedPlant = allPlants.find(data => data.name === plant.type);
      if (selectedPlant && plant.quantity > 0) {
        totalCarbon += selectedPlant.carbonRate * plant.quantity;
        totalVocs += selectedPlant.vocRate * plant.quantity;
      } else if (plant.quantity <= 0) {
        hasInvalidInput = true;
      }
    });

    if (hasInvalidInput) {
      setMessage('Pastikan semua tanaman memiliki kuantitas lebih dari 0.');
      setShowReport(false);
      return;
    }

    setCarbonAbsorbed(totalCarbon);
    setVocsAbsorbed(totalVocs);
    setShowReport(true);
    setMessage('');
    setEnvironmentalSummary(''); // Clear previous summary
    setPlantCareTips(''); // Clear previous tips
  };

  // Fungsi untuk memanggil Gemini API untuk ringkasan dampak lingkungan
  const generateEnvironmentalSummary = async () => {
    if (!showReport || (carbonAbsorbed === 0 && vocsAbsorbed === 0)) {
      setMessage('Harap hitung penyerapan terlebih dahulu.');
      return;
    }

    setIsGeneratingSummary(true);
    setEnvironmentalSummary('');
    setMessage('');

    try {
      const plantList = plants
        .filter(plant => plant.type !== 'Pilih Tanaman' && plant.quantity > 0)
        .map(plant => `${plant.quantity} ${plant.type}`)
        .join(', ');

      // Konversi data untuk perbandingan yang mudah dipahami
      const carbonKg = carbonAbsorbed / 1000; // gram ke kg
      const carbonTons = carbonKg / 1000; // kg ke ton

      // Statistik perbandingan menarik
      const carEmissionPerKm = 120; // gram CO2 per km (rata-rata mobil)
      const carKmEquivalent = Math.round(carbonAbsorbed / carEmissionPerKm);
      const treesEquivalent = Math.round(carbonAbsorbed / 22000); // 1 pohon dewasa ~22kg CO2/tahun
      const householdDailyEmission = 16000; // gram CO2 per hari rata-rata rumah tangga
      const householdDaysEquivalent = Math.round(carbonAbsorbed / householdDailyEmission);

      const prompt = `Berdasarkan data berikut:
- Tanaman yang ditanam: ${plantList}
- Total CO2 yang diserap: ${carbonAbsorbed.toLocaleString()} gram per tahun (${carbonKg.toFixed(1)} kg atau ${carbonTons.toFixed(3)} ton)
- Total VOCs yang diserap: ${vocsAbsorbed.toLocaleString()} unit per tahun

STATISTIK PERBANDINGAN MENARIK:
- Setara dengan mengurangi emisi ${carKmEquivalent.toLocaleString()} km perjalanan mobil
- Setara dengan ${treesEquivalent} pohon dewasa dalam menyerap CO2
- Setara dengan menetralisir emisi rumah tangga selama ${householdDaysEquivalent} hari
- Dalam kilogram: ${carbonKg.toFixed(1)} kg CO2 diserap per tahun
- Dalam ton: ${carbonTons.toFixed(3)} ton CO2 diserap per tahun

Buatkan ringkasan dampak lingkungan yang positif dan inspiratif dalam bahasa Indonesia.

WAJIB SERTAKAN:
1. Statistik perbandingan di atas dalam format yang menarik dan mudah dipahami
2. Penjelasan manfaat konkret terhadap lingkungan dan kualitas udara
3. Dampak positif terhadap kehidupan sehari-hari
4. Motivasi untuk terus berkontribusi pada lingkungan

Gunakan bahasa yang mudah dipahami, menarik, dan inspiratif. Sertakan emoji yang relevan untuk membuat lebih menarik.`;
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Leave this as-is. Canvas will provide the API key at runtime.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setEnvironmentalSummary(text);
      } else {
        setMessage('Gagal menghasilkan ringkasan dampak lingkungan. Coba lagi.');
        console.error('Unexpected API response structure:', result);
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat menghubungi API. Coba lagi.');
      console.error('Error generating environmental summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Fungsi untuk memanggil Gemini API untuk tips perawatan tanaman
  const generatePlantCareTips = async () => {
    const selectedPlantNames = selectedPlants
      .filter(plant => plant.type !== 'Pilih Tanaman' && plant.quantity > 0)
      .map(plant => plant.type);

    if (selectedPlantNames.length === 0) {
      setMessage('Harap pilih tanaman yang valid untuk mendapatkan tips perawatan.');
      return;
    }

    setIsGeneratingTips(true);
    setPlantCareTips('');
    setMessage('');

    try {
      const plantList = plants
        .filter(plant => plant.type !== 'Pilih Tanaman' && plant.quantity > 0)
        .map(plant => `${plant.quantity} ${plant.type}`)
        .join(', ');

      const prompt = `Sebagai ahli hortikultura dan perawatan tanaman, berikan panduan perawatan yang komprehensif dan praktis untuk tanaman berikut: ${selectedPlantNames.join(', ')}.

WAJIB SERTAKAN untuk setiap jenis tanaman:

🌱 **KEBUTUHAN DASAR:**
- Intensitas cahaya (rendah/sedang/tinggi) dan durasi ideal
- Frekuensi penyiraman dan cara mengecek kelembaban tanah
- Tingkat kelembaban udara yang dibutuhkan
- Suhu optimal (rentang minimum-maksimum)

🌿 **PERAWATAN RUTIN:**
- Jadwal pemupukan (jenis pupuk dan frekuensi)
- Cara dan waktu pemangkasan yang tepat
- Tanda-tanda tanaman sehat vs tidak sehat
- Kapan dan cara repotting/pindah pot

🐛 **PENCEGAHAN MASALAH:**
- Hama dan penyakit yang sering menyerang
- Cara pencegahan alami dan aman
- Tanda-tanda awal masalah dan solusinya
- Tips menjaga sirkulasi udara

🏠 **PENEMPATAN & LINGKUNGAN:**
- Lokasi ideal di dalam/luar ruangan
- Jarak antar tanaman yang optimal
- Ventilasi dan sirkulasi udara
- Perlindungan dari cuaca ekstrem

💡 **TIPS KHUSUS & TRIK:**
- Cara mempercepat pertumbuhan secara alami
- Metode propagasi/perbanyakan tanaman
- Seasonal care (perawatan musiman)
- Cara memaksimalkan kemampuan penyerapan polutan

⚠️ **KESALAHAN UMUM YANG HARUS DIHINDARI:**
- Over-watering vs under-watering
- Penempatan yang salah
- Kesalahan pemupukan
- Mengabaikan tanda-tanda penyakit

Gunakan bahasa Indonesia yang mudah dipahami, berikan tips praktis yang bisa langsung diterapkan, dan sertakan emoji yang relevan untuk setiap bagian. Fokus pada solusi yang ramah lingkungan dan sustainable.

Untuk tanaman kustom (jika ada), berikan tips umum berdasarkan karakteristik tanaman serupa.`;

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Leave this as-is. Canvas will provide the API key at runtime.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setPlantCareTips(text);
      } else {
        setMessage('Gagal menghasilkan tips perawatan tanaman. Coba lagi.');
        console.error('Unexpected API response structure:', result);
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat menghubungi API. Coba lagi.');
      console.error('Error generating plant care tips:', error);
    } finally {
      setIsGeneratingTips(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-2 sm:p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-2xl border border-green-200">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-green-800 mb-4 sm:mb-6">
          Aplikasi Hejoijo
        </h1>
        <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
          Hitung kemampuan tanaman Anda dalam menyerap karbon dan VOCs.
        </p>

        <div className="space-y-4 mb-6">
          {/* Tombol untuk menampilkan/menyembunyikan list tanaman */}
          <button
            onClick={() => setShowPlantSelector(!showPlantSelector)}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showPlantSelector ? 'Tutup Pilihan Tanaman' : 'Pilih Tanaman'}
          </button>

          {/* List tanaman dengan foto */}
          {showPlantSelector && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">🌿 Pilih Tanaman Anda</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getAllPlants().map((plant, index) => {
                  const isCustomPlant = customPlants.some(cp => cp.name === plant.name);
                  return (
                    <div
                      key={index}
                      onClick={() => handleSelectPlantFromList(plant.name)}
                      className="bg-white p-3 rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition duration-200 cursor-pointer group"
                    >
                      <div className="w-16 h-16 mx-auto mb-2 group-hover:scale-110 transition duration-200">
                        {plant.icon || (
                          <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🌱</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <h4 className="text-xs font-medium text-gray-800 mb-1 line-clamp-2">{plant.name}</h4>
                        {isCustomPlant && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Kustom</span>
                        )}
                        <div className="text-xs text-gray-600 mt-1">
                          <div>CO2: {plant.carbonRate}g</div>
                          <div>VOC: {plant.vocRate}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tanaman yang dipilih */}
          {selectedPlants.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">🌱 Tanaman yang Dipilih</h3>
              <div className="space-y-3">
                {selectedPlants.map((plant, index) => {
                  const allPlants = getAllPlants();
                  const plantInfo = allPlants.find(p => p.name === plant.type);
                  const isCustomPlant = customPlants.some(cp => cp.name === plant.type);
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                      <div className="w-12 h-12 flex-shrink-0">
                        {plantInfo?.icon || (
                          <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-lg">🌱</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-800 truncate">{plant.type}</h4>
                          {isCustomPlant && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Kustom</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          CO2: {plantInfo?.carbonRate || 0}g • VOC: {plantInfo?.vocRate || 0}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={plant.quantity}
                          onChange={(e) => handleQuantityChange(plant.type, e.target.value)}
                          className="w-16 p-1 border border-blue-300 rounded text-center text-sm"
                        />
                        <button
                          onClick={() => handleRemoveSelectedPlant(plant.type)}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bagian Tanaman Kustom */}
        <div className="mb-4">
          <button
            onClick={() => setShowAddCustomPlant(!showAddCustomPlant)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">{showAddCustomPlant ? 'Tutup Form Tanaman Kustom' : 'Tambah Tanaman Kustom'}</span>
            <span className="sm:hidden">{showAddCustomPlant ? 'Tutup Form' : 'Tambah Kustom'}</span>
          </button>

          {showAddCustomPlant && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3">Tambah Tanaman Kustom</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nama Tanaman</label>
                  <input
                    type="text"
                    value={newPlantName}
                    onChange={(e) => setNewPlantName(e.target.value)}
                    placeholder="Contoh: Tanaman Hias Favorit"
                    className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Penyerapan CO2 (gram/tahun/tanaman)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newPlantCarbonRate}
                      onChange={(e) => setNewPlantCarbonRate(e.target.value)}
                      placeholder="500"
                      className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Penyerapan VOCs (unit/tahun/tanaman)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newPlantVocRate}
                      onChange={(e) => setNewPlantVocRate(e.target.value)}
                      placeholder="1000"
                      className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddCustomPlant}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out text-sm sm:text-base"
                >
                  Simpan Tanaman Kustom
                </button>
              </div>
            </div>
          )}

          {/* Daftar Tanaman Kustom */}
          {customPlants.length > 0 && (
            <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Tanaman Kustom Tersimpan</h3>
              <div className="space-y-2">
                {customPlants.map((plant, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-white rounded-md border border-gray-200 gap-2">
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 text-sm sm:text-base">{plant.name}</span>
                      <div className="text-xs sm:text-sm text-gray-600">
                        CO2: {plant.carbonRate} g/tahun • VOCs: {plant.vocRate} unit/tahun
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomPlant(plant.name)}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ease-in-out self-start sm:self-center"
                      aria-label="Hapus tanaman kustom"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={calculateAbsorption}
          className="w-full bg-emerald-500 text-white py-2 sm:py-3 px-4 rounded-xl hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition duration-300 ease-in-out shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 2v-2m-6 4h.01M12 17h.01M15 17h.01M6 12v3.586a1 1 0 00.293.707l2.586 2.586a1 1 0 00.707.293h3.586a1 1 0 00.707-.293l2.586-2.586a1 1 0 00.293-.707V12M12 6V4m0 0V3m0 1H9m3 0h3" />
          </svg>
          Hitung Penyerapan
        </button>

        {message && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
            {message}
          </div>
        )}

        {showReport && (
          <div 
            ref={reportRef} 
            className="mt-6 sm:mt-8 bg-green-50 p-4 sm:p-6 rounded-2xl shadow-inner border border-green-200"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-3 sm:mb-4 text-center">
              Laporan Penyerapan
            </h2>
            
            {/* Daftar Tanaman yang Dihitung */}
            <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-green-100">
              <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2 sm:mb-3">Daftar Tanaman yang Dihitung:</h3>
              <div className="space-y-2">
                {selectedPlants
                  .filter(plant => plant.quantity > 0)
                  .map((plant, index) => {
                    const allPlants = getAllPlants();
                    const plantInfo = allPlants.find(data => data.name === plant.type);
                    const isCustomPlant = customPlants.some(cp => cp.name === plant.type);
                    return (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-green-50 rounded-md border border-green-100 gap-2">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-800 text-sm sm:text-base">{plant.type}</span>
                            {isCustomPlant && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Kustom</span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            CO2: {plantInfo?.carbonRate || 0} g/tahun/tanaman • VOCs: {plantInfo?.vocRate || 0} unit/tahun/tanaman
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-base sm:text-lg font-semibold text-green-700">{plant.quantity} tanaman</span>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Total: {((plantInfo?.carbonRate || 0) * plant.quantity).toLocaleString()} g CO2/tahun
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>

            {/* Total Penyerapan */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-green-100 gap-1 sm:gap-0">
                <span className="text-sm sm:text-lg font-medium text-gray-700">Total Karbon Dioksida (CO2) Diserap:</span>
                <span className="text-lg sm:text-xl font-semibold text-green-800">{carbonAbsorbed.toLocaleString()} gram/tahun</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-green-100 gap-1 sm:gap-0">
                <span className="text-sm sm:text-lg font-medium text-gray-700">Total VOCs Diserap:</span>
                <span className="text-lg sm:text-xl font-semibold text-green-800">{vocsAbsorbed.toLocaleString()} unit/tahun</span>
              </div>
            </div>

            {/* Statistik Perbandingan Menarik */}
            <div className="mt-4 sm:mt-6 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-green-100">
              <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2 sm:mb-3">📊 Dampak Lingkungan dalam Perspektif:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-blue-50 p-2 sm:p-3 rounded-md border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl sm:text-2xl">🚗</span>
                    <span className="font-medium text-blue-800 text-xs sm:text-sm">Setara Mengurangi Emisi Kendaraan</span>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600">
                    {Math.round(carbonAbsorbed / 120).toLocaleString()} km perjalanan mobil
                  </div>
                </div>
                
                <div className="bg-green-50 p-2 sm:p-3 rounded-md border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl sm:text-2xl">🌳</span>
                    <span className="font-medium text-green-800 text-xs sm:text-sm">Setara dengan Pohon Dewasa</span>
                  </div>
                  <div className="text-xs sm:text-sm text-green-600">
                    {Math.round(carbonAbsorbed / 22000)} pohon dewasa per tahun
                  </div>
                </div>
                
                <div className="bg-orange-50 p-2 sm:p-3 rounded-md border border-orange-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl sm:text-2xl">🏠</span>
                    <span className="font-medium text-orange-800 text-xs sm:text-sm">Menetralisir Emisi Rumah Tangga</span>
                  </div>
                  <div className="text-xs sm:text-sm text-orange-600">
                    Selama {Math.round(carbonAbsorbed / 16000)} hari
                  </div>
                </div>
                
                <div className="bg-purple-50 p-2 sm:p-3 rounded-md border border-purple-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl sm:text-2xl">⚖️</span>
                    <span className="font-medium text-purple-800 text-xs sm:text-sm">Berat CO2 yang Diserap</span>
                  </div>
                  <div className="text-xs sm:text-sm text-purple-600">
                    {(carbonAbsorbed / 1000).toFixed(1)} kg ({(carbonAbsorbed / 1000000).toFixed(3)} ton)
                  </div>
                </div>
              </div>
            </div>

            {/* Cap Resmi Hejoijo */}
            <div className="mt-6 flex justify-center">
              <div className="relative">
                {/* Cap Resmi SVG */}
                <svg width="120" height="120" viewBox="0 0 120 120" className="text-green-600">
                  {/* Lingkaran luar */}
                  <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="1"/>
                  
                  {/* Daun/Tanaman di tengah */}
                  <g transform="translate(60,60)">
                    <path d="M-15,-20 Q-20,-30 -10,-35 Q0,-40 10,-35 Q20,-30 15,-20 Q10,-10 0,-15 Q-10,-10 -15,-20 Z" 
                          fill="currentColor" opacity="0.8"/>
                    <path d="M-10,5 Q-15,-5 -5,-10 Q5,-15 15,-10 Q25,-5 20,5 Q15,15 5,10 Q-5,15 -10,5 Z" 
                          fill="currentColor" opacity="0.6"/>
                    <path d="M0,-15 L0,20" stroke="currentColor" strokeWidth="2"/>
                  </g>
                  
                  {/* Teks HEJOIJO */}
                  <path id="circle-text" d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" 
                        fill="none" stroke="none"/>
                  <text className="text-xs font-bold fill-current">
                    <textPath href="#circle-text" startOffset="25%">
                      HEJOIJO • RESMI • HEJOIJO • RESMI •
                    </textPath>
                  </text>
                  
                  {/* Tahun di bawah */}
                  <text x="60" y="95" textAnchor="middle" className="text-xs font-semibold fill-current">
                    2024
                  </text>
                </svg>
                
                {/* Teks "VERIFIED" di tengah */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs font-bold text-green-700">VERIFIED</div>
                    <div className="text-xs text-green-600">LAPORAN</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tombol-tombol di luar laporan */}
        {showReport && (
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              <button
                onClick={generatePDF}
                className="bg-green-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-xl hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition duration-300 ease-in-out shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Unduh Laporan PDF
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={generateEnvironmentalSummary}
                className="flex-1 bg-blue-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-300 ease-in-out shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                disabled={isGeneratingSummary}
              >
                {isGeneratingSummary ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Membuat ringkasan...</span>
                    <span className="sm:hidden">Membuat...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">✨ Ringkasan Dampak Lingkungan</span>
                    <span className="sm:hidden">✨ Ringkasan</span>
                  </>
                )}
              </button>

              <button
                onClick={generatePlantCareTips}
                className="flex-1 bg-purple-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition duration-300 ease-in-out shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                disabled={isGeneratingTips}
              >
                {isGeneratingTips ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Membuat tips...</span>
                    <span className="sm:hidden">Membuat...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">✨ Tips Perawatan Tanaman</span>
                    <span className="sm:hidden">✨ Tips</span>
                  </>
                )}
              </button>
            </div>

            {environmentalSummary && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">Ringkasan Dampak Lingkungan:</h3>
                <div className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{environmentalSummary}</div>
              </div>
            )}

            {plantCareTips && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-purple-800">🌿 Panduan Perawatan Tanaman</h3>
                    <p className="text-sm text-purple-600">Tips komprehensif untuk tanaman Anda</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                  <div className="prose prose-sm sm:prose-base max-w-none">
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed"
                         style={{
                           lineHeight: '1.7',
                           fontSize: 'inherit'
                         }}>
                      {plantCareTips}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-purple-700">
                      <strong>💡 Tips Tambahan:</strong> Setiap tanaman memiliki kebutuhan unik. Amati tanaman Anda secara rutin dan sesuaikan perawatan berdasarkan kondisi lingkungan setempat. Konsultasikan dengan ahli tanaman lokal untuk hasil terbaik.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
