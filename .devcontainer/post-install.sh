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

ssh root@omega-8f79 "echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDC7qRSUrvdkBGYgpYt7US32o3tZMNIXgll+PHZFkFLsAkN2sBp+t8eaLvwBWDzv0CZWNxWk4HRL5ci07J6T+1JQ358985LbVXRwsOkAv6Q1aVyB5Drqmydu/GWnE2dFC/c2lB8EIGZTsZWnMXJ4FEL4oX3MqB1+amkNArtXsvHd/NSNn3QNn017rKFrMUzvH6BOnPPIYMH88JlS+iMNR+3aiG0I43u8ldpsKolQFLuRLg8jk85Voj3FrLwsAEP9DTyh+73NbaDc0xHLbk06v/QH97ihm95R46iWG8jbMDWnrZt/TfHNrkAcYaKxXH2eoDrYyp+Opitqkt6vCE4rJDmTh6/Cv+raNTdIz5vxqUig/0Ugkd68knUQUCSj6i90/s9WIS2aP+bjIJjLnZNW/2wdfmWGJoUQDFyaqaGfCtTm7PWZI+B990Ei/Ac8PgnBq3T5wcmQivwZitMzGzy08lKiEIgD/Yzm6sg86vRUs8dsgT103ETKPrLEuAN0EjXEWs= vscode@bcfd98d5dd06' >> /etc/dropbear/authorized_keys"

### Permissions for powershell
sudo setcap cap_net_raw=eip /opt/microsoft/powershell/7/pwsh   # https://github.com/PowerShell/PowerShell/issues/18585

### init web-api
# install vscode python extention v2022.8.0 for python 3.6 debugging
# use python instedd python3 sym link that may be reffered to python 3.9 by default
cd web-api
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
