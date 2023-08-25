git init
git config --global --add safe.directory /workspaces/eta-regulator-board
git remote add -t \* -f origin https://github.com/leontev-vyacheslav/eta-regulator-board
git checkout master
git reset --hard

sudo apt-get update
sudo apt-get install iputils-ping -y

sudo ssh-keygen

sudo apt-get install npm