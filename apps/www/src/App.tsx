import { useMessages } from '@hatohui/models';

function App() {
  const { data: messages, isLoading, isError } = useMessages();

  return (
    <main>
      <h1>Messages</h1>
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
