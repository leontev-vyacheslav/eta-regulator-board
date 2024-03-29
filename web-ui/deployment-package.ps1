param(
    [string]$BumpVersion = (Read-Host -Prompt "Upgrade the application version (yes/no)?"),
    [string]$DebugMode = (Read-Host -Prompt "Operate in the debug mode (yes/no)?")
)

Import-Module $PSScriptRoot\..\.deployment\deployment-support.ps1 -Force


$buildDateTimeMark = Get-Date -Format "yyyyMMddTHHmmss"

$uri = "http://eta24.ru:15020"
if ($DebugMode -eq "yes" -or $DebugMode -eq "y") {
    $uri = "http://192.168.0.107:5020"
}

$uri += "/deployments/"

if ($BumpVersion -eq "yes" -or $BumpVersion -eq "y") {
    Set-AppVersion `
        -RelativePath "./src/constants/app-constants.ts" `
        -SearchPattern "APP_VERSION = " `
        -Substitution "const APP_VERSION = 'v.0.1.${buildDateTimeMark}';"

    Set-AppVersion `
        -RelativePath "./public/index.html" `
        -SearchPattern "<meta name=`"description`" content=`"Eta Regulator Board Web UI" `
        -Substitution "<meta name=`"description`" content=`"Eta Regulator Board Web UI v.0.1.${buildDateTimeMark}`" />"
}
# Rebuilding the app
$rebuildFlag = Read-Host -Prompt 'Do you want to rebuild the application (yes/no)?'

if ($rebuildFlag -eq 'yes' -or $rebuildFlag -eq 'y') {
    Write-Host "${GREEN}Rebuilding '$WEB_UI_APP_NAME'...${RESET}"
    npm run build
    Start-Sleep -Seconds 2
    Write-Host
}

If (-not(Test-Path -Path './distro')) {
    New-Item -Path "./" -Name "distro" -ItemType Directory
}

$deployment_package_path = "./distro/web_ui_${buildDateTimeMark}.zip"

if($IsLinux) {
    Invoke-Expression "zip -r $deployment_package_path ./build"
} else {
    Compress-Archive -Path "./build" -DestinationPath $deployment_package_path
}

$form = @{
    file = Get-Item -Path $deployment_package_path
}

Invoke-WebRequest -Uri $uri `
    -Method Post `
    -Form $form `
    -ConnectionTimeoutSeconds 30 `
    -OperationTimeoutSeconds 30
