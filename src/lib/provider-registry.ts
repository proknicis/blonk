export interface FieldDefinition {
    key: string;
    label: string;
    type: "text" | "password" | "number" | "boolean" | "textarea" | "select";
    placeholder?: string;
    hint?: string;
    options?: { label: string; value: string }[];
}

export interface ProviderEntry {
    provider: string;
    displayName: string;
    authType: 
        | "oauth2"
        | "oauth1"
        | "apiKey"
        | "apiKeyHeader"
        | "apiKeyQuery"
        | "bearerToken"
        | "basicAuth"
        | "usernamePassword"
        | "databaseConnection"
        | "smtpImap"
        | "sshKey"
        | "certificate"
        | "cloudProvider";
    n8nCredentialType: string;
    icon: string; // lucide icon name or emoji or path
    category: "productivity" | "ai" | "crm" | "payment" | "messaging" | "dev" | "storage" | "database" | "social";
    fields: FieldDefinition[];
    description: string;
    helpUrl?: string;
    helpLabel?: string;
}

export const PROVIDER_REGISTRY: ProviderEntry[] = [
    {
        provider: "openai",
        displayName: "OpenAI",
        authType: "bearerToken",
        n8nCredentialType: "openAiApi",
        icon: "Brain",
        category: "ai",
        description: "Connect to GPT-4o, GPT-4 and embeddings for intelligent workflows.",
        helpUrl: "https://platform.openai.com/api-keys",
        helpLabel: "Get your API key from OpenAI",
        fields: [
            { key: "apiKey", label: "OpenAI API Key", type: "password", placeholder: "sk-proj-...", hint: "Obtain this from platform.openai.com api-keys." }
        ]
    },
    {
        provider: "telegram",
        displayName: "Telegram Bot",
        authType: "bearerToken",
        n8nCredentialType: "telegramApi",
        icon: "Send",
        category: "messaging",
        description: "Control Telegram bot commands and broadcast message updates.",
        helpUrl: "https://t.me/BotFather",
        helpLabel: "Get your Bot Token from BotFather",
        fields: [
            { key: "accessToken", label: "Telegram Bot Token", type: "password", placeholder: "123456789:ABCdef...", hint: "Obtain this token from @BotFather." }
        ]
    },
    {
        provider: "slack",
        displayName: "Slack",
        authType: "oauth2",
        n8nCredentialType: "slackOAuth2Api",
        icon: "MessageCircle",
        category: "messaging",
        description: "Send channel messages, direct messages, and trigger slack alert flows.",
        fields: [
            { key: "clientId", label: "Client ID", type: "text", placeholder: "12345.67890..." },
            { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "••••••••••••" },
            { key: "accessToken", label: "Slack Access Token", type: "password", placeholder: "xoxb-...", hint: "For manual configuration. Enter OAuth Token." }
        ]
    },
    {
        provider: "stripe",
        displayName: "Stripe",
        authType: "apiKeyHeader",
        n8nCredentialType: "stripeApi",
        icon: "CreditCard",
        category: "payment",
        description: "Synchronize payouts, track client invoices, and register charges.",
        helpUrl: "https://dashboard.stripe.com/apikeys",
        helpLabel: "Get your API key from Stripe",
        fields: [
            { key: "apiKey", label: "Stripe Secret Key", type: "password", placeholder: "sk_live_...", hint: "Generate key in dashboard.stripe.com." }
        ]
    },
    {
        provider: "gmail",
        displayName: "Gmail",
        authType: "oauth2",
        n8nCredentialType: "gmailOAuth2",
        icon: "Mail",
        category: "productivity",
        description: "Send automated emails, read inbox alerts, and manage draft reviews.",
        fields: [
            { key: "clientId", label: "Google Client ID", type: "text", placeholder: "12345-abc.apps.googleusercontent.com" },
            { key: "clientSecret", label: "Google Client Secret", type: "password", placeholder: "••••••••••••" },
            { key: "accessToken", label: "Access Token", type: "password", placeholder: "ya29.a0..." }
        ]
    },
    {
        provider: "google-sheets",
        displayName: "Google Sheets",
        authType: "oauth2",
        n8nCredentialType: "googleSheetsOAuth2Api",
        icon: "Table",
        category: "productivity",
        description: "Read, write, append, and log workspace activities directly in spreadsheets.",
        fields: [
            { key: "clientId", label: "Google Client ID", type: "text", placeholder: "12345-abc.apps.googleusercontent.com" },
            { key: "clientSecret", label: "Google Client Secret", type: "password", placeholder: "••••••••••••" },
            { key: "accessToken", label: "Access Token", type: "password", placeholder: "ya29.a0..." }
        ]
    },
    {
        provider: "github",
        displayName: "GitHub",
        authType: "bearerToken",
        n8nCredentialType: "githubApi",
        icon: "Github",
        category: "dev",
        description: "Trigger repo checks, issue tracking, and monitor git repository updates.",
        helpUrl: "https://github.com/settings/tokens",
        helpLabel: "Get your access token from GitHub",
        fields: [
            { key: "accessToken", label: "Personal Access Token", type: "password", placeholder: "ghp_...", hint: "Create a PAT in GitHub Developer Settings." }
        ]
    },
    {
        provider: "twilio",
        displayName: "Twilio",
        authType: "basicAuth",
        n8nCredentialType: "twilioApi",
        icon: "Phone",
        category: "messaging",
        description: "Send SMS messages, alert teams, and manage voice calls.",
        fields: [
            { key: "accountSid", label: "Twilio Account SID", type: "text", placeholder: "AC..." },
            { key: "authToken", label: "Auth Token", type: "password", placeholder: "••••••••••••" }
        ]
    },
    {
        provider: "hubspot",
        displayName: "HubSpot",
        authType: "oauth2",
        n8nCredentialType: "hubspotOAuth2Api",
        icon: "Activity",
        category: "crm",
        description: "Sync deals, pipeline contacts, and qualify leads into HubSpot CRM.",
        fields: [
            { key: "clientId", label: "App Client ID", type: "text", placeholder: "HubSpot App ID" },
            { key: "clientSecret", label: "App Client Secret", type: "password", placeholder: "••••••••••••" }
        ]
    },
    {
        provider: "discord-bot",
        displayName: "Discord Bot",
        authType: "bearerToken",
        n8nCredentialType: "discordBotApi",
        icon: "MessageSquare",
        category: "messaging",
        description: "Sync channel alerts and interact with members via Discord bot tokens.",
        fields: [
            { key: "token", label: "Bot Token", type: "password", placeholder: "MTY4..." }
        ]
    },
    {
        provider: "discord-webhook",
        displayName: "Discord Webhook",
        authType: "apiKeyQuery",
        n8nCredentialType: "discordWebhookApi",
        icon: "MessageSquare",
        category: "messaging",
        description: "Post automated events directly to discord channels using webhooks.",
        fields: [
            { key: "webhookUrl", label: "Discord Webhook URL", type: "text", placeholder: "https://discord.com/api/webhooks/..." }
        ]
    },
    {
        provider: "aws-s3",
        displayName: "AWS S3",
        authType: "cloudProvider",
        n8nCredentialType: "aws",
        icon: "Cloud",
        category: "storage",
        description: "Store files and retrieve media objects from AWS S3 buckets.",
        fields: [
            { key: "awsAccessKeyId", label: "AWS Access Key ID", type: "text", placeholder: "AKIA..." },
            { key: "awsSecretAccessKey", label: "AWS Secret Access Key", type: "password", placeholder: "••••••••••••" },
            { key: "region", label: "Default Region", type: "text", placeholder: "us-east-1" }
        ]
    },
    {
        provider: "gcs",
        displayName: "Google Cloud Storage",
        authType: "cloudProvider",
        n8nCredentialType: "gcp",
        icon: "Cloud",
        category: "storage",
        description: "Store objects and read binary payloads from GCS buckets.",
        fields: [
            { key: "privateKey", label: "Service Account Private Key JSON", type: "textarea", placeholder: "{ \"type\": \"service_account\", ... }" }
        ]
    },
    {
        provider: "azure-blob",
        displayName: "Azure Blob Storage",
        authType: "cloudProvider",
        n8nCredentialType: "azure",
        icon: "Cloud",
        category: "storage",
        description: "Manage storage blobs and retrieve files from Azure storage accounts.",
        fields: [
            { key: "accountName", label: "Azure Storage Account Name", type: "text", placeholder: "myazurestorage" },
            { key: "accountKey", label: "Azure Storage Account Key", type: "password", placeholder: "••••••••••••" }
        ]
    },
    {
        provider: "postgresql",
        displayName: "PostgreSQL Database",
        authType: "databaseConnection",
        n8nCredentialType: "postgresDb",
        icon: "Database",
        category: "database",
        description: "Query databases, load table records, and perform operations in PostgreSQL.",
        fields: [
            { key: "host", label: "Database Host", type: "text", placeholder: "127.0.0.1" },
            { key: "port", label: "Port", type: "number", placeholder: "5432" },
            { key: "user", label: "User", type: "text", placeholder: "postgres" },
            { key: "password", label: "Password", type: "password", placeholder: "••••••••••••" },
            { key: "database", label: "Database Name", type: "text", placeholder: "main_production" },
            { key: "ssl", label: "Enable SSL", type: "boolean", placeholder: "" }
        ]
    },
    {
        provider: "mysql",
        displayName: "MySQL Database",
        authType: "databaseConnection",
        n8nCredentialType: "mySql",
        icon: "Database",
        category: "database",
        description: "Execute SQL statements and synchronise logs with MySQL/MariaDB.",
        fields: [
            { key: "host", label: "Database Host", type: "text", placeholder: "127.0.0.1" },
            { key: "port", label: "Port", type: "number", placeholder: "3306" },
            { key: "user", label: "User", type: "text", placeholder: "root" },
            { key: "password", label: "Password", type: "password", placeholder: "••••••••••••" },
            { key: "database", label: "Database Name", type: "text", placeholder: "mysql_db" },
            { key: "ssl", label: "Enable SSL", type: "boolean", placeholder: "" }
        ]
    },
    {
        provider: "smtp",
        displayName: "SMTP Email",
        authType: "smtpImap",
        n8nCredentialType: "smtpApi",
        icon: "Mail",
        category: "productivity",
        description: "Send system announcements and outbound messages via SMTP relay.",
        fields: [
            { key: "host", label: "SMTP Host Address", type: "text", placeholder: "smtp.mailgun.org" },
            { key: "port", label: "SMTP Port", type: "number", placeholder: "587" },
            { key: "user", label: "Username / Email", type: "text", placeholder: "postmaster@domain.com" },
            { key: "password", label: "Password", type: "password", placeholder: "••••••••••••" },
            { key: "ssl", label: "Use SSL/TLS Security", type: "boolean", placeholder: "" }
        ]
    },
    {
        provider: "imap",
        displayName: "IMAP Email",
        authType: "smtpImap",
        n8nCredentialType: "imapApi",
        icon: "Mail",
        category: "productivity",
        description: "Connect to email accounts to automatically fetch and scan new emails.",
        fields: [
            { key: "host", label: "IMAP Host Address", type: "text", placeholder: "imap.gmail.com" },
            { key: "port", label: "IMAP Port", type: "number", placeholder: "993" },
            { key: "user", label: "Username / Email", type: "text", placeholder: "user@gmail.com" },
            { key: "password", label: "Password", type: "password", placeholder: "••••••••••••" },
            { key: "ssl", label: "Use SSL/TLS Security", type: "boolean", placeholder: "" }
        ]
    },
    {
        provider: "zendesk",
        displayName: "Zendesk",
        authType: "basicAuth",
        n8nCredentialType: "zendeskApi",
        icon: "MessageSquare",
        category: "crm",
        description: "Fetch new tickets, sync user profiles, and manage zendesk tasks.",
        fields: [
            { key: "subdomain", label: "Zendesk Subdomain", type: "text", placeholder: "myhelpdesk" },
            { key: "email", label: "Zendesk Email Address", type: "text", placeholder: "admin@mycompany.com" },
            { key: "apiToken", label: "Zendesk API Token", type: "password", placeholder: "••••••••••••" }
        ]
    },
    {
        provider: "mailchimp",
        displayName: "Mailchimp",
        authType: "apiKeyQuery",
        n8nCredentialType: "mailchimpApi",
        icon: "Mail",
        category: "social",
        description: "Sync contact records and qualify mailchimp marketing campaigns.",
        helpUrl: "https://mailchimp.com/help/about-api-keys/",
        helpLabel: "Get your API key from Mailchimp",
        fields: [
            { key: "apiKey", label: "Mailchimp API Key", type: "password", placeholder: "123456...-us1" }
        ]
    },
    {
        provider: "ms-teams",
        displayName: "Microsoft Teams",
        authType: "oauth2",
        n8nCredentialType: "microsoftTeamsOAuth2Api",
        icon: "MessageSquare",
        category: "messaging",
        description: "Send alerts, create chats, and coordinate operations on Microsoft Teams.",
        fields: [
            { key: "clientId", label: "Teams Client ID", type: "text", placeholder: "App Registration Client ID" },
            { key: "clientSecret", label: "Teams Client Secret", type: "password", placeholder: "••••••••••••" }
        ]
    },
    {
        provider: "activecampaign",
        displayName: "ActiveCampaign",
        authType: "apiKeyHeader",
        n8nCredentialType: "activeCampaignApi",
        icon: "Activity",
        category: "social",
        description: "Synchronize deals and contacts into ActiveCampaign systems.",
        helpUrl: "https://help.activecampaign.com/hc/en-us/articles/207317590-Getting-Started-with-the-ActiveCampaign-API",
        helpLabel: "Get your API key from ActiveCampaign",
        fields: [
            { key: "apiUrl", label: "ActiveCampaign API URL", type: "text", placeholder: "https://myaccount.api-us1.com" },
            { key: "apiKey", label: "API Access Key", type: "password", placeholder: "••••••••••••" }
        ]
    },
    {
        provider: "jira",
        displayName: "Jira Software",
        authType: "oauth2",
        n8nCredentialType: "jiraSoftwareOAuth2Api",
        icon: "Table",
        category: "dev",
        description: "Generate tasks and track bugs automatically in Jira.",
        fields: [
            { key: "clientId", label: "Jira Client ID", type: "text" },
            { key: "clientSecret", label: "Jira Client Secret", type: "password" }
        ]
    },
    {
        provider: "asana",
        displayName: "Asana",
        authType: "oauth2",
        n8nCredentialType: "asanaOAuth2Api",
        icon: "Table",
        category: "productivity",
        description: "Synchronize items and update task statuses in Asana projects.",
        fields: [
            { key: "clientId", label: "Asana Client ID", type: "text" },
            { key: "clientSecret", label: "Asana Client Secret", type: "password" }
        ]
    },
    {
        provider: "trello",
        displayName: "Trello",
        authType: "oauth1",
        n8nCredentialType: "trelloApi",
        icon: "Table",
        category: "productivity",
        description: "Retrieve boards, compile task items, and add cards on Trello.",
        fields: [
            { key: "apiKey", label: "Trello Developer API Key", type: "text", placeholder: "Developer Key" },
            { key: "oauthToken", label: "OAuth Access Token", type: "password", placeholder: "Token" }
        ]
    },
    {
        provider: "gitlab",
        displayName: "GitLab",
        authType: "bearerToken",
        n8nCredentialType: "gitLabApi",
        icon: "Github",
        category: "dev",
        description: "Deploy integrations, monitor repository jobs, and track GitLab merge requests.",
        helpUrl: "https://gitlab.com/-/profile/personal_access_tokens",
        helpLabel: "Get your token from GitLab",
        fields: [
            { key: "accessToken", label: "GitLab Personal Token", type: "password", placeholder: "glpat-..." }
        ]
    },
    {
        provider: "airtable",
        displayName: "Airtable",
        authType: "bearerToken",
        n8nCredentialType: "airtableApi",
        icon: "Table",
        category: "database",
        description: "Read records, perform lookups, and post entries to Airtable databases.",
        helpUrl: "https://airtable.com/create/tokens",
        helpLabel: "Get your access token from Airtable",
        fields: [
            { key: "apiKey", label: "Airtable Token", type: "password", placeholder: "pat..." }
        ]
    },
    {
        provider: "pipedrive",
        displayName: "Pipedrive CRM",
        authType: "apiKeyQuery",
        n8nCredentialType: "pipedriveApi",
        icon: "Activity",
        category: "crm",
        description: "Sync contacts, create opportunities, and track CRM deals in Pipedrive.",
        helpUrl: "https://developers.pipedrive.com/tutorials/how-to-find-pipedrive-api-token",
        helpLabel: "Get your token from Pipedrive",
        fields: [
            { key: "apiToken", label: "Pipedrive API Token", type: "password", placeholder: "••••••••••••" }
        ]
    },
    {
        provider: "shopify",
        displayName: "Shopify",
        authType: "apiKeyHeader",
        n8nCredentialType: "shopifyApi",
        icon: "CreditCard",
        category: "payment",
        description: "Synchronize orders, inventory records, and clients from Shopify stores.",
        helpUrl: "https://help.shopify.com/en/manual/apps/custom-apps",
        helpLabel: "Learn how to get custom app token on Shopify",
        fields: [
            { key: "shopSubdomain", label: "Shop Subdomain name", type: "text", placeholder: "my-shop" },
            { key: "accessToken", label: "Shopify Admin Access Token", type: "password", placeholder: "shpat_..." }
        ]
    },
    {
        provider: "zoom",
        displayName: "Zoom meetings",
        authType: "oauth2",
        n8nCredentialType: "zoomOAuth2Api",
        icon: "Phone",
        category: "productivity",
        description: "Configure webinars and generate meeting invites on Zoom.",
        fields: [
            { key: "clientId", label: "Zoom Client ID", type: "text" },
            { key: "clientSecret", label: "Zoom Client Secret", type: "password" }
        ]
    },
    {
        provider: "salesforce",
        displayName: "Salesforce CRM",
        authType: "oauth2",
        n8nCredentialType: "salesforceOAuth2Api",
        icon: "Activity",
        category: "crm",
        description: "Manage high-value accounts, sync contact records, and track CRM deals.",
        fields: [
            { key: "clientId", label: "Connected App Client ID", type: "text" },
            { key: "clientSecret", label: "Connected App Client Secret", type: "password" }
        ]
    },
    {
        provider: "twenty",
        displayName: "Twenty CRM",
        authType: "bearerToken",
        n8nCredentialType: "httpHeaderAuth",
        icon: "Activity",
        category: "crm",
        description: "Connect to your Twenty CRM cloud or self-hosted instance to sync people, companies, and tasks.",
        helpUrl: "https://app.twenty.com/settings/developers",
        helpLabel: "Get your API key from Twenty CRM (Settings → API & Webhooks)",
        fields: [
            { key: "instanceUrl", label: "Instance URL", type: "text", placeholder: "https://your-workspace.twenty.com" },
            { key: "apiKey", label: "API Key", type: "password", placeholder: "twenty-key-..." }
        ]
    }
];
