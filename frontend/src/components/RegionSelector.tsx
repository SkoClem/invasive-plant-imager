import React, { useState, useRef, useEffect } from 'react';
import { regionsData, Country } from '../data/regions';

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

function RegionSelector({ selectedRegion, onRegionChange }: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'search' | 'browse'>('browse');
  const [countries] = useState<Country[]>(regionsData.countries);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<{country: string, region: string}[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Filter regions based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const results: {country: string, region: string}[] = [];
      countries.forEach(country => {
        country.regions.forEach(region => {
          const searchTermLower = searchTerm.toLowerCase();
          if (region.toLowerCase().includes(searchTermLower) ||
              country.name.toLowerCase().includes(searchTermLower)) {
            results.push({ country: country.name, region });
          }
        });
      });
      setFilteredRegions(results);
    } else {
      setFilteredRegions([]);
    }
  }, [searchTerm, countries]);

  // Focus search input when switching to search tab
  useEffect(() => {
    if (activeTab === 'search' && isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [activeTab, isOpen]);

  
  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
    // Reset region selection when country changes
    onRegionChange('');
  };

  const handleRegionSelect = (regionName: string, countryName?: string) => {
    const finalCountry = countryName || selectedCountry;
    const fullRegion = `${finalCountry}, ${regionName}`;
    onRegionChange(fullRegion);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchResultSelect = (countryName: string, regionName: string) => {
    setSelectedCountry(countryName);
    handleRegionSelect(regionName, countryName);
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const getDisplayText = () => {
    if (!selectedRegion) return 'Select Your Region';
    return selectedRegion;
  };

  const getSelectedCountryFlag = () => {
    if (!selectedCountry) return '';

    const flags: Record<string, string> = {
      'United States': '🇺🇸',
      'Canada': '',
      'Mexico': '',
      'Australia': '',
      'New Zealand': ''
    };

    return flags[selectedCountry] || '';
  };

  const getPopularRegions = () => {
    // Return popular/common regions for quick access
    return [
      { country: 'United States', region: 'California' },
      { country: 'United States', region: 'Texas' },
      { country: 'United States', region: 'Florida' },
      { country: 'United States', region: 'New York' },
      { country: 'Canada', region: 'Ontario' },
      { country: 'Canada', region: 'British Columbia' },
      { country: 'Australia', region: 'New South Wales' },
      { country: 'Australia', region: 'Victoria' },
    ];
  };

  return (
    <div className="region-selector enhanced" ref={dropdownRef}>
      <button
        className="region-selector-button enhanced"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="region-selector-content">
          <div className="region-icon-wrapper">
            <span className="country-flag">{getSelectedCountryFlag()}</span>
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
          </div>
          <div className="region-text-wrapper">
            <span className="region-text">{getDisplayText()}</span>
            {!selectedRegion && (
              <span className="region-hint">Choose your location for accurate plant identification</span>
            )}
          </div>
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
        <div className="region-dropdown enhanced">
          {/* Tab Navigation */}
          <div className="dropdown-tabs">
            <button
              className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              Browse
            </button>
            <button
              className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              Search
            </button>
          </div>

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="search-section">
              <div className="search-input-wrapper">
                <span className="search-icon"></span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search regions or countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button className="search-clear" onClick={clearSearch}>
                    ✕
                  </button>
                )}
              </div>

              {searchTerm && (
                <div className="search-results">
                  {filteredRegions.length === 0 ? (
                    <div className="no-results">
                      <span className="no-results-icon"></span>
                      <p>No regions found for "{searchTerm}"</p>
                      <p className="no-results-hint">Try searching for a state, province, or country</p>
                    </div>
                  ) : (
                    <>
                      <div className="results-count">
                        Found {filteredRegions.length} region{filteredRegions.length !== 1 ? 's' : ''}
                      </div>
                      <div className="dropdown-list search-list">
                        {filteredRegions.slice(0, 20).map(({ country, region }) => (
                          <button
                            key={`${country}-${region}`}
                            className="dropdown-item search-result-item"
                            onClick={() => handleSearchResultSelect(country, region)}
                          >
                            <span className="result-country-flag">
                              {country === 'United States' ? '🇺🇸' : ''}
                            </span>
                            <div className="result-content">
                              <span className="result-region">{region}</span>
                              <span className="result-country">{country}</span>
                            </div>
                            <span className="select-arrow">→</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Browse Tab */}
          {activeTab === 'browse' && (
            <>
              {/* Popular Regions */}
              <div className="dropdown-section">
                <h3 className="dropdown-title">
                  Popular Regions
                </h3>
                <div className="dropdown-list popular-list">
                  {getPopularRegions().map(({ country, region }) => (
                    <button
                      key={`popular-${country}-${region}`}
                      className="dropdown-item popular-item"
                      onClick={() => handleSearchResultSelect(country, region)}
                    >
                      <span className="popular-flag">
                        {country === 'United States' ? '🇺🇸' : ''}
                      </span>
                      <span className="popular-region">{region}</span>
                      <span className="popular-country">{country}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Countries List */}
              <div className="dropdown-section">
                <h3 className="dropdown-title">
                  Countries ({countries.length})
                </h3>
                <div className="dropdown-list countries-list">
                  {countries.map((country) => (
                    <button
                      key={country.name}
                      className={`dropdown-item country-item ${selectedCountry === country.name ? 'selected' : ''}`}
                      onClick={() => handleCountrySelect(country.name)}
                    >
                      <span className="country-flag-large">
                        {country.name === 'United States' ? '🇺🇸' : ''}
                      </span>
                      <span className="country-name">{country.name}</span>
                      <span className="region-count">{country.regions.length} regions</span>
                      {selectedCountry === country.name && (
                        <span className="selected-check">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regions Section */}
              {selectedCountry && availableRegions.length > 0 && (
                <div className="dropdown-section regions-section">
                  <h3 className="dropdown-title">
                    Regions in {selectedCountry}
                  </h3>
                  <div className="dropdown-list regions-list enhanced">
                    {availableRegions.map((region) => (
                      <button
                        key={region}
                        className="dropdown-item region-item"
                        onClick={() => handleRegionSelect(region)}
                      >
                        <span className="region-icon-small"></span>
                        <span className="region-name">{region}</span>
                        <span className="select-arrow">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default RegionSelector;