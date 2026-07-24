import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Lishe" },
      {
        name: "description",
        content: "What Lishe collects and what it doesn't. No accounts, no personal data stored.",
      },
      { property: "og:title", content: "Privacy — Lishe" },
      { property: "og:description", content: "No accounts. No profiles. Nothing to leak." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Privacy</h1>
      <p className="mt-4 text-xs text-muted">Last updated 24 July 2026</p>

      <div className="mt-8 space-y-6 text-ink">
        <section>
          <h2 className="font-display text-xl font-bold">No account, no profile</h2>
          <p className="mt-2 text-muted">
            Lishe does not require you to sign up or sign in. We do not collect your name, email,
            phone number, location, or anything that identifies you as a person.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">What we store</h2>
          <p className="mt-2 text-muted">
            Nothing personal on our servers. The site does not run any analytics or tracking scripts
            and does not set advertising cookies.
          </p>
          <p className="mt-2 text-muted">
            Your Ask conversation is kept in your own browser (local storage) so you can come back
            to it later on the same device. Clearing your browser data, or using the "Clear chat"
            button on the Ask page, removes it. The stored history is never uploaded to or kept on
            Lishe's servers — messages you send pass through our server only to generate a reply
            (see "The Ask helper" below) and are not retained.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">The Ask helper</h2>
          <p className="mt-2 text-muted">
            When you send a question to the nutrition helper, your question — and the last few turns
            of the current conversation, for context — is forwarded to Google's Gemini API to
            generate the answer. Google may process it under their own privacy policy. We do not
            attach any personal information (no name, no email, no device ID) to the request.
          </p>
          <p className="mt-2 text-muted">
            Because your question travels to a third party, do not include your full name, ID
            number, phone number, address, or any medical or financial details you wouldn't want
            outside your device.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Hosting logs</h2>
          <p className="mt-2 text-muted">
            Like any website, our hosting provider automatically records short-lived technical logs
            (IP address, browser type, request path) to keep the site running and to block abuse.
            These logs are not linked to any user account and are rotated by the host.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Contact</h2>
          <p className="mt-2 text-muted">
            Privacy questions:{" "}
            <a className="text-leaf underline" href="mailto:mwangititus6634@gmail.com">
              mwangititus6634@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
