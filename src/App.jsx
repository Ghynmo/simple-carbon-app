import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

// Data dummy untuk tingkat penyerapan tanaman (nilai ini adalah ilustratif)
// Carbon rate dalam gram CO2 per tahun per tanaman
// VOC rate dalam unit arbitrer per tahun per tanaman
const plantData = [
  { name: 'Pilih Tanaman', carbonRate: 0, vocRate: 0 },
  { name: 'Lidah Mertua (Sansevieria)', carbonRate: 500, vocRate: 1000 },
  { name: 'Spider Plant (Chlorophytum comosum)', carbonRate: 400, vocRate: 800 },
  { name: 'Peace Lily (Spathiphyllum)', carbonRate: 300, vocRate: 1200 },
  { name: 'Palem Areca (Dypsis lutescens)', carbonRate: 600, vocRate: 700 },
  { name: 'Sirih Gading (Pothos)', carbonRate: 350, vocRate: 900 },
  { name: 'Monstera Deliciosa', carbonRate: 550, vocRate: 600 },
];

const App = () => {
  const [plants, setPlants] = useState([]);
  const [carbonAbsorbed, setCarbonAbsorbed] = useState(0);
  const [vocsAbsorbed, setVocsAbsorbed] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [message, setMessage] = useState('');
  const [environmentalSummary, setEnvironmentalSummary] = useState('');
  const [plantCareTips, setPlantCareTips] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  
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
    // Hapus tanaman kustom dari daftar plants yang sedang dipilih
    setPlants(plants.filter(plant => plant.type !== plantName));
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
      
      // Pastikan elemen terlihat dan memiliki ukuran yang benar
      const reportElement = reportRef.current;
      
      // Konfigurasi html2canvas-pro yang mendukung warna oklch
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Meningkatkan kualitas
        useCORS: true,
        allowTaint: true, // Mengizinkan konten dari domain lain
        logging: false,
        backgroundColor: '#ffffff', // Warna latar belakang putih
        scrollX: 0,
        scrollY: -window.scrollY, // Mengatasi masalah scroll
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight
      });
      
      // Periksa apakah canvas berhasil dibuat dan memiliki dimensi
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas tidak valid atau kosong');
      }
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0); // Gunakan JPEG dengan kualitas maksimum
      
      // Membuat dokumen PDF dengan ukuran A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Hitung dimensi yang tepat untuk menjaga rasio aspek
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 20; // Beri margin 10mm di setiap sisi
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Menambahkan judul
      pdf.setFontSize(20);
      pdf.setTextColor(22, 101, 52); // Warna hijau tua (text-green-800 dalam RGB)
      pdf.text('Laporan Penyerapan Tanaman Hejoijo', pdfWidth / 2, 20, { align: 'center' });
      
      // Menambahkan tanggal
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100); // Warna abu-abu
      const today = new Date();
      const dateStr = today.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      pdf.text(`Dibuat pada: ${dateStr}`, pdfWidth / 2, 30, { align: 'center' });
      
      // Menambahkan gambar laporan dengan posisi yang tepat
      pdf.addImage(imgData, 'JPEG', 10, 40, imgWidth, imgHeight);
      
      // Menambahkan footer
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text('Hejoijo - Aplikasi Kalkulator Penyerapan Tanaman', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
        pdf.text(`Halaman ${i} dari ${pageCount}`, pdfWidth / 2, pdfHeight - 5, { align: 'center' });
      }
      
      // Mengunduh PDF
      // Simpan PDF dengan nama yang lebih deskriptif
      try {
        pdf.save('Laporan_Penyerapan_Tanaman_Hejoijo.pdf');
        setMessage('PDF berhasil dibuat dan diunduh!');
        
        // Menghapus pesan sukses setelah 3 detik
        setTimeout(() => {
          if (message === 'PDF berhasil dibuat dan diunduh!') {
            setMessage('');
          }
        }, 3000);
      } catch (saveError) {
        console.error('Error saving PDF:', saveError);
        setMessage('Terjadi kesalahan saat menyimpan PDF. Silakan coba lagi.');
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
      
      // Tampilkan pesan error yang lebih spesifik untuk debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Error details:', error.message);
      }
    }
  };

  // Menambahkan baris input tanaman baru
  const handleAddPlant = () => {
    setPlants([...plants, { type: 'Pilih Tanaman', quantity: 1 }]);
    resetOutputs();
  };

  // Menangani perubahan jenis tanaman pada baris tertentu
  const handlePlantTypeChange = (index, newType) => {
    const updatedPlants = plants.map((plant, i) =>
      i === index ? { ...plant, type: newType } : plant
    );
    setPlants(updatedPlants);
    resetOutputs();
  };

  // Menangani perubahan kuantitas tanaman pada baris tertentu
  const handleQuantityChange = (index, newQuantity) => {
    const updatedPlants = plants.map((plant, i) =>
      i === index ? { ...plant, quantity: parseInt(newQuantity) || 0 } : plant
    );
    setPlants(updatedPlants);
    resetOutputs();
  };

  // Menghapus baris input tanaman
  const handleRemovePlant = (index) => {
    const updatedPlants = plants.filter((_, i) => i !== index);
    setPlants(updatedPlants);
    resetOutputs();
  };

  // Melakukan kalkulasi total penyerapan karbon dan VOCs
  const calculateAbsorption = () => {
    if (plants.length === 0) {
      setMessage('Harap tambahkan setidaknya satu tanaman untuk menghitung.');
      setShowReport(false);
      return;
    }

    let totalCarbon = 0;
    let totalVocs = 0;
    let hasInvalidInput = false;
    const allPlants = getAllPlants();

    plants.forEach(plant => {
      const selectedPlant = allPlants.find(data => data.name === plant.type);
      if (selectedPlant && plant.quantity > 0 && plant.type !== 'Pilih Tanaman') {
        totalCarbon += selectedPlant.carbonRate * plant.quantity;
        totalVocs += selectedPlant.vocRate * plant.quantity;
      } else if (plant.type === 'Pilih Tanaman' || plant.quantity <= 0) {
        hasInvalidInput = true;
      }
    });

    if (hasInvalidInput) {
      setMessage('Pastikan semua tanaman dipilih dan kuantitasnya lebih dari 0.');
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
    const selectedPlantNames = plants
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
      const prompt = `Berikan tips perawatan singkat dan penting untuk tanaman berikut: ${selectedPlantNames.join(', ')}. Sertakan informasi tentang kebutuhan cahaya, penyiraman, dan kelembaban umum.`;
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-2xl border border-green-200">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-green-800 mb-6">
          Aplikasi Hejoijo
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Hitung kemampuan tanaman Anda dalam menyerap karbon dan VOCs.
        </p>

        <div className="space-y-4 mb-6">
          {plants.map((plant, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-green-50 rounded-lg shadow-sm">
              <select
                className="flex-grow p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out bg-white text-gray-700"
                value={plant.type}
                onChange={(e) => handlePlantTypeChange(index, e.target.value)}
              >
                {getAllPlants().map((data) => (
                  <option key={data.name} value={data.name}>
                    {data.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                className="w-24 p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out text-center text-gray-700"
                value={plant.quantity}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
              />
              <button
                onClick={() => handleRemovePlant(index)}
                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-sm"
                aria-label="Hapus tanaman"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddPlant}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out mb-4 shadow-lg flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tambah Tanaman
        </button>

        {/* Bagian Tanaman Kustom */}
        <div className="mb-4">
          <button
            onClick={() => setShowAddCustomPlant(!showAddCustomPlant)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out shadow-md flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {showAddCustomPlant ? 'Tutup Form Tanaman Kustom' : 'Tambah Tanaman Kustom'}
          </button>

          {showAddCustomPlant && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Tambah Tanaman Kustom</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tanaman</label>
                  <input
                    type="text"
                    value={newPlantName}
                    onChange={(e) => setNewPlantName(e.target.value)}
                    placeholder="Contoh: Tanaman Hias Favorit"
                    className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Penyerapan CO2 (gram/tahun/tanaman)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newPlantCarbonRate}
                      onChange={(e) => setNewPlantCarbonRate(e.target.value)}
                      placeholder="500"
                      className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Penyerapan VOCs (unit/tahun/tanaman)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newPlantVocRate}
                      onChange={(e) => setNewPlantVocRate(e.target.value)}
                      placeholder="1000"
                      className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddCustomPlant}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                >
                  Simpan Tanaman Kustom
                </button>
              </div>
            </div>
          )}

          {/* Daftar Tanaman Kustom */}
          {customPlants.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Tanaman Kustom Tersimpan</h3>
              <div className="space-y-2">
                {customPlants.map((plant, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200">
                    <div>
                      <span className="font-medium text-gray-800">{plant.name}</span>
                      <div className="text-sm text-gray-600">
                        CO2: {plant.carbonRate} g/tahun • VOCs: {plant.vocRate} unit/tahun
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomPlant(plant.name)}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                      aria-label="Hapus tanaman kustom"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
          className="w-full bg-emerald-500 text-white py-3 px-4 rounded-xl hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition duration-300 ease-in-out shadow-lg flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            className="mt-8 bg-green-50 p-6 rounded-2xl shadow-inner border border-green-200"
          >
            <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
              Laporan Penyerapan
            </h2>
            
            {/* Daftar Tanaman yang Dihitung */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Daftar Tanaman yang Dihitung:</h3>
              <div className="space-y-2">
                {plants
                  .filter(plant => plant.type !== 'Pilih Tanaman' && plant.quantity > 0)
                  .map((plant, index) => {
                    const allPlants = getAllPlants();
                    const plantInfo = allPlants.find(data => data.name === plant.type);
                    const isCustomPlant = customPlants.some(cp => cp.name === plant.type);
                    return (
                      <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-md border border-green-100">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{plant.type}</span>
                            {isCustomPlant && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Kustom</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            CO2: {plantInfo?.carbonRate || 0} g/tahun/tanaman • VOCs: {plantInfo?.vocRate || 0} unit/tahun/tanaman
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-green-700">{plant.quantity} tanaman</span>
                          <div className="text-sm text-gray-600">
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
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <span className="text-lg font-medium text-gray-700">Total Karbon Dioksida (CO2) Diserap:</span>
                <span className="text-xl font-semibold text-green-800">{carbonAbsorbed.toLocaleString()} gram/tahun</span>
              </div>
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <span className="text-lg font-medium text-gray-700">Total VOCs Diserap:</span>
                <span className="text-xl font-semibold text-green-800">{vocsAbsorbed.toLocaleString()} unit/tahun</span>
              </div>
            </div>

            {/* Statistik Perbandingan Menarik */}
            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 mb-3">📊 Dampak Lingkungan dalam Perspektif:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🚗</span>
                    <span className="font-medium text-blue-800">Setara Mengurangi Emisi Kendaraan</span>
                  </div>
                  <div className="text-sm text-blue-600">
                    {Math.round(carbonAbsorbed / 120).toLocaleString()} km perjalanan mobil
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-md border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🌳</span>
                    <span className="font-medium text-green-800">Setara dengan Pohon Dewasa</span>
                  </div>
                  <div className="text-sm text-green-600">
                    {Math.round(carbonAbsorbed / 22000)} pohon dewasa per tahun
                  </div>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🏠</span>
                    <span className="font-medium text-orange-800">Menetralisir Emisi Rumah Tangga</span>
                  </div>
                  <div className="text-sm text-orange-600">
                    Selama {Math.round(carbonAbsorbed / 16000)} hari
                  </div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">⚖️</span>
                    <span className="font-medium text-purple-800">Berat CO2 yang Diserap</span>
                  </div>
                  <div className="text-sm text-purple-600">
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
          <div className="mt-6 space-y-4">
            <div className="flex justify-center">
              <button
                onClick={generatePDF}
                className="bg-green-500 text-white py-3 px-6 rounded-xl hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition duration-300 ease-in-out shadow-lg flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Unduh Laporan PDF
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={generateEnvironmentalSummary}
                className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-300 ease-in-out shadow-lg flex items-center justify-center gap-2"
                disabled={isGeneratingSummary}
              >
                {isGeneratingSummary ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Membuat ringkasan...
                  </>
                ) : (
                  <>
                    ✨ Ringkasan Dampak Lingkungan
                  </>
                )}
              </button>

              <button
                onClick={generatePlantCareTips}
                className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-xl hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition duration-300 ease-in-out shadow-lg flex items-center justify-center gap-2"
                disabled={isGeneratingTips}
              >
                {isGeneratingTips ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Membuat tips...
                  </>
                ) : (
                  <>
                    ✨ Tips Perawatan Tanaman
                  </>
                )}
              </button>
            </div>

            {environmentalSummary && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Ringkasan Dampak Lingkungan:</h3>
                <p className="text-gray-700">{environmentalSummary}</p>
              </div>
            )}

            {plantCareTips && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200 shadow-sm">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Tips Perawatan Tanaman:</h3>
                <p className="text-gray-700 whitespace-pre-line">{plantCareTips}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
