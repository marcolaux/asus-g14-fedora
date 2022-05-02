# Fedora 35 Setup with an ASUS Zephyrus G14 2020 model

---

This Git repo describes how I setup the ASUS Zephyrus G14 (GA401IV) with Fedora 35 including a GNOME Shell extension to switch between GPUs and ROG profiles.

**This is not for the 2021 model**

**This is my personal config, no official guide**.<br>If you want support from the asus-linux community please have a look at the official install guide here: [https://asus-linux.org/wiki/fedora-guide/](https://asus-linux.org/wiki/fedora-guide/)<br>
This guide will also get you a fully functional **2021** G14 if you are looking for this.

## Installation process

**1. Follow the guide on [https://asus-linux.org/wiki/fedora-guide/](https://asus-linux.org/wiki/fedora-guide/)**

**2. copy all the files to the appropriate directories**

```bash
git clone https://github.com/hyphone/asus-g14-fedora.git
cd asus-g14-fedora
cp -R etc/* /etc/
systemd-hwdb update
udevadm trigger
systemctl enable asusctl_hibernate.service
```
> we clone this repo

> we go to the repo directory

> we copy everything in this repo of etc to /etc/

> mod the keyboard that **page up / down** is mapped to **fn+up/down** while **home (pos1) / end** is mapped to **fn+left/right**

> you can use `brightnessctl -d asus::kbd_backlight s +1` and `brightnessctl -d asus::kbd_backlight s 1-` and map this to a key of your choice in your desktop environment

> asus_hibernate.service restarts asusd after hibernation to re-apply the battery charge limit.


**3. install brightnessctl**
```bash
dnf install brightnessctl
```

> brightnessctl is used for controlling the keyboard backlight as I'm overriding the default keys with page up / down before. you can map brightnessctl then in your DE to a key you want.

**4. Reboot**

**5. You can switch your prefered graphics mode via the GNOME Shell extension "asusctl-gex" or with "supergfxctl -m (graphics mode)"**

---


## GUI for controlling asusctl

- [asusctl-gex (GNOME Shell extension)](https://extensions.gnome.org/extension/4320/asusctl-gex/)

## asusctl

for more information on asusctl have a look here: [asus-linux.org)](https://asus-linux.org)

also custom fan curves are supported via the kernel now.