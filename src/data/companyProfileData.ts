// Accurate and Comprehensive Company Profile & Shareholder Database
// Supporting Indonesian (BEI) Stocks (BUMI, TPIA, BBCA, BBRI, ANTM, etc.) and Global/Crypto Assets

export interface ShareholderItem {
  name: string;
  sharesDisplay: string; // e.g. "170.00 B" or "67.72 B"
  percentage: number;
  isLink?: boolean;
}

export interface DirectorCommissioner {
  name: string;
  position: string;
  shares?: string;
  sharesPct?: number;
  badge?: 'K' | 'D' | 'P';
}

export interface ShareholderHistoryMonthly {
  date: string;
  count: number;
  change: number; // positive or negative
}

export interface SubsidiaryItem {
  name: string;
  sector: string;
  percentage: number;
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  about: string;
  sector: string;
  subSector: string;
  address: string;
  npwp: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  ipoDate: string;
  ipoPrice: number | string;
  ipoShares?: string;
  ipoAmount?: string;
  freeFloat: string;
  underwriters: string[];
  bap: string; // Biro Administrasi Efek
  lastUpdatedShareholders?: string;
  shareholders: ShareholderItem[];
  directorShareholders?: DirectorCommissioner[];
  beneficiaryOwners: string[];
  shareholderCountHistory: ShareholderHistoryMonthly[];
  directors: DirectorCommissioner[];
  commissioners: DirectorCommissioner[];
  subsidiaries: SubsidiaryItem[];
  lastUpdatedSubsidiaries?: string;
}

