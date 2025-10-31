import React from 'react';

interface AboutPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
}

function AboutPage({ setCurrentPage }: AboutPageProps) {
  return (
    <section className="about-section">
      <div className="container">
        <h1>About Our Mission</h1>
        <p className="subtitle">
          We're dedicated to helping communities identify and manage invasive plant species through accessible technology.
        </p>

        <div className="about-content">
          <div className="about-text">
            <h2>Our Story</h2>
            <p>
              InvasiScan was created by a team of environmental scientists and software engineers who recognized
              the need for an accessible tool to help people identify potentially harmful invasive plant species.
            </p>
            <p>
              Our mission is to empower communities with the knowledge they need to protect local ecosystems
              and biodiversity from the threat of invasive plants.
            </p>

            <h2>How It Works</h2>
            <p>
              Our platform uses advanced machine learning algorithms trained on thousands of plant images to accurately
              identify invasive species. Simply upload a photo, and our system will analyze it to determine if the plant
              is invasive and provide detailed information about it.
            </p>
          </div>

          <div className="about-image">
            <div className="image-placeholder" style={{backgroundColor: 'var(--container-bg)', height: '300px', borderRadius: 'var(--radius-card)'}}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;