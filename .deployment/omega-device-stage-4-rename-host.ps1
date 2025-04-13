param (
    [string]$HOSTNAME, [string]$NEWHOSTNAME
)

clear
Import-Module $PSScriptRoot\deployment-support.ps1 -Force

# Check connection
$testConnectionStatus = Test-Connection -TargetName $HOSTNAME -IPv4 -Count 1
If($testConnectionStatus.Status -ne "Success")
{
    Write-Host "Failed to connect to the device ${HOSTNAME}." -ForegroundColor Red
    Write-Host

    Exit 1
}
Write-Host "The connection with the device '${HOSTNAME}' was established!" -ForegroundColor Green
Write-Host

Write-Host "Let's try to rename the host and the WIFI endpoint (ssid) from '${HOSTNAME}' to '${NEWHOSTNAME}'." -ForegroundColor Green
Write-Host

Write-Host "Attention! After running this command the current SSH terminal session will be closed."-ForegroundColor Darkred
Write-Host "It's possible you will need to press ENTER (or CTRL-C) to return to the original PowerShell terminal session." -ForegroundColor Darkred
Write-Host "By the way, the WIFI-connection with '${HOSTNAME}' will be closed too." -ForegroundColor Darkred
Write-Host "Don't remember to update the connection to '${NEWHOSTNAME}'!" -ForegroundColor Darkred
Write-Host

do {
    $response = Read-Host -Prompt "Do you want to continue? (Y/N)"
    $response = $response.ToUpper()
} while ($response -ne "Y" -and $response -ne "N")

if ($response -eq "Y") {
    Write-Host "Proceeding..."
    ssh ${ACCOUNT}@${HOSTNAME} "uci set wireless.@wifi-iface[0].ssid='${NEWHOSTNAME}';uci commit wireless;uci set system.@system[0].hostname='${NEWHOSTNAME}';uci commit system;/etc/init.d/system restart;wifi restart&"
} else {
    Write-Host "Operation cancelled."
    exit
}
