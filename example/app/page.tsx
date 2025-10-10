import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>🚀 Next.js Docker Benchmark App</h1>
      <p>
        This is a benchmark application designed to test Docker build performance
        with 2000 statically generated pages.
      </p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>📊 App Characteristics</h2>
        <ul>
          <li><strong>Total Pages:</strong> 2001 (1 home + 2000 dynamic)</li>
          <li><strong>Build Delay:</strong> 200-400ms per page (simulated API call)</li>
          <li><strong>Total Build Time:</strong> ~6-13 minutes for initial build</li>
          <li><strong>Output:</strong> Next.js standalone mode</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>🔗 Sample Links</h2>
        <ul>
          <li><Link href="/1">Page 1</Link></li>
          <li><Link href="/100">Page 100</Link></li>
          <li><Link href="/500">Page 500</Link></li>
          <li><Link href="/1000">Page 1000</Link></li>
          <li><Link href="/2000">Page 2000</Link></li>
        </ul>
      </div>
    </main>
  )
}

