import React, { useContext } from 'react';
import { SocialIcon } from 'react-social-icons';
import { ThemeContext } from 'styled-components';
import useProfile from '../hooks/useProfile';

const styles = {
  iconStyle: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
};

function Social() {
  const theme = useContext(ThemeContext);
  const { data } = useProfile();
  const socialData = data.social;

  return (
    <div className="social">
      {socialData ? socialData.social.map((social) => (
        <SocialIcon
          key={social.network}
          style={styles.iconStyle}
          url={social.href}
          network={social.network}
          bgColor={theme.socialIconBgColor}
          fgColor={theme.background}
          target="_blank"
          rel="noopener"
        />
      )) : null}
    </div>
  );
}

export default Social;
