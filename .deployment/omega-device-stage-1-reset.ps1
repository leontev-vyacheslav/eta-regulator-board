param (
    [string]$HOSTNAME
)

clear
Import-Module $PSScriptRoot\deployment-support.ps1 -Force

if ([string]::IsNullOrEmpty($HOSTNAME)) {
    Write-Host "HOSTNAME parameter is required." -ForegroundColor Red
    Exit 1
}

Write-Host "Revoking the existed fingerprints for ${HOSTNAME}..." -ForegroundColor Yellow
ssh-keygen -R "$HOSTNAME" -f "$HOME/.ssh/known_hosts"
ssh-keygen -R "192.168.3.1" -f "$HOME/.ssh/known_hosts"
Write-Host

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

# Shutting down 'eta-regulator-board-web-ui'...
Write-Host "Stopping UHTTPD web server ('$WEB_UI_APP_NAME')..." -ForegroundColor Yellow
try {
    $null = ssh ${ACCOUNT}@${HOSTNAME} '/etc/init.d/uhttpd stop 2>/dev/null'
    Start-Sleep -Seconds 2
    Write-Host "UHTTPD web server stopped successfully." -ForegroundColor Green
} catch {
    Write-Host "Warning: Failed to stop UHTTPD web server. It might not be running." -ForegroundColor Yellow
}
Write-Host

# Shutting down 'eta-regulator-board-web-api'...
Write-Host "Stopping '$WEB_API_APP_NAME' app..." -ForegroundColor Yellow
try {
    $pidFile = "${WORKSPACE_ROOT}/web-api/src/PID_FILE"
    $null = ssh ${ACCOUNT}@${HOSTNAME} "[ -f '$pidFile' ] && kill `$(cat '$pidFile') || echo 'PID file not found'"
    Start-Sleep -Seconds 2
    Write-Host "'$WEB_API_APP_NAME' service stopped successfully." -ForegroundColor Green
} catch {
    Write-Host "Warning: Failed to stop '$WEB_API_APP_NAME' service. It might not be running." -ForegroundColor Yellow
}
Write-Host

# Removing orignal files...
Write-Host "Removing orignal files..."  -ForegroundColor Yellow
ssh ${ACCOUNT}@${HOSTNAME} "rm -rf ${WORKSPACE_ROOT}"
Start-Sleep -Seconds 2
Write-Host

# Prepare for system reboot
Write-Host "Preparing for system reboot..." -ForegroundColor Yellow
try {
    $null = ssh ${ACCOUNT}@${HOSTNAME} "firstboot -y && sync && reboot &"
    Write-Host "System reset prepared. Rebooting..." -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to prepare for reboot." -ForegroundColor Red
    Exit 1
}
Write-Host

Write-Host "Cleanup and reset operations completed successfully!" -ForegroundColor Green
