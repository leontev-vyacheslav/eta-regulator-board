function Set-WebApiAppVersion
{
    param (
        [string] $MajorVersionPart
    )

    $defaultRouterPath = Resolve-Path ./src/routers/default_router.py

    $mylist = [System.Collections.Generic.List[string]]::new()

    $d = Get-Date -Format "yyyyMMdd-HHmmss"
    foreach($line in [System.IO.File]::ReadLines($defaultRouterPath))
    {
        if ($line.Contains("Eta Regulator Board Web API"))
        {
            $mylist.Add("        message='Eta Regulator Board Web API v.$MajorVersionPart.$d'");
        }
        else
        {
            $mylist.Add($line);
        }
    }

    [System.IO.File]::WriteAllLines($defaultRouterPath.Path + "~", $mylist);

    [System.IO.File]::Delete($defaultRouterPath)

    [System.IO.File]::Move($defaultRouterPath.Path + "~", $defaultRouterPath)
}

# Bump version
Set-WebApiAppVersion -MajorVersionPart 0.1