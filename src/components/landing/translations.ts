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
      title: 'Kelola klien, proyek, dan tagihan freelance di satu tempat.',
      description:
        'Satukan prospek CRM, proposal PDF, papan tugas, catatan jam kerja, invoice, dan portal klien tanpa berpindah aplikasi.',
      startFree: 'Mulai Gratis',
      loginLink: 'Masuk',
      modulesStrip: ['CRM Pipeline', 'Proposal PDF', 'Task Kanban', 'Time Log', 'Invoice', 'Client Portal'],
      tabs: {
        crm: 'Pipeline CRM',
        proposals: 'Proposal',
        kanban: 'Kanban & Jam',
        billing: 'Tagihan',
      },
      workspaceName: 'Aksara Studio',
      workspacePlan: 'Pro Workspace',
    },
    mockup: {
      crmView: {
        title: 'Pipeline Prospek Aktif',
        countLabel: '3 prospek berjalan',
        rows: [
          { client: 'Nusantara Retail', scope: 'Portal Order B2B', value: 'Rp 38.500.000', stage: 'Proposal Sent' },
          { client: 'Surya Logistics', scope: 'Dashboard Armada', value: 'Rp 24.000.000', stage: 'Negotiation' },
          { client: 'Bumi Arsitektur', scope: 'Web Company Profile', value: 'Rp 14.500.000', stage: 'Won' },
        ],
      },
      proposalView: {
        number: 'PROP-2026-014',
        client: 'Nusantara Retail',
        status: 'Approved',
        services: [
          { name: 'Desain UI Sistem Order & Checkout', price: 'Rp 16.000.000' },
          { name: 'Pengembangan Next.js & Integrasi API', price: 'Rp 19.000.000' },
        ],
        taxLabel: 'PPN 10%',
        taxValue: 'Rp 3.500.000',
        totalLabel: 'Total Estimasi',
        totalValue: 'Rp 38.500.000',
      },
      kanbanView: {
        title: 'Sprint Aktif: Portal Order B2B',
        timerProject: 'Portal Order B2B',
        timerDuration: '03:42:15',
        timerBillable: 'Rp 925.000',
        columns: [
          { label: 'Backlog', task: 'Skema peran admin cabang' },
          { label: 'In Progress', task: 'Integrasi upload bukti bayar' },
          { label: 'Review', task: 'Halaman riwayat pesanan' },
        ],
      },
      billingView: {
        title: 'Buku Tagihan & Jadwal Berulang',
        rows: [
          { number: 'INV-2026-028', client: 'Nusantara Retail', due: '24 Nov 2026', amount: 'Rp 19.250.000', status: 'Sent' },
          { number: 'INV-2026-027', client: 'Bumi Arsitektur', due: '10 Nov 2026', amount: 'Rp 14.500.000', status: 'Paid' },
        ],
      },
    },
    features: {
      title: 'Semua modul inti yang benar-benar dipakai saat menangani klien.',
      subtitle: 'Dirancang mengikuti urutan kerja freelancer dari kontak pertama hingga invoice lunas.',
      primary: [
        {
          title: 'CRM Pipeline & Proposal PDF',
          desc: 'Catat prospek per tahap, ubah jadi akun klien saat deal, lalu susun estimasi pajak dan ekspor proposal PDF. Proposal yang disetujui langsung membuat proyek baru.',
          metrics: [
            { label: 'Tahap Pipeline', value: 'Lead -> Contacted -> Sent -> Won' },
            { label: 'Otomatisasi', value: 'Approve proposal membuat proyek aktif' },
          ],
        },
        {
          title: 'Milestone, Kanban & Catatan Jam Kerja',
          desc: 'Pecah target proyek menjadi milestone dan kartu tugas. Jalankan timer langsung dari workspace, lalu konversi log jam billable ke tagihan proyek.',
          metrics: [
            { label: 'Pelacakan Waktu', value: '1 timer aktif per workspace + log manual' },
            { label: 'Progres Proyek', value: 'Terhitung otomatis dari status milestone' },
          ],
        },
      ],
      secondary: [
        {
          title: 'Invoice PDF & Jadwal Berulang',
          desc: 'Buat nomor tagihan berurutan, kirim lewat email, catat pembayaran, dan aktifkan penagihan retainer otomatis.',
        },
        {
          title: 'Penyimpanan Berkas Terkontrol',
          desc: 'Kelompokkan kontrak, aset desain, dan dokumen deliverable per proyek dengan batas kuota paket yang jelas.',
        },
        {
          title: 'Multi-Workspace & Batas Paket',
          desc: 'Pisahkan bisnis studio atau freelance pribadi dalam workspace berbeda dengan kontrol peran owner dan klien.',
        },
        {
          title: 'Analitik Pendapatan & Beban Kerja',
          desc: 'Pantau pendapatan bulanan 12 bulan terakhir, tagihan tertunda, dan distribusi status proyek secara langsung.',
        },
      ],
    },
    workflow: {
      title: 'Tiga langkah dari prospek ke pembayaran.',
      subtitle: 'Setiap modul terhubung ke data yang sama sehingga tidak perlu input ulang.',
      steps: [
        {
          index: '01',
          title: 'Catat Prospek & Kirim Proposal',
          desc: 'Masukkan kontak baru di papan CRM, konversi jadi klien, dan kirim penawaran PDF dengan rincian harga.',
          io: 'Input: Brief klien -> Output: Proposal PDF & proyek aktif',
        },
        {
          index: '02',
          title: 'Eksekusi Tugas & Rekam Jam',
          desc: 'Atur milestone proyek, geser kartu tugas di Kanban, dan catat jam kerja real-time maupun entri manual.',
          io: 'Input: Daftar milestone -> Output: Progres & log jam billable',
        },
        {
          index: '03',
          title: 'Terbitkan Invoice & Buka Portal',
          desc: 'Kirim tagihan PDF atau jadwalkan invoice berulang sambil memberi klien akses pantau progres dan berkas.',
          io: 'Input: Deliverable & tagihan -> Output: Pembayaran tercatat',
        },
      ],
    },
    portal: {
      title: 'Portal Klien tanpa perlu akun freelancer.',
      subtitle:
        'Undang perwakilan klien untuk memantau perkembangan proyek, mengunduh aset, dan memeriksa tagihan dalam tampilan khusus.',
      items: [
        {
          label: 'Progres & Milestone Read-Only',
          detail: 'Klien melihat persentase selesai, tenggat waktu, dan daftar tugas tiap tahap.',
        },
        {
          label: 'Pertukaran Berkas Terpusat',
          detail: 'Unduh deliverable final atau unggah dokumen referensi langsung ke proyek terkait.',
        },
        {
          label: 'Riwayat Tagihan & Unduh PDF',
          detail: 'Semua invoice berstatus sent, paid, atau overdue tersedia beserta PDF siap cetak.',
        },
      ],
      preview: {
        clientName: 'Nusantara Retail',
        projectName: 'Portal Order B2B',
        progress: 72,
        milestones: [
          { title: 'Arsitektur & Wireframe', status: 'Completed' },
          { title: 'Integrasi Katalog & Checkout', status: 'In Progress' },
          { title: 'Uji Muat & Serah Terima', status: 'Not Started' },
        ],
        invoiceNumber: 'INV-2026-028',
        invoiceAmount: 'Rp 19.250.000',
        invoiceStatus: 'Sent',
        fileName: 'Panduan-API-v2.pdf',
        fileMeta: '2.4 MB',
      },
    },
    cta: {
      title: 'Mulai rapikan operasional klien dan tagihan Anda hari ini.',
      subtitle: 'Buat workspace gratis untuk mengelola hingga 3 proyek aktif dan 5 klien tanpa kartu kredit.',
      buttonRegister: 'Mulai Gratis',
      buttonLogin: 'Masuk',
    },
    footer: {
      tagline: 'Workspace operasional proyek, klien, dan penagihan untuk freelancer.',
      navigation: 'Navigasi',
      account: 'Akun',
      rights: 'SyncLancer.',
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
      title: 'Run your client pipeline, project delivery, and billing in one place.',
      description:
        'Bring CRM leads, PDF proposals, task boards, time tracking, invoices, and client portals into one focused workspace.',
      startFree: 'Start Free',
      loginLink: 'Sign In',
      modulesStrip: ['CRM Pipeline', 'PDF Proposals', 'Task Kanban', 'Time Log', 'Invoices', 'Client Portal'],
      tabs: {
        crm: 'CRM Pipeline',
        proposals: 'Proposals',
        kanban: 'Kanban & Time',
        billing: 'Billing',
      },
      workspaceName: 'Aksara Studio',
      workspacePlan: 'Pro Workspace',
    },
    mockup: {
      crmView: {
        title: 'Active Lead Pipeline',
        countLabel: '3 active deals',
        rows: [
          { client: 'Nusantara Retail', scope: 'B2B Order Portal', value: '$3,850', stage: 'Proposal Sent' },
          { client: 'Surya Logistics', scope: 'Fleet Operations Dashboard', value: '$2,400', stage: 'Negotiation' },
          { client: 'Bumi Architecture', scope: 'Studio Showcase Site', value: '$1,450', stage: 'Won' },
        ],
      },
      proposalView: {
        number: 'PROP-2026-014',
        client: 'Nusantara Retail',
        status: 'Approved',
        services: [
          { name: 'Order Flow & Checkout UI Architecture', price: '$1,600' },
          { name: 'Next.js Frontend & API Integration', price: '$1,900' },
        ],
        taxLabel: 'Tax 10%',
        taxValue: '$350',
        totalLabel: 'Proposal Total',
        totalValue: '$3,850',
      },
      kanbanView: {
        title: 'Active Sprint: B2B Order Portal',
        timerProject: 'B2B Order Portal',
        timerDuration: '03:42:15',
        timerBillable: '$240.50',
        columns: [
          { label: 'Backlog', task: 'Branch manager role matrix' },
          { label: 'In Progress', task: 'Payment proof upload flow' },
          { label: 'Review', task: 'Order history export view' },
        ],
      },
      billingView: {
        title: 'Invoice Ledger & Recurring Billing',
        rows: [
          { number: 'INV-2026-028', client: 'Nusantara Retail', due: 'Nov 24, 2026', amount: '$1,925', status: 'Sent' },
          { number: 'INV-2026-027', client: 'Bumi Architecture', due: 'Nov 10, 2026', amount: '$1,450', status: 'Paid' },
        ],
      },
    },
    features: {
      title: 'Every core module you actually use across client engagements.',
      subtitle: 'Structured around how independent engineers and studios take work from initial lead to paid invoice.',
      primary: [
        {
          title: 'CRM Pipeline & PDF Proposals',
          desc: 'Track prospects by stage, convert won deals into client profiles, and build itemized PDF proposals. Approving a proposal spawns the active project.',
          metrics: [
            { label: 'Pipeline Stages', value: 'Lead -> Contacted -> Sent -> Won' },
            { label: 'Handoff', value: 'Approval creates the project record' },
          ],
        },
        {
          title: 'Milestones, Kanban & Time Tracking',
          desc: 'Break projects into dated milestones and draggable tasks. Run a persistent workspace timer or log manual hours ready for billing.',
          metrics: [
            { label: 'Timer Scope', value: '1 active timer per workspace + manual logs' },
            { label: 'Completion', value: 'Calculated from milestone status' },
          ],
        },
      ],
      secondary: [
        {
          title: 'PDF Invoices & Recurring Billing',
          desc: 'Issue sequential invoices, email clients directly, mark payments, and automate monthly retainers.',
        },
        {
          title: 'Scoped Cloud File Storage',
          desc: 'Organize contracts, design files, and deliverables per project with explicit plan quota checks.',
        },
        {
          title: 'Multi-Workspace & Role Access',
          desc: 'Separate client accounts or retainers into isolated workspaces with owner and client permissions.',
        },
        {
          title: 'Revenue & Workload Analytics',
          desc: 'Track 12-month rolling revenue, pending balances, logged hours, and project status distribution.',
        },
      ],
    },
    workflow: {
      title: 'Three steps from prospect to paid invoice.',
      subtitle: 'Each stage shares the same workspace records so nothing gets retyped across tools.',
      steps: [
        {
          index: '01',
          title: 'Capture Leads & Send Proposals',
          desc: 'Log prospects in the CRM board, convert them to clients, and export clean PDF scopes with tax totals.',
          io: 'Input: Client brief -> Output: PDF proposal & project',
        },
        {
          index: '02',
          title: 'Deliver Milestones & Log Hours',
          desc: 'Schedule milestones, move tasks across Kanban columns, and track billable hours in real time.',
          io: 'Input: Task breakdown -> Output: Verified progress & time log',
        },
        {
          index: '03',
          title: 'Issue Invoices & Share Portal',
          desc: 'Send sequential PDF invoices or recurring schedules while clients track updates from their portal.',
          io: 'Input: Deliverables & hours -> Output: Recorded payment',
        },
      ],
    },
    portal: {
      title: 'A dedicated Client Portal without admin noise.',
      subtitle:
        'Invite client stakeholders to check milestone completion, exchange files, and download PDF invoices from one clean view.',
      items: [
        {
          label: 'Read-Only Milestone Timeline',
          detail: 'Clients inspect project completion percentages, target dates, and task progress.',
        },
        {
          label: 'Direct File Exchange',
          detail: 'Download approved deliverables or upload reference assets scoped to each project.',
        },
        {
          label: 'Invoice Ledger & PDF Access',
          detail: 'Every sent, paid, or overdue invoice is listed with instant PDF download.',
        },
      ],
      preview: {
        clientName: 'Nusantara Retail',
        projectName: 'B2B Order Portal',
        progress: 72,
        milestones: [
          { title: 'Architecture & Wireframes', status: 'Completed' },
          { title: 'Catalog & Checkout Integration', status: 'In Progress' },
          { title: 'Load Testing & Handoff', status: 'Not Started' },
        ],
        invoiceNumber: 'INV-2026-028',
        invoiceAmount: '$1,925',
        invoiceStatus: 'Sent',
        fileName: 'API-Handoff-Spec-v2.pdf',
        fileMeta: '2.4 MB',
      },
    },
    cta: {
      title: 'Keep client delivery and invoicing in one organized workspace.',
      subtitle: 'Create a free workspace for up to 3 active projects and 5 clients with no credit card required.',
      buttonRegister: 'Start Free',
      buttonLogin: 'Sign In',
    },
    footer: {
      tagline: 'Client, project, and billing operations workspace for freelancers.',
      navigation: 'Navigation',
      account: 'Account',
      rights: 'SyncLancer.',
    },
  },
};
