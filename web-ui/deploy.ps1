$GREEN = "`e[32m"
$RESET = "`e[0m"

$IPADDR = "10.10.10.1"
$APP_ROOT = "/mnt/mmcblk0p1/eta-regulator-board" # /home/eta-regulator-board
$WEB_UI_APP_NAME = "eta-regulator-board-web-ui"

# 0. Initialising the app folders
ssh root@${IPADDR} "mkdir -p ${APP_ROOT}/web-ui/"

Write-Host "${GREEN}Shutting down '$WEB_UI_APP_NAME' and removing orignal files...${RESET}"
ssh root@${IPADDR} "rm -rf ${APP_ROOT}/web-ui/"
Start-Sleep -Seconds 2
Write-Host

Write-Host "${GREEN}Deleting JS and CSS source maps files...${RESET}"
Get-ChildItem -Path "./build" -Recurse -Include "*.map" | Remove-Item -Force -Recurse
Start-Sleep -Seconds 2
Write-Host

Write-Host "${GREEN}Copying updated files...${RESET}"
scp -r build root@${IPADDR}:${APP_ROOT}/web-ui
Start-Sleep -Seconds 2
Write-Host

Write-Host "${GREEN}Restarting UHTTPD web server with '$WEB_UI_APP_NAME'...${RESET}"
ssh root@${IPADDR} '/etc/init.d/uhttpd restart'
Start-Sleep -Seconds 2