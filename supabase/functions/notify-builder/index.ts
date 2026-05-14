import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { to, subject, body } = await req.json()

  console.log(`Sending email to ${to} with subject: ${subject}`)

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email send")
    return new Response(JSON.stringify({ success: true, mocked: true }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'SassyMartie <notifications@sassymartie.com>',
      to,
      subject,
      html: body,
    }),
  })

  const data = await res.json()

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  })
})
