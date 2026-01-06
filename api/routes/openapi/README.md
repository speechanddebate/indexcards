# Documenting API Endpoints

This directory contains documentation for our API endpoints using the OpenAPI specification.

## How We Document Endpoints

- **Specification Format:**  
    All endpoints are documented in JSON format following the [OpenAPI 3.1](https://swagger.io/specification/) standard.

- **Location:**  
    Each endpoint is defined in the corresponding controller for the endpoint. Then some helper code generates a big document
    from those definitions

- **Structure:**  
    Each OpenAPI definition <b>MUST</b> include:
    - A summary field describing the operation. ex: Get all ads, Create pairing
    - A description of the operation. Ex: returns all the current ads in the DB
    - all relevant tags. Please check/modify tags.js to avoid duplicates.
    - all possible responses with a complete schema attached, preferably with example values. schemas and responses should be
    stored in their corresponding directories.

- **Updating Documentation:**  
    When you add or modify an endpoint, update the corresponding OpenAPI json snippet.
    Ensure all fields are accurate and examples are up to date.
