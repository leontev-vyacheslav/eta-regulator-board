$GREEN = "`e[32m"
$RESET = "`e[0m"

Write-Host "${GREEN}Shutting down 'eta-regulator-board-web-ui' and removing orignal files...${RESET}"
ssh root@10.10.10.1 'rm -rf /home/eta-regulator-board/web-ui/'
Start-Sleep -Seconds 2
Write-Host

Write-Host "${GREEN}Copying updated files...${RESET}"
scp -r build root@10.10.10.1:/home/eta-regulator-board/web-ui
Start-Sleep -Seconds 2
Write-Host

Write-Host "${GREEN}Restarting UHTTPD web server...${RESET}"
ssh root@10.10.10.1 '/etc/init.d/uhttpd restart'
Start-Sleep -Seconds 2