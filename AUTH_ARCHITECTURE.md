# Authentication Architecture Documentation

## Overview
This carpooling app uses Clerk for authentication with Next.js App Router, following best practices for server/client component separation.

## Key Principles

### 1. Server Components vs Client Components

**Server Components (no "use client"):**
- Handle authentication checks
- Fetch data from the database
- Pass authenticated user data to client components
- Examples: `/offer-ride/page.tsx`, `/my-rides/page.tsx`

**Client Components ("use client"):**
- Handle interactive UI (forms, buttons, maps)
- Receive authenticated user data as props
- Call server actions with user context
- Examples: `/offer-ride/offer-ride-form.tsx`, components with state/hooks

### 2. Authentication Flow

```
1. User visits protected route (e.g., /offer-ride)
2. Middleware checks authentication via Clerk
3. If not authenticated → redirect to /sign-in
4. If authenticated → Server component gets userId
5. Server component passes userId to client components
6. Client components use userId for server actions
```

## Implementation Pattern

### Protected Page Structure

```typescript
// app/protected-page/page.tsx (SERVER COMPONENT)
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProtectedForm from "./protected-form";

export default async function ProtectedPage() {
  // Get authenticated user
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Pass userId to client component
  return <ProtectedForm userId={userId} />;
}
```

### Client Component Structure

```typescript
// app/protected-page/protected-form.tsx (CLIENT COMPONENT)
"use client";

interface ProtectedFormProps {
  userId: string;
}

export default function ProtectedForm({ userId }: ProtectedFormProps) {
  const handleSubmit = async (formData: FormData) => {
    // Pass userId to server action
    const result = await serverAction(userId, formData);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Server Action Structure

```typescript
// app/protected-page/actions.ts (SERVER ACTION)
"use server";

export async function serverAction(userId: string, formData: FormData) {
  // Use userId directly - no need to call auth() here
  // This avoids the client/server boundary error
  return await databaseOperation(userId, formData);
}
```

## Common Errors and Solutions

### Error: "Cannot import from Client Component module"
**Cause:** Trying to use `auth()` from Clerk in a server action that's called from a client component.
**Solution:** Pass userId from server component to client component as prop, then to server action.

### Error: "Unauthorized access"
**Cause:** Route not protected by middleware.
**Solution:** Add route to middleware's `isProtectedRoute` matcher.

## File Structure

```
app/
├── offer-ride/
│   ├── page.tsx           # Server component (auth check)
│   ├── offer-ride-form.tsx # Client component (form UI)
│   └── actions.ts         # Server actions
├── my-rides/
│   ├── page.tsx           # Server component (auth + data fetch)
│   └── page-client.tsx    # Client component (interactive UI)
└── layout.tsx             # Root layout with ClerkProvider
```

## Middleware Configuration

```typescript
// middleware.ts
const isProtectedRoute = createRouteMatcher([
  "/offer-ride(.*)",
  "/my-rides(.*)",
  "/profile(.*)",
  "/messages(.*)",
  "/notifications(.*)",
]);
```

## Benefits of This Architecture

1. **Security**: Authentication happens on the server, not client
2. **Performance**: Server components reduce JavaScript bundle size
3. **SEO**: Server-rendered content is crawlable
4. **Type Safety**: TypeScript ensures userId is always available
5. **Clarity**: Clear separation of concerns

## Components That Should Be Converted

Based on this pattern, these components should be restructured:
- `/my-rides/page.tsx` - Already using dynamic import wrapper, should be split properly
- `/profile/page.tsx` - Needs server component for auth check
- `/messages/page.tsx` - Needs server component for auth check
- `/notifications/page.tsx` - Needs server component for auth check

## Development vs Production

During development:
- You can temporarily remove routes from middleware protection
- Use test user IDs for quick iteration
- Add "Testing Mode" notices in UI

For production:
- All protected routes must be in middleware
- Proper authentication required for all operations
- Remove any test user logic

## Testing the Implementation

1. Start the development server: `npm run dev`
2. Visit `/offer-ride` without authentication → Should redirect to `/sign-in`
3. Sign in with Clerk
4. Visit `/offer-ride` → Should show the form
5. Submit a ride → Should create successfully with your user ID

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Server Components vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
