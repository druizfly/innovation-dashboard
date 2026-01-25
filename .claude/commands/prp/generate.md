---
description: Generate comprehensive PRP (Product Requirements & Plans) with thorough research and validation
argument-hint: [feature description or user story]
allowed-tools: TaskCreate, TaskUpdate, TaskList, Read, Write, Glob, Grep, Bash, Task, WebSearch, WebFetch, AskUserQuestion
---

# Create PRP

## Feature file: $ARGUMENTS

Generate PRP (Product Requirements & Plans) through validated research and codebase analysis.

## Workflow Summary

Two-phase approach: validate completeness (Phase 1), then research (Phase 2).

**CRITICAL**: PRP must contain ALL context - research findings, documentation URLs, code examples. The executor agent sees only the final PRP document, not your research process.

**Progress Tracking**: Use TaskCreate at the start to create workflow tasks, and TaskUpdate to mark progress through each phase. This provides visibility to the user throughout the PRP generation process.

## Research Process

**Phase 1: Initial Discovery & Task Validation** (Validate task completeness
before deep research)

1. **Setup and Planning**
   - Use TaskCreate to create task: "Phase 1: Preflight analysis and validation"
   - Mark task as in_progress with TaskUpdate when starting

2. **Preflight Analysis**  (Use subagent: `preflight-prp`)
   - Quick scan of project structure for similar features/patterns
   - Analyze user's task description for business logic completeness
   - Identify gaps in user requirements and missing business logic details:
     - User flows and interaction patterns
     - Data requirements and relationships
     - Integration points with existing features
     - Edge cases and error scenarios
     - UI/UX expectations and constraints
   - **Language Guidelines for Questions**:
     - Ask clarification questions in the same language the user wrote the initial task
     - Wait for user responses and analyze thoroughly
   - preflight-prp agent will use AskUserQuestion for clarifications if needed
   - Make proceed/clarify recommendation with clear reasoning

3. **Decision Gate**:
   - **IF** preflight-prp recommends PROCEED → Mark Phase 1 task as completed, continue to Phase 2
   - **IF** preflight-prp identifies gaps → Agent will ask clarifying questions using AskUserQuestion
   - **ONLY** continue to comprehensive research after user provides missing details
   - Use surface discovery findings to inform Phase 2 research focus
   - Mark Phase 1 task as completed with TaskUpdate before proceeding

**Phase 2: Comprehensive Research Phase** (After task validation - Codebase
first, then smart external research)

1. **Codebase Analysis**
   - Use TaskCreate to create task: "Phase 2: Codebase analysis"
   - Mark task as in_progress with TaskUpdate
   - Use Task tool with subagent: `codebase-research`
   - Search for similar features/patterns in the codebase
   - Identify files to reference in PRP
   - Note existing conventions to follow
   - Check test patterns for validation approach
   - **CRITICAL**: Document what components/libraries/patterns already exist
   - **ASSESS**: Determine knowledge gaps that truly need external research
   - Mark codebase analysis task as completed with TaskUpdate

2. **Smart External Research Decision** (Evaluate AFTER codebase analysis)

   **FIRST: Analyze codebase findings to determine if external research is
   needed:**

   **SKIP External Research if:**
   - ✅ Similar components/patterns found in codebase (internal project
     components)
   - ✅ Clear implementation path from existing code
   - ✅ Standard CRUD/UI operations using existing patterns
   - ✅ Internal utility functions/services already available

   **PROCEED with External Research ONLY if:**
   - ❌ New external npm/library integration needed (get current docs)
   - ❌ Existing external library usage but complex/undocumented features
     needed
   - ❌ Complex algorithm or pattern not in codebase
   - ❌ Security/performance considerations beyond current code
   - ❌ External API integration without existing examples
   - ❌ **No similar patterns/components found in codebase** (need external
     examples)

   **If External Research is needed**:
   - Use TaskCreate to create task: "External research for [specific topic]"
   - Mark task as in_progress with TaskUpdate
   - Use Task tool with subagent: `research-agent`
   - Focus ONLY on missing knowledge gaps identified above
   - External npm/library documentation for NEW packages or complex features
   - Best practices for COMPLEX patterns not in codebase
   - Security considerations for NEW external integrations
   - **PARALLEL**: If more than one research is needed, run them in parallel using multiple Task tool calls in a single message
   - **AVOID**: Researching internal project components (use codebase instead)
   - **Agent returns all findings directly in response context**
   - Mark external research task as completed with TaskUpdate

