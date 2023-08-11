$GREEN = "`e[32m"
$RESET = "`e[0m"
$IPADDR = "10.10.10.1"
$ACCOUNT = 'root'
$APP_ROOT = "/mnt/mmcblk0p1/eta-regulator-board" # /home/eta-regulator-board

$utcNow = Get-Date -Format "yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'fff'Z'" -AsUTC
$buildDateTimeMark = Get-Date -Format "yyyyMMdd-HHmmss"

$WEB_API_APP_NAME = "eta-regulator-board-web-api"
$WEB_UI_APP_NAME = "eta-regulator-board-web-ui"
$WEB_API_SHUTDOWN_ENDPOINT = "http://127.0.0.1:5000/shutdown"

function Set-AppVersion([string] $RelativePath, [string] $SearchPattern, [string] $Substitution)
{

    $defaultRouterPath = Resolve-Path $RelativePath # ./src/routers/default_router.py

    $mylist = [System.Collections.Generic.List[string]]::new()

    foreach($line in [System.IO.File]::ReadLines($defaultRouterPath))
    {
        if ($line.Contains($SearchPattern)) # "Eta Regulator Board Web API"
        {
            $mylist.Add($Substitution);
        }
        else
        {
            $mylist.Add($line);
        }
    }

    [System.IO.File]::WriteAllLines($defaultRouterPath.Path + "~", $mylist);

    [System.IO.File]::Delete($defaultRouterPath.Path)

    [System.IO.File]::Move($defaultRouterPath.Path + "~", $defaultRouterPath)
}

function Sync-DateTime
{
    Write-Host "Sync date&time according to the device timezone (${utcNow})..." -ForegroundColor Green
    ssh ${ACCOUNT}@${IPADDR} "ntpd -q -p ptbtime1.ptb.de" # Network Time Protocol daemon
    Start-Sleep -Seconds 2
    Write-Host
}

function Initialize-AppFolder ([string] $AppRootFolder)
{
    Write-Host "Initializing the app folders..." -ForegroundColor Green
    ssh ${ACCOUNT}@${IPADDR} "mkdir -p ${APP_ROOT}${AppRootFolder}/"
    Start-Sleep -Seconds 2
    Write-Host
}