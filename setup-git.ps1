# Git Setup Script for IPSM Web Project - PowerShell Version

Write-Host "🚀 Setting up Git repository for IPSM Web..." -ForegroundColor Green

# Initialize Git repository
git init

# Configure Git user (using memory settings)  
git config user.name "IPSM Developer"
git config user.email "developer@ipsmweb.com"

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: IPSM Web full-stack application

- Frontend: React + Vite with complete UI structure
- Backend: Node.js + Express + MongoDB API  
- Features: Project management, task tracking, dashboard
- Authentication: JWT-based auth with role management
- Database: MongoDB Atlas integration
- Security: Comprehensive middleware and validation"

# Add remote repository
git remote add origin https://github.com/MadushaLiyanage/ISPM_Web.git

# Push to GitHub
git branch -M main
git push -u origin main

Write-Host "✅ Git repository setup completed!" -ForegroundColor Green
Write-Host "📊 Repository URL: https://github.com/MadushaLiyanage/ISPM_Web.git" -ForegroundColor Cyan