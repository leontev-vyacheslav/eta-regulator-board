$GREEN = "`e[32m"
$RESET = "`e[0m"
$IPADDR = "10.10.10.1"
$APP_ROOT = "/mnt/mmcblk0p1/eta-regulator-board" # /home/eta-regulator-board
$WEB_API_APP_NAME = "eta-regulator-board-web-api"
$WEB_API_SHUTDOWN_ENDPOINT = "http://127.0.0.1:5000/shutdown"

# Initialising the app folders
ssh root@${IPADDR} "mkdir -p ${APP_ROOT}/web-api/src/"


# Shutting down 'eta-regulator-board-web-api' and removing orignal files...
Write-Host "${GREEN}Shutting down '$WEB_API_APP_NAME' and removing orignal files...${RESET}"
ssh root@${IPADDR} "wget --post-data='security_pass=onioneer' ${WEB_API_SHUTDOWN_ENDPOINT}"
ssh root@${IPADDR} "rm -rf ${APP_ROOT}/web-api/src/"
Start-Sleep -Seconds 2
Write-Host


# Deleting compiled Python version dependent modules...
Write-Host "${GREEN}Deleting compiled Python version dependent modules...${RESET}"
Get-ChildItem -Path "./src" -Recurse -Include "__pycache__" | Remove-Item -Force -Recurse
Start-Sleep -Seconds 2
Write-Host


# Copying updated files...
Write-Host "${GREEN}Copying updated files...${RESET}"
scp -r src ./startup.sh root@${IPADDR}:${APP_ROOT}/web-api
Start-Sleep -Seconds 2
Write-Host


# Adding the ability to startup the application after OS reboot...
Write-Host "${GREEN}Adding the ability to startup '$WEB_API_APP_NAME' after OS reboot...${RESET}"

# Rewriting /etc/rc.local like lhat
# #!/bin/sh -e
# cd /mnt/mmcblk0p1/eta-regulator-board/web-api/
# sh 'startup.sh'
# exit 0
ssh root@${IPADDR} 'chmod 755 /etc/rc.local'
ssh root@${IPADDR} "echo -e '#!/bin/sh -e\n\ncd ${APP_ROOT}/web-api/\n\nsh ""startup.sh""\n\nexit 0' > /etc/rc.local"
Start-Sleep -Seconds 2
Write-Host


# Launching 'eta-regulator-board-web-api...
Write-Host "${GREEN}Launching '$WEB_API_APP_NAME'...${RESET}"
ssh root@${IPADDR} "cd ${APP_ROOT}/web-api/; sh startup.sh"