import React from 'react';
import { InvasivePlant } from '../data/invasivePlants';

interface PlantCardProps {
  plant: InvasivePlant;
  onLearnMore?: (plantId: string) => void;
}

function PlantCard({ plant, onLearnMore }: PlantCardProps) {
  return (
    <div className="plant-card">
      <div className="plant-card-header">
        <h3 className="plant-name">{plant.commonName}</h3>
        <span className="scientific-name">{plant.scientificName}</span>
      </div>

      <div className="plant-card-content">
        <p className="plant-description">{plant.description}</p>

        <div className="plant-details">
          <div className="detail-section">
            <h4>Identification Tips</h4>
            <ul>
              {plant.identificationTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h4>Impact</h4>
            <p>{plant.impact}</p>
          </div>

          <div className="detail-section">
            <h4>Control Methods</h4>
            <ul>
              {plant.controlMethods.map((method, index) => (
                <li key={index}>{method}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h4>Native Alternatives</h4>
            <div className="alternatives-list">
              {plant.nativeAlternatives.map((alternative, index) => (
                <div key={index} className="alternative-item">
                  <strong>{alternative.commonName}</strong>
                  <span className="scientific-name-small">{alternative.scientificName}</span>
                  <p>{alternative.description}</p>
                  <div className="benefits">
                    {alternative.benefits.map((benefit, benefitIndex) => (
                      <span key={benefitIndex} className="benefit-tag">{benefit}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {onLearnMore && (
          <button
            className="button secondary-button"
            onClick={() => onLearnMore(plant.id)}
          >
            Learn More
          </button>
        )}
      </div>
    </div>
  );
}

export default PlantCard;