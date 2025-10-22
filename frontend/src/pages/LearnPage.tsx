import React, { useState } from 'react';
import { austinInvasivePlants } from '../data/invasivePlants';
import { localResources } from '../data/resources';
import { educationalMaterials, climateResilienceContent, communityImpactContent } from '../data/educationalContent';
import PlantCard from '../components/PlantCard';
import ResourceCard from '../components/ResourceCard';

interface LearnPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'learn' | 'loading' | 'results') => void;
}

type LearnSection = 'why-matter' | 'local-focus' | 'resources' | 'homeowners' | 'education';

function LearnPage({ setCurrentPage }: LearnPageProps) {
  const [activeSection, setActiveSection] = useState<LearnSection>('why-matter');

  const sections: { id: LearnSection; title: string; icon: string }[] = [
    { id: 'why-matter', title: 'Why They Matter', icon: '🌿' },
    { id: 'local-focus', title: 'Local Focus', icon: '📍' },
    { id: 'resources', title: 'Resources', icon: '📚' },
    { id: 'homeowners', title: 'What You Can Do', icon: '🏡' },
    { id: 'education', title: 'Education', icon: '🎓' },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'why-matter':
        return (
          <div className="learn-section-content">
            <h2>Why Invasive Plants Matter</h2>
            <div className="content-grid">
              <div className="content-card">
                <h3>🌍 Ecological Impact</h3>
                <p>Invasive species disrupt local ecosystems by outcompeting native plants, reducing biodiversity, and altering natural habitats.</p>
              </div>
              <div className="content-card">
                <h3>💧 Water Resources</h3>
                <p>Many invasive plants consume more water than native species, affecting local water availability and quality in sensitive areas like the Balcones Canyonlands Preserve.</p>
              </div>
              <div className="content-card">
                <h3>🦋 Wildlife Habitat</h3>
                <p>Native wildlife depends on specific native plants for food and shelter. Invasive species can eliminate these critical resources.</p>
              </div>
              <div className="content-card">
                <h3>💰 Economic Costs</h3>
                <p>Managing invasive species costs millions annually in control efforts, lost agricultural productivity, and damage to infrastructure.</p>
              </div>
            </div>
          </div>
        );

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
                <h3>🏞️ Balcones Canyonlands Preserve</h3>
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
                <h3>🔍 Step 1: Identification</h3>
                <p>Learn to recognize common invasive plants in your yard using our identification guides and photo references.</p>
              </div>
              <div className="content-card">
                <h3>🗑️ Step 2: Proper Removal</h3>
                <p>Safe and effective methods for removing invasive plants, including when to use herbicides and mechanical removal.</p>
              </div>
              <div className="content-card">
                <h3>♻️ Step 3: Disposal</h3>
                <p>How to properly dispose of invasive plant material to prevent spreading seeds and fragments.</p>
              </div>
              <div className="content-card">
                <h3>🌱 Step 4: Replacement</h3>
                <p>Planting native alternatives and maintaining your new landscape with seasonal care tips.</p>
              </div>
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="learn-section-content">
            <h2>Educational Content</h2>
            <div className="content-intro">
              <p>Educational resources for all ages to learn about invasive species, native plants, and environmental conservation.</p>
            </div>

            <div className="education-grid">
              {educationalMaterials.map((material) => (
                <div key={material.id} className="education-card">
                  <div className="education-header">
                    <h3>{material.title}</h3>
                    <span className="grade-level">{material.gradeLevel}</span>
                  </div>
                  <p className="education-description">{material.description}</p>
                  <div className="education-details">
                    <span className="duration">⏱️ {material.duration}</span>
                    <span className="type">{material.type}</span>
                  </div>
                  {material.objectives && (
                    <div className="objectives">
                      <h4>Learning Objectives:</h4>
                      <ul>
                        {material.objectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="climate-resilience-section">
              <h3>{climateResilienceContent.title}</h3>
              <div className="climate-grid">
                {climateResilienceContent.sections.map((section, index) => (
                  <div key={index} className="climate-card">
                    <h4>{section.title}</h4>
                    <p>{section.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="community-impact-section">
              <h3>{communityImpactContent.title}</h3>
              <div className="impact-grid">
                {communityImpactContent.sections.map((section, index) => (
                  <div key={index} className="impact-card">
                    <h4>{section.title}</h4>
                    <p>{section.content}</p>
                  </div>
                ))}
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
            <span className="button-icon">📸</span>
            <span className="button-text">Start Scanning Plants</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default LearnPage;