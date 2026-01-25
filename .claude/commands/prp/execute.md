---
description: Implement features from PRP specifications with comprehensive validation and testing
argument-hint: [path/to/prp-file.md]
allowed-tools: TaskCreate, TaskUpdate, TaskList, TaskGet, Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
---

# Execute BASE PRP

Implement a feature using the PRP file.

## PRP File: $ARGUMENTS

## Execution Process

1. **Load PRP**
    - Use TaskCreate to create task: "Load and analyze PRP"
    - Mark task as in_progress with TaskUpdate
    - Read the specified PRP file
    - Understand all context and requirements
    - Follow all instructions in the PRP and extend the research if needed
    - Ensure you have all needed context to implement the PRP fully
    - Consider using Task tool to delegate research if gaps exist
    - Use AskUserQuestion for clarifications on ambiguous requirements
    - Mark PRP loading task as completed with TaskUpdate

2. **Plan Implementation**
    - Use TaskCreate to create task: "Plan implementation approach"
    - Mark task as in_progress with TaskUpdate
    - Think hard before you execute the plan. Create a comprehensive plan
      addressing all requirements
    - Break down complex tasks using TaskCreate for each major component
    - **CRITICAL**: Study reference files specified in PRP - understand their
      exact structure, patterns, and organization
    - **ALWAYS**: Mirror the reference implementation patterns exactly - same
      file organization, naming conventions, component structure, and code
      patterns
    - Mark planning task as completed with TaskUpdate

3. **Execute the plan**
    - Use TaskUpdate to mark each component task as in_progress when starting
    - **BEFORE coding each component**: Read the corresponding reference file to
      understand its exact structure
    - **FOR each task**: Look at reference implementation first, then adapt the
      pattern for your feature
    - Execute the PRP following reference patterns exactly
    - Implement all the code using established patterns
    - Consider using Task tool to delegate complex implementations to specialized agents
    - Mark each component task as completed with TaskUpdate when done

4. **Validate**
    - Use TaskCreate to create task: "Run validation suite"
    - Mark task as in_progress with TaskUpdate
    - Run each validation command specified in PRP
    - Fix any failures
    - Re-run until all pass
    - Mark validation task as completed with TaskUpdate

5. **Complete**
    - Use TaskCreate to create task: "Final verification"
    - Ensure all checklist items done
    - Run final validation suite
    - Report completion status
    - Read the PRP again to ensure you have implemented everything
    - Mark final verification as completed with TaskUpdate
    - Use TaskList to verify all tasks are completed

6. **Reference the PRP**
    - You can always reference the PRP again if needed
    - Use TaskGet to check status of specific tasks

Note: If validation fails, use error patterns in PRP to fix and retry. Track all work with task tools to provide visibility to the user.
