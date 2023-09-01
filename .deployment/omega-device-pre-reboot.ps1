Import-Module $PSScriptRoot\deployment-support.ps1 -Force

# Check connection
$testConnectionStatus = Test-Connection -TargetName $IPADDR -IPv4 -Count 1
If($testConnectionStatus.Status -ne "Success")
{
    Write-Host "Failed to connect to the device ${IPADDR}." -ForegroundColor Red
    Write-Host

    Exit 1
}
Write-Host "Connection with the device was established!" -ForegroundColor Green
Write-Host

# Shutting down 'eta-regulator-board-web-ui'...
Write-Host "Shutdowning UHTTPD web server with '$WEB_UI_APP_NAME'..." -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} '/etc/init.d/uhttpd stop'
Start-Sleep -Seconds 2
Write-Host

# Shutting down 'eta-regulator-board-web-api'...
Write-Host "Shutting down '$WEB_API_APP_NAME' and removing orignal files..."  -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} "cd ${WORKSPACE_ROOT}/web-api/src;kill `$(cat PID_FILE)"
Start-Sleep -Seconds 2
Write-Host

# Removing orignal files...
Write-Host "Shutting down '$WEB_API_APP_NAME' and removing orignal files..."  -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} "rm -rf ${WORKSPACE_ROOT}"
Start-Sleep -Seconds 2
Write-Host

# Prepairing to a system reboot...
Write-Host "Prepairing to a system reboot..."  -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} "firstboot -y"
ssh ${ACCOUNT}@${IPADDR} "sync"
ssh ${ACCOUNT}@${IPADDR} "reboot"
