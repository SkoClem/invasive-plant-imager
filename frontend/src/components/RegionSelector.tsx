import React, { useState, useRef, useEffect } from 'react';
import { regionsData, Country } from '../data/regions';

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

function RegionSelector({ selectedRegion, onRegionChange }: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [countries] = useState<Country[]>(regionsData.countries);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update available regions when country changes
  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find(c => c.name === selectedCountry);
      setAvailableRegions(country ? country.regions : []);
    } else {
      setAvailableRegions([]);
    }
  }, [selectedCountry, countries]);

  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
    // Reset region selection when country changes
    onRegionChange('');
  };

  const handleRegionSelect = (regionName: string) => {
    const fullRegion = `${selectedCountry}, ${regionName}`;
    onRegionChange(fullRegion);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!selectedRegion) return 'Select Region';
    return selectedRegion;
  };

  return (
    <div className="region-selector" ref={dropdownRef}>
      <button
        className="region-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="region-selector-content">
          <svg
            className="region-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span className="region-text">{getDisplayText()}</span>
        </div>
        <svg
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="region-dropdown">
          <div className="dropdown-section">
            <h3 className="dropdown-title">Country</h3>
            <div className="dropdown-list">
              {countries.map((country) => (
                <button
                  key={country.name}
                  className={`dropdown-item ${selectedCountry === country.name ? 'selected' : ''}`}
                  onClick={() => handleCountrySelect(country.name)}
                >
                  {country.name}
                </button>
              ))}
            </div>
          </div>

          {selectedCountry && availableRegions.length > 0 && (
            <div className="dropdown-section">
              <h3 className="dropdown-title">Region/State</h3>
              <div className="dropdown-list regions-list">
                {availableRegions.map((region) => (
                  <button
                    key={region}
                    className="dropdown-item"
                    onClick={() => handleRegionSelect(region)}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RegionSelector;