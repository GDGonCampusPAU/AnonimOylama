---
trigger: always_on
---

## AI Agent Coding and Architectural Guidelines

When requested to develop a new feature (e.g., "Write the create room API"), you MUST break down and structure your code strictly according to the following architectural flow:

1. **`internal/models`**: If a new data structure is required, define and add the structs here.
2. **`internal/repository`**: Write the SQL/Go code responsible for database interactions (inserting/fetching data) here. (DO NOT mix business logic into this layer).
3. **`internal/service`**: Write the core business logic here. This layer should fetch data from the repository, process it (e.g., generate an invite code), and apply business rules.
4. **`internal/handlers`**: Write the HTTP controller logic here. This layer must ONLY receive the HTTP Request (parse JSON), invoke the Service layer, and return a JSON response that complies with the API Specifications.
5. **`cmd/api/main.go`**: Modify this file ONLY to register your newly created handler to the Router (e.g., adding `mux.HandleFunc` or the relevant framework's route definition).
6. **` for more pay attention to backend\docs\project-structure.md file.
**CRITICAL WARNING:** It is STRICTLY FORBIDDEN to pollute the `main.go` file with database queries, business logic, or any complex processing.