import React from 'react';

interface AboutPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'learn' | 'loading' | 'chat') => void;
}

function AboutPage({ setCurrentPage }: AboutPageProps) {
  return (
    <section className="about-section">
      <div className="container">
        <h1>About This Project</h1>
        <p className="subtitle">
          A tool designed to help users learn about and recognize invasive plant species.
        </p>

        <div className="about-content">
          <div className="about-text">
            <h2>Why This Exists</h2>
            <p>
              Invasive plant species can disrupt local ecosystems, reduce biodiversity, and make it harder for native
              plants to survive. Identifying these species early is an important step in managing their spread, but
              doing so often requires specialized knowledge.
            </p>
            <p>
              This project was created to make basic invasive plant identification more accessible to students,
              hobbyists, and community members who may not have a background in botany or ecology.
            </p>

            <h2>What It Does</h2>
            <p>
              The platform allows users to upload photos of plants and receive an identification suggestion based on a
              machine learning model trained on labeled plant images. When possible, it also provides general
              information about whether a species is considered invasive and why it may be harmful in certain regions.
            </p>
            <p>
              Results are intended for educational purposes and should not replace expert verification or official
              guidance from local environmental agencies.
            </p>

            <h2>Economic & Ecological Impact</h2>
            <div className="impact-details" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
              <p>
                Invasive species are not just a nuisance; they are a significant economic burden. In the United States alone, 
                invasive species cost the economy an estimated <strong>$120 billion annually</strong> in lost agricultural yields, 
                infrastructure damage, and direct control costs.
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '1rem 0' }}>
                <li><strong>Agriculture:</strong> Invasive weeds compete with crops for nutrients and water, reducing yields and requiring expensive herbicide applications.</li>
                <li><strong>Infrastructure:</strong> Plants like Kudzu and Japanese Knotweed can damage roads, foundations, and utility lines.</li>
                <li><strong>Real Estate:</strong> Infestations can lower property values and increase maintenance costs for homeowners.</li>
              </ul>
              <p>
                By identifying and reporting invasive plants early, we can help reduce these costs. Prevention and early detection 
                are far more cost-effective than managing established infestations.
              </p>
            </div>

            <h2>Project Goals</h2>
            <p>
              The goal of this project is to explore how machine learning can support environmental awareness and
              education. Over time, the project may expand to include more species, improved accuracy, and clearer
              regional context for invasive classifications.
            </p>
          </div>

          <div className="about-image">
            <div
              className="image-placeholder"
              style={{
                backgroundColor: 'var(--container-bg)',
                height: '300px',
                borderRadius: 'var(--radius-card)',
              }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;