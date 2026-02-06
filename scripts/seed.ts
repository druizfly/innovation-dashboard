import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  auditLog,
  lessonProjects,
  lessonTags,
  lessonsLearned,
  projectDuplications,
  projectMilestones,
  projectTags,
  projects,
  tags,
  techRadar,
} from "../src/lib/db/schema";

// Load .env
if (!process.env.DATABASE_URL) {
  const envPath = resolve(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
}

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL,
});
const db = drizzle(pool);

// ─── Data ────────────────────────────────────────────────────────────────────

const departments = [
  "Engineering",
  "Product",
  "Data Science",
  "DevOps",
  "Security",
  "Design",
  "QA",
  "Platform",
];

const projectData: (typeof projects.$inferInsert)[] = [
  // Engineering (5)
  { name: "API Gateway Modernization", description: "Replace legacy API gateway with cloud-native solution using Envoy and rate limiting.", department: "Engineering", leaderName: "Carlos Mendez", leaderEmail: "cmendez@company.com", status: "development", decision: "advance", decisionDate: "2025-11-15", decisionNotes: "Critical path for microservices migration", startDate: "2025-09-01", createdBy: "admin", updatedBy: "admin" },
  { name: "GraphQL Federation Layer", description: "Implement Apollo Federation to unify microservice APIs into a single graph.", department: "Engineering", leaderName: "Ana Rodriguez", leaderEmail: "arodriguez@company.com", status: "pilot", decision: "consolidate", decisionDate: "2025-12-01", startDate: "2025-06-15", createdBy: "admin", updatedBy: "admin" },
  { name: "Event-Driven Architecture Migration", description: "Migrate synchronous inter-service calls to event-driven patterns using Kafka.", department: "Engineering", leaderName: "David Park", leaderEmail: "dpark@company.com", status: "idea", createdBy: "admin", updatedBy: "admin" },
  { name: "API Gateway v2", description: "Next-gen API gateway with enhanced rate limiting and observability built on Envoy proxy.", department: "Engineering", leaderName: "Sofia Chen", leaderEmail: "schen@company.com", status: "idea", createdBy: "admin", updatedBy: "admin" },
  { name: "Monorepo Migration", description: "Consolidate repositories into a Turborepo monorepo for better code sharing.", department: "Engineering", leaderName: "James Wilson", leaderEmail: "jwilson@company.com", status: "development", decision: "advance", decisionDate: "2026-01-10", startDate: "2025-11-01", createdBy: "admin", updatedBy: "admin" },

  // Product (4)
  { name: "Customer Journey Analytics", description: "Build real-time customer journey tracking and funnel analysis dashboard.", department: "Product", leaderName: "Maria Lopez", leaderEmail: "mlopez@company.com", status: "development", decision: "advance", decisionDate: "2025-10-20", startDate: "2025-08-01", createdBy: "admin", updatedBy: "admin" },
  { name: "Feature Flag Platform", description: "Self-service feature flag management with gradual rollout capabilities.", department: "Product", leaderName: "Tom Harris", leaderEmail: "tharris@company.com", status: "pilot", decision: "advance", decisionDate: "2025-09-15", startDate: "2025-05-01", createdBy: "admin", updatedBy: "admin" },
  { name: "A/B Testing Framework", description: "Statistical A/B testing framework integrated with feature flags.", department: "Product", leaderName: "Lisa Wang", leaderEmail: "lwang@company.com", status: "idea", createdBy: "admin", updatedBy: "admin" },
  { name: "Product Analytics Pipeline", description: "Unified analytics pipeline for product metrics and user behavior tracking.", department: "Product", leaderName: "Kevin Zhang", leaderEmail: "kzhang@company.com", status: "development", decision: "consolidate", decisionDate: "2026-01-05", startDate: "2025-10-15", createdBy: "admin", updatedBy: "admin" },

  // Data Science (4)
  { name: "ML Model Registry", description: "Centralized registry for machine learning model versioning, tracking, and deployment.", department: "Data Science", leaderName: "Priya Sharma", leaderEmail: "psharma@company.com", status: "development", decision: "advance", decisionDate: "2025-11-01", startDate: "2025-07-15", createdBy: "admin", updatedBy: "admin" },
  { name: "Real-Time Fraud Detection", description: "ML-powered fraud detection system processing transactions in real-time.", department: "Data Science", leaderName: "Alex Turner", leaderEmail: "aturner@company.com", status: "pilot", decision: "advance", decisionDate: "2025-08-20", startDate: "2025-03-01", createdBy: "admin", updatedBy: "admin" },
  { name: "NLP Customer Support Bot", description: "Natural language processing chatbot for tier-1 customer support automation.", department: "Data Science", leaderName: "Rachel Kim", leaderEmail: "rkim@company.com", status: "idea", createdBy: "admin", updatedBy: "admin" },
  { name: "Data Lakehouse Architecture", description: "Implement Delta Lake on top of existing data lake for ACID transactions and schema evolution.", department: "Data Science", leaderName: "Omar Hassan", leaderEmail: "ohassan@company.com", status: "development", startDate: "2025-12-01", createdBy: "admin", updatedBy: "admin" },

  // DevOps (4)
  { name: "GitOps Pipeline", description: "Implement ArgoCD-based GitOps workflow for Kubernetes deployments.", department: "DevOps", leaderName: "Mike Johnson", leaderEmail: "mjohnson@company.com", status: "pilot", decision: "advance", decisionDate: "2025-10-01", startDate: "2025-04-15", createdBy: "admin", updatedBy: "admin" },
  { name: "Infrastructure Cost Optimizer", description: "Automated cloud cost analysis and right-sizing recommendations engine.", department: "DevOps", leaderName: "Sarah Brown", leaderEmail: "sbrown@company.com", status: "development", decision: "advance", decisionDate: "2025-12-15", startDate: "2025-09-01", createdBy: "admin", updatedBy: "admin" },
  { name: "Chaos Engineering Platform", description: "Controlled fault injection framework for resilience testing in production.", department: "DevOps", leaderName: "Chris Lee", leaderEmail: "clee@company.com", status: "idea", createdBy: "admin", updatedBy: "admin" },
  { name: "Observability Stack Upgrade", description: "Migrate from ELK to OpenTelemetry-based observability with Grafana stack.", department: "DevOps", leaderName: "Nina Patel", leaderEmail: "npatel@company.com", status: "development", decision: "consolidate", decisionDate: "2026-01-20", startDate: "2025-11-15", createdBy: "admin", updatedBy: "admin" },

  // Security (4)
  { name: "Zero Trust Network", description: "Implement zero trust architecture with mutual TLS and identity-aware proxy.", department: "Security", leaderName: "Robert Taylor", leaderEmail: "rtaylor@company.com", status: "development", decision: "advance", decisionDate: "2025-11-10", startDate: "2025-07-01", createdBy: "admin", updatedBy: "admin" },
  { name: "SAST/DAST Pipeline Integration", description: "Integrate static and dynamic security testing into CI/CD pipelines.", department: "Security", leaderName: "Emily Davis", leaderEmail: "edavis@company.com", status: "pilot", decision: "advance", decisionDate: "2025-09-01", startDate: "2025-04-01", createdBy: "admin", updatedBy: "admin" },
  { name: "Secrets Management Overhaul", description: "Migrate to HashiCorp Vault for centralized secrets management and rotation.", department: "Security", leaderName: "Daniel Wright", leaderEmail: "dwright@company.com", status: "idea", decision: "pause", decisionDate: "2026-01-15", decisionNotes: "Waiting for budget approval in Q2", createdBy: "admin", updatedBy: "admin" },
  { name: "Security Incident Response Automation", description: "Automated playbook execution for common security incidents using SOAR.", department: "Security", leaderName: "Jessica Martin", leaderEmail: "jmartin@company.com", status: "development", startDate: "2025-12-15", createdBy: "admin", updatedBy: "admin" },

  // Design (3)
  { name: "Design System 2.0", description: "Complete overhaul of component library with accessibility-first approach and dark mode.", department: "Design", leaderName: "Laura Green", leaderEmail: "lgreen@company.com", status: "development", decision: "advance", decisionDate: "2025-10-15", startDate: "2025-06-01", createdBy: "admin", updatedBy: "admin" },
  { name: "Figma-to-Code Pipeline", description: "Automated design-to-code generation using Figma plugins and code generators.", department: "Design", leaderName: "Mark Anderson", leaderEmail: "manderson@company.com", status: "idea", createdBy: "admin", updatedBy: "admin" },
  { name: "Design Tokens Infrastructure", description: "Centralized design token management with multi-platform output (web, iOS, Android).", department: "Design", leaderName: "Amy Foster", leaderEmail: "afoster@company.com", status: "pilot", decision: "consolidate", decisionDate: "2025-12-20", startDate: "2025-08-15", createdBy: "admin", updatedBy: "admin" },

  // QA (3)
  { name: "Visual Regression Testing", description: "Automated visual regression testing with Chromatic and Storybook integration.", department: "QA", leaderName: "Paul Mitchell", leaderEmail: "pmitchell@company.com", status: "development", decision: "advance", decisionDate: "2025-11-20", startDate: "2025-08-01", createdBy: "admin", updatedBy: "admin" },
  { name: "Contract Testing Framework", description: "Consumer-driven contract testing with Pact for microservice API compatibility.", department: "QA", leaderName: "Diana Ross", leaderEmail: "dross@company.com", status: "idea", createdBy: "admin", updatedBy: "admin" },
  { name: "Performance Testing as Code", description: "k6-based performance testing integrated into CI/CD with automatic SLA validation.", department: "QA", leaderName: "Steve Clark", leaderEmail: "sclark@company.com", status: "pilot", decision: "advance", decisionDate: "2025-10-05", startDate: "2025-05-15", createdBy: "admin", updatedBy: "admin" },

  // Platform (3)
  { name: "Internal Developer Portal", description: "Backstage-based developer portal for service catalog and documentation.", department: "Platform", leaderName: "Ryan Thompson", leaderEmail: "rthompson@company.com", status: "development", decision: "advance", decisionDate: "2025-12-01", startDate: "2025-09-15", createdBy: "admin", updatedBy: "admin" },
  { name: "Self-Service Infrastructure", description: "Terraform modules marketplace for teams to provision infrastructure via PR.", department: "Platform", leaderName: "Karen White", leaderEmail: "kwhite@company.com", status: "idea", createdBy: "admin", updatedBy: "admin" },
  { name: "Developer Experience Metrics", description: "DORA metrics dashboard with automated data collection from CI/CD systems.", department: "Platform", leaderName: "Brian Scott", leaderEmail: "bscott@company.com", status: "pilot", decision: "consolidate", decisionDate: "2026-01-25", startDate: "2025-10-01", createdBy: "admin", updatedBy: "admin" },
];

