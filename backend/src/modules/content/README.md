# Content Module

## Purpose and responsibilities
The Content module owns educational content for patients, including advice and blog-like articles that support medication adherence and wellness guidance.

## Features in scope
- Recommended advice retrieval
- Recommended blog feed retrieval
- Single blog content retrieval

## Public interfaces
- Public content read endpoints exposed through the API layer
- Content payloads for frontend display

## Dependencies
- Depends on shared infrastructure for content retrieval and presentation
- May be linked to Conditions and Medications when targeting disease-specific content

## Inputs and outputs
- Inputs: disease or content selection context
- Outputs: advice collections, blog summaries, full article content

## Implementation notes and future considerations
- Keep content retrieval separate from user-specific workflows
- Future work may include editorial workflows, localization, and personalization
