param (
    [string]$HOSTNAME
)

clear
Import-Module $PSScriptRoot\deployment-support.ps1 -Force

if ([string]::IsNullOrEmpty($HOSTNAME)) {
    Write-Host "HOSTNAME parameter is required." -ForegroundColor Red
    Exit 1
}

# Check connection
Write-Host "Testing connection to $HOSTNAME..." -ForegroundColor Yellow
$testConnectionStatus = Test-Connection -TargetName $HOSTNAME -IPv4 -Count 1
If($testConnectionStatus.Status -ne "Success")
{
    Write-Host "Failed to connect to the device ${HOSTNAME}." -ForegroundColor Red
    Write-Host

    Exit 1
}
Write-Host "Connection with the device $HOSTNAME was established!" -ForegroundColor Green
Write-Host

# Wifisetup'...
Write-Host "Wifisetup..." -ForegroundColor Yellow
ssh ${ACCOUNT}@${HOSTNAME} wifisetup
Start-Sleep -Seconds 2
Write-Host

Write-Host "Updating OS package maneger sources and instal Python ${HOSTNAME}..."  -ForegroundColor Yellow
ssh ${ACCOUNT}@${HOSTNAME} "opkg update"
$packages = @("python3-light", "python3-spidev", "python3-pip")
foreach ($package in $packages) {
    ssh ${ACCOUNT}@${HOSTNAME} "opkg install $package"
}

Write-Host "Updating OS completed successfully!" -ForegroundColor Green
