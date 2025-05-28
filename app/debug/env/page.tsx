export default function DebugEnvPage() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing",
    NODE_ENV: process.env.NODE_ENV,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <pre className="text-sm">{JSON.stringify(envVars, null, 2)}</pre>
        </div>
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="font-semibold text-yellow-800 mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Go to your Vercel dashboard</li>
            <li>Navigate to your project settings</li>
            <li>Go to Environment Variables</li>
            <li>Add the missing variables from your Supabase dashboard</li>
            <li>Redeploy your application</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
