Write-Host "====================================" -ForegroundColor Green
Write-Host "   Visitor App Mobile Launcher" -ForegroundColor Green  
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "1. Starting Backend Server..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d d:\PROJECT\Internship\backend && node index.js" -WindowStyle Normal
Write-Host "Backend server started in new window" -ForegroundColor Green

Write-Host "2. Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "3. Starting Metro Bundler..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d d:\PROJECT\Internship\VisitorApp && npx react-native start" -WindowStyle Normal
Write-Host "Metro bundler started in new window" -ForegroundColor Green

Write-Host "4. Waiting for Metro to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "5. Running App on Android Device..." -ForegroundColor Yellow
Set-Location "d:\PROJECT\Internship\VisitorApp"
npx react-native run-android

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "App should now be running on device!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Metro: http://localhost:8081" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Green

Read-Host "Press Enter to exit"
