# Prakarti Report Dashboard

Prakarti Report Dashboard is the administrative dashboard for the Prakarti Report platform. It provides interfaces for viewing and managing environmental reports, organizations, maps, analytics, hotspots, impact information, proposals, and dashboard settings.

---

## Dashboard Access

Administrative access is provided only to verified organizations.

Organizations are verified before access to the administration panel is provided. Therefore, users cannot directly register and obtain unrestricted administrative access.

For project evaluation and demonstration, use the following test credentials:

- **Email:** `Sankalp@gmail.com`
- **Password:** `Sankalp123`

These credentials are provided so that reviewers and evaluators can directly access and test the dashboard.

> **Important:** Please use the credentials above only for testing and project evaluation. Do not change the credentials or modify the associated account unnecessarily.

---

## Dashboard Sections

The repository contains the following main dashboard pages:

| Page | File | Description |
|---|---|---|
| Dashboard | `dashboard.html` | Main dashboard interface |
| Reports | `reports.html` | Environmental reports interface |
| Report Details | `report-details.html` | Detailed report view |
| Map | `map.html` | Map interface |
| Hotspots | `hotspots.html` | Environmental hotspots interface |
| Analytics | `analytics.html` | Analytics interface |
| Impact | `impact.html` | Impact interface |
| Organizations | `organizations.html` | Organization management interface |
| Proposal | `proposal.html` | Proposal interface |
| Settings | `settings.html` | Dashboard settings |
| Index | `index.html` | Main entry page |

---

## Repository Structure

```text
prakarti-report-dashboard/
│
├── .vscode/
│
├── assets/
│   └── images/
│
├── css/
│
├── js/
│
├── migrations/
│
├── scripts/
│
├── supabase/
│   └── migrations/
│
├── .env.example
├── .gitignore
├── analytics.html
├── dashboard.html
├── hotspots.html
├── impact.html
├── index.html
├── map.html
├── organizations.html
├── package.json
├── proposal.html
├── report-details.html
├── reports.html
└── settings.html
```

---

## Main Functionality

The dashboard provides interfaces for managing and viewing environmental reporting data.

### Reports
The reports section provides access to submitted environmental reports. Reports can be opened individually through the report details interface.

### Report Details
The report details page provides a dedicated view for an individual environmental report.

### Map
The map section provides a geographic view associated with the platform's reporting data.

### Hotspots
The hotspots section provides an interface for viewing environmental hotspot information.

### Analytics
The analytics section provides an interface for viewing information and statistics related to the platform's reports.

### Impact
The impact section provides an interface for viewing project impact information.

### Organizations
The organizations section provides functionality related to organizations using the platform.

### Organization Registration
The repository includes functionality for organization registration. Organizations are verified before receiving access to the administrative dashboard.

### Proposals
The proposal section provides an interface for proposal-related information.

### Settings
The settings section provides dashboard configuration options.

### Organization Verification
Prakarti Report uses organization verification before providing administrative dashboard access. The purpose of this process is to ensure that access to the administrative panel is provided only to organizations that have been verified.

The test credentials included in this README allow reviewers to evaluate the dashboard without requiring the organization verification process.

---

## Dashboard Workflow

The general dashboard workflow is:

```text
Environmental Report
        |
        v
     Reports
        |
        v
  Report Details
        |
        +----------------+
        |                |
        v                v
      Map            Analytics
        |
        v
     Hotspots
        |
        v
Organization Management
```

---

## Technology

The repository contains the following technologies and project components:

- **Frontend:** HTML, CSS, JavaScript
- **Backend & Database:** Supabase, Database Migrations
- **Tooling & Scripts:** Project Scripts, Node Package Manager (`npm`)

The implementation can be found in the source files included in this repository.

---

## Environment Configuration

The repository contains an `.env.example` file for environment configuration. Create your local environment file using the provided example:

```bash
cp .env.example .env
```

Configure the required environment variables in `.env` according to the project configuration. Do not commit private credentials or sensitive environment variables to the repository.

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the project directory:**
   ```bash
   cd <repository-directory>
   ```

3. **Install the project dependencies:**
   ```bash
   npm install
   ```

4. **Configure the environment:**
   ```bash
   cp .env.example .env
   ```
   Then add the required environment variables to `.env`.

---

## Running the Project

Use the commands defined in `package.json` to run the project. The available scripts can be viewed with:

```bash
npm run
```

---

## Testing the Dashboard

For project reviewers, judges, and evaluators, use the following credentials:

- **Email:** `Sankalp@gmail.com`
- **Password:** `Sankalp123`

The account can be used to explore the available dashboard sections and evaluate the implemented functionality.

---

## Security

- Administrative access is restricted to verified organizations.
- Sensitive configuration should be stored using environment variables and should not be committed to the repository.
- Do not expose private credentials, API keys, database credentials, or other sensitive configuration values.
- The `.env` file should remain local and should not be committed to Git.

---

## Project Information

| Field | Details |
|---|---|
| **Project** | Prakarti Report |
| **Component** | Organization Dashboard |
| **Access Model** | Verified Organizations |
| **Main Purpose** | Environmental Report Management |
| **Database / Backend Service** | Supabase |

---

## Important Note for Evaluators

The administrative panel is not publicly accessible through unrestricted organization registration. Organizations are verified before administrative access is provided.

The test credentials provided in this README are specifically intended to allow project reviewers and evaluators to access and test the dashboard.

---

## License

Refer to the repository for the applicable license and usage terms.