3. **Technical Clarification** (Use if needed after research completion)
   - Use AskUserQuestion for technical implementation clarifications
   - **ONLY** for technical implementation details, not business logic
   - Specific patterns to mirror and where to find them?
   - Integration requirements and where to find them?
   - Which existing service to use and its file path?
   - Confirm if external research is truly needed for identified gaps

## Language Guidelines

### User Interaction Language
- **Questions & Communication**: Ask all clarification questions in the same language the user wrote the initial task
- **Analysis & Discussion**: Continue using the user's language throughout the discovery and research phases

### PRP Document Language  
- **Final Document**: Always write the PRP document in English for consistency and international team compatibility
- **User Response Translation**: When incorporating user responses into the PRP, translate them to English while preserving the original meaning
- **Code Examples**: Always use English comments and variable names in technical examples
- **Technical Terms**: Use standard English technical terminology in the final document

## PRP Generation

1. **Begin PRP Document Creation**
   - Use TaskCreate to create task: "Generate PRP document"
   - Mark task as in_progress with TaskUpdate
   - Use docs/templates/prp_document_template.md as template

### Critical Context to Include and pass to the AI agent as part of the PRP

- **Discovery Findings**: Document Phase 1 findings and any user clarifications
  received
- **Business Logic**: Complete requirements gathered from user interactions
- **Code Examples**: Real snippets from codebase (PRIMARY FOCUS)
- **Patterns**: Existing approaches to follow (MIRROR THESE)
- **Documentation**: URLs ONLY for new/missing knowledge gaps
- **Research Integration**: All external research findings are provided directly in agent response context for immediate integration into PRP
- **Gotchas**: Library quirks, version issues from codebase analysis
- **Research Justification**: Explain why external research was/wasn't needed

### Implementation Blueprint

- Start with pseudocode showing approach
- Reference real files for patterns
- Include error handling strategy
- list tasks to be completed to fullfill the PRP in the order they should be
  completed

### Validation Gates (Must be Executable)

**During Codebase Research Phase**, identify and document available project
validation tools:

- Analyze project configuration files for validation commands (package.json,
  Makefile, pyproject.toml, setup.py, Cargo.toml, go.mod, etc.)
- Identify linting, testing, and formatting tools specific to the project's tech
  stack
- Document exact validation commands found in the project
- Include these validation commands directly in the PRP document
- Ensure all code changes will pass project validation standards
- Add specific validation steps to PRP task list with exact commands to run

**CRITICAL AFTER YOU ARE DONE RESEARCHING AND EXPLORING THE CODEBASE BEFORE YOU
START WRITING THE PRP**

**ULTRATHINK ABOUT THE PRP AND PLAN YOUR APPROACH THEN START WRITING THE PRP**

2. **Complete PRP Document**
   - Save PRP document using Write tool
   - Mark PRP generation task as completed with TaskUpdate

## Output
{incremental-id} is a numeric ID to be able to order the prps in order of execution
Save as: `docs/prps/{incremental-id}{feature-name}.md`

## Quality Checklist

- [ ] All necessary context included
- [ ] Validation gates are executable by AI
- [ ] References existing patterns
- [ ] Clear implementation path
- [ ] Error handling documented

Score the PRP on a scale of 1-10 (confidence level to succeed in one-pass
implementation using claude codes)

## Task Breakdown Generation

**Final Step: Generate Implementation Tasks**

After completing the PRP document, automatically generate a detailed task breakdown:

1. **Task Decomposition**
   - Use TaskCreate to create task: "Generate implementation task breakdown"
   - Mark task as in_progress with TaskUpdate
   - Use Task tool with subagent: `team-lead-task-breakdown`
   - Analyze the completed PRP document
   - Break down the implementation into manageable development tasks
   - Apply work breakdown structure (WBS) principles
   - Create appropriately-sized tasks for team capacity
   - Define clear dependencies and critical path
   - Generate acceptance criteria using Given-When-Then format
   - Save task breakdown to `docs/tasks/{feature-name}.md`
   - Mark task breakdown task as completed with TaskUpdate

2. **Integration with PRP**
   - Reference the task breakdown document in the PRP
   - Update PRP document to include link to `docs/tasks/{feature-name}.md`
   - Ensure alignment between PRP requirements and task definitions
   - Provide clear handoff to development team

3. **Keep track of decisions being made**
   - Annotate decisions/clarifications being made during the PRP creation
   - Update `docs/prp-decisions.md` to keep track of the decisions

This ensures the PRP includes both comprehensive requirements AND actionable implementation tasks ready for development sprints.

Remember: The goal is one-pass implementation success through comprehensive
context AND clear task decomposition.