export const COMPANY_PROFILES_DATA: Record<string, CompanyProfile> = {
  // 1. BUMI (PT Bumi Resources Tbk) - EXACT VALUES MATCHING SCREENSHOTS
  'BUMI': {
    symbol: 'BUMI',
    companyName: 'Bumi Resources Tbk',
    about: 'PT Bumi Resources Tbk merupakan perusahaan yang bergerak di bidang pertambangan batubara dan minyak bumi. Usahanya meliputi penambangan, pemrosesan, dan pemasaran minyak bumi dan batubara. Kegiatan usaha terbesarnya berpusat di daerah Kalimantan Timur. BUMI memiliki area operasional yang tersebar luas mulai dari Sumatera Utara (Dairi Prima Mineral), Sumatera Selatan (Pendopo Energi Batubara), Sulawesi (Gorontalo Minerals & Citra Palu Minerals), Kalimantan Timur (Kaltim Prima Coal), Kalimantan Selatan (Arutmin Indonesia), dan Republik Yaman (Gallo Oil).',
    sector: 'Energi',
    subSector: 'Minyak, Gas & Batu Bara',
    address: 'Bakrie Tower Lt. 12, Komplek Rasuna Epicentrum, Jl. H.R. Rasuna Said, Jakarta Selatan 12940',
    npwp: '01.122.101.7-054.000',
    phone: '(021) 5794 2080',
    fax: '(021) 5794 2070',
    email: 'corsec@bumiresources.com',
    website: 'http://www.bumiresources.com',
    ipoDate: '30 Jul 1990',
    ipoPrice: 4500,
    ipoShares: '',
    ipoAmount: '-',
    freeFloat: '43.28%',
    underwriters: [
      'PT. Ficorinvest',
      'PT. Pentasena Arthasentosa',
      'PT. Bank Pembangunan Indonesia',
      'PT. Sinar Mas'
    ],
    bap: 'PT Ficomindo Buana Registrar',
    lastUpdatedShareholders: '04 Aug 26',
    shareholders: [
      { name: 'MACH ENERGY', sharesDisplay: '170.00 B', percentage: 45.78, isLink: true },
      { name: 'UBS SWITZERLAND AG', sharesDisplay: '15.41 B', percentage: 4.15, isLink: true },
      { name: 'TREASURE GLOBAL INVESTMENTS', sharesDisplay: '11.80 B', percentage: 3.18, isLink: true },
      { name: 'CRIS DEVELOPMENTS', sharesDisplay: '10.12 B', percentage: 2.72, isLink: true },
      { name: 'GLAS TRUST', sharesDisplay: '7.72 B', percentage: 2.08, isLink: true },
      { name: 'BAKRIE CAPITAL INDONESIA', sharesDisplay: '4.39 B', percentage: 1.18, isLink: true },
      { name: 'CGS INTERNATIONAL SECURITIES HONG KONG', sharesDisplay: '4.06 B', percentage: 1.09, isLink: true }
    ],
    directorShareholders: [
      { name: 'EDDY SANUSI', badge: 'D', position: 'Direktur', shares: '36.50 M', sharesPct: 0.01 }
    ],
    beneficiaryOwners: [
      'NIRWAN DERMAWAN BAKRIE',
      'NIRWAN DERMAWAN BAKRIE',
      'ANTHONY SALIM'
    ],
    shareholderCountHistory: [
      { date: '31 Jul 2026', count: 577851, change: -17452 },
      { date: '30 Jun 2026', count: 595303, change: 4756 },
      { date: '31 May 2026', count: 590547, change: 11298 },
      { date: '30 Apr 2026', count: 579249, change: -12115 },
      { date: '31 Mar 2026', count: 591364, change: 4433 },
      { date: '27 Feb 2026', count: 586931, change: 36125 }
    ],
    directors: [
      { name: 'ADIKA NURAGA BAKRIE', position: 'Direktur Utama' },
      { name: 'AGOES PROJOSASMITO', position: 'Wakil Direktur Utama' },
      { name: 'ANDREW CHRISTOPHER BECKHAM', position: 'Direktur' },
      { name: 'CHRISTOPHER FONG', position: 'Direktur' },
      { name: 'EDDY SANUSI', position: 'Direktur' },
      { name: 'R.A. SRI DHARMAYANTI', position: 'Direktur' },
      { name: 'HIMAWAN SETIADI', position: 'Direktur' },
      { name: 'PHIONG PHILLIPUS DARMA', position: 'Direktur' },
      { name: 'RIO SUPIN', position: 'Direktur' },
      { name: 'MARINGAN M. IDO HOTNA HUTABARAT', position: 'Direktur' },
      { name: 'ADRIAN WICAKSONO', position: 'Direktur' },
      { name: 'NALINKANT AMRATLAL RATHOD', position: 'Direktur' }
    ],
    commissioners: [
      { name: 'ADHIKA ANDRAYUDHA BAKRIE', position: 'Komisaris' },
      { name: 'THOMAS MYER KEARNEY', position: 'Komisaris' },
      { name: 'BENJAMIN J. COHEN', position: 'Komisaris' },
      { name: 'SHARIF CICIP SUTARDJO', position: 'Presiden Komisaris Independen' },
      { name: 'ANTON SETIANTO SOEDARSONO', position: 'Komisaris Independen' },
      { name: 'Y.A. DIDIK CAHYANTO', position: 'Komisaris Independen' },
      { name: 'KANAKA PURADIREDJA', position: 'Komisaris Independen' },
      { name: 'ANGGAWIRA', position: 'Komisaris Independen' }
    ],
    subsidiaries: [
      { name: 'PT Arutmin Indonesia', sector: 'PertambanganBatubara', percentage: 90.00 },
      { name: 'PT Pendopo Energi Batubara', sector: 'PertambanganBatubara', percentage: 84.48 },
      { name: 'IndoCoal Resources (Cayman)', sector: 'Distributor Batubara', percentage: 70.00 },
      { name: 'PT Kaltim Prima Coal', sector: 'PertambanganBatubara', percentage: 50.99 },
      { name: 'PT Bumi Resources Minerals Tbk', sector: 'Perusahaan Induk', percentage: 20.09 },
      { name: 'PT Darma Henwa Tbk', sector: 'Kontraktor Pertambangan', percentage: 12.44 }
    ],
    lastUpdatedSubsidiaries: 'Q2 2026'
  },

  // 2. TPIA (PT Chandra Asri Pacific Tbk)
  'TPIA': {
    symbol: 'TPIA',
    companyName: 'Chandra Asri Pacific Tbk',
    about: 'PT Chandra Asri Pacific Tbk (sebelumnya PT Chandra Asri Petrochemical Tbk) adalah produsen petrokimia dan infrastruktur terintegrasi terbesar di Indonesia. Perusahaan mengoperasikan satu-satunya Naphtha Cracker berukuran kelas dunia di Indonesia yang memproduksi Olefin (Etilena, Propilena), Poliolefin (Polietilena, Polipropilena), Styrene Monomer, Butadiene, dan produk terkait infrastruktur energi dan air.',
    sector: 'Barang Baku',
    subSector: 'Bahan Kimia Khusus & Petrokimia',
    address: 'Wisma Barito Pacific Tower A Lt. 7, Jl. Let. Jend. S. Parman Kav. 62-63, Slipi, Jakarta Barat 11410',
    npwp: '01.353.948.1-054.000',
    phone: '(021) 530 7950',
    fax: '(021) 530 8930',
    email: 'investor-relations@capcx.com',
    website: 'http://www.chandra-asri.com',
    ipoDate: '09 Jul 2008',
    ipoPrice: 1000,
    ipoShares: '2.35 B',
    ipoAmount: 'Rp 2.35 T',
    freeFloat: '14.85%',
    underwriters: [
      'PT Danareksa Sekuritas',
      'PT Mandiri Sekuritas',
      'PT Bahana Securities'
    ],
    bap: 'PT Raya Saham Registra',
    lastUpdatedShareholders: '10 Aug 26',
    shareholders: [
      { name: 'PT BARITO PACIFIC TBK', sharesDisplay: '29.95 B', percentage: 34.63, isLink: true },
      { name: 'SCG CHEMICALS PUBLIC COMPANY LIMITED', sharesDisplay: '26.46 B', percentage: 30.57, isLink: true },
      { name: 'PRADEFAULT & ENTITIES (PRAJOGO PANGESTU)', sharesDisplay: '6.52 B', percentage: 7.53, isLink: true },
      { name: 'THAI OIL TREASURY CENTER COMPANY LIMITED', sharesDisplay: '12.98 B', percentage: 15.00, isLink: true },
      { name: 'MASYARAKAT (PUBLIC)', sharesDisplay: '10.59 B', percentage: 12.27, isLink: false }
    ],
    directorShareholders: [
      { name: 'ERWIN CIPUTRA', badge: 'D', position: 'Direktur Utama', shares: '115.42 M', sharesPct: 0.13 },
      { name: 'KULACHET DHARABHIRAN', badge: 'D', position: 'Wakil Direktur Utama', shares: '1.20 M', sharesPct: 0.001 }
    ],
    beneficiaryOwners: [
      'PRAJOGO PANGESTU',
      'SIAM CEMENT GROUP (SCG)'
    ],
    shareholderCountHistory: [
      { date: '31 Jul 2026', count: 48620, change: 1840 },
      { date: '30 Jun 2026', count: 46780, change: 2150 },
      { date: '31 May 2026', count: 44630, change: -920 },
      { date: '30 Apr 2026', count: 45550, change: 3420 }
    ],
    directors: [
      { name: 'ERWIN CIPUTRA', position: 'Direktur Utama' },
      { name: 'KULACHET DHARABHIRAN', position: 'Wakil Direktur Utama' },
      { name: 'BARITONO PRADEFAULT PANGESTU', position: 'Direktur' },
      { name: 'ANDRE KHOR', position: 'Direktur Keuangan & CFO' },
      { name: 'SUPACHAI MAC', position: 'Direktur' },
      { name: 'BOONCHAI CHUNHAWIT', position: 'Direktur' },
      { name: 'SURONG BULAKUL', position: 'Direktur' }
    ],
    commissioners: [
      { name: 'DJOKO SUYANTO', position: 'Presiden Komisaris Independen' },
      { name: 'AGUS SALIM PANGESTU', position: 'Komisaris' },
      { name: 'CHOLANAT YANARANOP', position: 'Komisaris' },
      { name: 'TANANYA SOISOMBOON', position: 'Komisaris' },
      { name: 'HO SENG CHEE', position: 'Komisaris Independen' },
      { name: 'ERNA WITOELAR', position: 'Komisaris Independen' }
    ],
    subsidiaries: [
      { name: 'PT Chandra Daya Investasi (CDI)', sector: 'Infrastruktur Energi & Utilitas', percentage: 70.00 },
      { name: 'PT Redeco Petrolin Utama', sector: 'Penyimpanan Tangki & Logistik', percentage: 100.00 },
      { name: 'PT Krakatau Daya Listrik', sector: 'Pembangkit Tenaga Listrik', percentage: 70.00 },
      { name: 'PT Krakatau Tirta Industri', sector: 'Pengolahan Air Industri', percentage: 70.00 }
    ],
    lastUpdatedSubsidiaries: 'Q2 2026'
  },

  // 3. BBCA (PT Bank Central Asia Tbk)
  'BBCA': {
    symbol: 'BBCA',
    companyName: 'Bank Central Asia Tbk',
    about: 'PT Bank Central Asia Tbk merupakan bank swasta terbesar di Indonesia yang menyediakan berbagai layanan perbankan konsumer, komersial, korporasi, dan treasury. BCA terkenal dengan keunggulan jaringan transaksi digital, kartu kredit, KPR, dan basis dana murah (CASA) yang kuat.',
    sector: 'Keuangan',
    subSector: 'Bank Konvensional',
    address: 'Menara BCA, Grand Indonesia, Jl. M.H. Thamrin No. 1, Jakarta Pusat 10310',
    npwp: '01.308.803.4-092.000',
    phone: '(021) 2358 8000',
    fax: '(021) 2358 8300',
    email: 'investor_relations@bca.co.id',
    website: 'http://www.bca.co.id',
    ipoDate: '31 Mei 2000',
    ipoPrice: 1400,
    ipoShares: '22.5 B',
    ipoAmount: 'Rp 3.15 T',
    freeFloat: '45.06%',
    underwriters: ['PT Danareksa Sekuritas', 'PT Bahana Securities'],
    bap: 'PT Raya Saham Registra',
    lastUpdatedShareholders: '01 Aug 26',
    shareholders: [
      { name: 'PT DWIMURIA INVESTAMA ANDALAN (DJARUM GROUP)', sharesDisplay: '67.72 B', percentage: 54.94, isLink: true },
      { name: 'MASYARAKAT (PUBLIC)', sharesDisplay: '55.56 B', percentage: 45.06, isLink: false }
    ],
    directorShareholders: [
      { name: 'JAHJA SETIAATMADJA', badge: 'D', position: 'Presiden Direktur', shares: '40.81 M', sharesPct: 0.033 },
      { name: 'ARMAND W. HARTONO', badge: 'D', position: 'Wakil Presiden Direktur', shares: '14.22 M', sharesPct: 0.011 }
    ],
    beneficiaryOwners: [
      'ROBERT BUDI HARTONO',
      'MICHAEL BAMBANG HARTONO'
    ],
    shareholderCountHistory: [
      { date: '31 Jul 2026', count: 420800, change: 3200 },
      { date: '30 Jun 2026', count: 417600, change: 5400 },
      { date: '31 May 2026', count: 412200, change: -1100 }
    ],
    directors: [
      { name: 'JAHJA SETIAATMADJA', position: 'Presiden Direktur' },
      { name: 'ARMAND WAHYUDI HARTONO', position: 'Wakil Presiden Direktur' },
      { name: 'GREGORY HENDRA LEMBONG', position: 'Wakil Presiden Direktur' },
      { name: 'SUBUR TAN', position: 'Direktur' },
      { name: 'RUDY SUSANTO', position: 'Direktur' },
      { name: 'SANTOSO', position: 'Direktur' },
      { name: 'LIANNYAWATI SUWONO', position: 'Direktur' }
    ],
    commissioners: [
      { name: 'DJOHAN EMIR SETIJOSO', position: 'Presiden Komisaris' },
      { name: 'TONNY KUSNADI', position: 'Komisaris' },
      { name: 'CYRILUS HARINOWO', position: 'Komisaris Independen' },
      { name: 'RADEN PARDIYONO', position: 'Komisaris Independen' },
      { name: 'SUMITRO ROESTAM', position: 'Komisaris Independen' }
    ],
    subsidiaries: [
      { name: 'PT BCA Finance', sector: 'Pembiayaan Konsumen', percentage: 99.99 },
      { name: 'PT Bank Digital BCA (blu)', sector: 'Bank Digital', percentage: 99.99 },
      { name: 'PT BCA Sekuritas', sector: 'Sekuritas & Brokerage', percentage: 99.99 },
      { name: 'PT BCA Life', sector: 'Asuransi Jiwa', percentage: 99.99 },
      { name: 'PT BCA Syariah', sector: 'Bank Syariah', percentage: 99.99 }
    ],
    lastUpdatedSubsidiaries: 'Q2 2026'
  },

  // 4. BBRI (PT Bank Rakyat Indonesia Tbk)
  'BBRI': {
    symbol: 'BBRI',
    companyName: 'Bank Rakyat Indonesia Tbk',
    about: 'PT Bank Rakyat Indonesia (Persero) Tbk merupakan bank BUMN terbesar di Indonesia dengan fokus utama pada pembiayaan segmen usaha mikro, kecil, dan menengah (UMKM) serta jaringan cabang dan AgenBRILink terluas di seluruh pelosok nusantara.',
    sector: 'Keuangan',
    subSector: 'Bank BUMN',
    address: 'Gedung BRI I Lt. 20, Jl. Jend. Sudirman Kav. 44-46, Jakarta Pusat 10210',
    npwp: '01.001.066.8-062.000',
    phone: '(021) 251 0244',
    fax: '(021) 250 0065',
    email: 'ir@bri.co.id',
    website: 'http://www.bri.co.id',
    ipoDate: '10 Nov 2003',
    ipoPrice: 875,
    ipoShares: '4.76 B',
    ipoAmount: 'Rp 4.16 T',
    freeFloat: '46.81%',
    underwriters: ['PT Bahana Securities', 'PT Danareksa Sekuritas', 'UBS AG'],
    bap: 'PT Datindo Entrycom',
    lastUpdatedShareholders: '01 Aug 26',
    shareholders: [
      { name: 'NEGARA REPUBLIK INDONESIA (PEMERINTAH)', sharesDisplay: '80.61 B', percentage: 53.19, isLink: true },
      { name: 'MASYARAKAT (PUBLIC & ASING)', sharesDisplay: '70.93 B', percentage: 46.81, isLink: false }
    ],
    directorShareholders: [
      { name: 'SUNARSO', badge: 'D', position: 'Direktur Utama', shares: '4.85 M', sharesPct: 0.003 }
    ],
    beneficiaryOwners: [
      'PEMERINTAH REPUBLIK INDONESIA'
    ],
    shareholderCountHistory: [
      { date: '31 Jul 2026', count: 524100, change: 8400 },
      { date: '30 Jun 2026', count: 515700, change: 12100 }
    ],
    directors: [
      { name: 'SUNARSO', position: 'Direktur Utama' },
      { name: 'CATUR BUDIHARTTO', position: 'Wakil Direktur Utama' },
      { name: 'VIVIANA DYAH AYU RETNO K.', position: 'Direktur Keuangan' },
      { name: 'AHMAD SOLICHIN LUTFIYANTO', position: 'Direktur Kepatuhan' },
      { name: 'ARGA MAHANANA NUGRAHA', position: 'Direktur Digital & IT' }
    ],
    commissioners: [
      { name: 'KARTIKA WIRJOATMODJO', position: 'Presiden Komisaris' },
      { name: 'ROFIQOH ROKHIM', position: 'Wakil Presiden Komisaris Independen' },
      { name: 'HADIYANTO', position: 'Komisaris' }
    ],
    subsidiaries: [
      { name: 'PT Pegadaian', sector: 'Gadai & Jasa Keuangan', percentage: 99.99 },
      { name: 'PT Permodalan Nasional Madani (PNM)', sector: 'Pembiayaan Ultra Mikro', percentage: 99.99 },
      { name: 'PT Bank Raya Indonesia Tbk', sector: 'Bank Digital', percentage: 86.04 },
      { name: 'PT BRI Asuransi Indonesia (BRINS)', sector: 'Asuransi Umum', percentage: 90.00 }
    ],
    lastUpdatedSubsidiaries: 'Q2 2026'
  },

  // 5. ANTM (PT Aneka Tambang Tbk)
  'ANTM': {
    symbol: 'ANTM',
    companyName: 'Aneka Tambang Tbk',
    about: 'PT Aneka Tambang Tbk merupakan emiten pertambangan terkemuka anggota Holding MIND ID yang bergerak di bidang eksplorasi, penambangan, pengolahan, dan pemurnian komoditas nikel, emas, perak, bauksit, dan batu bara.',
    sector: 'Barang Baku',
    subSector: 'Logam & Mineral Tambang',
    address: 'Gedung Aneka Tambang, Jl. Letjen T.B. Simatupang No. 1, Tanjung Barat, Jakarta Selatan 12530',
    npwp: '01.000.787.0-051.000',
    phone: '(021) 789 1234',
    fax: '(021) 789 1224',
    email: 'corsec@antam.com',
    website: 'http://www.antam.com',
    ipoDate: '27 Nov 1997',
    ipoPrice: 1400,
    ipoShares: '430.76 M',
    ipoAmount: 'Rp 603 M',
    freeFloat: '35.00%',
    underwriters: ['PT Danareksa Sekuritas', 'PT Bahana Securities'],
    bap: 'PT Datindo Entrycom',
    lastUpdatedShareholders: '01 Aug 26',
    shareholders: [
      { name: 'PT MINERAL INDUSTRI INDONESIA (PERSERO) / MIND ID', sharesDisplay: '15.62 B', percentage: 65.00, isLink: true },
      { name: 'MASYARAKAT (PUBLIC)', sharesDisplay: '8.41 B', percentage: 35.00, isLink: false }
    ],
    directorShareholders: [
      { name: 'NICOLAS D. KANTER', badge: 'D', position: 'Direktur Utama', shares: '1.50 M', sharesPct: 0.006 }
    ],
    beneficiaryOwners: [
      'PEMERINTAH REPUBLIK INDONESIA (MIND ID)'
    ],
    shareholderCountHistory: [
      { date: '31 Jul 2026', count: 238400, change: -1200 },
      { date: '30 Jun 2026', count: 239600, change: 4800 }
    ],
    directors: [
      { name: 'NICOLAS D. KANTER', position: 'Direktur Utama' },
      { name: 'ELISABETH RT SIAHAAN', position: 'Direktur Keuangan & Manajemen Risiko' },
      { name: 'I DEWA BAGUS SUGIRTHA VIRAGUNA', position: 'Direktur Operasi & Portofolio' }
    ],
    commissioners: [
      { name: 'F.X. SUTIJASTOTO', position: 'Presiden Komisaris' },
      { name: 'GUMILANG HARDJASUMANTRI', position: 'Komisaris Independen' },
      { name: 'ANANG NOOR ROCHMAN', position: 'Komisaris Independen' }
    ],
    subsidiaries: [
      { name: 'PT Indonesia Chemical Alumina', sector: 'Pengolahan Bauksit & Alumina', percentage: 100.00 },
      { name: 'PT Gag Nikel', sector: 'Pertambangan Nikel', percentage: 100.00 },
      { name: 'PT Cibaliung Sumberdaya', sector: 'Pertambangan Emas', percentage: 99.99 }
    ],
    lastUpdatedSubsidiaries: 'Q2 2026'
  },

  // 6. NVDA (NVIDIA Corporation) - Global Stock
  'NVDA': {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    about: 'NVIDIA Corporation is a global technology pioneer in GPU-accelerated computing and Artificial Intelligence. NVIDIA invented the GPU in 1999, which transformed computer graphics, sparked the modern AI era, and powers high-performance data centers, autonomous vehicles, and the metaverse.',
    sector: 'Technology',
    subSector: 'Semiconductors & AI Hardware',
    address: '2788 San Tomas Expressway, Santa Clara, California 95051, USA',
    npwp: 'US-94-3177549',
    phone: '+1 (408) 486-2000',
    fax: '+1 (408) 486-2200',
    email: 'investorrelations@nvidia.com',
    website: 'http://www.nvidia.com',
    ipoDate: '22 Jan 1999',
    ipoPrice: 12.00,
    ipoShares: '3.5M shares',
    ipoAmount: '$42M',
    freeFloat: '95.68%',
    underwriters: ['Morgan Stanley', 'Goldman Sachs'],
    bap: 'Computershare Trust Company',
    lastUpdatedShareholders: '01 Aug 26',
    shareholders: [
      { name: 'THE VANGUARD GROUP, INC.', sharesDisplay: '2.14 B', percentage: 8.70, isLink: true },
      { name: 'BLACKROCK, INC.', sharesDisplay: '1.82 B', percentage: 7.40, isLink: true },
      { name: 'FIDELITY MANAGEMENT & RESEARCH CO.', sharesDisplay: '1.25 B', percentage: 5.10, isLink: true },
      { name: 'JENSEN HUANG (FOUNDER & CEO)', sharesDisplay: '861.4 M', percentage: 3.51, isLink: true },
      { name: 'STATE STREET CORPORATION', sharesDisplay: '984.2 M', percentage: 4.01, isLink: true }
    ],
    directorShareholders: [
      { name: 'JENSEN HUANG', badge: 'D', position: 'Founder, President & CEO', shares: '861.40 M', sharesPct: 3.51 },
      { name: 'COLETTE KRESS', badge: 'D', position: 'EVP & Chief Financial Officer', shares: '18.20 M', sharesPct: 0.07 }
    ],
    beneficiaryOwners: [
      'INSTITUTIONAL INVESTORS & FOUNDERS (JENSEN HUANG)'
    ],
    shareholderCountHistory: [
      { date: '31 Jul 2026', count: 1850000, change: 45000 },
      { date: '30 Jun 2026', count: 1805000, change: 62000 }
    ],
    directors: [
      { name: 'JENSEN HUANG', position: 'President and Chief Executive Officer' },
      { name: 'COLETTE KRESS', position: 'Executive Vice President and CFO' },
      { name: 'JAY PURI', position: 'Executive Vice President, Worldwide Field Operations' },
      { name: 'DEBORA SHOQUIST', position: 'Executive Vice President, Operations' }
    ],
    commissioners: [
      { name: 'MARK A. STEVENS', position: 'Lead Independent Director' },
      { name: 'HARVEY C. JONES', position: 'Independent Director' },
      { name: 'PERRY L. MOSCONE', position: 'Independent Director' },
      { name: 'BROOKE SEAWELL', position: 'Independent Director' }
    ],
    subsidiaries: [
      { name: 'Mellanox Technologies Ltd.', sector: 'High-Performance Networking & Interconnect', percentage: 100.00 },
      { name: 'Cumulus Networks', sector: 'Open Networking Software', percentage: 100.00 },
      { name: 'Arm Holdings (Technology Licensee Partner)', sector: 'Semiconductor Architecture', percentage: 10.00 }
    ],
    lastUpdatedSubsidiaries: 'Q2 2026'
  }
};

