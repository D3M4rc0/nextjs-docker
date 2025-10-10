import { notFound } from 'next/navigation'

// Artificial delay to simulate API call or data fetching
async function fetchPageData(id: string): Promise<{ id: string; delay: number }> {
  const delay = Math.floor(Math.random() * 200) + 200 // Random 200-400ms
  await new Promise(resolve => setTimeout(resolve, delay))
  
  return {
    id,
    delay
  }
}

// Generate static params for 2000 pages
export async function generateStaticParams() {
  // Generate IDs from 1 to 2000
  return Array.from({ length: 2000 }, (_, i) => ({
    id: String("page-" + (i + 1)),
  }))
}

// Generate metadata for each page
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Page ${params.id} - Next.js Docker Benchmark`,
    description: `Statically generated page ${params.id} with artificial build delay`,
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const pageId = parseInt(params.id)
  
  // Validate the ID is within range
  if (isNaN(pageId) || pageId < 1 || pageId > 2000) {
    notFound()
  }

  // Simulate fetching data with artificial delay
  const data = await fetchPageData(params.id)
  
  return (
    <main style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>📄 Page {params.id}</h1>
      
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1.5rem', 
        background: '#f0f9ff', 
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <h2>Page Information</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>Page ID:</strong> {data.id}</li>
          <li><strong>Build Delay:</strong> {data.delay}ms</li>
          <li><strong>Page Number:</strong> {pageId} of 2000</li>
          <li><strong>Progress:</strong> {((pageId / 2000) * 100).toFixed(2)}%</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          This page was statically generated at build time with an artificial 
          delay of {data.delay}ms to simulate real-world API calls or data fetching operations.
          This helps benchmark the Docker build process under realistic conditions.
        </p>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        {pageId > 1 && (
          <a 
            href={`/${pageId - 1}`}
            style={{ 
              padding: '0.5rem 1rem', 
              background: '#3b82f6', 
              color: 'white', 
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            ← Previous
          </a>
        )}
        {pageId < 2000 && (
          <a 
            href={`/${pageId + 1}`}
            style={{ 
              padding: '0.5rem 1rem', 
              background: '#3b82f6', 
              color: 'white', 
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Next →
          </a>
        )}
        <a 
          href="/"
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#6b7280', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px',
            marginLeft: 'auto'
          }}
        >
          🏠 Home
        </a>
      </div>
    </main>
  )
}

