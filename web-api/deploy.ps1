Import-Module $PSScriptRoot\..\deployment-support.ps1 -Force

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
Write-Host "Bump up '$WEB_API_APP_NAME' build version before delpoyment ($buildDateTimeMark)..." -ForegroundColor Green
Set-AppVersion `
    -RelativePath "./src/routers/default_router.py" `
    -SearchPattern "Eta Regulator Board Web API" `
    -Substitution "        message='Eta Regulator Board Web API v.0.1.${buildDateTimeMark}'"
Start-Sleep -Seconds 2
Write-Host


# Sync date&time on OpenWrt OS
Sync-DateTime


# Initializing the app folders
Initialize-AppFolder `
    -AppRootFolder "/web-api/src"


# Shutting down 'eta-regulator-board-web-api' and removing orignal files...
Write-Host "Shutting down '$WEB_API_APP_NAME' and removing orignal files..."  -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} "wget --post-data='security_pass=onioneer' ${WEB_API_SHUTDOWN_ENDPOINT}"
ssh ${ACCOUNT}@${IPADDR} "rm -rf ${APP_ROOT}/web-api/src/"
Start-Sleep -Seconds 2
Write-Host


# Deleting compiled Python version dependent modules...
Write-Host "Deleting compiled Python version dependent modules..."  -ForegroundColor Green
Get-ChildItem -Path "./src" -Recurse -Include "__pycache__" | Remove-Item -Force -Recurse
Start-Sleep -Seconds 2
Write-Host


# Copying updated files...
Write-Host "Copying updated files..." -ForegroundColor Green
scp -r src ./startup.sh ./requirements.txt ./runtime.txt ${ACCOUNT}@${IPADDR}:${APP_ROOT}/web-api
Start-Sleep -Seconds 2
Write-Host


# Adding the ability to startup the application after OS reboot...
Write-Host "Adding the ability to startup '$WEB_API_APP_NAME' after OS reboot..." -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} 'chmod 755 /etc/rc.local'
ssh ${ACCOUNT}@${IPADDR} "echo -e '#!/bin/sh -e\n\ncd ${APP_ROOT}/web-api/\n\nsh ""startup.sh""\n\nexit 0\n\n# ${WEB_API_APP_NAME} date&time build mark ${buildDateTimeMark}' > /etc/rc.local"
Start-Sleep -Seconds 2
Write-Host

# problem!
# ssh root@${IPADDR} "cd ${APP_ROOT}/web-api/;python3 -m venv --copies .venv"
# ssh root@${IPADDR} "cd ${APP_ROOT}/web-api/;source .venv/bin/activate;python3 -m pip install -r requirements.txt"


# Installing dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
ssh root@${IPADDR} "cd ${APP_ROOT}/web-api/;python3 -m pip install -r requirements.txt"
Start-Sleep -Seconds 2
Write-Host


# Compiling to byte for python specific version
Write-Host "Compiling to byte for python specific version..." -ForegroundColor Green
ssh root@${IPADDR} "cd ${APP_ROOT}/web-api/; python3 -m compileall -b src"
Start-Sleep -Seconds 2
Write-Host


# Launching 'eta-regulator-board-web-api...
Write-Host "Launching '$WEB_API_APP_NAME'..." -ForegroundColor Green
ssh root@${IPADDR} "cd ${APP_ROOT}/web-api/; sh startup.sh"
