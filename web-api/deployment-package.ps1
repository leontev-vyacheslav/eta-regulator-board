param(
    [string]$BumpVersion = (Read-Host -prompt "Upgrade the application version (yes/no)?"),
    [string]$DebugMode = (Read-Host -prompt "Operate in the debug mode (yes/no)?")
)

Import-Module $PSScriptRoot\..\.deployment\deployment-support.ps1 -Force


$uri = "http://eta24.ru:15020"
if ($DebugMode -eq "yes" -or $DebugMode -eq "y") {
    $uri = "http://192.168.0.107:5020"
}

$uri += "/deployments/"

$buildDateTimeMark = Get-Date -Format "yyyyMMddTHHmmss"

if ($BumpVersion -eq "yes" -or $BumpVersion -eq "y") {
    Set-AppVersion `
        -RelativePath "./src/app.py" `
        -SearchPattern "APP_VERSION = " `
        -Substitution "APP_VERSION = 'v.0.1.${buildDateTimeMark}'"
}

If (-not(Test-Path -Path './distro')) {
    New-Item -Path "./" -Name "distro" -ItemType Directory
}
If (-not(Test-Path -Path './build')) {
    New-Item -Path "./" -Name "build" -ItemType Directory
}

Get-ChildItem -Path "./build" -Recurse | Remove-Item -force -recurse

Copy-Item -Path "src" -Destination "./build" -Recurse -Force
Copy-Item -Path "data" -Destination "./build" -Recurse -Force
Copy-Item -Path "log" -Destination "./build" -Recurse -Force
Copy-Item -Path "startup.sh" -Destination "./build" -Recurse -Force
Copy-Item -Path "requirements.txt" -Destination "./build" -Recurse -Force

$deployment_package_path = "./distro/web_api_${buildDateTimeMark}.zip"

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

Get-ChildItem -Path "./build" -Recurse | Remove-Item -Force -Recurse