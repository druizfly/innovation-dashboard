---
description: Check Latest changes using exploratory testing
argument-hint: [path/to/task-file.md or docs/tasks/{feature-name}.md]
allowed-tools: TaskCreate, TaskUpdate, TaskList, Read, Write, Edit, Glob, Grep, Bash, Task, playwright
---

# Execute Testing Task

Perform exploratory testing on recent changes using the detailed task specification. Use Playwright MCP to navigate the browser and check main functionalities. If errors are reported, fix them before proceeding to the next task.

## Task File: $ARGUMENTS

## Execution Process

1. **Load Task Document**
    - Use TaskCreate to create task: "Load testing specification"
    - Mark task as in_progress with TaskUpdate
    - Read the specified task breakdown file from `docs/tasks/`
    - Understand task context, requirements, and acceptance criteria
    - Review all referenced files and code patterns
    - Load the comprehensive task template structure
    - Identify specific task within document if multiple tasks present
    - Mark loading task as completed with TaskUpdate

2. **Task Analysis**
    - Use TaskCreate to create task: "Analyze testing requirements"
    - Mark task as in_progress with TaskUpdate
    - Extract the specific task requirements and constraints
    - Review Given-When-Then acceptance criteria scenarios
    - Study referenced code patterns and file locations
    - Understand integration points and dependencies
    - Mark analysis task as completed with TaskUpdate

3. **Testing Planning**
    - Use TaskCreate to create task: "Plan testing approach"
    - Mark task as in_progress with TaskUpdate
    - Break down the testing into specific test scenarios using TaskCreate
    - Plan testing approach following established conventions
    - Identify key user flows to validate
    - Mark planning task as completed with TaskUpdate

4. **Focused Testing**
    - Consider using Task tool to delegate to exploratory-agent for comprehensive testing
    - Use TaskCreate for each major test scenario
    - Mark each scenario as in_progress with TaskUpdate when starting
    - Use Playwright MCP to navigate and interact with the application
    - Test only the specific task requirements (no scope creep)
    - Verify functionality matches acceptance criteria
    - Document any issues or bugs found
    - If errors are found, fix them before proceeding
    - Mark each test scenario as completed with TaskUpdate

5. **Acceptance Criteria Validation**
    - Use TaskCreate to create task: "Validate acceptance criteria"
    - Mark task as in_progress with TaskUpdate
    - Execute each Given-When-Then scenario manually using Playwright
    - Verify rule-based criteria checklist completion
    - Execute validation commands specified in task
    - Mark validation task as completed with TaskUpdate

6. **Quality Gates**
    - Use TaskCreate to create task: "Run quality checks"
    - Mark task as in_progress with TaskUpdate
    - Run project-specific validation commands using Bash
    - Fix any linting, type-checking, or build errors
    - Ensure task-specific Definition of Done criteria met
    - Verify integration with existing systems
    - Mark quality checks task as completed with TaskUpdate

7. **Task Completion**
    - Use TaskCreate to create task: "Generate test report"
    - Document all test results and findings
    - Verify all acceptance criteria satisfied
    - Document any implementation notes or gotchas discovered
    - Use TaskList to verify all test scenarios completed
    - Mark test report task as completed with TaskUpdate
    - Report completion status with validation results

## Task Execution Best Practices

- Stay strictly within task boundaries - no additional features
- Reference existing patterns extensively before writing new code
- Test incrementally as you build each component
- Follow the exact file structure specified in task document
- Verify dependencies are satisfied before starting

Note: For complex tasks with multiple dependencies, ensure prerequisite tasks are completed first or coordinate with team members.