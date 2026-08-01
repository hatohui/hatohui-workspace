import { GoogleLoginButton, useAuth } from '@hatohui/libs';

function App() {
  const { user, logout } = useAuth();

  return (
    <main>
      {user ? (
        <button onClick={() => void logout()}>Log out ({user.name})</button>
      ) : (
        <GoogleLoginButton />
      )}
    </main>
  );
}

export default App;
