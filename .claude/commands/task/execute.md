---
description: Execute individual development tasks from task breakdown documents
argument-hint: [path/to/task-file.md or docs/tasks/{feature-name}.md]
allowed-tools: TaskCreate, TaskUpdate, TaskList, TaskGet, Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
---

# Execute Development Task

Implement a specific development task using the detailed task specification.

## Task File: $ARGUMENTS

## Execution Process

1. **Load Task Document**
    - Use TaskCreate to create task: "Load and analyze task specification"
    - Mark task as in_progress with TaskUpdate
    - Read the specified task breakdown file from `docs/tasks/`
    - Understand task context, requirements, and acceptance criteria
    - Review all referenced files and code patterns
    - Load the comprehensive task template structure
    - Identify specific task within document if multiple tasks present
    - Use AskUserQuestion if task requirements are ambiguous
    - Mark loading task as completed with TaskUpdate

2. **Task Analysis**
    - Use TaskCreate to create task: "Analyze task requirements"
    - Mark task as in_progress with TaskUpdate
    - Extract the specific task requirements and constraints
    - Review Given-When-Then acceptance criteria scenarios
    - Study referenced code patterns and file locations
    - Understand integration points and dependencies
    - Consider using Task tool to delegate research if needed
    - Mark analysis task as completed with TaskUpdate

3. **Implementation Planning**
    - Use TaskCreate to create task: "Plan implementation approach"
    - Mark task as in_progress with TaskUpdate
    - Break down the single task into micro-steps using TaskCreate if needed
    - **CRITICAL**: Study all referenced files specified in task description
    - **PATTERN MATCHING**: Identify exact patterns to mirror from existing code
    - Plan implementation approach following established conventions
    - Mark planning task as completed with TaskUpdate

4. **Focused Implementation**
    - Use TaskCreate for each implementation component
    - Mark each component as in_progress with TaskUpdate when starting
    - **BEFORE coding**: Read reference files to understand exact structure
    - **MIRROR PATTERNS**: Follow existing code patterns exactly
    - Implement only the specific task requirements (no scope creep)
    - Apply error handling patterns from reference implementations
    - Follow code organization and naming conventions from examples
    - Consider using Task tool to delegate complex implementations
    - Mark each component as completed with TaskUpdate when done

5. **Acceptance Criteria Validation**
    - Use TaskCreate to create task: "Validate acceptance criteria"
    - Mark task as in_progress with TaskUpdate
    - Execute each Given-When-Then scenario manually
    - Verify rule-based criteria checklist completion
    - Execute validation commands specified in task
    - Mark validation task as completed with TaskUpdate

6. **Quality Gates**
    - Use TaskCreate to create task: "Run quality checks"
    - Mark task as in_progress with TaskUpdate
    - Run project-specific validation commands
    - Fix any linting, type-checking, or build errors
    - Ensure task-specific Definition of Done criteria met
    - Verify integration with existing systems
    - Mark quality checks task as completed with TaskUpdate

7. **Task Completion**
    - Use TaskCreate to create task: "Final verification"
    - Verify all acceptance criteria satisfied
    - Document any implementation notes or gotchas discovered
    - Use TaskList to verify all subtasks completed
    - Mark final verification as completed with TaskUpdate
    - Report completion status with validation results

## Task Execution Best Practices

- Stay strictly within task boundaries - no additional features
- Reference existing patterns extensively before writing new code
- Test incrementally as you build each component
- Follow the exact file structure specified in task document
- Verify dependencies are satisfied before starting

Note: For complex tasks with multiple dependencies, ensure prerequisite tasks are completed first or coordinate with team members.