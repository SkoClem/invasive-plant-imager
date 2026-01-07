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