Import-Module $PSScriptRoot\..\.deployment\deployment-support.ps1 -Force

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

# Bump up the app build version
Write-Host "Bump up '$DRIVER_APP_NAME' build version before delpoyment ($buildDateTimeMark)..." -ForegroundColor Green
Set-AppVersion `
    -RelativePath "./src/app.py" `
    -SearchPattern "APP_VERSION = " `
    -Substitution "APP_VERSION = 'v.0.1.${buildDateTimeMark}'"
Start-Sleep -Seconds 2
Write-Host


# Sync date&time on OpenWrt OS
Sync-DateTime


# Initializing the app folders
Initialize-AppFolder `
    -AppRootFolder "/driver/src"


# Removing orignal files...
Write-Host "Removing orignal files '$DRIVER_APP_NAME'..."  -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} "rm -rf ${APP_ROOT}/driver/src/"
Start-Sleep -Seconds 2
Write-Host


# Deleting compiled Python version dependent modules...
Write-Host "Deleting compiled Python version dependent modules..."  -ForegroundColor Green
Get-ChildItem -Path "./src" -Recurse -Include "__pycache__" | Remove-Item -Force -Recurse
Start-Sleep -Seconds 2
Write-Host


# Copying updated files...
Write-Host "Copying updated files..." -ForegroundColor Green
scp -r src ./startup.sh ${ACCOUNT}@${IPADDR}:${APP_ROOT}/driver
Start-Sleep -Seconds 2
Write-Host


# Adding the ability to startup the application after OS reboot...
Write-Host "Adding the ability to startup '$DRIVER_APP_NAME' after OS reboot..." -ForegroundColor Green
scp ../deployment/configs/rc.local ${ACCOUNT}@${IPADDR}:/etc/rc.local
ssh ${ACCOUNT}@${IPADDR} 'chmod 755 /etc/rc.local'
ssh ${ACCOUNT}@${IPADDR} "echo -e '# ${WEB_API_APP_NAME} date&time build mark ${buildDateTimeMark}' >> /etc/rc.local"
Start-Sleep -Seconds 2
Write-Host


# Compiling to bytecode for python specific version
Write-Host "Compiling to bytecode for python specific version..." -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} "cd ${APP_ROOT}/driver/; python3 -m compileall -b src"
Start-Sleep -Seconds 2
Write-Host


# Launching 'eta-regulator-board-driver...
Write-Host "Launching '$DRIVER_APP_NAME'..." -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} "cd ${APP_ROOT}/driver/; sh startup.sh"
