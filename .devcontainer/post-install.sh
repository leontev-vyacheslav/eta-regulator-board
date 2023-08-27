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

ssh root@omega-8f79 "echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDNb4GBLHzeJP0BDAE8Xl27Dwu0KPlfFkUtIQPZIK9PfcxDOd13bBiGRoJJz1vxqudEdaWYCDeTzfJUA9bESLh+g12mnr9krA9ttnq2oEiltxcgJuc5w5Dy/7+xAjo8f0j5zvgqlu0gFi1OVC7VYPL/RNETGszhaWkAlObOyOfkrA1ImJuNBQ9+aHySzxRmXfWh+MKGqfsMP0We0J7x9C5e47zNQ7Zvk8H6UfXW3kEezhxtF0Npmm7HQ+R2iidzW4XKOQkj2Kr5PJZMP5x11vpa6MV6vdLR41DMLkVrdKyzp2vRV+BzSoZB5vYJbUxps+Ou33Cqon+KmRnOcf1oyHfUXasKNxLqpt37J02EyzI995oiESjzu92fbV7Et0JhDYKBGlpDxijVACigYPm0uduN6R2sOXZNkxkxBxGbV0Ea8F0HXoCy30tmeLPpCs8AbhfcTek0c8DCDJGEUy7LAANblMaarNKE3djqNmLcpic3WzmPhRuygAjyUZ2f5RpuAVM= vscode@2533fe7970bb' >> /etc/dropbear/authorized_keys"

### Permissions for powershell
sudo setcap cap_net_raw=eip /opt/microsoft/powershell/7/pwsh   # https://github.com/PowerShell/PowerShell/issues/18585

### init web-api
# install vscode python extention v2022.8.0 for python 3.6 debugging
# use python instedd python3 sym link that may be reffered to python 3.9 by default
cd web-api
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
