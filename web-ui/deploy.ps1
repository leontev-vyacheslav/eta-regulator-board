Import-Module $PSScriptRoot\..\.deployment\deployment-support.ps1 -Force

Clear-Host

$APP_ROOT = "/web-ui"
# Check connection
$testConnectionStatus = Test-Connection -TargetName $IPADDR -IPv4 -Count 1
If($testConnectionStatus.Status -ne "Success")
{
    Write-Host "Failed to connect to the device ${IPADDR}." -ForegroundColor Red
    Write-Host

    Exit 1
}

Write-Host "Connection with the device was established!" -ForegroundColor Green

# Bump up the app build version
Write-Host "Bump up '$WEB_UI_APP_NAME' build version before delpoyment ($buildDateTimeMark)..." -ForegroundColor Green
Set-AppVersion `
    -RelativePath "./src/constants/app-constants.ts" `
    -SearchPattern "APP_VERSION = " `
    -Substitution "const APP_VERSION = 'v.0.1.${buildDateTimeMark}';"
Start-Sleep -Seconds 2
Write-Host

# Sync date&time on OpenWrt OS
Sync-DateTime

$reinstallFlag = Read-Host -Prompt 'Do you want to install/reinstall all dependencies (yes/no)?'
if ($reinstallFlag -eq 'yes') {
    # Reinstall dependencies
    Write-Host "${GREEN}Installing dependencies '$WEB_UI_APP_NAME'...${RESET}"
    npm install
    Start-Sleep -Seconds 2
    Write-Host
}


$rebuildFlag = Read-Host -Prompt 'Do you want to rebuild app (yes/no)?'
if ($rebuildFlag -eq 'yes') {
    # Rebuilding the app
    Write-Host "${GREEN}Rebuilding '$WEB_UI_APP_NAME'...${RESET}"
    npm run build
    Start-Sleep -Seconds 2
    Write-Host
}


Write-Host "Shutting down UHTTPD web server with '$WEB_UI_APP_NAME'..." -ForegroundColor Green
$remoteOutput = ssh ${ACCOUNT}@${IPADDR} '/etc/init.d/uhttpd stop' *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    # exit
}

Start-Sleep -Seconds 2

# Initializing the app folders

Initialize-AppFolders `
    -AppRootFolders $APP_ROOT

Write-Host "Removing orignal files '$WEB_UI_APP_NAME'..." -ForegroundColor Green
$remoteOutput = ssh ${ACCOUNT}@${IPADDR} "rm -rf ${WORKSPACE_ROOT}${APP_ROOT}/" *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    Exit 1
}
Start-Sleep -Seconds 2
Write-Host

Write-Host "Deleting JS and CSS source maps files..." -ForegroundColor Green
Get-ChildItem -Path "./build" -Recurse -Include "*.map" | Remove-Item -Force -Recurse
Start-Sleep -Seconds 2
Write-Host

Write-Host "Copying updated files..." -ForegroundColor Green
$remoteOutput = scp -r build ${ACCOUNT}@${IPADDR}:${WORKSPACE_ROOT}${APP_ROOT} *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    exit
}
Start-Sleep -Seconds 2
Write-Host

Write-Host "Updating UHTTPD configuration for '$WEB_UI_APP_NAME'..." -ForegroundColor Green
$remoteOutput = scp ../.deployment/configs/uhttpd ${ACCOUNT}@${IPADDR}:/etc/config/uhttpd *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    exit
}
Start-Sleep -Seconds 2

Write-Host "Starting UHTTPD web server with '$WEB_UI_APP_NAME'..." -ForegroundColor Green
$remoteOutput = ssh ${ACCOUNT}@${IPADDR} '/etc/init.d/uhttpd start' *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    exit
}
Start-Sleep -Seconds 2

# param(
#     [string]$ipaddr,
#     [string]$distro,
#     [string]$root
# )

# Import-Module $PSScriptRoot\deployment_support.ps1 -Force


# $WEB_UI_APP_NAME = "eta-regulator-board-web-ui"
# $APP_ROOT = "/web-ui"