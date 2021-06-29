# Fedora 34 Setup with an ASUS Zephyrus G14 2020 model

---

This Git repo describes how I setup the ASUS Zephyrus G14 (GA401IV) with Fedora 34 including a GNOME Shell extension to switch between GPUs and ROG profiles.

**This is my personal config, no official guide**.<br>If you want support from the asus-linux community please have a look at the official install guide here: ![](https://asus-linux.org/wiki/fedora-guide/)

## Installation process

**1. Install Fedora 34**

**2. Boot to your installation, add Lukes Copr and update everything**

```bash
dnf copr enable lukenukem/asus-linux
dnf update --refresh
dnf install asusctl
```

> this also will fix the touchpad issues with all the G14 models that don't initialize correctly sometimes

> asusctl helps with managing ROG power profiles and switching between graphics modes

**3. Reboot**
```bash
reboot
```

**4. copy all the files to the appropriate directories**

```bash
git clone https://github.com/hyphone/asus-g14-fedora.git
cd asus-g14-fedora
cp -R etc/* /etc/
cp -R usr/* /usr/
systemd-hwdb update
udevadm trigger
systemctl enable asus_hibernate.service
```
> we clone this repo

> we go to the repo directory

> we copy everything in this repo of etc to /etc/

> we copy everything in this repo of usr to /usr/

> mod the keyboard that **page up / down** is mapped to **fn+up/down** while **home (pos1) / end** is mapped to **fn+left/right**

> you can use `brightnessctl -d asus::kbd_backlight s +1` and `brightnessctl -d asus::kbd_backlight s 1-` and map this to a key of your choice in your desktop environment

> asus_hibernate.service restarts asusd after hibernation to re-apply the power profile.


**5. install some packages**
```bash
dnf install --refresh kernel-devel akmod-nvidia xorg-x11-drv-nvidia-cuda akmod-acpi_call brightnessctl
```

> akmod-nvidia and xorg-x11-drv-nvidia-cuda installs the Nvidia driver

> kernel-devel is necesarry for the dynamic kernel modules to compile

> acpi_call modules from the tlp repo is needed to make the custom fan control working

> brightnessctl is used for controlling the keyboard backlight before and after suspend as there is a bug that the keyboard backlight sometimes does not switch completely off while suspending. I also use it to control the brightness with the keyboard as I'm overriding the default keys with page up / down.

**6. Reboot**
```bash
reboot
```

**7. You can switch your prefered graphics mode via the GNOME Shell extension "asusctl-gex" or with "asusctl graphics -m (graphics mode)"**

---


## GUIs for controlling asusctl

- ![asusctl-gex (GNOME Shell extension)](https://gitlab.com/asus-linux/asusctl-gex)
- ![asusctltray (Systray app)](https://github.com/Baldomo/asusctltray/)


## What's in here...

### asusctl config with custom fan curves

There is an example in etc/asusd/asusd_example.conf for how a custom fan curve should look like.
I haven't named it asusd.conf so it does not override the defaults from asusctl and asusd.

Custom fan curves have a problem at least on the 2020 models that sometimes the fans start to pulsate and one has to suspend one or two times to bring them back to a normal state.

I also currently don't use custom fan curves because of this.

### asusctl

![asusctl](https://gitlab.com/asus-linux/asusctl) by Luke Jones (and his Kernel modules) are the key to this all. Without the efford of the community we wouldn't have such handy tools to control this machine. asusctl is used here to do most of the things, like graphics switching via the GNOME Shell extension or setting the ROG profiles.

***

```
etc/asusd/asusd_example.conf
```
These are my custom fan curves for the asusd service from asus-linux.org.
When on AC I usually use "normal" because of turbo is enabled with the default silent fan profile of the laptop.
On "silent" I disabled turbo and I usually use this while on battery. This has a custom fan curve to make it silent.


```
etc/modules-load.d/...
```
- acpi_call.conf makes sure the acpi_call module is loaded (when installed) to get custom fan control working