Import-Module $PSScriptRoot\deployment-support.ps1 -Force

Clear-Host
$APP_ROOT = "/web-api"

function Find-ExternalError([System.Object]$remoteOutput) {
    [bool]$hasError = 0

    if ($null -eq $remoteOutput) {
        return $hasError
    }

    
    $remoteOutputArray = $null 
    if ($remoteOutput -isnot [array]) {
        $remoteOutputArray = ($remoteOutput)
    }
    else {
        $remoteOutputArray = $remoteOutput
    }
    
    foreach ( $remoteOutputItem in $remoteOutputArray) {
        if ($remoteOutputItem.PSobject.Properties.Name.Contains('Exception') -eq 'False') {
            Write-Host "$($remoteOutputItem.Exception.Message) ($($remoteOutputItem.Exception.GetType().Name))" -BackgroundColor Red
            $hasError = 1
        }
        else {
            Write-Host $remoteOutputItem
        }
    }
    

    return $hasError
}



#$remoteOutput = ssh ${ACCOUNT}@omega-8f791 'cd /&&ls' *>&1
#$remoteOutput = scp -r src ./startup.sh ./requirements.txt ./runtime.txt ${ACCOUNT}@${IPADDR}:${WORKSPACE_ROOT}${APP_ROOT} *>&1
#$remoteOutput = ssh ${ACCOUNT}@${IPADDR} "cd ${WORKSPACE_ROOT}${APP_ROOT}/src;kill111 `$(cat PID_FILE)" *>&1
$remoteOutput = ssh ${ACCOUNT}@${IPADDR} "cd ${WORKSPACE_ROOT}${APP_ROOT}/; sh startup.sh" *>&1

$hasError = Find-ExternalError -remoteOutput $remoteOutput

if ($hasError) {
    exit
}


Write-Output 'All right!'

