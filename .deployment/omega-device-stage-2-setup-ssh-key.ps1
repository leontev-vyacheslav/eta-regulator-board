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

# Revoking existed fingerprint
Write-Host "Revoking the existed fingerprints for ${HOSTNAME}..." -ForegroundColor Yellow
ssh-keygen -R "$HOSTNAME" -f "$HOME/.ssh/known_hosts"
ssh-keygen -R "192.168.3.1" -f "$HOME/.ssh/known_hosts"
Start-Sleep -Seconds 2
Write-Host


# Key management
$rsaPubKeyPath = "$HOME\.ssh\id_rsa.pub"
$rsaKeyPath = "$HOME\.ssh\id_rsa"

# Check for existing key pair
Write-Host "Check existing public key" -ForegroundColor Yellow
if (-not (Test-Path $rsaPubKeyPath) -or -not (Test-Path $rsaKeyPath)) {
    Write-Host "No RSA key pair found. Generating new SSH key..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $rsaKeyPath -N '""' -q
    Write-Host "New SSH key generated at $rsaKeyPath" -ForegroundColor Green
} else {
    Write-Host "Using existing public key: $rsaPubKeyPath" -ForegroundColor Green
    Get-Content $rsaPubKeyPath
}
Write-Host

# Configuring SSH access on device and preparing remote authorized_keys file
Write-Host "Configuring SSH access on $HOSTNAME..." -ForegroundColor Yellow
$sshCommand = @"
mkdir -p /etc/dropbear/ &&
chmod 700 /etc/dropbear/ &&
touch /etc/dropbear/authorized_keys &&
chmod 600 /etc/dropbear/authorized_keys
"@
$null = ssh ${ACCOUNT}@${HOSTNAME} $sshCommand
Write-Host

# SSH public key copy
Write-Host "Copying existed the development machine public key to ${HOSTNAME}..." -ForegroundColor Green
$pubKeyContent = Get-Content $rsaPubKeyPath -Raw
$null = ssh ${ACCOUNT}@${HOSTNAME} "echo '$pubKeyContent' > /etc/dropbear/authorized_keys && chmod 600 /etc/dropbear/authorized_keys"
Start-Sleep -Seconds 2
Write-Host

# Verify SSH key access
Write-Host "Verifying SSH key access..." -ForegroundColor Yellow
$verification = ssh -o PasswordAuthentication=no ${ACCOUNT}@${HOSTNAME} "echo 'SSH key authentication successful!'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "SSH key authentication failed!" -ForegroundColor Red
    Exit 1
}
Write-Host $verification -ForegroundColor Green
Write-Host

# Sync date/time
Write-Host "Synchronizing date and time..." -ForegroundColor Yellow
Sync-DateTime $HOSTNAME
Write-Host

