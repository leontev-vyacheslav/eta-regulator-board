$GREEN = "`e[32m"
$RESET = "`e[0m"

Write-Host "${GREEN}Shutting down 'eta-regulator-board-web-api' and removing orignal files...${RESET}"
ssh root@10.10.10.1 'wget --post-data="security_pass=onioneer" http://127.0.0.1:5000/shutdown'
ssh root@10.10.10.1 'rm -rf /home/eta-regulator-board/web-api/src/'
Start-Sleep -Seconds 2
Write-Host

Write-Host "${GREEN}Copying updated files...${RESET}"
scp -r src ./startup.sh root@10.10.10.1:/home/eta-regulator-board/web-api
Start-Sleep -Seconds 2
Write-Host

Write-Host "${GREEN}Launching 'eta-regulator-board-web-api...'${RESET}"
ssh root@10.10.10.1 'cd /home/eta-regulator-board/web-api/; sh startup.sh;exit'