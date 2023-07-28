$GREEN = "`e[32m"
$RESET = "`e[0m"

# 1. Shutting down 'eta-regulator-board-web-api' and removing orignal files...
Write-Host "${GREEN}Shutting down 'eta-regulator-board-web-api' and removing orignal files...${RESET}"
ssh root@10.10.10.1 'wget --post-data="security_pass=onioneer" http://127.0.0.1:5000/shutdown'
ssh root@10.10.10.1 'rm -rf /mnt/mmcblk0p1/eta-regulator-board/web-api/src/'
Start-Sleep -Seconds 2
Write-Host

# 2. Deleting compiled Python version dependent modules...
Write-Host "${GREEN}Deleting compiled Python version dependent modules...${RESET}"
Get-ChildItem -Path "./src" -Recurse -Include "__pycache__" | Remove-Item -Force -Recurse
Start-Sleep -Seconds 2
Write-Host

# 3. Copying updated files...
Write-Host "${GREEN}Copying updated files...${RESET}"
scp -r src ./startup.sh root@10.10.10.1:/mnt/mmcblk0p1/eta-regulator-board/web-api
Start-Sleep -Seconds 2
Write-Host

# 4. Adding the ability to startup the application after OS reboot...
Write-Host "${GREEN}Adding the ability to startup the application after OS reboot...${RESET}"

# Rewriting /etc/rc.local like lhat

# #!/bin/sh -e
# cd /mnt/mmcblk0p1/eta-regulator-board/web-api/
# sh 'startup.sh'
# exit 0
ssh root@10.10.10.1 'chmod 755 /etc/rc.local'
ssh root@10.10.10.1 'echo -e "#!/bin/sh -e\n\ncd /mnt/mmcblk0p1/eta-regulator-board/web-api/\n\nsh ''startup.sh''\n\nexit 0" > /etc/rc.local'
Start-Sleep -Seconds 2
Write-Host

# 5. Launching 'eta-regulator-board-web-api...
Write-Host "${GREEN}Launching 'eta-regulator-board-web-api...'${RESET}"
ssh root@10.10.10.1 'cd /mnt/mmcblk0p1/eta-regulator-board/web-api/; sh startup.sh'