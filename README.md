# SitecoreAI Content SDK - Next.js Sample with Azure Functions & Microsoft Dataverse Integration

> A production-ready reference implementation demonstrating how to connect **SitecoreAI (Sitecore XM Cloud)** to **Microsoft Dataverse** using **Azure Functions** as a secure serverless API layer, built on the **Sitecore Content SDK for Next.js**.

[![SitecoreAI](https://img.shields.io/badge/SitecoreAI-XM%20Cloud-red?logo=sitecore)](https://doc.sitecore.com/xmc/en/developers/content-sdk/index.html)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Azure Functions](https://img.shields.io/badge/Azure%20Functions-.NET%209-0062ad?logo=azurefunctions)](https://github.com/AmitKumar-AK/sitecoreai-dataverse-connector/tree/main/SitecoreAI-Dataverse-Azure-Functions)
[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [SitecoreAI Forms & Webhooks](#-sitecoreai-forms--webhooks)
- [Azure Functions - Dataverse CRUD](#-azure-functions--dataverse-crud)
- [Enquiries Listing Component](#-enquiries-listing-component)
- [Blog Series](#-blog-series)
- [References & Further Reading](#-references--further-reading)
- [Author](#-author)
- [License](#-license)

---

## 🌐 Overview

This repository contains the **front-end application** for a full-stack SitecoreAI integration pattern:

| Layer | Technology | Purpose |
|---|---|---|
| CMS / DXP | SitecoreAI (XM Cloud) | Content authoring, personalisation, forms |
| Front-end | Next.js 16 + Sitecore Content SDK | Headless rendering, routing, Sitecore components |
| API layer | Azure Functions (.NET isolated worker) — **[separate repo ↗](https://github.com/AmitKumar-AK/sitecoreai-dataverse-connector/tree/main/SitecoreAI-Dataverse-Azure-Functions)** | Serverless CRUD proxy for Dataverse |
| Data store | Microsoft Dataverse | Structured storage for form submissions & enquiries |
| Styling | Tailwind CSS 4 + CSS custom properties | Design system |

The integration captures form submissions through **SitecoreAI Forms**, routes them via a **webhook** to an **Azure Function**, and persists them in **Microsoft Dataverse** - all without exposing Dataverse credentials or business logic to the browser.

A **Next.js proxy API route** (`/api/enquiries`) securely forwards calls to Azure Functions, keeping API keys and connection strings strictly server-side. The `EnquiriesList` Sitecore component fetches and renders the results in a searchable, filterable card grid.

---

## 🏗 Architecture

```
┌───────────────────────────────────────────────────────┐
│                  SitecoreAI (XM Cloud)                │
│  ┌──────────────┐   webhook   ┌────────────────────┐  │
│  │  Forms       │ ──────────▶ │  Azure Function    │  │
│  │  Page Builder│             │  (POST /enquiries) │  │
│  └──────────────┘             └────────┬───────────┘  │
└──────────────────────────────────────┬─┘─────────────┘
                                        │ Dataverse SDK
         Next.js Front-end             ▼
  ┌────────────────────────┐   ┌────────────────────────┐
  │  /api/enquiries        │──▶│  Microsoft Dataverse   │
  │  (server-side proxy)   │   │  (crf51_sitecoreenquiry│
  └───────────┬────────────┘   │   table)               │
              │ JSON           └────────────────────────┘
  ┌───────────▼────────────┐
  │  EnquiriesList         │
  │  Sitecore Component    │
  │  (search + filter UI)  │
  └────────────────────────┘
```

**Data flow for a form submission:**
1. Visitor fills in a SitecoreAI Form on the page.
2. SitecoreAI sends a `POST` request to the configured **webhook** URL (the Azure Function).
3. The Azure Function validates the payload, maps fields, and calls **Dataverse `ServiceClient`** to create a record.
4. The Next.js `/api/enquiries` proxy fetches records from Azure Functions and caches the response.
5. The `EnquiriesList` component renders the enquiries in real time.

---

## 🛠 Tech Stack

| Package | Version | Role |
|---|---|---|
| `@sitecore-content-sdk/nextjs` | 2.2.x | Sitecore rendering, placeholders, components |
| `next` | 16.x | App framework (Pages Router) |
| `react` | 19.x | UI library |
| `tailwindcss` | 4.x | Utility-first styling |
| `typescript` | 5.8.x | Static typing |
| `@sitecore-content-sdk/cli` | 2.2.x | Sitecore scaffolding & code generation |

---

## 📁 Repository Structure

```
add-content-sdk-app/
└── src/
    └── headapps/
        └── nextjs/                          # Next.js front-end app
            ├── .env.local                   # Environment variables (not committed)
            ├── .sitecore/
            │   └── component-map.ts         # Sitecore component registry
            ├── next.config.js
            ├── sitecore.config.ts           # Edge context / site config
            └── src/
                ├── components/
                │   └── base-components/
                │       ├── navigation/      # Responsive nav with hamburger
                │       ├── enquiries/       # EnquiriesList component ← new
                │       ├── content-block/
                │       └── ...              # Other Sitecore base components
                ├── pages/
                │   ├── [[...path]].tsx      # Sitecore catch-all route
                │   └── api/
                │       └── enquiries.ts     # Server-side proxy ← new
                ├── lib/
                │   └── component-props/
                └── styles/
                    └── globals.css          # Design system + Tailwind layers
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- A **SitecoreAI (XM Cloud)** environment with an Edge Context ID
- An **Azure Function App** deployed from the [sitecoreai-dataverse-connector](https://github.com/AmitKumar-AK/sitecoreai-dataverse-connector/tree/main/SitecoreAI-Dataverse-Azure-Functions) repo (see [Azure Functions — Dataverse CRUD](#-azure-functions--dataverse-crud))

### 1. Clone & install

```bash
git clone https://github.com/AmitKumar-AK/add-content-sdk-app.git
cd add-content-sdk-app/src/headapps/nextjs
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local   # or edit .env.local directly
```

See [Environment Variables](#-environment-variables) for the full list.

### 3. Run in development

```bash
npm run next:dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm run next:start
```

---

## ⚙️ Environment Variables

Copy `.env.local` and set the following:

```dotenv
# ── Sitecore XM Cloud ────────────────────────────────────────
# Editing secret (secures /api/editing/render)
SITECORE_EDITING_SECRET=

# Site name (matches XM Cloud site definition)
NEXT_PUBLIC_DEFAULT_SITE_NAME=Contoso

# Edge Context ID - server-side
SITECORE_EDGE_CONTEXT_ID=

# Edge Context ID - client-side (public)
NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID=

# ── Azure Functions / Dataverse ──────────────────────────────
# Full URL including the function key; kept server-side only
ENQUIRIES_API_URL=https://<your-function-app>.azurewebsites.net/api/enquiries?code=<key>
```

> **Security note:** `ENQUIRIES_API_URL` is intentionally **not** prefixed with `NEXT_PUBLIC_`. It is only read by the server-side proxy route `/api/enquiries`, so the Azure Function key is never sent to the browser.

---

## 📬 SitecoreAI Forms & Webhooks

This project uses **SitecoreAI Forms** as the data-capture layer. Form submissions are forwarded to the Azure Function via a **webhook**.

### Configuring the Webhook

1. In SitecoreAI, open a form in the **Form Editor** and click **Settings**.
2. Click **Manage webhooks → Add** (or go to the **Webhooks dashboard → Create webhook**).
3. Set the **Authentication Type** to **API Key** and paste the Azure Function key.
4. Set the **URL** to your Azure Function endpoint, e.g. `https://<app>.azurewebsites.net/api/dataverse/enquiries`.
5. Click **Save**, then assign the webhook to the form via **Choose webhook**.
6. Before going live, use **Test webhook** to verify the payload and response.

> **Tip:** Test submissions include `"test": true` in the payload. Filter these out in your Azure Function before writing to Dataverse.

### Webhook Authentication Options

| Type | When to use |
|---|---|
| API Key | Azure Functions with `AuthorizationLevel.Function` |
| OAuth 2 | Azure AD-protected APIs |
| Basic | Simple username/password-secured endpoints |
| No Authentication | Development only - not recommended for production |

### Submit Actions

Configure what happens after a successful form submission under **Settings → Submit actions**. Common actions include redirect, confirmation message, and webhook delivery.

**Official docs:**
- [Work with webhooks](https://doc.sitecore.com/sai/en/users/sitecoreai/design-components/forms/edit-form-settings/work-with-webhooks.html)
- [Set submit actions](https://doc.sitecore.com/sai/en/users/sitecoreai/design-components/forms/edit-form-settings/set-submit-actions.html)
- [Enable forms in Page Builder](https://doc.sitecore.com/sai/en/users/sitecoreai/design-components/forms/enable-forms-in-the-page-builder.html)
- [Webhooks dashboard](https://doc.sitecore.com/sai/en/users/sitecoreai/design-components/forms/working-with-forms-dashboards/work-with-the-webhooks-dashboard.html)

---

## ⚡ Azure Functions - Dataverse CRUD

> **This is a separate repository.**
> The Azure Functions back-end lives at:
> **[AmitKumar-AK/sitecoreai-dataverse-connector — SitecoreAI-Dataverse-Azure-Functions](https://github.com/AmitKumar-AK/sitecoreai-dataverse-connector/tree/main/SitecoreAI-Dataverse-Azure-Functions)**

This front-end calls that Function App through the `/api/enquiries` server-side proxy. The Function App is a **.NET 9 isolated worker** project that exposes clean CRUD endpoints over Microsoft Dataverse.

### Why Azure Functions + Dataverse?

- Keeps Dataverse credentials and business rules **away from the browser**.
- Each function represents **one business operation** (create, update, delete, get) - not a generic table endpoint.
- Supports SitecoreAI, Next.js, automation scripts, and **MCP tools** from a single, auditable API surface.
- The **isolated worker model** (`--worker-runtime dotnet-isolated`) gives full .NET DI, independent versioning, and support for .NET 9/10+.

> ⚠️ The in-process .NET model reaches end of support on **November 10, 2026**. All new Azure Functions projects should use `dotnet-isolated`.

### Dataverse Table Schema (example)

| Display Name | Logical Name | Type | Required |
|---|---|---|---|
| Name | `crf51_newcolumn` | Text | Yes |
| Email | `crf51_email` | Text | Yes |
| Message | `crf51_messag` | Multiline Text | No |
| Source | `crf51_source` | Text | No |

Table logical name: `crf51_sitecoreenquiry`

### Available Endpoints

| Method | Route | Function |
|---|---|---|
| `POST` | `/api/dataverse/enquiries` | Create a new enquiry record |
| `GET` | `/api/dataverse/enquiries` | Retrieve all enquiry records |
| `GET` | `/api/dataverse/enquiries/{id}` | Retrieve a single record by ID |
| `GET` | `/api/dataverse/enquiries/email/{email}` | Retrieve records filtered by email |
| `PATCH` | `/api/dataverse/enquiries/{id}` | Update an existing record |
| `DELETE` | `/api/dataverse/enquiries/{id}` | Delete a record |

### Local Development

```json
// local.settings.json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "DataverseEnvironment": "https://<org>.crm.dynamics.com",
    "ClientId": "<app-registration-client-id>",
    "ClientSecret": "<secret>" // use Key Vault reference in production
  }
}
```

**Azure Functions tooling references:**
- [Develop and run Azure Functions locally](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local)
- [Develop with Visual Studio](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-vs?pivots=isolated)
- [Develop with VS Code](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-vs-code)
- [Quickstart: Create and deploy with VS Code](https://learn.microsoft.com/en-us/azure/azure-functions/how-to-create-function-vs-code?pivots=programming-language-csharp)

---

## 📋 Enquiries Listing Component

The `EnquiriesList` Sitecore component is registered in the component map and can be placed on any page in XM Cloud's Page Builder.

### Features

- **Animated skeleton cards** while data loads
- **Coloured source badges** - click any badge to filter by source
- **Live search** across name, email, message, and source
- **Dropdown source filter** + clear button
- **Responsive card grid** - collapses to a single column on mobile
- Cards lift on hover; message truncated to 3 lines with `line-clamp`
- Email addresses are rendered as `mailto:` links
- Accessible error and empty states

### How It Works

```
EnquiriesList (client component)
  └── fetch('/api/enquiries')          ← server-side proxy (API key hidden)
        └── ENQUIRIES_API_URL (env)    ← Azure Function endpoint
              └── Dataverse            ← crf51_sitecoreenquiry table
```

### Files

| File | Purpose |
|---|---|
| `src/components/base-components/enquiries/enquiries.props.ts` | TypeScript types (`Enquiry`, `EnquiriesApiResponse`, `EnquiriesListProps`) |
| `src/components/base-components/enquiries/EnquiriesList.tsx` | Component - fetch, filter, render |
| `src/pages/api/enquiries.ts` | Server-side proxy route |
| `.sitecore/component-map.ts` | Registration as `componentType: 'client'` |

---

## 📚 Blog Series

This codebase accompanies a practical blog series by [Amit Kumar](https://www.amitk.net) (8× Sitecore MVP):

| # | Title | Link |
|---|---|---|
| 1 | Introduction to SitecoreAI and Microsoft Dataverse Integration | [Read →](https://www.amitk.net/blog/sitecoreai-dataverse-integration-dotnet/) |
| 2 | Connecting SitecoreAI with Microsoft Dataverse: Authentication & Access | [Read →](https://www.amitk.net/blog/sitecoreai-dataverse-authentication-connection/) |
| 3 | **Azure Functions for Dataverse CRUD in .NET** | [Read →](https://www.amitk.net/blog/sitecoreai-azure-functions-dataverse-crud/) |

**Related articles:**
- [How to Create Azure Function Webhooks for Sitecore XM Cloud & Experience Edge Integration](https://enlightenwithamit.hashnode.dev/azure-function-webhook-xm-cloud-integration)
- [How to Set Up Unit Testing for SitecoreAI Content SDK Next.js Projects](https://www.amitk.net/blog/sitecoreai-contentsdk-component-testing/)
- [Why MCP Server Matters: Copilot vs GenAI vs Agentic AI vs AI Agents Explained](https://www.amitk.net/blog/mcp-server-vs-copilot-genai-agentic-ai/)

---

## 🔗 References & Further Reading

### Sitecore Content SDK & XM Cloud

- [Sitecore Content SDK Documentation](https://doc.sitecore.com/xmc/en/developers/content-sdk/index.html)
- [SitecoreAI Forms - Use Cases](https://doc.sitecore.com/sai/en/users/sitecoreai/design-components/forms.html#use-cases)
- [Work with Webhooks](https://doc.sitecore.com/sai/en/users/sitecoreai/design-components/forms/edit-form-settings/work-with-webhooks.html)
- [Set Submit Actions](https://doc.sitecore.com/sai/en/users/sitecoreai/design-components/forms/edit-form-settings/set-submit-actions.html)
- [Enable Forms in Page Builder](https://doc.sitecore.com/sai/en/users/sitecoreai/design-components/forms/enable-forms-in-the-page-builder.html)
- [Webhooks Dashboard](https://doc.sitecore.com/sai/en/users/sitecoreai/design-components/forms/working-with-forms-dashboards/work-with-the-webhooks-dashboard.html)

### Azure Functions

- [Azure Functions HTTP Trigger](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger)
- [.NET Isolated Worker Model](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide)
- [Develop and Run Azure Functions Locally](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local)
- [Develop with Visual Studio](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-vs?pivots=isolated)
- [Develop with VS Code](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-vs-code)
- [Create and Deploy with VS Code (Quickstart)](https://learn.microsoft.com/en-us/azure/azure-functions/how-to-create-function-vs-code?pivots=programming-language-csharp)
- [Create and Publish from Visual Studio (C# Corner)](https://www.c-sharpcorner.com/article/how-to-create-publish-azure-function-from-visual-studio/)
- [Azure Key Vault References for App Settings](https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references)
- [Monitor Azure Functions with Application Insights](https://learn.microsoft.com/en-us/azure/azure-functions/functions-monitoring)

### Microsoft Dataverse

- [Microsoft.PowerPlatform.Dataverse.Client (NuGet)](https://www.nuget.org/packages/Microsoft.PowerPlatform.Dataverse.Client)
- [Dataverse Web API Basic Operations](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/web-api-basic-operations-sample)
- [ServiceClient - Dataverse .NET SDK](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/org-service/overview)

---

## 👤 Author

**Amit Kumar** - Solution Architect & 8× Sitecore MVP

[![Blog](https://img.shields.io/badge/Blog-amitk.net-blue)](https://www.amitk.net)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-kumaramitkumar-0077b5?logo=linkedin)](https://www.linkedin.com/in/kumaramitkumar/)
[![GitHub](https://img.shields.io/badge/GitHub-AmitKumar--AK-black?logo=github)](https://github.com/AmitKumar-AK)
[![YouTube](https://img.shields.io/badge/YouTube-AmitKumar--Info-red?logo=youtube)](https://www.youtube.com/@AmitKumar-Info)
[![Sitecore MVP](https://img.shields.io/badge/Sitecore%20MVP-8×-red?logo=sitecore)](https://mvp.sitecore.com/en/Directory/Profile?id=764c86d9cfe14cc4b5f708dabbc3b551)

---

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).

---

> Built with ❤️ for the Sitecore developer community. If this project helped you, consider sharing it or contributing back - every star and PR supports the community.
