# Admin & Supabase setup

The admin area lets staff sign in and add dog listings (with photo uploads).
This guide gets the Supabase backend ready to match the React code.

## 1. Environment variables

Copy `.env.example` to `.env` and fill in your project's URL and anon key
(Supabase dashboard → Project Settings → API):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

On Vercel, add these same two variables under Project → Settings →
Environment Variables, then redeploy.

## 2. Database table

In the Supabase dashboard → SQL Editor, run:

```sql
create table public.dogs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  status        text not null default 'romania',  -- romania | uk_foster | uk_kennels | adopted
  age           text,
  size          text,                              -- small | medium | large
  gender        text,                              -- male | female
  bio           text,
  good_with_dogs boolean default false,
  good_with_cats boolean default false,
  good_with_kids boolean default false,
  neutered      boolean default false,
  vaccinated    boolean default false,
  photo_urls    text[] default '{}'
);

-- Turn on row-level security.
alter table public.dogs enable row level security;

-- Anyone may read listings (so the public site can show them).
create policy "Public can read dogs"
  on public.dogs for select
  using (true);

-- Only signed-in users (your admins) may create/update/delete.
create policy "Authenticated can insert dogs"
  on public.dogs for insert
  to authenticated with check (true);

create policy "Authenticated can update dogs"
  on public.dogs for update
  to authenticated using (true);

create policy "Authenticated can delete dogs"
  on public.dogs for delete
  to authenticated using (true);
```

## 3. Storage bucket

Dashboard → Storage → New bucket:

- Name: **dog-photos**
- Public bucket: **on** (so the photo URLs are viewable on the public site)

Then add policies so the public can view images and signed-in admins can
upload. In SQL Editor:

```sql
-- Public read access to images in the dog-photos bucket.
create policy "Public can view dog photos"
  on storage.objects for select
  using (bucket_id = 'dog-photos');

-- Signed-in admins can upload.
create policy "Authenticated can upload dog photos"
  on storage.objects for insert
  to authenticated with check (bucket_id = 'dog-photos');
```

## 3b. Adoption enquiries table

When a visitor enquires about a dog, it saves here. Crucially, the security is
the *reverse* of the dogs table: the public can **submit** an enquiry but must
**not** be able to read anyone's enquiries (they contain personal contact
details). Only signed-in admins can read, update, or delete them.

In SQL Editor, run:

```sql
create table public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  dog_id      uuid,
  dog_name    text,
  name        text not null,
  email       text not null,
  phone       text,
  message     text,
  status      text not null default 'new'   -- 'new' | 'handled'
);

alter table public.enquiries enable row level security;

-- Anyone (even logged-out visitors) may submit an enquiry.
create policy "Public can submit enquiries"
  on public.enquiries for insert
  to anon, authenticated with check (true);

-- Only signed-in admins may read enquiries.
create policy "Authenticated can read enquiries"
  on public.enquiries for select
  to authenticated using (true);

-- Only signed-in admins may update (mark handled) or delete.
create policy "Authenticated can update enquiries"
  on public.enquiries for update
  to authenticated using (true);

create policy "Authenticated can delete enquiries"
  on public.enquiries for delete
  to authenticated using (true);
```

> Note: `dog_id` is intentionally **not** a foreign key to `dogs`. We store the
> `dog_name` alongside it so that if a dog is later removed, the enquiry still
> makes sense in the admin list.

## 4. Create an admin user

Dashboard → Authentication → Users → Add user. Give them an email and
password. There is no public sign-up in the app — accounts are created here by
you, so only people you add can log in.

## 5. Try it

- Visit `/admin` on the site.
- Sign in with the user you created.
- Fill in the form, attach a photo or two, and save.
- Check the `dogs` table and the `dog-photos` bucket — the row and images
  should be there.

## How the code is organised

```
src/lib/
  supabaseClient.js   initialises Supabase from the env vars
  useAuth.js          tracks the login session; signOut helper
  dogsApi.js          uploadDogPhoto / uploadDogPhotos / createDogListing
  theme.js            shared brand colours + fonts
src/admin/
  AdminApp.jsx        auth gate: shows login or dashboard
  LoginPage.jsx       email + password sign-in
  Dashboard.jsx       protected shell (header, sign out)
  AddDogForm.jsx      the create-a-dog form
```

The data logic lives in `dogsApi.js`, separate from the UI — so the upload and
save behaviour can be reused or tested on its own.

## A note on security

The anon key in the browser is expected and safe. What actually protects your
data is row-level security: with the policies above, anyone can *read*
listings, but only a signed-in admin can *create or change* them. Never put the
**service_role** key in front-end code — that one bypasses every policy.
