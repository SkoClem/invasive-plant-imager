export interface RegionData {
  countries: Country[];
}

export interface Country {
  name: string;
  regions: string[];
}

export const regionsData: RegionData = {
  countries: [
    {
      name: "United States",
      regions: [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
        "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
        "Wisconsin", "Wyoming"
      ]
    },
    {
      name: "Canada",
      regions: [
        "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
        "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
        "Quebec", "Saskatchewan", "Yukon"
      ]
    },
    {
      name: "Mexico",
      regions: [
        "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
        "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo",
        "Jalisco", "Mexico City", "Mexico State", "Michoacán", "Morelos", "Nayarit", "Nuevo León",
        "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora",
        "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
      ]
    },
    {
      name: "Australia",
      regions: [
        "Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland",
        "South Australia", "Tasmania", "Victoria", "Western Australia"
      ]
    },
    {
      name: "New Zealand",
      regions: [
        "Northland", "Auckland", "Waikato", "Bay of Plenty", "Gisborne", "Hawke's Bay",
        "Taranaki", "Manawatū-Whanganui", "Wellington", "Tasman", "Nelson", "Marlborough",
        "West Coast", "Canterbury", "Otago", "Southland"
      ]
    }
  ]
};