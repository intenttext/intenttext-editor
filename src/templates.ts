export interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: "agent" | "human" | "docs";
  content: string;
}

export const TEMPLATES: Template[] = [
  // ── Agent-to-Agent ────────────────────────────────────────
  {
    id: "support-pipeline",
    name: "Support Pipeline",
    icon: "🤖",
    category: "agent",
    description: "Multi-agent customer support triage",
    content: `title: Customer Support Pipeline
agent: triage-agent | model: gpt-4o
context: | ticketId: T-4821 | channel: chat

section: Intake
trigger: ticket.created | event: support.new
step: Classify ticket | tool: classifier.run | input: ticketText
result: Classification complete | code: 200 | data: {"category":"billing","urgency":"high"}
emit: Classified | phase: triage | level: info

section: Routing
decision: Route by category | if: category == "billing" | then: step-billing | else: step-general
handoff: Transfer to billing | from: triage-agent | to: billing-agent
wait: Billing agent response | timeout: 30s | fallback: escalate

section: Resolution
call: Get customer history | status: complete | timeout: 5s
step: Draft response | id: step-billing | tool: response.generate | depends: step-2
retry: Send confirmation email | max: 3 | delay: 1000 | backoff: exponential
result: Ticket resolved | code: 200 | data: {"resolution":"refund_processed"}

checkpoint: ticket-closed
audit: Ticket resolved | by: billing-agent | at: {{timestamp}}`,
  },
  {
    id: "deploy-workflow",
    name: "Deploy Workflow",
    icon: "🚀",
    category: "agent",
    description: "CI/CD deployment with rollback",
    content: `title: Production Deployment Pipeline
agent: deploy-agent | model: claude-sonnet-4
context: | env: production | branch: main | version: 2.1.0

section: Pre-Deploy Checks
parallel: Run all checks | steps: test,lint,typecheck,security-scan
step: Run test suite | id: test | tool: ci.test | timeout: 300000
step: Lint codebase | id: lint | tool: ci.lint | timeout: 60000
step: Type check | id: typecheck | tool: ci.typecheck | timeout: 60000
step: Security scan | id: security-scan | tool: ci.audit | timeout: 120000

section: Deploy
decision: All checks passed? | if: checks == "pass" | then: step-deploy | else: step-abort
step: Deploy to staging | id: step-deploy | tool: k8s.deploy | input: version
wait: Smoke test results | timeout: 60s | fallback: step-rollback
step: Promote to production | tool: k8s.promote | depends: step-deploy

section: Rollback Plan
error: Deploy failed | fallback: step-rollback | notify: ops-team
step: Rollback to previous | id: step-rollback | tool: k8s.rollback
step: Abort pipeline | id: step-abort | tool: ci.abort | status: cancelled

section: Post-Deploy
result: Deployed v2.1.0 to production | code: 200
handoff: Transfer monitoring | from: deploy-agent | to: observability-agent
gate: Production approval | status: approved | approver: ops-lead
emit: Live | phase: monitoring | level: info
audit: Deployment complete | by: deploy-agent | at: {{timestamp}}`,
  },
  {
    id: "data-pipeline",
    name: "Data Pipeline",
    icon: "🔄",
    category: "agent",
    description: "ETL workflow with retry and parallelism",
    content: `title: Daily Data Sync Pipeline
agent: etl-agent | model: gpt-4o
context: | source: postgres | target: warehouse | date: 2026-03-04

section: Extract
trigger: schedule | event: cron.daily
step: Extract user data | tool: db.query | input: usersTable | timeout: 60000
step: Extract orders | tool: db.query | input: ordersTable | timeout: 60000
step: Extract events | tool: db.query | input: eventsTable | timeout: 60000
retry: Extract failed records | max: 3 | delay: 5000 | backoff: exponential

section: Transform
parallel: Transform datasets | steps: transform-users,transform-orders,transform-events
step: Clean user records | id: transform-users | tool: transform.clean | depends: step-1
step: Aggregate orders | id: transform-orders | tool: transform.aggregate | depends: step-2
step: Dedupe events | id: transform-events | tool: transform.dedupe | depends: step-3
progress: 3/3 transforms complete

section: Load
step: Load to warehouse | tool: warehouse.load | priority: 1
wait: Validation query | timeout: 30s | fallback: step-retry
result: 1.2M rows synced | code: 200 | data: {"users":450000,"orders":680000,"events":70000}

checkpoint: sync-complete
audit: Daily sync finished | by: etl-agent | at: {{timestamp}}`,
  },

  // ── Human-to-Agent ────────────────────────────────────────
  {
    id: "onboarding",
    name: "User Onboarding",
    icon: "👤",
    category: "human",
    description: "Agent-executed onboarding flow",
    content: `title: User Onboarding Flow
agent: onboard-agent | model: claude-sonnet-4
context: | userId: u_123 | plan: pro

section: Verification
step: Verify email address | tool: email.verify | input: userId | output: emailStatus
step: Create user workspace | tool: ws.create | depends: step-1 | input: userId
decision: Check plan | if: plan == "pro" | then: step-3 | else: step-4
step: Enable pro features | id: step-3 | tool: features.enable | status: pending
step: Send welcome email | id: step-4 | tool: email.send

section: Setup
step: Initialize preferences | tool: prefs.init | input: userId
step: Import existing data | tool: import.run | timeout: 60000
wait: User confirms profile | timeout: 300s | fallback: step-reminder

section: Completion
result: Onboarding complete | code: 200 | data: {"workspaceId":"ws_456"}
checkpoint: onboarding-complete
handoff: Transfer to support | from: onboard-agent | to: success-agent
audit: Onboarding finished | by: onboard-agent | at: {{timestamp}}`,
  },
  {
    id: "content-campaign",
    name: "Content Campaign",
    icon: "📣",
    category: "human",
    description: "Marketing campaign with AI generation",
    content: `title: Q2 Product Launch Campaign
agent: marketing-agent | model: claude-sonnet-4
context: | product: IntentText v2.3 | audience: developers

section: Research
step: Analyze competitor campaigns | tool: research.competitors | timeout: 120000
step: Survey target audience | tool: survey.send | input: audience
wait: Survey responses | timeout: 86400s | fallback: step-3
result: Research complete | data: {"responses":342,"sentiment":"positive"}

section: Content Creation
parallel: Generate content | steps: blog,social,email
step: Write blog post | id: blog | tool: copywriter.blog | priority: 1
step: Create social posts | id: social | tool: copywriter.social | depends: blog
step: Draft email sequence | id: email | tool: copywriter.email | depends: blog
decision: Quality check | if: confidence > 0.85 | then: step-publish | else: step-review

section: Review & Publish
step: Human review | id: step-review | status: blocked | source: human
step: Schedule publishing | id: step-publish | tool: cms.schedule
retry: Publish to all channels | max: 2 | delay: 3000

section: Tracking
emit: Campaign live | phase: monitoring | level: info
loop: Track daily metrics | over: campaignDays | do: step-metrics
step: Pull analytics | id: step-metrics | tool: analytics.pull

audit: Campaign launched | by: marketing-agent | at: {{timestamp}}`,
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    icon: "🗓️",
    category: "human",
    description: "Agenda, decisions, and action items",
    content: `title: Sprint Planning — Week 12
summary: Reviewed Q2 priorities and assigned tasks for the week.

section: Attendees
note: @ahmed, @sarah, @mike, @lisa

section: Agenda
- Review last sprint results
- Discuss IntentText v2.1 launch
- Assign tasks for the week

section: Discussion
ask: Should we delay the launch for more testing?
quote: The test suite is solid — 255 tests all passing. Let's ship it. | by: Ahmed

info: Team agreed to proceed with launch on Wednesday.
warning: Need to coordinate with marketing on the announcement.

section: Action Items
task: Finalize deployment script | owner: Ahmed | due: Monday | priority: high
task: Write changelog blog post | owner: Sarah | due: Tuesday
task: Update documentation site | owner: Mike | due: Wednesday
task: Coordinate launch announcement | owner: Lisa | due: Wednesday
done: Merge v2.1 branch to main | owner: Ahmed

section: Next Steps
note: Launch Wednesday at 10am UTC. Standup moved to Thursday.
tip: Share launch notes with community on Discord.

summary: v2.1 launches Wednesday. All tasks assigned and tracked above.`,
  },

  // ── Documentation ─────────────────────────────────────────
  {
    id: "api-docs",
    name: "API Documentation",
    icon: "🔌",
    category: "docs",
    description: "REST API endpoints and parameters",
    content: `title: API Documentation — IntentText Service
summary: REST API for parsing and rendering IntentText documents.

section: Overview
note: Base URL: *https://api.intenttext.dev/v2*
note: All requests require an *Authorization* header with a Bearer token.
info: Rate limit: 1000 requests per minute per API key.

section: Parse Document
sub: POST /parse
note: Parse an IntentText string into structured JSON.

| Parameter | Type | Required | Description |
| content | string | Yes | Raw .it content |
| options | object | No | Parser options |

section: Render HTML
sub: POST /render
note: Render a parsed document to styled HTML.

| Parameter | Type | Required | Description |
| document | object | Yes | Parsed IntentDocument |
| theme | string | No | "light" or "dark" (default: "light") |

success: Returns 200 with the rendered HTML string.

section: Error Codes
| Code | Meaning | Description |
| 400 | Bad Request | Invalid .it syntax |
| 401 | Unauthorized | Missing or invalid token |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Internal error |

summary: Full API reference. See GitHub for SDK examples.`,
  },
  {
    id: "project-plan",
    name: "Project Plan",
    icon: "📋",
    category: "docs",
    description: "Goals, milestones, and team tasks",
    content: `title: *IntentText* v2.3 Release Plan
summary: Ship gate, call, emit — agentic workflow v2.3 update.

section: Goals
- Add gate, call, emit keywords
- Add {{variable}} interpolation support
- Add join: on parallel, on: on wait
- Remove schema: standalone block, alias status: → emit:
- Pass 255+ tests with full backward compatibility
- Publish to npm as @intenttext/core v2.3.0

section: Team
| Role | Name | Focus |
| Lead | Ahmed | Architecture & parser |
| Frontend | Sarah | Renderer & demo app |
| Testing | Mike | Test suite & CI |

section: Milestones

sub: Phase 1 — New Keywords
done: Add gate, call, emit blocks | owner: Ahmed
done: {{variable}} interpolation | owner: Ahmed
done: join: on parallel, on: on wait | owner: Ahmed

sub: Phase 2 — Rendering
done: HTML renderers for gate, call, emit | owner: Sarah
done: CSS styling with icons and badges | owner: Sarah

sub: Phase 3 — Testing & Docs
done: 35 new tests (255 total passing) | owner: Mike
done: Update SPEC.md with v2.3 blocks | owner: Ahmed
done: Update demo app with v2.3 templates | owner: Sarah

section: Risks
warning: Browser bundle size may increase — monitor.
tip: Keep new blocks consistent with v2.0 design patterns.

progress: 10/10 milestones complete
summary: v2.3 shipped and published to npm.`,
  },
  {
    id: "blank",
    name: "Blank Document",
    icon: "📄",
    category: "docs",
    description: "Start from scratch",
    content: `title: Untitled Document

note: Start writing here…
`,
  },
  {
    id: "book-chapter",
    name: "Book Chapter",
    icon: "📖",
    category: "docs",
    description: "Book-style chapter with typography",
    content: `font: | family: Palatino Linotype | size: 12pt | leading: 1.8
page: | size: A5 | margins: 25mm

title: *The Architecture of Intent*

dedication: To the builders who write before they code.

byline: Ahmed Al-Rashid | role: Author | date: 2026

toc: | depth: 2 | title: Contents

section: The Problem with Markup
epigraph: The tools we build shape the thoughts we can think. | source: Kenneth Iverson

Every document format forces a choice between human readability and machine parseability. Markdown optimized for the first. XML optimized for the second. Neither achieved both.

IntentText proposes a third path: keywords that read like natural language but parse like structured data.

sub: Why Keywords Matter
A keyword like \`task:\` is simultaneously a heading, a data type, and an instruction. The writer sees a to-do item. The parser sees a typed block with properties. The AI agent sees an executable action.

section: Design Principles
note: Every line reads naturally in plain text.
note: Keywords declare _intent_, not just appearance.
note: Pipe metadata stays on the same line — no extra files.

section: Looking Ahead
The next chapter explores how IntentText enables multi-agent workflows — where documents become executable specifications.

footnote: 1 | See Chapter 3 for the full agentic workflow specification.

break:

section: Notes
caption: Figure 1 — The IntentText parsing pipeline`,
  },
  {
    id: "invoice-template",
    name: "Invoice Template",
    icon: "🧾",
    category: "docs",
    description: "Professional invoice with {{variables}}",
    content: `font: | family: Helvetica | size: 11pt | leading: 1.5
page: | size: A4 | margins: 20mm | footer: Page {{page}} of {{pages}}

title: *Invoice*

section: From
note: {{company.name}}
note: {{company.address}}
note: {{company.email}}

section: Bill To
note: {{client.name}}
note: {{client.address}}

divider:

section: Invoice Details
| Item | Description | Amount |
| 1 | {{items.0.description}} | {{items.0.amount}} |
| 2 | {{items.1.description}} | {{items.1.amount}} |

divider:

note: *Total: {{total}}*

section: Payment Terms
note: Payment due within 30 days of invoice date.
note: Bank transfer to account details provided separately.

footnote: 1 | All amounts in {{currency}}.`,
  },
  {
    id: "letter-template",
    name: "Formal Letter",
    icon: "✉️",
    category: "docs",
    description: "Business letter with header/footer",
    content: `page: | size: A4 | margins: 25mm | header: {{company.name}} | footer: Page {{page}}

title: {{subject}}

section: Sender
note: {{sender.name}}
note: {{sender.title}}
note: {{sender.address}}
note: {{date}}

section: Recipient
note: {{recipient.name}}
note: {{recipient.title}}
note: {{recipient.company}}
note: {{recipient.address}}

divider:

note: Dear {{recipient.name}},

note: {{body.paragraph1}}

note: {{body.paragraph2}}

note: {{body.paragraph3}}

note: Sincerely,

note: {{sender.name}}
note: {{sender.title}}`,
  },
  {
    id: "report-template",
    name: "Report",
    icon: "📊",
    category: "docs",
    description: "Professional report with sections",
    content: `font: | family: Inter | size: 11pt | leading: 1.6
page: | size: A4 | margins: 25mm | header: {{report.title}} — Confidential | footer: Page {{page}} of {{pages}}

title: {{report.title}}
byline: {{author}} | role: {{author.role}} | date: {{date}}
summary: {{executive.summary}}

toc: | depth: 2

section: Introduction
note: {{introduction}}

section: Methodology
note: {{methodology}}

section: Findings

sub: Key Metrics
| Metric | Value | Change |
| {{metric.1.name}} | {{metric.1.value}} | {{metric.1.change}} |
| {{metric.2.name}} | {{metric.2.value}} | {{metric.2.change}} |
| {{metric.3.name}} | {{metric.3.value}} | {{metric.3.change}} |

sub: Analysis
note: {{analysis}}

section: Recommendations
task: {{recommendation.1}} | priority: high
task: {{recommendation.2}} | priority: medium
task: {{recommendation.3}} | priority: low

section: Conclusion
note: {{conclusion}}

footnote: 1 | All data as of {{date}}.`,
  },
  {
    id: "readme-template",
    name: "README",
    icon: "📖",
    category: "docs",
    description: "Software project README",
    content: `title: {{project.name}}
summary: {{project.description}}

section: Installation
code:
{{install.command}}
end:

section: Quick Start
code:
{{quickstart.code}}
end:

section: Features
- {{feature.1}}
- {{feature.2}}
- {{feature.3}}

section: API Reference
sub: {{api.method1.name}}
note: {{api.method1.description}}
code:
{{api.method1.example}}
end:

section: Contributing
note: Contributions are welcome! Please read our contributing guidelines first.

section: License
note: {{license}}`,
  },
  {
    id: "changelog-template",
    name: "Changelog",
    icon: "🔄",
    category: "docs",
    description: "Version changelog with categories",
    content: `title: Changelog

section: [{{version}}] — {{date}}

sub: Added
- {{added.1}}
- {{added.2}}

sub: Changed
- {{changed.1}}
- {{changed.2}}

sub: Fixed
- {{fixed.1}}
- {{fixed.2}}

sub: Removed
- {{removed.1}}

section: [{{prev.version}}] — {{prev.date}}
note: Previous release notes…`,
  },
];