const techRadarData: (typeof techRadar.$inferInsert)[] = [
  // Explore (5)
  { technologyName: "Bun Runtime", category: "explore", quadrant: "tools", description: "JavaScript runtime alternative to Node.js with built-in bundler and test runner.", rationale: "Potential performance gains for serverless functions and build tooling.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "WebAssembly Components", category: "explore", quadrant: "techniques", description: "WASM component model for portable, language-agnostic modules.", rationale: "Could enable polyglot microservices with near-native performance.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "CockroachDB", category: "explore", quadrant: "platforms", description: "Distributed SQL database with strong consistency and horizontal scaling.", rationale: "Evaluate for geo-distributed workloads requiring ACID compliance.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "Deno 2", category: "explore", quadrant: "languages-frameworks", description: "Secure JavaScript/TypeScript runtime with native npm compatibility.", rationale: "Improved security model and npm compatibility make it worth evaluating.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "EdgeDB", category: "explore", quadrant: "platforms", description: "Graph-relational database with built-in migrations and type-safe queries.", rationale: "Novel query language could simplify complex data modeling.", createdBy: "admin", updatedBy: "admin" },

  // Adopt (6)
  { technologyName: "Next.js 15", category: "adopt", quadrant: "languages-frameworks", description: "React framework with server components, streaming, and edge runtime.", rationale: "Proven framework with strong ecosystem. Standard for all new web projects.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "PostgreSQL 16", category: "adopt", quadrant: "platforms", description: "Advanced open-source relational database with JSON support and extensions.", rationale: "Industry-standard RDBMS. Required for all new services.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "Kubernetes", category: "adopt", quadrant: "platforms", description: "Container orchestration platform for production workloads.", rationale: "De facto standard. All production services must deploy to K8s.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "TypeScript", category: "adopt", quadrant: "languages-frameworks", description: "Typed superset of JavaScript for large-scale application development.", rationale: "Mandatory for all JavaScript projects. Reduces runtime errors significantly.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "OpenTelemetry", category: "adopt", quadrant: "techniques", description: "Vendor-neutral observability framework for traces, metrics, and logs.", rationale: "Standardized observability. Replaces vendor-specific instrumentation.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "Drizzle ORM", category: "adopt", quadrant: "tools", description: "Lightweight TypeScript ORM with SQL-like query builder.", rationale: "Type-safe, performant, and close to SQL. Recommended for all Node.js services.", createdBy: "admin", updatedBy: "admin" },

  // Consolidate (5)
  { technologyName: "Express.js", category: "consolidate", quadrant: "techniques", description: "Minimal Node.js web framework.", rationale: "Migrate to Hono or Next.js API routes for new projects. Maintain existing only.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "MongoDB", category: "consolidate", quadrant: "platforms", description: "Document database used in legacy services.", rationale: "Migrate to PostgreSQL where possible. No new MongoDB deployments.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "Jenkins", category: "consolidate", quadrant: "tools", description: "Legacy CI/CD server.", rationale: "Migrate all pipelines to GitHub Actions by Q3 2026.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "Sequelize", category: "consolidate", quadrant: "tools", description: "Promise-based Node.js ORM.", rationale: "Replace with Drizzle ORM in all services during next refactoring cycle.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "REST APIs (internal)", category: "consolidate", quadrant: "techniques", description: "Traditional REST for inter-service communication.", rationale: "Migrate to gRPC or GraphQL federation for internal APIs.", createdBy: "admin", updatedBy: "admin" },

  // Avoid (4)
  { technologyName: "jQuery", category: "avoid", quadrant: "tools", description: "DOM manipulation library.", rationale: "No new usage. Modern React patterns replace all jQuery use cases.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "CoffeeScript", category: "avoid", quadrant: "languages-frameworks", description: "Legacy compile-to-JS language.", rationale: "TypeScript is the standard. CoffeeScript has no community support.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "Heroku", category: "avoid", quadrant: "platforms", description: "PaaS for deployment.", rationale: "Costs are prohibitive at scale. Use Kubernetes on cloud provider.", createdBy: "admin", updatedBy: "admin" },
  { technologyName: "Angular.js (v1)", category: "avoid", quadrant: "languages-frameworks", description: "Legacy frontend framework.", rationale: "End of life. Migrate remaining apps to React/Next.js immediately.", createdBy: "admin", updatedBy: "admin" },
];

const lessonsData: (typeof lessonsLearned.$inferInsert)[] = [
  { title: "Microservices Migration: Start with Strangler Fig", content: "## Key Insight\n\nWhen migrating from a monolith to microservices, the **strangler fig pattern** proved far more effective than a big-bang rewrite.\n\n### What Worked\n- Routing traffic gradually through a proxy layer\n- Starting with the least coupled domain (notifications)\n- Maintaining a shared database initially, then splitting\n\n### What Failed\n- Attempting to extract the payment domain first (too many dependencies)\n- Underestimating the need for distributed tracing early on\n\n### Recommendation\nAlways start with a low-risk, loosely-coupled service. Invest in observability **before** the migration, not after.", author: "Carlos Mendez", updatedBy: "Carlos Mendez" },
  { title: "Feature Flags Saved Our Launch", content: "## Context\n\nWe used feature flags for the v3 dashboard rollout and it prevented a potential outage.\n\n### Timeline\n- **Day 1**: Rolled out to 5% of users, caught a memory leak\n- **Day 3**: Fixed leak, rolled to 25%\n- **Day 7**: Full rollout with zero incidents\n\n### Key Takeaway\nFeature flags are not optional for any user-facing change. The 2-day investment in flag infrastructure saved us from a P1 incident.", author: "Tom Harris", updatedBy: "Tom Harris" },
  { title: "Database Migration Downtime: Lessons from the Outage", content: "## The Incident\n\nA schema migration on the orders table caused 47 minutes of downtime.\n\n### Root Cause\n- `ALTER TABLE` with `NOT NULL` constraint on a 500M-row table\n- Lock contention blocked all writes\n\n### Fix\n- Use `CREATE TABLE ... AS SELECT` pattern for large migrations\n- Add columns as nullable, backfill, then add constraint\n- Always test migrations against production-sized datasets\n\n### Tools\n- `pg_repack` for table rewrites\n- `pgloader` for parallel data migration", author: "Priya Sharma", updatedBy: "Priya Sharma" },
  { title: "Why We Chose Drizzle Over Prisma", content: "## Evaluation Criteria\n\nWe evaluated Prisma, TypeORM, Sequelize, and Drizzle for our new services.\n\n### Decision Factors\n1. **Type safety**: Drizzle infers types from schema, no codegen step\n2. **SQL closeness**: Drizzle queries map directly to SQL\n3. **Performance**: No query engine overhead\n4. **Bundle size**: 10x smaller than Prisma client\n\n### Trade-offs\n- Prisma has better documentation and ecosystem\n- Drizzle requires more SQL knowledge\n- Drizzle Studio is less mature than Prisma Studio", author: "Ana Rodriguez", updatedBy: "Ana Rodriguez" },
  { title: "Kubernetes Resource Limits: Getting Them Right", content: "## Problem\n\nOur services were being OOM-killed in production despite running fine in staging.\n\n### Root Cause\n- Memory limits set to 256MB based on idle usage\n- Under load, Node.js services needed 512MB+\n- No load testing in staging with production-like traffic\n\n### Solution\n- Implemented VPA (Vertical Pod Autoscaler) for recommendations\n- Set requests to p50 usage, limits to p99 + 20% buffer\n- Added memory profiling to CI pipeline\n\n### Metrics\n- OOM kills dropped from 15/day to 0\n- Resource utilization improved by 30%", author: "Mike Johnson", updatedBy: "Mike Johnson" },
  { title: "Implementing Zero Trust: Harder Than Expected", content: "## Journey\n\nOur zero trust implementation took 8 months instead of the planned 3.\n\n### Challenges\n1. Legacy services without mTLS support\n2. Service mesh (Istio) complexity and debugging\n3. Certificate rotation automation\n4. Developer pushback on added complexity\n\n### What We'd Do Differently\n- Start with a simpler mesh (Linkerd instead of Istio)\n- Implement gradually, one namespace at a time\n- Invest more in developer documentation and tooling", author: "Robert Taylor", updatedBy: "Robert Taylor" },
  { title: "Design System Adoption: Measuring Success", content: "## Metrics That Matter\n\nAfter 6 months of Design System 2.0 adoption:\n\n| Metric | Before | After |\n|--------|--------|-------|\n| Component reuse | 23% | 78% |\n| Design-to-dev time | 5 days | 2 days |\n| Accessibility violations | 142 | 12 |\n| Visual inconsistencies | High | Low |\n\n### Key Drivers\n- Mandatory Storybook stories for all components\n- Design review checklist integration\n- Monthly design system office hours", author: "Laura Green", updatedBy: "Laura Green" },
  { title: "Chaos Engineering: Start Small", content: "## First Experiment\n\nOur first chaos experiment (killing random pods) revealed 3 critical single points of failure.\n\n### Findings\n1. Redis session store had no fallback\n2. Payment webhook processor had no retry logic\n3. Configuration service was a SPOF for all services\n\n### Approach\n- Start in staging with simple experiments\n- Graduate to production with blast radius limits\n- Always have a rollback plan\n- Run game days before automated chaos", author: "Chris Lee", updatedBy: "Chris Lee" },
  { title: "GraphQL Federation: Performance Pitfalls", content: "## Problem\n\nOur federated GraphQL gateway had p99 latency of 2.3s for dashboard queries.\n\n### Cause\n- N+1 queries across subgraphs\n- No DataLoader pattern in resolvers\n- Gateway doing excessive schema stitching\n\n### Solution\n1. Implemented `@requires` and `@provides` directives\n2. Added DataLoader to all entity resolvers\n3. Enabled query planning cache\n4. Added persisted queries for known operations\n\n### Result\n- p99 dropped from 2.3s to 340ms\n- Gateway CPU usage reduced by 60%", author: "Ana Rodriguez", updatedBy: "Ana Rodriguez" },
  { title: "Observability-Driven Development", content: "## Concept\n\nInstead of adding observability after building features, we now instrument first.\n\n### Process\n1. Define SLOs before writing code\n2. Create dashboards with expected metrics\n3. Add trace spans to the design doc\n4. Implement the feature with instrumentation\n5. Validate dashboards show expected patterns\n\n### Benefits\n- Bugs caught 40% faster\n- On-call incidents reduced by 55%\n- New team members onboard faster via dashboards\n\n### Tools\n- OpenTelemetry for instrumentation\n- Grafana for dashboards\n- PagerDuty for alerting", author: "Nina Patel", updatedBy: "Nina Patel" },
];

const tagNames = [
  "microservices", "api", "database", "security", "devops",
  "frontend", "backend", "machine-learning", "infrastructure", "monitoring",
  "testing", "performance", "ci-cd", "cloud", "kubernetes",
  "react", "typescript", "graphql", "observability", "design-system",
  "data-pipeline", "automation", "cost-optimization", "developer-experience", "resilience",
];

// ─── Seed Function ──────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding database...\n");

  // Clear tables in FK-safe order
  console.log("Clearing existing data...");
  await db.delete(auditLog);
  await db.delete(lessonTags);
  await db.delete(projectTags);
  await db.delete(lessonProjects);
  await db.delete(projectDuplications);
  await db.delete(projectMilestones);
  await db.delete(lessonsLearned);
  await db.delete(techRadar);
  await db.delete(tags);
  await db.delete(projects);

  // Insert projects
  console.log("Inserting 30 projects...");
  const insertedProjects = await db.insert(projects).values(projectData).returning({ id: projects.id, name: projects.name });
  console.log(`  Inserted ${insertedProjects.length} projects`);

  // Insert milestones for projects in development/pilot
  console.log("Inserting project milestones...");
  const milestoneData: (typeof projectMilestones.$inferInsert)[] = [];
  for (const p of insertedProjects) {
    const proj = projectData[insertedProjects.indexOf(p)];
    if (proj.status === "development" || proj.status === "pilot") {
      milestoneData.push(
        { projectId: p.id, title: "Requirements Complete", targetDate: "2025-08-01", completedDate: "2025-08-05" },
        { projectId: p.id, title: "MVP Delivered", targetDate: "2025-11-01", completedDate: proj.status === "pilot" ? "2025-10-28" : undefined },
        { projectId: p.id, title: "Production Rollout", targetDate: "2026-02-01" },
      );
    }
  }
  if (milestoneData.length > 0) {
    await db.insert(projectMilestones).values(milestoneData);
    console.log(`  Inserted ${milestoneData.length} milestones`);
  }

  // Insert duplication pairs (near-duplicate projects)
  console.log("Inserting duplication flags...");
  const duplicationPairs: [string, string, number][] = [
    ["API Gateway Modernization", "API Gateway v2", 0.87],
    ["Customer Journey Analytics", "Product Analytics Pipeline", 0.62],
    ["Feature Flag Platform", "A/B Testing Framework", 0.55],
    ["GitOps Pipeline", "Self-Service Infrastructure", 0.48],
    ["ML Model Registry", "Data Lakehouse Architecture", 0.41],
    ["Observability Stack Upgrade", "Developer Experience Metrics", 0.52],
    ["Design System 2.0", "Design Tokens Infrastructure", 0.65],
  ];

  const dupData: (typeof projectDuplications.$inferInsert)[] = [];
  for (const [name1, name2, score] of duplicationPairs) {
    const p1 = insertedProjects.find((p) => p.name === name1);
    const p2 = insertedProjects.find((p) => p.name === name2);
    if (p1 && p2) {
      dupData.push({
        projectId: p1.id,
        relatedProjectId: p2.id,
        flaggedBy: "admin",
        similarityScore: score,
        notes: `Potential overlap detected between "${name1}" and "${name2}"`,
      });
    }
  }
  if (dupData.length > 0) {
    await db.insert(projectDuplications).values(dupData);
    console.log(`  Inserted ${dupData.length} duplication flags`);
  }

  // Insert tech radar
  console.log("Inserting 20 tech radar items...");
  const insertedTechRadar = await db.insert(techRadar).values(techRadarData).returning({ id: techRadar.id });
  console.log(`  Inserted ${insertedTechRadar.length} tech radar items`);

  // Insert lessons
  console.log("Inserting 10 lessons learned...");
  const insertedLessons = await db.insert(lessonsLearned).values(lessonsData).returning({ id: lessonsLearned.id, title: lessonsLearned.title });
  console.log(`  Inserted ${insertedLessons.length} lessons`);

  // Insert tags
  console.log("Inserting 25 tags...");
  const insertedTags = await db.insert(tags).values(tagNames.map((name) => ({ name }))).returning({ id: tags.id, name: tags.name });
  console.log(`  Inserted ${insertedTags.length} tags`);

  // Assign tags to projects
  console.log("Assigning tags to projects...");
  const tagMap = new Map(insertedTags.map((t) => [t.name, t.id]));
  const projectTagAssignments: Record<string, string[]> = {
    "API Gateway Modernization": ["api", "microservices", "infrastructure", "backend"],
    "GraphQL Federation Layer": ["graphql", "api", "backend", "microservices"],
    "Event-Driven Architecture Migration": ["microservices", "backend", "infrastructure"],
    "API Gateway v2": ["api", "infrastructure", "backend"],
    "Monorepo Migration": ["developer-experience", "ci-cd", "typescript"],
    "Customer Journey Analytics": ["data-pipeline", "frontend", "monitoring"],
    "Feature Flag Platform": ["frontend", "backend", "testing"],
    "ML Model Registry": ["machine-learning", "infrastructure", "data-pipeline"],
    "Real-Time Fraud Detection": ["machine-learning", "security", "performance"],
    "GitOps Pipeline": ["devops", "ci-cd", "kubernetes", "infrastructure"],
    "Infrastructure Cost Optimizer": ["cloud", "cost-optimization", "automation"],
    "Zero Trust Network": ["security", "infrastructure", "kubernetes"],
    "SAST/DAST Pipeline Integration": ["security", "ci-cd", "testing", "automation"],
    "Design System 2.0": ["design-system", "frontend", "react", "typescript"],
    "Visual Regression Testing": ["testing", "frontend", "ci-cd", "automation"],
    "Internal Developer Portal": ["developer-experience", "infrastructure", "backend"],
    "Performance Testing as Code": ["testing", "performance", "ci-cd"],
    "Developer Experience Metrics": ["developer-experience", "monitoring", "ci-cd"],
    "Observability Stack Upgrade": ["observability", "monitoring", "devops"],
    "NLP Customer Support Bot": ["machine-learning", "automation", "backend"],
  };

  const ptData: (typeof projectTags.$inferInsert)[] = [];
  for (const [projName, projTags] of Object.entries(projectTagAssignments)) {
    const proj = insertedProjects.find((p) => p.name === projName);
    if (proj) {
      for (const tagName of projTags) {
        const tagId = tagMap.get(tagName);
        if (tagId) ptData.push({ projectId: proj.id, tagId });
      }
    }
  }
  if (ptData.length > 0) {
    await db.insert(projectTags).values(ptData);
    console.log(`  Inserted ${ptData.length} project-tag assignments`);
  }

  // Assign lessons to projects
  console.log("Linking lessons to projects...");
  const lpData: (typeof lessonProjects.$inferInsert)[] = [];
  const lessonProjectLinks: Record<string, string[]> = {
    "Microservices Migration: Start with Strangler Fig": ["API Gateway Modernization", "Event-Driven Architecture Migration"],
    "Feature Flags Saved Our Launch": ["Feature Flag Platform", "A/B Testing Framework"],
    "Database Migration Downtime: Lessons from the Outage": ["Data Lakehouse Architecture"],
    "Why We Chose Drizzle Over Prisma": ["Internal Developer Portal", "API Gateway Modernization"],
    "Kubernetes Resource Limits: Getting Them Right": ["GitOps Pipeline", "Infrastructure Cost Optimizer"],
    "Implementing Zero Trust: Harder Than Expected": ["Zero Trust Network"],
    "Design System Adoption: Measuring Success": ["Design System 2.0", "Design Tokens Infrastructure"],
    "Chaos Engineering: Start Small": ["Chaos Engineering Platform", "GitOps Pipeline"],
    "GraphQL Federation: Performance Pitfalls": ["GraphQL Federation Layer"],
    "Observability-Driven Development": ["Observability Stack Upgrade", "Developer Experience Metrics"],
  };
  for (const [lessonTitle, projNames] of Object.entries(lessonProjectLinks)) {
    const lesson = insertedLessons.find((l) => l.title === lessonTitle);
    if (lesson) {
      for (const projName of projNames) {
        const proj = insertedProjects.find((p) => p.name === projName);
        if (proj) lpData.push({ lessonId: lesson.id, projectId: proj.id });
      }
    }
  }
  if (lpData.length > 0) {
    await db.insert(lessonProjects).values(lpData);
    console.log(`  Inserted ${lpData.length} lesson-project links`);
  }

  // Assign tags to lessons
  console.log("Assigning tags to lessons...");
  const ltData: (typeof lessonTags.$inferInsert)[] = [];
  const lessonTagLinks: Record<string, string[]> = {
    "Microservices Migration: Start with Strangler Fig": ["microservices", "backend", "infrastructure"],
    "Feature Flags Saved Our Launch": ["frontend", "testing", "resilience"],
    "Database Migration Downtime: Lessons from the Outage": ["database", "performance", "devops"],
    "Why We Chose Drizzle Over Prisma": ["database", "typescript", "backend"],
    "Kubernetes Resource Limits: Getting Them Right": ["kubernetes", "devops", "monitoring"],
    "Implementing Zero Trust: Harder Than Expected": ["security", "infrastructure", "kubernetes"],
    "Design System Adoption: Measuring Success": ["design-system", "frontend", "react"],
    "Chaos Engineering: Start Small": ["resilience", "testing", "devops"],
    "GraphQL Federation: Performance Pitfalls": ["graphql", "performance", "api"],
    "Observability-Driven Development": ["observability", "monitoring", "devops"],
  };
  for (const [lessonTitle, lTags] of Object.entries(lessonTagLinks)) {
    const lesson = insertedLessons.find((l) => l.title === lessonTitle);
    if (lesson) {
      for (const tagName of lTags) {
        const tagId = tagMap.get(tagName);
        if (tagId) ltData.push({ lessonId: lesson.id, tagId });
      }
    }
  }
  if (ltData.length > 0) {
    await db.insert(lessonTags).values(ltData);
    console.log(`  Inserted ${ltData.length} lesson-tag assignments`);
  }

  // Insert audit log entries
  console.log("Inserting audit log entries...");
  const auditData: (typeof auditLog.$inferInsert)[] = [
    { tableName: "projects", recordId: insertedProjects[0].id, action: "INSERT", newValues: { name: projectData[0].name }, performedBy: "admin" },
    { tableName: "projects", recordId: insertedProjects[0].id, action: "UPDATE", changedFields: { status: true }, oldValues: { status: "idea" }, newValues: { status: "development" }, performedBy: "admin" },
    { tableName: "projects", recordId: insertedProjects[0].id, action: "UPDATE", changedFields: { decision: true }, oldValues: { decision: null }, newValues: { decision: "advance" }, performedBy: "cmendez@company.com" },
    { tableName: "tech_radar", recordId: insertedTechRadar[0].id, action: "INSERT", newValues: { technology_name: techRadarData[0].technologyName }, performedBy: "admin" },
    { tableName: "lessons_learned", recordId: insertedLessons[0].id, action: "INSERT", newValues: { title: lessonsData[0].title }, performedBy: "Carlos Mendez" },
    { tableName: "projects", recordId: insertedProjects[5].id, action: "INSERT", newValues: { name: projectData[5].name }, performedBy: "admin" },
    { tableName: "projects", recordId: insertedProjects[5].id, action: "UPDATE", changedFields: { status: true, decision: true }, oldValues: { status: "idea", decision: null }, newValues: { status: "development", decision: "advance" }, performedBy: "mlopez@company.com" },
    { tableName: "tags", recordId: insertedTags[0].id, action: "INSERT", newValues: { name: tagNames[0] }, performedBy: "admin" },
  ];
  await db.insert(auditLog).values(auditData);
  console.log(`  Inserted ${auditData.length} audit log entries`);

  console.log("\nSeed completed successfully!");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
