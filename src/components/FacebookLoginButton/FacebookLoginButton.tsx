import { Button } from '@mantine/core';
import { IconBrandFacebook } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

declare global {
  interface Window {
    FB: any;
  }
}

interface FacebookLoginButtonProps {
  onSuccess: (accessToken: string) => void;
}

export const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({ onSuccess }) => {
  const initFacebookSDK = () => {
    // Load the Facebook SDK asynchronously
    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode?.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');

    window.FB?.init({
      appId: import.meta.env.VITE_FACEBOOK_APP_ID,
      cookie: true,
      xfbml: true,
      version: 'v18.0',
    });
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      initFacebookSDK();
    }

    window.FB?.login(
      (response: any) => {
        if (response.status === 'connected') {
          const accessToken = response.authResponse.accessToken;
          onSuccess(accessToken);
          notifications.show({
            title: 'Success',
            message: 'Successfully connected to Facebook',
            color: 'green',
          });
        } else {
          notifications.show({
            title: 'Error',
            message: 'Failed to connect to Facebook',
            color: 'red',
          });
        }
      },
      { scope: 'pages_manage_posts,pages_read_engagement' },
    );
  };

  return (
    <Button
      leftSection={<IconBrandFacebook size={16} />}
      onClick={handleFacebookLogin}
      variant="light"
      color="blue"
    >
      Connect Facebook Account
    </Button>
  );
};
