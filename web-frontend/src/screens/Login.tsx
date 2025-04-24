import { LoginAccountCard } from '@/components/login-account-card';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react'
import AmericaIcon from '../assets/angolaIcon.svg';

function Login() {
  const { onLogOut } = useAuth();

  useEffect(() => {
    onLogOut!();
  }, []);

  return (
    <div className='flex flex-col items-center justify-center gap-2 w-screen h-screen'>
      <img src={AmericaIcon} alt={"American Logo"} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: '-1', opacity: 0.6 }} width="65%" />
      <div className="flex flex-col items-center justify-center relative" style={{ height: "100%" }}>
        <LoginAccountCard />
      </div>
      <footer className="bg-gray-100 text-gray-400 text-center py-2 w-screen">
        <div>
          <span>&copy; {new Date().getFullYear()} Chainocracy, Abrar Ahmed. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

export default Login;
