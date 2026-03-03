export interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  content: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    name: "Blank Document",
    icon: "📄",
    description: "Start from scratch",
    content: "title: Untitled Document\n\nnote: Start writing here…\n",
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    icon: "🗓️",
    description: "Agenda, decisions, and action items",
    content: `title: Meeting Notes — [Topic]

section: Attendees
note: @alice, @bob, @charlie

section: Agenda
note: Review progress on Q2 goals
note: Discuss new feature requirements
note: Plan next sprint

section: Discussion
question: What's the timeline for the API redesign?
quote: We should target end of month — two-week sprints.

info: Everyone agreed to the proposed timeline.
warning: Budget approval still pending from finance.

section: Action Items
task: Draft API specification | owner: Alice | due: 2026-03-15 | priority: high
task: Set up staging environment | owner: Bob | due: 2026-03-12
task: Schedule follow-up with design team | owner: Charlie | due: 2026-03-10
done: Repository access granted to new team members | owner: Alice

section: Next Steps
note: Next meeting scheduled for Monday at 10:00 AM.
tip: Share these notes with the team on Slack.

summary: Discussed API redesign timeline, assigned action items, budget pending.`,
  },
  {
    id: "project",
    name: "Project Plan",
    icon: "🚀",
    description: "Goals, milestones, and tasks",
    content: `title: Project Plan — [Project Name]

section: Overview
note: Brief description of the project and its objectives.
note: This project aims to deliver a working MVP by end of Q2.

section: Goals
note: 1. Launch beta version to internal users
note: 2. Gather feedback and iterate
note: 3. Public release with documentation

section: Team
| Role | Name | Focus |
| Lead | Ahmed | Architecture & planning |
| Frontend | Sarah | UI & user experience |
| Backend | Mike | API & data layer |

section: Milestones

sub: Phase 1 — Foundation
task: Set up project repository | owner: Ahmed | due: 2026-03-10 | priority: high
task: Define data models | owner: Mike | due: 2026-03-12
task: Create wireframes | owner: Sarah | due: 2026-03-14
done: Project kickoff meeting | owner: Ahmed

sub: Phase 2 — Core Features
task: Build authentication flow | owner: Mike | due: 2026-03-20 | priority: high
task: Implement main dashboard | owner: Sarah | due: 2026-03-25
task: Write API endpoints | owner: Mike | due: 2026-03-28

sub: Phase 3 — Polish & Launch
task: User testing sessions | owner: Sarah | due: 2026-04-05
task: Performance optimization | owner: Mike | due: 2026-04-10
task: Write documentation | owner: Ahmed | due: 2026-04-12

section: Risks
warning: Dependency on third-party API — may cause delays.
warning: Team availability during Ramadan.
tip: Keep scope tight for MVP. Features can be added post-launch.

summary: MVP targeted for April 15. Weekly syncs every Monday.`,
  },
  {
    id: "report",
    name: "Weekly Report",
    icon: "📊",
    description: "Accomplishments, blockers, and plans",
    content: `title: Weekly Report — Week of [Date]

section: Accomplishments
done: Completed user authentication module | owner: Sarah | time: 3d
done: Fixed 12 bugs from QA backlog | owner: Mike | time: 2d
done: Published API documentation v2 | owner: Ahmed | time: 1d

section: In Progress
task: Dashboard redesign — 60% complete | owner: Sarah | priority: high
task: Database migration script | owner: Mike | priority: medium
task: Onboarding email sequence | owner: Ahmed | priority: low

section: Blockers
warning: Waiting on design approval for new logo.
warning: Staging server disk space running low.

section: Key Metrics
| Metric | Last Week | This Week | Change |
| Active Users | 1,240 | 1,385 | +11.7% |
| API Response Time | 320ms | 285ms | -10.9% |
| Open Bugs | 24 | 12 | -50% |
| Test Coverage | 78% | 82% | +4% |

section: Plan for Next Week
task: Launch dashboard redesign to beta | owner: Sarah | due: 2026-03-14
task: Complete database migration | owner: Mike | due: 2026-03-13
task: User feedback interviews (5 sessions) | owner: Ahmed | due: 2026-03-15

info: Sprint review on Friday at 2:00 PM.

summary: Good progress this week. Dashboard and migration are the top priorities.`,
  },
  {
    id: "personal",
    name: "Personal Notes",
    icon: "📝",
    description: "Quick notes, ideas, and to-dos",
    content: `title: My Notes

section: Ideas
note: Build a habit tracker that uses .it files as the data format.
note: Write a blog post about structured writing vs. free-form notes.
question: Would a mobile app for IntentText make sense?

section: To-Do
task: Grocery shopping | priority: high
task: Call dentist to reschedule | due: 2026-03-10
task: Read chapters 5-7 of design book
done: Renew gym membership
[ ] Reply to Sarah's email @sarah !high

section: Bookmarks
link: IntentText Documentation | to: https://github.com/emadjumaah/IntentText
link: Design Inspiration | to: https://dribbble.com

section: Random Thoughts
quote: The best tool is the one you actually use.
tip: Keep notes short. One idea per line.

---

info: Last updated on March 3, 2026.`,
  },
  {
    id: "api",
    name: "API Documentation",
    icon: "🔌",
    description: "Endpoints, parameters, and examples",
    content: `title: API Documentation — [Service Name]

section: Overview
note: Base URL: *https://api.example.com/v1*
note: All requests require an *Authorization* header with a Bearer token.
info: Rate limit: 1000 requests per minute per API key.

section: Authentication
sub: POST /auth/login
note: Authenticate a user and receive a JWT token.

| Parameter | Type | Required | Description |
| email | string | Yes | User email address |
| password | string | Yes | User password |

note: Response: \`{ "token": "eyJ...", "expires_in": 3600 }\`

section: Users
sub: GET /users
note: List all users. Supports pagination.

| Parameter | Type | Required | Description |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |

sub: GET /users/:id
note: Get a single user by ID.
warning: Returns 404 if user not found.

sub: POST /users
note: Create a new user.

| Parameter | Type | Required | Description |
| name | string | Yes | Full name |
| email | string | Yes | Email address |
| role | string | No | User role (default: "member") |

success: Returns 201 with the created user object.

section: Error Codes
| Code | Meaning | Description |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Internal server error |

summary: Full API reference. See GitHub for code examples.`,
  },
];
