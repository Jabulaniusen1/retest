# Supabase Authentication Setup Guide

This application now uses Supabase for authentication instead of local storage.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and pnpm installed

## Setup Instructions

### 1. Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Project name: `capital-city-bank` (or your preferred name)
   - Database password: Create a strong password (save this!)
   - Region: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize (~2 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the sidebar
2. Navigate to **API** section
3. You'll find two important values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

### 3. Configure Environment Variables

1. Create a `.env.local` file in the root of your project:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Replace the values with your actual credentials from step 2.

### 4. Configure Supabase Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email settings:
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation email template if needed
4. For development, you may want to disable email confirmation:
   - Go to **Authentication** → **Settings**
   - Under "Email Auth", toggle off "Enable email confirmations"
   - This allows immediate login after signup during development

### 5. Optional: Set Up Database Tables

If you want to store additional user data (accounts, transactions), you can create tables:

1. Go to **Table Editor** in your Supabase dashboard
2. Create tables for your banking data (accounts, transactions, etc.)
3. Set up Row Level Security (RLS) policies to protect user data

Example SQL for accounts table:
```sql
create table accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  account_number text not null,
  balance decimal(15,2) default 0,
  currency text default 'USD',
  account_type text check (account_type in ('checking', 'savings')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table accounts enable row level security;

-- Create policy to allow users to read their own accounts
create policy "Users can view their own accounts"
  on accounts for select
  using (auth.uid() = user_id);

-- Create policy to allow users to insert their own accounts
create policy "Users can insert their own accounts"
  on accounts for insert
  with check (auth.uid() = user_id);
```

### 6. Run the Application

1. Install dependencies (if not already done):
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open http://localhost:3000 in your browser

### 7. Test Authentication

1. Go to the signup page and create a new account
2. If email confirmation is enabled, check your email and confirm
3. Log in with your credentials
4. You should be redirected to the dashboard

## Features

- ✅ Email/Password authentication
- ✅ Automatic session management
- ✅ Secure cookie-based sessions
- ✅ Protected routes with middleware
- ✅ User metadata storage (name, account number)

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file has the correct values
- Ensure you're using the **anon/public** key, not the service role key
- Restart your dev server after changing environment variables

### Email confirmation not working
- Check your Supabase email settings
- For development, disable email confirmations in Authentication settings
- Check spam folder for confirmation emails

### User not redirecting after login
- Check browser console for errors
- Verify middleware is properly configured
- Clear browser cookies and try again

## Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- The `anon` key is safe to use in client-side code
- Never expose your `service_role` key in client-side code
- Enable Row Level Security (RLS) on all database tables
- Use Supabase policies to control data access

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
