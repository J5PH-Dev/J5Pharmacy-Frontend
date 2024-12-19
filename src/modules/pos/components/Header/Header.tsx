import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import format from 'date-fns/format';
import logo from '../../assets/images/logo.png';

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '100%',
  padding: theme.spacing(1, 3),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const LogoSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '33%',
});

const Logo = styled('img')({
  height: '65px',
  width: 'auto',
  objectFit: 'contain',
});

const GreetingText = styled(Typography)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& .greeting': {
    fontWeight: 500,
    fontSize: '1.1rem',
    lineHeight: 1.2,
    color: theme.palette.text.primary,
  },
  '& .user': {
    fontWeight: 600,
    fontSize: '1.2rem',
    color: theme.palette.primary.main,
  },
}));

const CenterSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '34%',
});

const TimeText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '1.8rem',
  letterSpacing: '0.5px',
  lineHeight: 1,
  color: theme.palette.primary.main,
  [theme.breakpoints.up('sm')]: {
    fontSize: '2rem',
  },
}));

const DateText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.3rem',
  letterSpacing: '0.5px',
  opacity: 0.9,
  lineHeight: 1,
  color: theme.palette.text.secondary,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.5rem',
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  width: '33%',
  gap: theme.spacing(0.5),
}));

const StatusText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  letterSpacing: '0.5px',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.2rem',
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  letterSpacing: '0.5px',
  color: theme.palette.text.secondary,
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.2rem',
  },
}));

const Header: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [pharmacistInfo, setPharmacistInfo] = useState<any>(null);
  
  useEffect(() => {
    // Get pharmacist info from localStorage
    const storedPharmacist = localStorage.getItem('user');
    if (storedPharmacist) {
      setPharmacistInfo(JSON.parse(storedPharmacist));
    }

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };

    const updateDateTime = () => {
      setCurrentDateTime(new Date());
      setGreeting(getGreeting());
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <HeaderContainer>
      <LogoSection>
        <Logo 
          src={logo}
          alt="J5 Pharmacy Logo"
          loading="eager"
        />
        <GreetingText>
          <span className="greeting">{greeting},</span>
          <span className="user">{pharmacistInfo?.name || 'User'}</span>
        </GreetingText>
      </LogoSection>

      <CenterSection>
        <TimeText>
          {format(currentDateTime, 'hh:mm:ss a')}
        </TimeText>
        <DateText>
          {format(currentDateTime, 'MMMM dd, yyyy')}
        </DateText>
      </CenterSection>

      <RightSection>
        <StatusText sx={{ color: navigator.onLine ? 'success.main' : 'error.main' }}>
          System {navigator.onLine ? 'ONLINE' : 'OFFLINE'}
        </StatusText>
        <InfoLabel>
          Branch: {pharmacistInfo?.branch_name || 'Loading...'}
        </InfoLabel>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
