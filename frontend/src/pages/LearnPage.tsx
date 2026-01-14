import React, { useState } from 'react';
import { austinInvasivePlants } from '../data/invasivePlants';
import { localResources } from '../data/resources';
import PlantCard from '../components/PlantCard';
import ResourceCard from '../components/ResourceCard';

interface LearnPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'learn' | 'loading' | 'chat') => void;
}

type LearnSection = 'local-focus' | 'resources' | 'homeowners';

function LearnPage({ setCurrentPage }: LearnPageProps) {
  const [activeSection, setActiveSection] = useState<LearnSection>('local-focus');

  const sections: { id: LearnSection; title: string; icon: string }[] = [
    { id: 'local-focus', title: 'Local Focus', icon: '' },
    { id: 'resources', title: 'Resources', icon: '' },
    { id: 'homeowners', title: 'What You Can Do', icon: '' },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'local-focus':
        return (
          <div className="learn-section-content">
            <h2>Local Austin/Travis County Focus</h2>
            <div className="content-intro">
              <p>Learn about the most problematic invasive plants in our area and how to identify and manage them.</p>
            </div>

            <div className="plants-grid">
              {austinInvasivePlants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>

            <div className="additional-info">
              <div className="info-card">
                <h3> Balcones Canyonlands Preserve</h3>
                <p>Our local preserve faces unique challenges from invasive species that threaten endangered species habitats. Conservation efforts focus on:</p>
                <ul>
                  <li>Protecting golden-cheeked warbler and black-capped vireo habitats</li>
                  <li>Managing invasive species in sensitive karst ecosystems</li>
                  <li>Restoring native plant communities</li>
                  <li>Monitoring water quality impacts</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div className="learn-section-content">
            <h2>Resources and Programs</h2>
            <div className="content-intro">
              <p>Access local programs, guides, and organizations that can help you manage invasive species and restore native habitats.</p>
            </div>

            <div className="resources-grid">
              {localResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        );

      case 'homeowners':
        return (
          <div className="learn-section-content">
            <h2>What Homeowners Can Do</h2>
            <div className="content-grid">
              <div className="content-card">
                <h3> Step 1: Identification</h3>
                <p>Learn to recognize common invasive plants in your yard using our identification guides and photo references.</p>
              </div>
              <div className="content-card">
                <h3> Step 2: Proper Removal</h3>
                <p>Safe and effective methods for removing invasive plants, including when to use herbicides and mechanical removal.</p>
              </div>
              <div className="content-card">
                <h3> Step 3: Disposal</h3>
                <p>How to properly dispose of invasive plant material to prevent spreading seeds and fragments.</p>
              </div>
              <div className="content-card">
                <h3> Step 4: Replacement</h3>
                <p>Planting native alternatives and maintaining your new landscape with seasonal care tips.</p>
              </div>
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <section className="learn-section">
      <div className="container">
        <div className="learn-header">
          <h1>Learn About Invasive Plants</h1>
          <p className="subtitle">
            Comprehensive resources to help you understand, identify, and manage invasive species in your community.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="learn-tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`learn-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="tab-icon">{section.icon}</span>
              <span className="tab-label">{section.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="learn-content">
          {renderSectionContent()}
        </div>

        {/* Call to Action */}
        <div className="learn-cta">
          <h3>Ready to Take Action?</h3>
          <p>Use our scanning feature to identify invasive plants in your area and contribute to conservation efforts.</p>
          <button
            className="button primary-button"
            onClick={() => setCurrentPage('upload')}
          >
            <span className="button-icon"></span>
            <span className="button-text">Start Scanning Plants</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default LearnPage;