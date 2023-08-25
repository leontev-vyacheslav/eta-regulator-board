git init
git config --global --add safe.directory /workspaces/eta-regulator-board
git remote add -t \* -f origin https://github.com/leontev-vyacheslav/eta-regulator-board
git checkout master
git reset --hard

sudo apt-get update
sudo apt-get install iputils-ping -y

ssh-keygen # install keys for vscode user

sudo apt-get install npm

sudo setcap cap_net_raw=eip /opt/microsoft/powershell/7/pwsh   # https://github.com/PowerShell/PowerShell/issues/18585