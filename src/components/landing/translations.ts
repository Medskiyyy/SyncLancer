export type Language = 'id' | 'en';

export const translations = {
  id: {
    nav: {
      features: 'Modul',
      workflow: 'Alur Kerja',
      portal: 'Portal Klien',
      login: 'Masuk',
      register: 'Mulai Gratis',
    },
    hero: {
      title: 'Satu buku kerja untuk klien, proyek, dan tagihan.',
      description:
        'Kelola prospek, proposal PDF, milestone tugas, jam kerja billable, dan invoice dalam satu ruang kerja bersih.',
      startFree: 'Mulai Gratis',
      loginLink: 'Masuk',
      captionLeft: 'SyncLancer Workspace',
      captionRight: 'CRM · Proposal · Milestone · Invoice · Portal',
      imageAlt: 'Meja studio kerja minimalis dengan buku kontrak, laptop matte hitam, dan daun emerald',
    },
    features: {
      title: 'Enam modul operasional yang terhubung ke satu data klien.',
      subtitle:
        'Pindah dari penawaran awal ke invoice lunas tanpa menyalin ulang data antar aplikasi.',
      tabs: [
        { id: 'crm', label: 'Pipeline CRM' },
        { id: 'proposals', label: 'Proposal PDF' },
        { id: 'delivery', label: 'Milestone & Jam' },
        { id: 'billing', label: 'Invoice & Berkas' },
      ],
      panels: {
        crm: {
          heading: 'Pipeline prospek dan konversi klien',
          summary:
            'Pindahkan prospek antar kolom status, catat estimasi nilai proyek, lalu ubah menjadi profil klien aktif dalam satu klik.',
          tag: 'Lead -> Klien Aktif',
          rows: [
            { title: 'Nusantara Retail', subtitle: 'Portal Order B2B', metric: 'Rp 38.500.000', status: 'Proposal Sent', positive: false },
            { title: 'Surya Logistics', subtitle: 'Dashboard Armada', metric: 'Rp 24.000.000', status: 'Negotiation', positive: false },
            { title: 'Bumi Arsitektur', subtitle: 'Company Profile Web', metric: 'Rp 14.500.000', status: 'Won', positive: true },
          ],
        },
        proposals: {
          heading: 'Penyusun proposal dan persetujuan proyek',
          summary:
            'Rinci item layanan, hitung pajak otomatis, dan unduh PDF siap kirim. Saat disetujui, proyek baru langsung terbentuk.',
          tag: 'PROP-2026-014',
          rows: [
            { title: 'Arsitektur UI Sistem Order & Checkout', subtitle: 'Tahap 1 Desain', metric: 'Rp 16.000.000', status: 'Included', positive: false },
            { title: 'Pengembangan Next.js & Integrasi API', subtitle: 'Tahap 2 Implementasi', metric: 'Rp 19.000.000', status: 'Included', positive: false },
            { title: 'Total Estimasi (termasuk PPN 10%)', subtitle: 'Nusantara Retail', metric: 'Rp 38.500.000', status: 'Approved', positive: true },
          ],
        },
        delivery: {
          heading: 'Milestone proyek, Kanban tugas, dan time tracker',
          summary:
            'Pantau progres proyek otomatis dari status milestone, jalankan satu timer aktif per workspace, atau catat jam kerja manual.',
          tag: 'Progres 72%',
          rows: [
            { title: 'Skema peran admin cabang', subtitle: 'Backlog · Estimasi 6j', metric: 'Milestone 1', status: 'Done', positive: true },
            { title: 'Integrasi upload bukti pembayaran', subtitle: 'In Progress · Timer aktif', metric: '03:42:15', status: 'Billable', positive: true },
            { title: 'Ekspor laporan pesanan bulanan', subtitle: 'Review · Tenggat 28 Nov', metric: 'Milestone 2', status: 'In Review', positive: false },
          ],
        },
        billing: {
          heading: 'Invoice PDF, jadwal berulang, dan kuota berkas',
          summary:
            'Terbitkan nomor tagihan berurutan, jadwalkan invoice retainer bulanan, dan kelola dokumen deliverable dalam satu folder proyek.',
          tag: 'Kuota Paket Terkontrol',
          rows: [
            { title: 'INV-2026-028', subtitle: 'Nusantara Retail · Termin 1', metric: 'Rp 19.250.000', status: 'Sent', positive: false },
            { title: 'INV-2026-027', subtitle: 'Bumi Arsitektur · Lunas', metric: 'Rp 14.500.000', status: 'Paid', positive: true },
            { title: 'Panduan-API-v2.pdf', subtitle: 'Berkas Deliverable · 2.4 MB', metric: 'Shared', status: 'Portal Ready', positive: true },
          ],
        },
      },
      highlights: {
        topTitle: 'Data mengalir tanpa input ulang',
        topBody:
          'Profil klien dari CRM otomatis mengisi halaman proposal, menginisialisasi proyek saat disetujui, dan tersambung ke buku tagihan.',
        bottomTitle: 'Multi-workspace terisolasi',
        bottomBody:
          'Pisahkan proyek pribadi dan studio dalam workspace berbeda dengan batasan paket proyek aktif, klien, serta kuota penyimpanan.',
      },
    },
    workflow: {
      title: 'Urutan kerja yang jelas dari kontak pertama hingga lunas.',
      subtitle: 'Empat tahap utama operasional freelancer tanpa spreadsheet terpisah.',
      steps: [
        {
          verb: 'Catat Prospek',
          desc: 'Kelola prospek di papan CRM, simpan detail kontak, lalu konversi ke profil klien aktif saat deal.',
          result: 'Daftar klien rapi sejak hari pertama.',
        },
        {
          verb: 'Susun Proposal',
          desc: 'Buat penawaran bertarif, hitung subtotal dan pajak, ekspor PDF, dan pantau persetujuan.',
          result: 'Proyek langsung terbuat saat disetujui.',
        },
        {
          verb: 'Pantau Eksekusi',
          desc: 'Pecah target menjadi milestone, geser kartu tugas di Kanban, dan catat jam kerja billable.',
          result: 'Persentase selesai selalu terukur.',
        },
        {
          verb: 'Terbitkan Invoice',
          desc: 'Buat tagihan sekali jalan atau berulang, kirim PDF, dan bagikan progres melalui portal klien.',
          result: 'Pembayaran dan deliverable tercatat utuh.',
        },
      ],
    },
    portal: {
      title: 'Portal Klien khusus tanpa keramaian dashboard admin.',
      subtitle:
        'Undang perwakilan klien untuk memeriksa perkembangan milestone, mengunduh deliverable, dan mengecek status tagihan.',
      imageAlt: 'Dossier serah terima klien dengan pita pembatas emerald dan lembaran spesifikasi proyek',
      items: [
        {
          label: 'Progres & Milestone Read-Only',
          detail: 'Klien melihat persentase selesai, tenggat waktu, dan status tugas per tahap tanpa mengubah papan internal.',
        },
        {
          label: 'Pertukaran Berkas Terpusat',
          detail: 'Unduh hasil akhir atau unggah dokumen referensi yang langsung tertaut ke proyek terkait.',
        },
        {
          label: 'Riwayat Tagihan & Unduh PDF',
          detail: 'Semua invoice berstatus sent, paid, maupun overdue tersedia lengkap beserta berkas PDF.',
        },
      ],
    },
    cta: {
      title: 'Rapikan alur klien, proyek, dan tagihan Anda hari ini.',
      subtitle: 'Mulai workspace gratis untuk hingga 3 proyek aktif dan 5 klien tanpa kartu kredit.',
      buttonRegister: 'Mulai Gratis',
      buttonLogin: 'Masuk',
    },
    footer: {
      tagline: 'Ruang kerja operasional klien, proyek, dan penagihan untuk freelancer.',
      navigation: 'Navigasi',
      account: 'Akun',
      rights: 'SyncLancer. Seluruh hak cipta dilindungi.',
    },
  },
  en: {
    nav: {
      features: 'Modules',
      workflow: 'Workflow',
      portal: 'Client Portal',
      login: 'Sign In',
      register: 'Start Free',
    },
    hero: {
      title: 'One operational ledger for clients, delivery, and billing.',
      description:
        'Manage your lead pipeline, PDF proposals, project milestones, billable hours, and client invoices in one calm workspace.',
      startFree: 'Start Free',
      loginLink: 'Sign In',
      captionLeft: 'SyncLancer Workspace',
      captionRight: 'CRM · Proposals · Milestones · Invoices · Portal',
      imageAlt: 'Minimalist daylight studio desk with a closed matte black laptop, architectural scope sheets, and an emerald botanical leaf',
    },
    features: {
      title: 'Six core modules connected to the same client record.',
      subtitle:
        'Move engagements from initial inquiry to paid invoice without retyping details across disconnected apps.',
      tabs: [
        { id: 'crm', label: 'CRM Pipeline' },
        { id: 'proposals', label: 'PDF Proposals' },
        { id: 'delivery', label: 'Milestones & Time' },
        { id: 'billing', label: 'Invoices & Files' },
      ],
      panels: {
        crm: {
          heading: 'Lead tracking and one-click client conversion',
          summary:
            'Move prospects across Kanban columns, record deal estimates, and convert won deals directly into active client profiles.',
          tag: 'Lead -> Active Client',
          rows: [
            { title: 'Nusantara Retail', subtitle: 'B2B Order Portal', metric: '$3,850', status: 'Proposal Sent', positive: false },
            { title: 'Surya Logistics', subtitle: 'Fleet Operations Dashboard', metric: '$2,400', status: 'Negotiation', positive: false },
            { title: 'Bumi Architecture', subtitle: 'Studio Showcase Site', metric: '$1,450', status: 'Won', positive: true },
          ],
        },
        proposals: {
          heading: 'Itemized scope builder and project auto-spawn',
          summary:
            'Build line-item quotes with automatic tax totals and export print-ready PDFs. Approving a proposal spawns the project.',
          tag: 'PROP-2026-014',
          rows: [
            { title: 'Order Flow & Checkout UI Architecture', subtitle: 'Phase 1 Design', metric: '$1,600', status: 'Included', positive: false },
            { title: 'Next.js Frontend & API Integration', subtitle: 'Phase 2 Build', metric: '$1,900', status: 'Included', positive: false },
            { title: 'Proposal Total (incl. 10% Tax)', subtitle: 'Nusantara Retail', metric: '$3,850', status: 'Approved', positive: true },
          ],
        },
        delivery: {
          heading: 'Project milestones, task Kanban, and time logs',
          summary:
            'Calculate completion from milestone status, run one persistent timer per workspace, or log manual billable entries.',
          tag: '72% Complete',
          rows: [
            { title: 'Branch manager role matrix', subtitle: 'Backlog · Est. 6h', metric: 'Milestone 1', status: 'Done', positive: true },
            { title: 'Payment proof upload flow', subtitle: 'In Progress · Active timer', metric: '03:42:15', status: 'Billable', positive: true },
            { title: 'Monthly order export view', subtitle: 'Review · Due Nov 28', metric: 'Milestone 2', status: 'In Review', positive: false },
          ],
        },
        billing: {
          heading: 'Sequential PDF invoices, recurring billing, and files',
          summary:
            'Issue numbered invoices, automate monthly retainers, and organize project deliverables with explicit workspace quota checks.',
          tag: 'Quota Tracked',
          rows: [
            { title: 'INV-2026-028', subtitle: 'Nusantara Retail · Deposit', metric: '$1,925', status: 'Sent', positive: false },
            { title: 'INV-2026-027', subtitle: 'Bumi Architecture · Settled', metric: '$1,450', status: 'Paid', positive: true },
            { title: 'API-Handoff-Spec-v2.pdf', subtitle: 'Deliverable Asset · 2.4 MB', metric: 'Shared', status: 'Portal Ready', positive: true },
          ],
        },
      },
      highlights: {
        topTitle: 'Single source of client truth',
        topBody:
          'Client records created in CRM populate proposals, spawn active project scopes on approval, and stay linked to every invoice.',
        bottomTitle: 'Isolated multi-workspace control',
        bottomBody:
          'Separate independent retainers or studio arms with strict owner and client roles plus built-in plan limits.',
      },
    },
    workflow: {
      title: 'A clear sequence from inquiry to settled invoice.',
      subtitle: 'Four operational stages built on one shared workspace schema.',
      steps: [
        {
          verb: 'Capture Leads',
          desc: 'Track prospects on your CRM board, store contact notes, and convert won opportunities into clients.',
          result: 'Clean client records from day one.',
        },
        {
          verb: 'Send Proposals',
          desc: 'Draft itemized scopes, compute tax automatically, export PDFs, and track client approval.',
          result: 'Approval spawns the active project.',
        },
        {
          verb: 'Track Delivery',
          desc: 'Organize milestones, move tasks across Kanban lanes, and record billable hours accurately.',
          result: 'Progress stays grounded in real tasks.',
        },
        {
          verb: 'Issue Invoices',
          desc: 'Send sequential PDF invoices or monthly retainers while clients review updates in their portal.',
          result: 'Payments and deliverables stay aligned.',
        },
      ],
    },
    portal: {
      title: 'A focused Client Portal without internal workspace clutter.',
      subtitle:
        'Invite client stakeholders to track milestone progress, exchange project files, and download PDF invoices.',
      imageAlt: 'Architectural stone table with charcoal deliverable dossier, emerald bookmark ribbon, and geometric layout sheets',
      items: [
        {
          label: 'Read-Only Milestone Progress',
          detail: 'Clients inspect completion percentages, target dates, and task delivery without touching internal boards.',
        },
        {
          label: 'Scoped File Exchange',
          detail: 'Download signed-off deliverables or upload reference assets scoped directly to each project.',
        },
        {
          label: 'Invoice Ledger & PDF Access',
          detail: 'Every sent, paid, or overdue invoice is available in one chronological list with PDF download.',
        },
      ],
    },
    cta: {
      title: 'Bring clients, project delivery, and invoicing into one workspace.',
      subtitle: 'Create a free workspace for up to 3 active projects and 5 clients with no credit card required.',
      buttonRegister: 'Start Free',
      buttonLogin: 'Sign In',
    },
    footer: {
      tagline: 'Operational workspace for freelance client pipelines, delivery, and billing.',
      navigation: 'Navigation',
      account: 'Account',
      rights: 'SyncLancer. All rights reserved.',
    },
  },
} as const;
