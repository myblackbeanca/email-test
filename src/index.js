import { Resend } from 'resend';

export default {
  async fetch(request, env, ctx) {
    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Allow all origins
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allowed methods
      'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
    };

    // Handle OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204, // No content for preflight response
        headers: corsHeaders,
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Only POST requests are allowed.' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch the RESEND_API_KEY from environment variables
    const RESEND_API_KEY = env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing RESEND_API_KEY in environment variables.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      // Parse the request body as JSON
      const emailData = await request.json();

      // Validate required fields in the email data
      const { to, subject, html } = emailData;
      if (!to || !subject || !html) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: to, subject, or html.' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Initialize the Resend client
      const resend = new Resend(RESEND_API_KEY);

      // Send the email using Resend
      const emailResponse = await resend.emails.send({
        from: 'Miny Vinyl <hello@minyvinyl.com>',
        to,
        subject,
        html: html,
      });

      // Return a success response
      return new Response(
        JSON.stringify({
          message: 'Email sent successfully!',
          ResponseID: emailResponse.data.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
