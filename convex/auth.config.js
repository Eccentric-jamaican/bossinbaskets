const clerkFrontendApiUrl = process.env.CLERK_FRONTEND_API_URL

if (typeof clerkFrontendApiUrl !== "string" || clerkFrontendApiUrl.trim() === "") {
  throw new Error(
    "Sign-in is temporarily unavailable because the app is missing required authentication configuration."
  )
}

export default {
  providers: [
    {
      domain: clerkFrontendApiUrl,
      applicationID: 'convex',
    },
  ],
}