export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'SyncLancer <onboarding@resend.dev>';

  if (!apiKey || apiKey.startsWith('re_your') || apiKey === 'your-api-key') {
    console.log('-----------------------------------------');
    console.log(`[MOCK EMAIL DISPATCH]`);
    console.log(`To: ${to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 300)}...`);
    console.log('-----------------------------------------');
    return { success: true, mocked: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Resend API error: ${res.status} - ${errText}`);
      throw new Error(`Failed to send email: ${errText}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (e: any) {
    console.error('Email dispatch error:', e);
    throw e;
  }
}
