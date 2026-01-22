# EAS Secrets Setup Script
# Bu script .env dosyasindaki tüm environment variable'lari EAS Secrets'a ekler
# ⚠️ BU SCRIPT HARDCODED SECRET ICERMEZ - .env'den dinamik okur

Write-Host "🔐 EAS Secrets Setup" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

# .env dosyasini oku
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Make sure you have a .env file in the frontend directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📄 Reading .env file..." -ForegroundColor Yellow

# .env dosyasindan key-value cikar
$envContent = Get-Content $envFile
$secrets = @{}

foreach ($line in $envContent) {
    # Yorum ve bos satirlari atla
    if ($line -match "^#" -or [string]::IsNullOrWhiteSpace($line)) {
        continue
    }
    
    # KEY=VALUE formatini parse et
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Cift tirnak varsa kaldir
        $value = $value -replace '^"(.*)"$', '$1'
        $value = $value -replace "^'(.*)'$", '$1'
        
        $secrets[$key] = $value
        Write-Host "  ✓ Found: $key" -ForegroundColor Gray
    }
}

if ($secrets.Count -eq 0) {
    Write-Host "❌ No secrets found in .env file!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Pushing $($secrets.Count) secrets to EAS..." -ForegroundColor Yellow
Write-Host "   This will overwrite existing secrets with the same name`n" -ForegroundColor DarkGray

$successCount = 0
$failCount = 0

foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    Write-Host "  → $key... " -NoNewline -ForegroundColor Gray
    
    try {
        # Yeni secret ekle (--force ile ustune yazar)
        $result = eas secret:create --name $key --value $value --scope project --force 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "✗" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n===================" -ForegroundColor Cyan
Write-Host "📊 Results:" -ForegroundColor Cyan
Write-Host "   ✓ Success: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "   ✗ Failed:  $failCount" -ForegroundColor Red
}
Write-Host "`n📋 Verify with: eas secret:list" -ForegroundColor Cyan
