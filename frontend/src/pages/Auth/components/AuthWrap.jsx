import Bubbles from './Bubbles';
import { PAGE_BG } from './tokens';

function AuthWrap({ children }) {
  return (
    <div style={{
      minHeight: '100vh', paddingTop: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '56px 16px 16px', position: 'relative', background: PAGE_BG,
    }}>
      <Bubbles n={5} />
      <div style={{
        width: '100%', maxWidth: '380px', position: 'relative', zIndex: 10,
        animation: 'fadeInUp .4s ease-out'
      }}>
        {children}
      </div>
    </div>
  );
}

export default AuthWrap;
