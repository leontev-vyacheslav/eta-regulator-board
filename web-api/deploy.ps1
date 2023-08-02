Import-Module ..\deployment-support.ps1 -Force

# Bump up the app build version
Write-Host "${GREEN}Bump up '$WEB_API_APP_NAME' build version before delpoyment ($buildDateTimeMark)...${RESET}"
Set-AppVersion `
    -RelativePath "./src/routers/default_router.py" `
    -SearchPattern "Eta Regulator Board Web API" `
    -Substitution "        message='Eta Regulator Board Web API v.0.1.${buildDateTimeMark}'"
Start-Sleep -Seconds 2
Write-Host


# Sync date&time on OpenWrt OS
Sync-DateTime


# Initializing the app folders
Init-AppFolder `
    -AppRootFolder "/web-api/src"


# Shutting down 'eta-regulator-board-web-api' and removing orignal files...
Write-Host "${GREEN}Shutting down '$WEB_API_APP_NAME' and removing orignal files...${RESET}"
ssh ${ACCOUNT}@${IPADDR} "wget --post-data='security_pass=onioneer' ${WEB_API_SHUTDOWN_ENDPOINT}"
ssh ${ACCOUNT}@${IPADDR} "rm -rf ${APP_ROOT}/web-api/src/"
Start-Sleep -Seconds 2
Write-Host


# Deleting compiled Python version dependent modules...
Write-Host "${GREEN}Deleting compiled Python version dependent modules...${RESET}"
Get-ChildItem -Path "./src" -Recurse -Include "__pycache__" | Remove-Item -Force -Recurse
Start-Sleep -Seconds 2
Write-Host


# Copying updated files...
Write-Host "${GREEN}Copying updated files...${RESET}"
scp -r src ./startup.sh ${ACCOUNT}@${IPADDR}:${APP_ROOT}/web-api
Start-Sleep -Seconds 2
Write-Host


# Adding the ability to startup the application after OS reboot...
Write-Host "${GREEN}Adding the ability to startup '$WEB_API_APP_NAME' after OS reboot...${RESET}"
ssh ${ACCOUNT}@${IPADDR} 'chmod 755 /etc/rc.local'
ssh ${ACCOUNT}@${IPADDR} "echo -e '#!/bin/sh -e\n\ncd ${APP_ROOT}/web-api/\n\nsh ""startup.sh""\n\nexit 0' > /etc/rc.local"
Start-Sleep -Seconds 2
Write-Host


# Launching 'eta-regulator-board-web-api...
Write-Host "${GREEN}Launching '$WEB_API_APP_NAME'...${RESET}"
ssh root@${IPADDR} "cd ${APP_ROOT}/web-api/; sh startup.sh"
