# Contributing Guide

Thank you for taking the time to contribute!  
To keep this project stable, consistent, and easy to maintain across all languages and packages, please follow the guidelines below.

---

## 🧱 Development Workflow

1. **Create a branch** from `main`:

   - `feat/<short-description>`
   - `fix/<short-description>`
   - `chore/<short-description>`
   - `docs/<short-description>`
   - `refactor/<short-description>`

2. **Implement your changes**

   - Follow the coding standards of the repository.
   - Add or update tests as needed.
   - Update related documentation.

3. **Commit your work** using **Conventional Commits** (see below).

4. **Open a Pull Request** against `main`.

   - Fill out the PR template fully.
   - Link an issue if applicable.

5. **Address review feedback**.

   - Keep PRs small and focused.
   - Split large PRs into smaller ones if requested.

6. **Wait for maintainer approval**.
   - At least one maintainer review is required.
   - No self-merging unless explicitly allowed by maintainers.

---

## 🏷️ Commit Style — Conventional Commits

This project uses **Conventional Commits**:

- `feat: <message>` — new feature
- `fix: <message>` — bug fix
- `docs: <message>` — documentation only
- `chore: <message>` — maintenance, CI, tooling
- `refactor: <message>` — code change without feature/fix
- `test: <message>` — adding or updating tests

**Why?**

- Automatically generates changelogs
- Enables semantic versioning
- Makes history clean and understandable

---

## 🔍 Pull Request Requirements

Before creating a PR, ensure:

- [ ] Code compiles/builds successfully
- [ ] Tests pass
- [ ] Linting passes (if applicable)
- [ ] Documentation is updated
- [ ] PR template is completed
- [ ] Branch is up to date with `main`

PRs that do not meet these requirements may be declined or asked to rework.

---

## 🧪 Testing

Every contribution must include tests where applicable.  
How to run tests depends on the project’s tech stack, for example:

```bash
npm test
# or
./gradlew test
# or
swift test
```

If tests are missing or incomplete, maintainers will request them before merging.

---

## 📚 Documentation

If your change affects how the package behaves, update:
• README sections
• Code comments
• Example snippets
• Any related docs in the repo

Documentation quality is a mandatory requirement.

---

## 🚀 Releases & Versioning

Each project in this organization follows a unified release philosophy:

- **Semantic Versioning (SemVer)**
  - **MAJOR** — breaking changes
  - **MINOR** — new backwards-compatible features
  - **PATCH** — bug fixes and small improvements
- **Releases are created through the project's dedicated release pipeline.**
- **All published releases must:**
  - Be tied to a tagged commit
  - Include a changelog entry
  - Follow SemVer correctly
  - Pass all CI checks before being cut
- **Release automation and package publishing** (npm, Maven Central, SwiftPM, etc.)  
  are defined **per project**, depending on the language and package registry.

---

## ☑️ Code of Conduct

By participating, you agree to follow our
[Code of Conduct](CODE_OF_CONDUCT)￼.

---

## 💬 Questions?

If you have questions about contributing, open an issue labeled question, or start a discussion (if enabled).

Thank you for helping improve this project!
