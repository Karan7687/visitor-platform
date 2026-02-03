const express = require("express");
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Test user data
const users = [
  {
    id: 1,
    full_name: "Test Employee",
    email: "employee@test.com",
    password: "password123",
    company_code: "TEST123",
    role: "employee"
  }
];

// Test visitor data
const visitors = [
  {
    id: 1,
    full_name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    organization: "Tech Corp",
    designation: "Software Engineer",
    city: "Bangalore",
    country: "India"
  },
  {
    id: 2,
    full_name: "Jane Smith", 
    email: "jane@example.com",
    phone: "9123456789",
    organization: "Design Inc",
    designation: "UX Designer",
    city: "Mumbai",
    country: "India"
  }
];

// User routes
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);
  
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ user: { id: user.id, full_name: user.full_name, email: user.email }, token: "test-token" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post('/api/users/register', (req, res) => {
  const { full_name, email, password, company_code } = req.body;
  console.log('Register:', full_name, email);
  
  const newUser = {
    id: users.length + 1,
    full_name,
    email,
    password,
    company_code,
    role: "employee"
  };
  
  users.push(newUser);
  res.json({ user: { id: newUser.id, full_name: newUser.full_name, email: newUser.email }, token: "test-token" });
});

// Visitor routes
app.get('/api/visitors/phone-suggestions/:query', (req, res) => {
  const { query } = req.params;
  console.log('Phone suggestions for:', query);
  
  const cleanQuery = query.replace(/[\s\-\(\)]/g, '');
  const suggestions = visitors.filter(v => {
    const cleanPhone = v.phone.replace(/[\s\-\(\)]/g, '');
    return cleanPhone.startsWith(cleanQuery);
  }).map(v => ({
    ...v,
    match_priority: v.phone === query ? 1 : 2
  }));
  
  res.json({ suggestions, query: cleanQuery, total_found: suggestions.length });
});

app.get('/api/visitors/check-phone/:phone', (req, res) => {
  const { phone } = req.params;
  console.log('Check phone:', phone);
  
  const visitor = visitors.find(v => v.phone === phone);
  if (visitor) {
    res.json({ visitor, exists: true, match_type: 'exact' });
  } else {
    res.json({ visitor: null, exists: false, match_type: 'none' });
  }
});

app.get('/api/visitors/exists/:phone', (req, res) => {
  const { phone } = req.params;
  console.log('Exists check:', phone);
  
  const exists = visitors.some(v => v.phone === phone);
  res.json({ exists, exact_match: exists, count: exists ? 1 : 0, phone_checked: phone });
});

app.post('/api/visitors', (req, res) => {
  const { full_name, email, phone, organization, designation, city, country, employee_id } = req.body;
  console.log('Register visitor:', full_name, phone);
  
  const newVisitor = {
    id: visitors.length + 1,
    full_name,
    email,
    phone,
    organization,
    designation,
    city,
    country
  };
  
  visitors.push(newVisitor);
  res.json({ message: 'Visitor registered successfully', visitor_id: newVisitor.id });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: "OK" });
});

const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📱 Mobile app can connect to: http://192.168.1.3:${PORT}`);
  console.log(`💻 Local access: http://localhost:${PORT}`);
});
