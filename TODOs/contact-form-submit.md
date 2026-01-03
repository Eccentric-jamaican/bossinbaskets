# TODO: Wire up Contact Form submission

- **Location**: `components/site/ContactForm.tsx`
- **Need**: Replace the placeholder `window.setTimeout` logic inside `handleSubmit` with a real request (Convex mutation or API route) so inquiries are persisted/delivered.
- **Acceptance**: Submitting the form should send data (name, email, company, message) to the backend and provide user-visible success/error states.
