### init git and get projects from github
git init
git config --global --add safe.directory /workspaces/eta-regulator-board
git remote add -t \* -f origin https://github.com/leontev-vyacheslav/eta-regulator-board
git clean -d -f
git checkout master
git reset --hard

### install ping utils
sudo apt-get update
sudo apt-get install iputils-ping -y

ssh-keygen # install keys for vscode user /home/vscode/.ssh/id_rsa.pub

ssh root@omega-8f79 "echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC9Wsvi447Lk+De2RS06t4qWxYEM7ToRTVB5E1neeEe3+MwS0o8qd7BNz1QEwZ5DDrhxvwAYZMaF9l6sOIQAa4jfGp3yVS0Yj/xVihL+GtsGYJLUjuGUCFlEbI0WaRuvHHc/2W0U4eFfUA/mX6n0W/+dm9ZPtk9PVN/Y9xSNybWF5+euoJ98Ypz5HxUowyk3Px+SftLGpkorOEpU0yudhwWxdPYnnuAKuyXhaFQDE10gsRUh96sxjTWqcMhcxc6jWtbL3QoKzDQAixc1I7q4G4UDMmgU4Elku4osHLUBw6Of8+kvUN3FbJax9Rm6vnsNaocc3xvpvtmocp9tIDKr7c+F30VADER9oyQAP8kUDx9hgbkfSD5iFe1zsCN/Z1+0Zh7YpRNxHftc4RFPrcZx3NauEdkL8MEmT41f7cb53a5Ae+fToAPvOKJco65CHW9TwcvnM6wFXn7Jo+jd4IlOiet0ylCb+ZNofHqbLAt2p+Ugm0yXYwwrX5ful13Fju8tPc= vscode@98960edcc695' >> /etc/dropbear/authorized_keys"

### Permissions for powershell
sudo setcap cap_net_raw=eip /opt/microsoft/powershell/7/pwsh   # https://github.com/PowerShell/PowerShell/issues/18585

### init web-api
# install vscode python extention v2022.8.0 for python 3.6 debugging
# use python instedd python3 sym link that may be reffered to python 3.9 by default
cd web-api
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
