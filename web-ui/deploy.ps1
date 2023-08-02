Import-Module ..\deployment-support.ps1 -Force

# Bump up the app build version
Write-Host "${GREEN}Bump up '$WEB_UI_APP_NAME' build version before delpoyment ($buildDateTimeMark)...${RESET}"
Set-AppVersion `
    -RelativePath "./src/constants/app-constants.ts" `
    -SearchPattern "version:" `
    -Substitution "        version: 'v.0.1.${buildDateTimeMark}'"
Start-Sleep -Seconds 2
Write-Host


# Sync date&time on OpenWrt OS
Sync-DateTime


# Rebuilding the app
Write-Host "${GREEN}Rebuilding '$WEB_UI_APP_NAME'...${RESET}"
npm run build
Start-Sleep -Seconds 2
Write-Host


# Initializing the app folders
Init-AppFolder `
    -AppRootFolder "/web-ui"



Write-Host "${GREEN}Shutting down '$WEB_UI_APP_NAME' and removing orignal files...${RESET}"
ssh ${ACCOUNT}@${IPADDR} "rm -rf ${APP_ROOT}/web-ui/"
Start-Sleep -Seconds 2
Write-Host


Write-Host "${GREEN}Deleting JS and CSS source maps files...${RESET}"
Get-ChildItem -Path "./build" -Recurse -Include "*.map" | Remove-Item -Force -Recurse
Start-Sleep -Seconds 2
Write-Host


Write-Host "${GREEN}Copying updated files...${RESET}"
scp -r build ${ACCOUNT}@${IPADDR}:${APP_ROOT}/web-ui
Start-Sleep -Seconds 2
Write-Host


Write-Host "${GREEN}Restarting UHTTPD web server with '$WEB_UI_APP_NAME'...${RESET}"
ssh ${ACCOUNT}@${IPADDR} '/etc/init.d/uhttpd restart'
Start-Sleep -Seconds 2
