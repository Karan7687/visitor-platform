# Correct PowerShell Commands for Running the Visitor App

# Step 1: Navigate to VisitorApp directory
cd "d:\PROJECT\Internship\VisitorApp"

# Step 2: Start Metro Bundler (in separate PowerShell window)
npx react-native start

# Step 3: Run on Android Device (in another PowerShell window)
npx react-native run-android

# Alternative: Single command with proper spacing
cd "d:\PROJECT\Internship\VisitorApp"; npx react-native run-android

# Backend Server (in separate PowerShell window)
cd "d:\PROJECT\Internship\backend"
node index.js