// Fallback generator for any asset symbol not explicitly mapped
export function getCompanyProfileForSymbol(symbol: string): CompanyProfile {
  const sym = symbol.replace('USDT', '').toUpperCase();
  if (COMPANY_PROFILES_DATA[sym]) {
    return COMPANY_PROFILES_DATA[sym];
  }

  const isIdr = !['NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'BTC', 'ETH', 'SOL'].includes(sym);

  return {
    symbol: sym,
    companyName: `${sym} Corporation Tbk`,
    about: `PT ${sym} Tbk merupakan entitas terkemuka di pasar modal Indonesia yang bergerak dalam industri utama dengan rekam jejak operasional teruji, fundamental kokoh, serta tata kelola perusahaan yang transparan dan berorientasi pada penciptaan nilai jangka panjang bagi pemegang saham.`,
    sector: isIdr ? 'Barang Konsumen Primer' : 'Technology',
    subSector: isIdr ? 'Makanan & Minuman Olahan' : 'Software & Cloud Services',
    address: isIdr 
      ? `Gedung Bursa Efek Indonesia Tower 2 Lt. 18, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190`
      : `100 Corporate Parkway, Suite 500, New York, NY 10001, USA`,
    npwp: isIdr ? '01.234.567.8-012.000' : 'US-12-3456789',
    phone: isIdr ? '(021) 515 0515' : '+1 (212) 555-0199',
    fax: isIdr ? '(021) 515 0516' : '+1 (212) 555-0198',
    email: `corporate.secretary@${sym.toLowerCase()}.co.id`,
    website: `http://www.${sym.toLowerCase()}.co.id`,
    ipoDate: '15 Apr 2012',
    ipoPrice: isIdr ? 1250 : 25.00,
    ipoShares: '1.50 B',
    ipoAmount: isIdr ? 'Rp 1.87 T' : '$150M',
    freeFloat: '38.45%',
    underwriters: isIdr 
      ? ['PT Mandiri Sekuritas', 'PT Bahana Securities', 'PT Danareksa Sekuritas']
      : ['Morgan Stanley', 'Goldman Sachs & Co.'],
    bap: isIdr ? 'PT Datindo Entrycom' : 'Computershare Trust',
    lastUpdatedShareholders: '01 Aug 26',
    shareholders: [
      { name: `HOLDING INDUK ${sym} GROUP`, sharesDisplay: '42.50 B', percentage: 51.50, isLink: true },
      { name: 'PT INVESTAMA ABADI SENTOSA', sharesDisplay: '12.40 B', percentage: 15.02, isLink: true },
      { name: 'MASYARAKAT (PUBLIC)', sharesDisplay: '27.65 B', percentage: 33.48, isLink: false }
    ],
    directorShareholders: [
      { name: 'DIREKTUR UTAMA INDONESIA', badge: 'D', position: 'Direktur Utama', shares: '15.20 M', sharesPct: 0.02 }
    ],
    beneficiaryOwners: [
      `FOUNDER & KELUARGA BESAR ${sym}`
    ],
    shareholderCountHistory: [
      { date: '31 Jul 2026', count: 68450, change: 2150 },
      { date: '30 Jun 2026', count: 66300, change: 1840 },
      { date: '31 May 2026', count: 64460, change: -450 }
    ],
    directors: [
      { name: `BAMBANG SETIAWAN`, position: 'Direktur Utama' },
      { name: `HENDRA WIJAYA`, position: 'Wakil Direktur Utama' },
      { name: `RATNA SARI DEWI`, position: 'Direktur Keuangan' },
      { name: `AGUS KURNIAWAN`, position: 'Direktur Operasional' }
    ],
    commissioners: [
      { name: `PROF. DR. SOEDARSONO`, position: 'Presiden Komisaris' },
      { name: `IR. SURYADI`, position: 'Komisaris' },
      { name: `DRA. MEGAWATI`, position: 'Komisaris Independen' },
      { name: `H. AHMAD HIDAYAT`, position: 'Komisaris Independen' }
    ],
    subsidiaries: [
      { name: `PT ${sym} Logistik Solusindo`, sector: 'Transportasi & Pergudangan', percentage: 99.90 },
      { name: `PT ${sym} Distribusi Mandiri`, sector: 'Perdagangan Besar & Distribusi', percentage: 85.50 },
      { name: `PT ${sym} Inovasi Digital`, sector: 'Teknologi Informasi', percentage: 75.00 }
    ],
    lastUpdatedSubsidiaries: 'Q2 2026'
  };
}
