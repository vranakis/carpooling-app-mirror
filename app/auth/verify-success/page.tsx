import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function VerificationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Email Verified!</CardTitle>
          <CardDescription className="text-center">
            Your email has been successfully verified. You can now log in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-600">
            Thank you for verifying your email address. You now have full access to all features of the RideShare
            platform.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
            <Link href="/auth/login">Log in to your account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
