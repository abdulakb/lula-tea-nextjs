# PowerShell Script to Copy Logo
# This script helps you copy your logo file to the correct location

Write-Host "=== Lula Tea Logo Setup ===" -ForegroundColor Green
Write-Host ""

$sourceFolder = "C:\Users\akbah\Dev\Sandbox-python\Lula Tea\tea blend final-2_Folder"
$destinationFolder = "C:\Users\akbah\Dev\Sandbox-python\Lula Tea\public\images"
$destinationFile = "$destinationFolder\lula-tea-logo.png"

Write-Host "Looking for logo files in: $sourceFolder" -ForegroundColor Cyan
Write-Host ""

# Check if source folder exists
if (Test-Path $sourceFolder) {
    # Look for image files
    $imageFiles = Get-ChildItem -Path $sourceFolder -Recurse -Include *.png,*.jpg,*.jpeg,*.svg -ErrorAction SilentlyContinue
    
    if ($imageFiles.Count -gt 0) {
        Write-Host "Found $($imageFiles.Count) image file(s):" -ForegroundColor Yellow
        $imageFiles | ForEach-Object { Write-Host "  - $($_.Name)" }
        Write-Host ""
        
        # If there's a logo file, copy it
        $logoFile = $imageFiles | Where-Object { $_.Name -like "*logo*" -or $_.Name -like "*lula*" } | Select-Object -First 1
        
        if ($logoFile) {
            Write-Host "Copying logo: $($logoFile.Name)" -ForegroundColor Green
            Copy-Item -Path $logoFile.FullName -Destination $destinationFile -Force
            Write-Host "✓ Logo copied successfully to: $destinationFile" -ForegroundColor Green
        } else {
            Write-Host "No logo file found. Please manually copy your logo image to:" -ForegroundColor Yellow
            Write-Host "  $destinationFile" -ForegroundColor White
        }
    } else {
        Write-Host "⚠ No image files found in the folder." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please save your logo image as:" -ForegroundColor Cyan
        Write-Host "  $destinationFile" -ForegroundColor White
    }
} else {
    Write-Host "⚠ Source folder not found: $sourceFolder" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Manual Steps ===" -ForegroundColor Cyan
Write-Host "1. Save your logo image (the circular green logo) as:" -ForegroundColor White
Write-Host "   $destinationFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Recommended: Also save a 64x64px version as favicon:" -ForegroundColor White
Write-Host "   $destinationFolder\favicon.png" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. The website will automatically use your logo!" -ForegroundColor Green
Write-Host ""

# Open the images folder
Write-Host "Press any key to open the images folder..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
explorer.exe $destinationFolder
