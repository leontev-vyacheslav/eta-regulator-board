param (
    [string]$IPADDR
)
Import-Module $PSScriptRoot\..\.deployment\deployment-support.ps1 -Force

if ([string]::IsNullOrEmpty($IPADDR)) {
    Write-Host "The device address is null or empty." -ForegroundColor Red
    Exit 1
}

$APP_ROOT = "/web-api"

# deleting unnecessary files and folders
if (Test-Path "./data/archives" -PathType Container) {
    Remove-Item -Path "./data/archives" -Recurse -Force
}
if (Test-Path "./log" -PathType Container) {
    Remove-Item -Path "./log" -Recurse -Force
}

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
    -RelativePath "./src/app.py" `
    -SearchPattern "APP_VERSION = " `
    -Substitution "APP_VERSION = 'v.0.1.${buildDateTimeMark}'"
Start-Sleep -Seconds 2
Write-Host


# Sync date&time on OpenWrt OS
Sync-DateTime


# Initializing the app folders
[string[]]$folders = "${APP_ROOT}/src", "${APP_ROOT}/data", "${APP_ROOT}/log"
Initialize-AppFolders `
    -AppRootFolders $folders


# Shutting down 'eta-regulator-board-web-api' and removing orignal files...
Write-Host "Shutting down '$WEB_API_APP_NAME' and removing orignal files..."  -ForegroundColor Green
# ssh ${ACCOUNT}@${IPADDR} "wget --post-data='security_pass=onioneer' --tries=2 ${WEB_API_SHUTDOWN_ENDPOINT}"
$remoteOutput = ssh ${ACCOUNT}@${IPADDR} "cd ${WORKSPACE_ROOT}${APP_ROOT}/src;pid=`$(cat PID_FILE);kill -TERM `$pid;wait `$pid" *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    # exit
}

$remoteOutput = ssh ${ACCOUNT}@${IPADDR} "rm -rf ${WORKSPACE_ROOT}${APP_ROOT}/src/" *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    exit
}
Start-Sleep -Seconds 2
Write-Host


# Deleting compiled Python version dependent modules...
Write-Host "Deleting compiled Python version dependent modules..."  -ForegroundColor Green
Get-ChildItem -Path "./src" -Recurse -Include "__pycache__" | Remove-Item -Force -Recurse
Start-Sleep -Seconds 2
Write-Host


# Copying updated files...
Write-Host "Copying updated files..." -ForegroundColor Green

$remoteOutput = scp -r src data ./startup.sh ./restart.sh ./requirements.txt ${ACCOUNT}@${IPADDR}:${WORKSPACE_ROOT}${APP_ROOT} *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    exit
}

Start-Sleep -Seconds 2
Write-Host


# Adding the ability to startup the application after OS reboot...
Write-Host "Adding the ability to startup '$WEB_API_APP_NAME' after OS reboot..." -ForegroundColor Green
$remoteOutput = scp ../.deployment/configs/rc.local ${ACCOUNT}@${IPADDR}:/etc/rc.local  *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    exit
}

$remoteOutput = ssh ${ACCOUNT}@${IPADDR} 'chmod 755 /etc/rc.local' *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    exit
}

$remoteOutput = ssh ${ACCOUNT}@${IPADDR} "echo -e '# ${WEB_API_APP_NAME} date&time build mark ${buildDateTimeMark}' >> /etc/rc.local" *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    exit
}

Start-Sleep -Seconds 2
Write-Host

# Installing dependencies
$reinstallFlag = Read-Host -Prompt 'Do you want to install/reinstall all Python dependencies (yes/no)?'
if ($reinstallFlag -eq 'yes') {
    Write-Host "Installing dependencies..." -ForegroundColor Green
    $remoteOutput = ssh ${ACCOUNT}@${IPADDR} "cd ${WORKSPACE_ROOT}${APP_ROOT}/;python3 -m pip install -r requirements.txt --prefix ${WORKSPACE_ROOT}" *>&1
    $hasError = Find-ExternalError -remoteOutput $remoteOutput
    if ($hasError) {
        exit
    }
    Start-Sleep -Seconds 2
    Write-Host
}

# Compiling to bytecode for python specific version
Write-Host "Compiling to bytecode for python specific version..." -ForegroundColor Green
$remoteOutput = ssh ${ACCOUNT}@${IPADDR} "cd ${WORKSPACE_ROOT}${APP_ROOT}/; python3 -m compileall src" *>&1
$hasError = Find-ExternalError -remoteOutput $remoteOutput
if ($hasError) {
    exit
}
Start-Sleep -Seconds 2
Write-Host


# Launching 'eta-regulator-board-web-api...
Write-Host "Launching '$WEB_API_APP_NAME'..." -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} "cd ${WORKSPACE_ROOT}${APP_ROOT}/; sh startup.sh"
