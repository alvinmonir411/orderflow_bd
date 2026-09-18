import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Returns an HTML page that passes the access_token or code to the parent opener window
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Facebook Login - OrderFlow BD</title>
  <style>
    body {
      background: #0a0c12;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #121624;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 32px 40px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(24, 119, 242, 0.2);
      border-top-color: #1877f2;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600;">ফেসবুক কানেক্ট হচ্ছে...</h3>
    <p style="margin: 0; color: #94a3b8; font-size: 13px;">অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন, উইন্ডোটি বন্ধ হয়ে যাবে</p>
  </div>
  <script>
    (function() {
      try {
        var hash = window.location.hash ? window.location.hash.substring(1) : '';
        var search = window.location.search ? window.location.search.substring(1) : '';
        var params = new URLSearchParams(hash || search);
        var accessToken = params.get('access_token');
        var error = params.get('error_description') || params.get('error');

        if (window.opener) {
          if (accessToken) {
            window.opener.postMessage({ type: 'FB_OAUTH_TOKEN', accessToken: accessToken }, '*');
          } else if (error) {
            window.opener.postMessage({ type: 'FB_OAUTH_TOKEN', error: error }, '*');
          }
        }
        setTimeout(function() {
          window.close();
        }, 800);
      } catch(e) {
        console.error('OAuth postMessage error:', e);
      }
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
