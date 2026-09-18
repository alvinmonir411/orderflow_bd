declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

export const FACEBOOK_APP_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1791959961818599';

export const FACEBOOK_REQUIRED_SCOPES = [
  'pages_show_list',
  'pages_messaging',
  'pages_manage_metadata',
  'public_profile',
].join(',');

let isSdkLoading = false;
let sdkLoadedPromise: Promise<boolean> | null = null;

export function loadFacebookSdk(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  if (window.FB) {
    return Promise.resolve(true);
  }

  if (sdkLoadedPromise) {
    return sdkLoadedPromise;
  }

  sdkLoadedPromise = new Promise((resolve) => {
    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v20.0',
        });
        resolve(true);
      } catch (err) {
        console.warn('[Facebook SDK Init Error]:', err);
        resolve(false);
      }
    };

    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      js.onerror = () => {
        console.warn('[Facebook SDK Script Load Failed (Likely Adblocker)]');
        resolve(false);
      };
      document.body.appendChild(js);
    }
  });

  return sdkLoadedPromise;
}

export interface FacebookLoginResult {
  success: boolean;
  accessToken?: string;
  userId?: string;
  error?: string;
}

export async function loginWithFacebookPopup(): Promise<FacebookLoginResult> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window is not defined' };
  }

  // Use direct OAuth Dialog Popup to avoid "JSSDK Option is Not Toggled" restrictions
  return launchOAuthPopupFallback();
}

function launchOAuthPopupFallback(): Promise<FacebookLoginResult> {
  return new Promise((resolve) => {
    const redirectUri =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'https://orderflowbd.vercel.app/api/facebook/oauth-callback'
        : `${window.location.origin}/api/facebook/oauth-callback`;
    const oauthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=${FACEBOOK_REQUIRED_SCOPES}&response_type=token&auth_type=rerequest&display=popup`;

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    let isResolved = false;
    let interval: any = null;

    const cleanup = () => {
      if (messageListener) {
        window.removeEventListener('message', messageListener);
      }
      if (interval) {
        clearInterval(interval);
      }
    };

    const done = (result: FacebookLoginResult) => {
      if (isResolved) return;
      isResolved = true;
      cleanup();
      try {
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (e) {}
      resolve(result);
    };

    const messageListener = (event: MessageEvent) => {
      if (event.data && event.data.type === 'FB_OAUTH_TOKEN') {
        if (event.data.accessToken) {
          done({ success: true, accessToken: event.data.accessToken });
        } else if (event.data.error) {
          done({ success: false, error: event.data.error || 'লগইন বাতিল করা হয়েছে' });
        }
      }
    };

    window.addEventListener('message', messageListener);

    const popup = window.open(
      oauthUrl,
      'FacebookLoginPopup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
    );

    if (!popup) {
      cleanup();
      return resolve({
        success: false,
        error: 'পপ-আপ উইন্ডোটি ব্রাউজার দ্বারা ব্লক করা হয়েছে। অনুগ্রহ করে ব্রাউজারে পপ-আপ অন করুন।',
      });
    }

    interval = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          done({ success: false, error: 'লগইন উইন্ডো বন্ধ করা হয়েছে' });
          return;
        }

        // Try reading hash if popup navigated to our origin
        if (popup.location && popup.location.origin === window.location.origin) {
          const hash = popup.location.hash.substring(1);
          const search = popup.location.search.substring(1);
          const params = new URLSearchParams(hash || search);
          const accessToken = params.get('access_token');
          if (accessToken) {
            done({ success: true, accessToken });
          }
        }
      } catch (crossOriginErr) {
        // Expected while navigating on facebook.com until callback
      }
    }, 500);
  });
}
