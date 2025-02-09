#

## 1. How to connect to Omega2 device?

1. Turn on your Omega2 device.
2. Wait for a minute because of OS loading.
3. Plug in an additional wifi adapter to your computer and select to it as an active network as Omega-xxx.
4. Check accessability a default web server of Omega2 device. For that, type the address <http://omega-xxx/> in your computer browser and wait to see a welcome page's Omega2 device.

Wifi network security key Omega-xxx is 12345678. Default root account OpenWrt is 'root -> onioneer'

## 2. What is the preferred way to copy files from developer computer to OpenWRT OS on the Omega2 board?

Alter you established a connection with the Omega2 device you need to access to a file system, a command line interface OS and etc.

For this purpose the Omega2 documentation mentions WinScp app (<https://winscp.net/>) but if you want you can use a terminal manager like as MobaXterm (<https://mobaxterm.mobatek.net>).

## 3. How to have an internet access for the Omega2 device and your computer simultaneously?

First of all you need to switch Omega2 device on a wifi router with internet access using commands (in then command line interface's OpenWrt OS) like that

```bash
wifisetup

Onion Omega Wifi Setup
Select from the following:
1) Scan for Wifi networks
2) Type network info
q) Exit

Selection: 1
Scanning for wifi networks...

Select Wifi network:
1) DSL-2750U-29B9
2) Keenetic-1219

Selection: 1
password: ******
```

Then switch your computer's active wifi-router to Omega-xxx router and check an internet access internet on your computer and an access to Omega2 device

## 4. How can copy files from Windows to the Omega2 device's  OpenWrt OS using SSH and command line tools?

During the first session ssh connection you will get a proposal to accept a new RSA key fingerprint. Accept it typing 'yes' and press 'enter' key.

```bash
scp test.txt root@1omega-xxx:/home/

The authenticity of host 'omega-xxx (10.10.10.1)' can't be established.
RSA key fingerprint is SHA256:37vUMWiwZwxfLHeRB/LzIPvSNCdYAMIu8/NKH8gb+88.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
Please type 'yes', 'no' or the fingerprint:
Warning: Permanently added 'omega-xxx' (RSA) to the list of known hosts.

root@omega-xxx's password:

test.txt  100%    29     0.0KB/s   00:00    c
```

It is important to mention that we have the option to copy a folder with all of its contents. For example like that:

```bash
scp -r src ./startup.sh root@omega-xxx:/mnt/mmcblk0p1/eta-regulator-board/web-api
```

In the absence of a ssh public key from your computer you  will always need to enter the root user password for every command.
How to do this see the next question.

## 5. How to install ssh public key on OpenWrt OS?

The most important thing for this to figure out that public keys OpenWrt save in the folder /etc/dropbear/ but not /root/.ssh

Therefore, we create the file "authorized_keys" and apply permissions for it:

```bash
cd /etc/dropbear/
touch authorized_keys
chmod 600 authorized_keys
```

Next, you need to copy the public key from the Windows machine to OpenWrt like that

```powershell
pscp C:\Users\Leo\.ssh\id_rsa.pub root@omega-xxx:/etc/dropbear/authorized_keys
```

Now we can use a command console (cmd, PowerShell, bash ect.) of the developer machine to access OpenWrt OS without entering any passwords.

## 6. How to install python packages on OpenWRT?

First of all you need install a standard package manager like as 'pip' using for this OS package manager 'opkg'.

```bash
opkg update
opkg install python3-pip
```

## 7. How to deploy and host a ReactJs application on the OpenWRT OS?

You need to verify the list of OpenWRT OS installed packages at the beginning

```bash
opkg list-installed
```

You have to see 'uhttpd' package in the list of installed packages, like that

```bash
uhttpd - 2018-06-26-796d42bc-1
```

It is a web server written to be an efficient and stable server, suitable for lightweight tasks commonly used with embedded devices and proper integration with OpenWrt's configuration framework (UCI). In addition, it provides all the functionality expected of present day web servers.

Then you need to edit uhttpd config file adding several lines, like that

```yaml
config uhttpd 'other'
    option listen_http '3000'
    option http_index 'index.html'
    option index_page 'index.html'
    option error_page '/index.html'
    option 'home' '/mnt/mmcblk0p1/eta-regulator-board/web-ui'
```

Then, restart the uHTTPd service to apply the changes:

```bash
/etc/init.d/uhttpd restart
```

Finally, copy the static js-bundle to the appropriate directory on your OpenWrt OS of the Omega2 device.

## 8. How can I start a shell script after reboot OS linux (to start web-api in our case)?

You need to add the command in the file "/etc/rc.local", like that:

```bash
cd /mnt/mmcblk0p1/eta-regulator-board/web-api/&&sh "startup.sh"
exit 0
```

## 9. How to create a python virtual environment based on certain version a python  interpreter (Windows)?

```bash
py -3.6 -m venv .venv
python -m pip install -r requirements.txt
```

Now you have the python package manager and will use it for extending python language environment, like that

```bash
python3 -m pip install flask, flask-cors
```

## 10. How to properly perform a factory reset Omega2 device and to setup a production environment ?

### 1. Need to execute three following command in th CLI, like that

```shell
    firstboot -y
    sync
    reboot
```

### 2. Wait 2-3 minutes, turn off your wifi adapter on the developer machine

### 3. Connect to Omega2 device wifi network, for example with credential: Omega-8f79 (12345678)

### 4. In the browser of the developer machine explore using following url <http://omega-8f79.local/OnionOS/> or <http://192.168.3.1/>

### 5. Login with credential: root (onioneer)

### 6. Allow to connect to internet selected wifi adapter with internet access

### 7. Check connection to developer machine by ssh, like that

```shell
ssh root@192.168.3.1
```

### 8. If necessary change the default ip address for the wlan adapter to 10.10.10.1

/etc/config/network

```yaml
config interface 'wlan'
    option type 'bridge'
    option proto 'static'
    option ipaddr '192.168.3.1'
    option netmask '255.255.255.0'
    option ip6assign '60'
```

```yaml
    option ipaddr '10.10.10.1'
```

### 9. Restore an access through ssh with a key pair (see ## 5)

### 10. Restore an access to web-ui app (see ## 7)

### 11. Install python3

```shell
opkg update
opkg install python3
```

(free 14)

### 12. Install a python package manager PIP

```shell
opkg install python3-pip
```

(free 11M)

### 13. On the stage preparing the device (aka "карабулька") we need to add ${WORKSPACE_ROOT} to the profile file

```shell
    touch ~/.profile
    echo 'export PATH=$PATH:/mnt/mmcblk0p2/eta-regulator-board/bin' >> ~/.profile
    . ~/.profile
```

### 13. Install the FLASK library

```shell
python3 -m pip install flask flask-cors flask_pydantic
```

It will install many packages with itself:

itsdangerous,typing-extensions,zipp,importlib-metadata, click,
MarkupSafe, Jinja2, dataclasses, Werkzeug,
flask, flask-cors, pydantic, flask-pydantic

(free 9M)


### 14. Deploy applications using deploy.ps1 in the appropriate project folders



## 11. How to format microsd card on Omega2+?

```bash
top | grep mnt              # find all process depend on mounted storage device

kill xxx                    # kill the flask web-api app and the other processes blocked the mounted storage device

/etc/init.d/uhttpd stop     # stop web-ui
umount /dev/mmcblk0            # unmount storage device
mkfs.ext4 /dev/mmcblk0      # format
```

## 12. How can I control the GPIOs from Python/Is there an onionGpio module for Python3?

In official documentation was mentioned such python2 library as pyOnionGpio.
It was written as a quick and dirty wrapper for the sysfs gpio interface way back in 2016.
We don't recommend using it for anything other than a hello world.

BETTER OPTIONS
There are other better sysfs gpio libraries available for Python3:

https://pypi.org/project/gpio/
https://python-periphery.readthedocs.io/en/latest/gpio.html
https://github.com/vitiral/gpio


## 13. How can I stop web API and regulator background processes and then run their again?

```bash

cd /mnt/mmcblk0p1/eta-regulator-board/web-api

top | grep python   # it will give three identificators of processes

kill xxx yyy zzz    # kill all three processes

sh startup.sh       # start web API again
```

It's convinient to run FS-SSH extention and jump to a terminal on the remote device (on "carabulca")
in the target folder and then execute this script

## 14. What the device dependant files are there in web-api project?

startup.sh

    /mnt/mmcblk0pXX

rc.local

    /mnt/mmcblk0pXX

task.json

    "echo '192.168.0.104    omega-7995'

uhttpd
    /mnt/mmcblk0pXX

deployment-support.ps1 -

    $IPADDR = "omega-XXXX"
    $ACCOUNT = 'root'
    $WORKSPACE_ROOT = "/mnt/mmcblk0pXX/eta-regulator-board" # /home/eta-regulator-board
