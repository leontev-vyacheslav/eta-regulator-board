Import-Module $PSScriptRoot\deployment-support.ps1 -Force

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

# Revoking existed fingerprint
Write-Host "Revoking existed fingerprint for ${IPADDR}..." -ForegroundColor Green
ssh-keygen -R ${IPADDR}
Start-Sleep -Seconds 2
Write-Host

Write-Host "Copying existed the development machine public key to ${IPADDR}..." -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} "cd /etc/dropbear/;touch authorized_keys;chmod 600 authorized_keys"
pscp C:\Users\Leo\.ssh\id_rsa.pub ${ACCOUNT}@${IPADDR}:/etc/dropbear/authorized_keys
Start-Sleep -Seconds 2
Write-Host


# Sync date&time on OpenWrt OS
Sync-DateTime

Write-Host "Updating OS package maneger sources and instal Python ${IPADDR}..."  -ForegroundColor Green
ssh ${ACCOUNT}@${IPADDR} "opkg update"
ssh ${ACCOUNT}@${IPADDR} "opkg install python3"
ssh ${ACCOUNT}@${IPADDR} "opkg install python3-pip"
Start-Sleep -Seconds 2
Write-Host
