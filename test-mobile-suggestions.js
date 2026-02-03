// Simple test script to verify mobile number suggestion functionality
const express = require("express");
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Test mobile number suggestions endpoint
app.get("/api/visitors/phone-suggestions/:query", (req, res) => {
  const { query } = req.params;
  console.log('Getting phone suggestions for:', query);

  // Sample suggestions for testing
  const suggestions = [
    {
      id: 'test-1',
      phone: '9876543210',
      full_name: 'John Doe',
      email: 'john@example.com',
      organization: 'Tech Corp',
      designation: 'Software Engineer',
      city: 'Bangalore',
      country: 'India',
      match_priority: 1
    },
    {
      id: 'test-2', 
      phone: '9123456789',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      organization: 'Design Inc',
      designation: 'UX Designer',
      city: 'Mumbai',
      country: 'India',
      match_priority: 2
    }
  ];

  // Filter suggestions based on query
  const filteredSuggestions = suggestions.filter(suggestion => {
    const cleanPhone = suggestion.phone.replace(/[\s\-\(\)]/g, '');
    const cleanQuery = query.replace(/[\s\-\(\)]/g, '');
    return cleanPhone.startsWith(cleanQuery);
  });

  res.status(200).json({
    suggestions: filteredSuggestions,
    query: query.replace(/[\s\-\(\)]/g, ''),
    total_found: filteredSuggestions.length
  });
});

// Test check phone endpoint
app.get("/api/visitors/check-phone/:phone", (req, res) => {
  const { phone } = req.params;
  console.log('Checking phone:', phone);

  // Clean phone number
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Test data
  if (cleanPhone === '9876543210') {
    res.status(200).json({
      visitor: {
        id: 'test-1',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        organization: 'Tech Corp',
        designation: 'Software Engineer',
        city: 'Bangalore',
        country: 'India'
      },
      exists: true,
      match_type: 'exact'
    });
  } else {
    res.status(200).json({
      visitor: null,
      exists: false,
      match_type: 'none'
    });
  }
});

// Test exists endpoint
app.get("/api/visitors/exists/:phone", (req, res) => {
  const { phone } = req.params;
  console.log('Checking if visitor exists:', phone);

  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Test logic
  const exists = cleanPhone === '9876543210' || cleanPhone === '9123456789';
  const exactMatch = cleanPhone === '9876543210';

  res.status(200).json({
    exists: exists,
    exact_match: exactMatch,
    count: exists ? 1 : 0,
    phone_checked: cleanPhone
  });
});

const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test endpoints available:`);
  console.log(`  - GET /api/visitors/phone-suggestions/:query`);
  console.log(`  - GET /api/visitors/check-phone/:phone`);
  console.log(`  - GET /api/visitors/exists/:phone`);
});
