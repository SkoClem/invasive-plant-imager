import React from 'react';
import { Resource } from '../data/resources';

interface ResourceCardProps {
  resource: Resource;
}

function ResourceCard({ resource }: ResourceCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'program': return '📋';
      case 'guide': return '📖';
      case 'incentive': return '💵';
      case 'nursery': return '🏪';
      case 'organization': return '🏛️';
      default: return '📚';
    }
  };

  return (
    <div className="resource-card">
      <div className="resource-header">
        <div className="resource-type-icon">
          {getTypeIcon(resource.type)}
        </div>
        <div className="resource-title-section">
          <h3 className="resource-title">{resource.title}</h3>
          <span className="resource-type">{resource.type}</span>
        </div>
      </div>

      <div className="resource-content">
        <p className="resource-description">{resource.description}</p>

        {resource.benefits && resource.benefits.length > 0 && (
          <div className="benefits-section">
            <h4>Benefits:</h4>
            <ul>
              {resource.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {resource.eligibility && (
          <div className="eligibility-section">
            <h4>Eligibility:</h4>
            <p>{resource.eligibility}</p>
          </div>
        )}

        <div className="contact-info">
          {resource.url && (
            <div className="contact-item">
              <span className="contact-label">Website:</span>
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="contact-link">
                Visit Website
              </a>
            </div>
          )}

          {resource.phone && (
            <div className="contact-item">
              <span className="contact-label">Phone:</span>
              <a href={`tel:${resource.phone}`} className="contact-link">
                {resource.phone}
              </a>
            </div>
          )}

          {resource.address && (
            <div className="contact-item">
              <span className="contact-label">Address:</span>
              <span className="contact-text">{resource.address}</span>
            </div>
          )}

          {resource.hours && (
            <div className="contact-item">
              <span className="contact-label">Hours:</span>
              <span className="contact-text">{resource.hours}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceCard;