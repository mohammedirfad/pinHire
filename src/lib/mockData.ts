export interface CompanyMock {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  description: string;
  website: string;
  verified: boolean;
  lat: number;
  lng: number;
}

export interface JobMock {
  id: string;
  slug: string;
  title: string;
  companyId: string;
  company: CompanyMock;
  description: string;
  lat: number;
  lng: number;
  locationLabel: string;
  experienceMin: number;
  experienceMax?: number;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'FREELANCE';
  applyLink?: string;
  hrEmail?: string;
  postedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DRAFT';
  source: 'manual' | 'pasted-extract' | 'csv';
  createdBy: string;
}

export const MOCK_COMPANIES: CompanyMock[] = [
  {
    id: 'comp-stripe',
    slug: 'stripe',
    name: 'Stripe',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Financial infrastructure for the internet. Millions of companies use Stripe to accept payments and grow.',
    website: 'https://stripe.com',
    verified: true,
    lat: 12.9352,
    lng: 77.6245, // Koramangala, Bangalore
  },
  {
    id: 'comp-razorpay',
    slug: 'razorpay',
    name: 'Razorpay',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'India\'s leading Payments & Banking Platform for businesses of all sizes.',
    website: 'https://razorpay.com',
    verified: true,
    lat: 12.9279,
    lng: 77.6271, // HSR Layout, Bangalore
  },
  {
    id: 'comp-swiggy',
    slug: 'swiggy',
    name: 'Swiggy',
    logoUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'India\'s leading on-demand convenience platform powering food and grocery delivery.',
    website: 'https://swiggy.com',
    verified: true,
    lat: 12.9344,
    lng: 77.6101, // Tavarekere, Bangalore
  },
  {
    id: 'comp-freshworks',
    slug: 'freshworks',
    name: 'Freshworks',
    logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Modern software for IT, customer support, and sales teams that businesses actually love to use.',
    website: 'https://freshworks.com',
    verified: true,
    lat: 9.9981,
    lng: 76.3578, // Infopark Kochi
  },
  {
    id: 'comp-vercel',
    slug: 'vercel',
    name: 'Vercel',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Vercel provides developer tools and cloud infrastructure to build, deploy, and scale web applications.',
    website: 'https://vercel.com',
    verified: true,
    lat: 37.7749,
    lng: -122.4194, // San Francisco, CA
  },
  {
    id: 'comp-datadog',
    slug: 'datadog',
    name: 'Datadog',
    logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Essential monitoring and security platform for cloud applications.',
    website: 'https://datadoghq.com',
    verified: true,
    lat: 40.7589,
    lng: -73.9851, // New York City
  },
  {
    id: 'comp-revolut',
    slug: 'revolut',
    name: 'Revolut',
    logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'One app, all things money. Global financial superapp used by 35+ million people.',
    website: 'https://revolut.com',
    verified: true,
    lat: 51.5045,
    lng: -0.0195, // Canary Wharf, London
  },
  {
    id: 'comp-zalando',
    slug: 'zalando',
    name: 'Zalando',
    logoUrl: 'https://images.unsplash.com/photo-1542744094-3a3172720189?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Europe\'s leading online platform for fashion and lifestyle.',
    website: 'https://zalando.com',
    verified: true,
    lat: 52.5034,
    lng: 13.4471, // Berlin Friedrichshain
  }
];

