import { useMessages } from '@hatohui/models';
import { GoogleLoginButton, useAuth } from '@hatohui/libs';

function App() {
  const { data: messages, isLoading, isError } = useMessages();
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>Messages</h1>
      {user ? (
        <button onClick={() => void logout()}>Log out ({user.name})</button>
      ) : (
        <GoogleLoginButton />
      )}
      {isLoading && <p>Loading...</p>}
      {isError && <p>Failed to load messages.</p>}
      <ul>
        {messages?.data.map((message) => (
          <li key={message.id}>
            <p>{message.text}</p>
            <time>{new Date(message.createdAt).toLocaleString()}</time>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
