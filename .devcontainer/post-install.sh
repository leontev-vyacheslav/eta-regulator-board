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

ssh-keygen # install keys for vscode user

### Ppermissions for powershell
sudo setcap cap_net_raw=eip /opt/microsoft/powershell/7/pwsh   # https://github.com/PowerShell/PowerShell/issues/18585

### init web-api
# install vscode python extention v2022.8.0 for python 3.6 debugging
# use python instedd python3 sym link that may be reffered to python 3.9 by default
cd web-api
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
