import { auth } from "@clerk/nextjs/server";

export default async function TestAuthPage() {
  const { userId } = await auth();

  return (
    <div className="p-8">
      <h1>Auth Test</h1>
      <p>User ID: {userId || "Not logged in"}</p>
    </div>
  );
}
    