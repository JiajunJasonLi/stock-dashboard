import { useEffect, useState } from 'react'
import './App.css'

type HealthResponse = {
  status: string;
  message: string;
};

function App() {

  const [data, setData] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/health")
      .then((response) => response.json())
      .then((data: HealthResponse) => setData(data))
      .catch((error) => console.error("API error:", error));
  }, []);

  return (
    <main>
      <h1>Stock Dashboard</h1>

      {data ? (
        <p>
          {data.status}: {data.message}
        </p>
      ) : (
        <p>Loading backend...</p>
      )}
    </main>
  )
}

export default App