export const MOCK_JOBS: JobMock[] = [
  {
    id: 'job-1',
    slug: 'senior-full-stack-engineer-stripe-koramangala-101',
    title: 'Senior Full-Stack Engineer (React & Node)',
    companyId: 'comp-stripe',
    company: MOCK_COMPANIES[0],
    description: `We are seeking a Senior Full-Stack Engineer to lead the design and execution of high-throughput payment components.\n\n### Key Responsibilities:\n- Build ultra-responsive user interfaces with React, Next.js, and TypeScript.\n- Design resilient GraphQL and REST APIs backed by Postgres and Redis.\n- Optimize payment checkout funnels to reduce latency and boost conversion rates.\n\n### Requirements:\n- 4+ years experience with modern JavaScript / TypeScript ecosystems.\n- Strong expertise in SQL performance tuning and database migrations.\n- Experience working in high-availability distributed systems.`,
    lat: 12.9352,
    lng: 77.6245,
    locationLabel: 'Koramangala, Bangalore, India',
    experienceMin: 4,
    experienceMax: 8,
    jobType: 'FULL_TIME',
    applyLink: 'https://stripe.com/jobs/senior-fullstack-engineer',
    hrEmail: 'careers-in@stripe.com',
    postedAt: '2026-08-08T10:00:00Z',
    expiresAt: '2026-09-08T10:00:00Z',
    status: 'ACTIVE',
    source: 'manual',
    createdBy: 'admin',
  },
  {
    id: 'job-2',
    slug: 'backend-engineer-payments-razorpay-hsr-102',
    title: 'Backend Systems Engineer (Go & Microservices)',
    companyId: 'comp-razorpay',
    company: MOCK_COMPANIES[1],
    description: `Razorpay is hiring a Backend Engineer to scale core payment processing pipelines handling over 5,000 requests per second.\n\n### Role Overview:\n- Architect distributed Go microservices handling real-time settlement processing.\n- Build high-concurrency event queues with Kafka and Redis.\n- Drive automated integration testing and zero-downtime deployment pipelines.`,
    lat: 12.9279,
    lng: 77.6271,
    locationLabel: 'HSR Layout, Bangalore, India',
    experienceMin: 2,
    experienceMax: 5,
    jobType: 'FULL_TIME',
    applyLink: 'https://razorpay.com/jobs/backend-engineer',
    hrEmail: 'tech-hiring@razorpay.com',
    postedAt: '2026-08-09T08:30:00Z',
    expiresAt: '2026-09-09T08:30:00Z',
    status: 'ACTIVE',
    source: 'manual',
    createdBy: 'admin',
  },
  {
    id: 'job-3',
    slug: 'ui-ux-product-designer-swiggy-tavarekere-103',
    title: 'Senior Product Designer (Mobile & Web)',
    companyId: 'comp-swiggy',
    company: MOCK_COMPANIES[2],
    description: `Join Swiggy's consumer experience team to design delightful micro-interactions for food and grocery checkout flows.\n\n### What you will do:\n- Create interactive Figma prototypes and design systems.\n- Conduct qualitative user interviews across metro and tier-2 markets.\n- Collaborate closely with iOS, Android, and Web engineers.`,
    lat: 12.9344,
    lng: 77.6101,
    locationLabel: 'Tavarekere, Bangalore, India',
    experienceMin: 3,
    experienceMax: 6,
    jobType: 'FULL_TIME',
    applyLink: 'https://careers.swiggy.com/designer',
    hrEmail: 'design-jobs@swiggy.in',
    postedAt: '2026-08-07T14:15:00Z',
    expiresAt: '2026-09-07T14:15:00Z',
    status: 'ACTIVE',
    source: 'manual',
    createdBy: 'admin',
  },
  {
    id: 'job-4',
    slug: 'frontend-lead-react-freshworks-infopark-104',
    title: 'Frontend Tech Lead (React & TypeScript)',
    companyId: 'comp-freshworks',
    company: MOCK_COMPANIES[3],
    description: `Freshworks Kochi is looking for a Tech Lead to head the customer portal frontend module.\n\n### Key Focus:\n- Architect modular frontend libraries used by 50,000+ business customers worldwide.\n- Drive Web Vitals optimization and accessibility (WCAG AA compliance).\n- Mentor junior software engineers and establish code review standard practices.`,
    lat: 9.9981,
    lng: 76.3578,
    locationLabel: 'Infopark, Kochi, Kerala, India',
    experienceMin: 5,
    experienceMax: 10,
    jobType: 'FULL_TIME',
    applyLink: 'https://freshworks.com/careers/kochi-lead',
    hrEmail: 'kochi-careers@freshworks.com',
    postedAt: '2026-08-06T09:00:00Z',
    expiresAt: '2026-09-06T09:00:00Z',
    status: 'ACTIVE',
    source: 'manual',
    createdBy: 'admin',
  },
  {
    id: 'job-5',
    slug: 'cloud-infrastructure-engineer-vercel-sf-105',
    title: 'Edge Infrastructure Engineer',
    companyId: 'comp-vercel',
    company: MOCK_COMPANIES[4],
    description: `Help Vercel build the fastest edge platform on planet Earth.\n\n### Responsibilities:\n- Deploy Rust and Go edge workers across global CDN nodes.\n- Manage Kubernetes clusters, eBPF telemetry, and global DNS routing.\n- Partner with Next.js core team to streamline serverless deployment latency.`,
    lat: 37.7749,
    lng: -122.4194,
    locationLabel: 'Downtown San Francisco, CA, USA',
    experienceMin: 3,
    experienceMax: 7,
    jobType: 'FULL_TIME',
    applyLink: 'https://vercel.com/careers/edge-infra',
    hrEmail: 'jobs@vercel.com',
    postedAt: '2026-08-05T16:00:00Z',
    expiresAt: '2026-09-05T16:00:00Z',
    status: 'ACTIVE',
    source: 'manual',
    createdBy: 'admin',
  },
  {
    id: 'job-6',
    slug: 'site-reliability-engineer-datadog-ny-106',
    title: 'Senior Site Reliability Engineer (SRE)',
    companyId: 'comp-datadog',
    company: MOCK_COMPANIES[5],
    description: `Datadog NYC is searching for an SRE to manage telemetry pipelines ingesting petabytes of metrics daily.\n\n### Requirements:\n- Expertise in Terraform, Kubernetes, Helm, and Prometheus.\n- Strong scripting skills in Python, Go, or Bash.\n- On-call incident response and root-cause analysis mindset.`,
    lat: 40.7589,
    lng: -73.9851,
    locationLabel: 'Times Square, New York, NY, USA',
    experienceMin: 4,
    experienceMax: 9,
    jobType: 'FULL_TIME',
    applyLink: 'https://datadog.com/careers/sre-nyc',
    hrEmail: 'nyc-hiring@datadoghq.com',
    postedAt: '2026-08-04T11:20:00Z',
    expiresAt: '2026-09-04T11:20:00Z',
    status: 'ACTIVE',
    source: 'manual',
    createdBy: 'admin',
  },
  {
    id: 'job-7',
    slug: 'mobile-engineer-flutter-revolut-london-107',
    title: 'Mobile Engineer (iOS & Android)',
    companyId: 'comp-revolut',
    company: MOCK_COMPANIES[6],
    description: `Revolut London is expanding its wealth & trading team. Build seamless stock trading and crypto transaction screens in Swift and Kotlin.`,
    lat: 51.5045,
    lng: -0.0195,
    locationLabel: 'Canary Wharf, London, UK',
    experienceMin: 2,
    experienceMax: 5,
    jobType: 'FULL_TIME',
    applyLink: 'https://revolut.com/careers/mobile-dev',
    hrEmail: 'london-recruitment@revolut.com',
    postedAt: '2026-08-03T15:00:00Z',
    expiresAt: '2026-09-03T15:00:00Z',
    status: 'ACTIVE',
    source: 'manual',
    createdBy: 'admin',
  },
  {
    id: 'job-8',
    slug: 'data-scientist-recommendations-zalando-berlin-108',
    title: 'Data Scientist - Personalization AI',
    companyId: 'comp-zalando',
    company: MOCK_COMPANIES[7],
    description: `Join Zalando Berlin to build hyper-personalized fashion recommendation models serving 50M active shoppers.\n\n### Skillset:\n- Python, PyTorch / TensorFlow, Scikit-Learn, Spark.\n- Multi-armed bandit testing and real-time feature stores.`,
    lat: 52.5034,
    lng: 13.4471,
    locationLabel: 'Friedrichshain, Berlin, Germany',
    experienceMin: 3,
    experienceMax: 7,
    jobType: 'FULL_TIME',
    applyLink: 'https://jobs.zalando.com/en/data-scientist-recommendations',
    hrEmail: 'tech-berlin@zalando.de',
    postedAt: '2026-08-02T13:45:00Z',
    expiresAt: '2026-09-02T13:45:00Z',
    status: 'ACTIVE',
    source: 'manual',
    createdBy: 'admin',
  }
];
