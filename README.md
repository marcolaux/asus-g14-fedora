# Fedora 33 Setup with an ASUS Zephyrus G14 GA401IV

---

This Git repo describes how I setup the ASUS Zephyrus G14 (GA401IV) with Fedora 33 including a GNOME Shell extension to switch between GPUs and ROG profiles.

## Installation process

**1. Install Fedora 33**

**2. Boot to your installation and update everything**

```bash
dnf update
dnf install tlp tlp-rdw brightnessctl
```

> tlp is used for automatic power management for some hardware components (so you don't have to powertop --auto-tune)

> brightnessctl is used for controlling the keyboard backlight before and after suspend as there is a bug that the keyboard backlight sometimes does not switch completely off while suspending. I also use it to control the brightness with the keyboard as I'm overriding the default keys with page up / down.

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
chmod +x /usr/sbin/asusboot
chmod a+x /usr/lib/systemd/system-sleep/asus_keyboard_backlight
systemd-hwdb update
udevadm trigger
```
> we clone this repo

> we go to the repo directory

> we copy everything in this repo of etc to /etc/

> we copy everything in this repo of usr to /usr/

> we make the script /usr/sbin/asusboot and /usr/lib/systemd/system-sleep/asus_keyboard_backlight executable

> mod the keyboard that **page up / down** is mapped to **fn+up/down** while **home (pos1) / end** is mapped to **fn+left/right**

> you can use brightnessctl -d asus::kbd_backlight s +1 and brightnessctl -d asus::kbd_backlight s 1- and map this to a key of your choice in your DE

**5 install some packages**
```bash
dnf update
dnf install kernel-devel akmod-nvidia xorg-x11-drv-nvidia-cuda asus-nb-ctrl dkms-hid-asus-rog dkms-asus-rog-nb-wmi akmod-acpi_call
```
> update the the packages and check the new repos (asus-linux.org and tlp) for new packages

> akmod-nvidia and xorg-x11-drv-nvidia-cuda installs the Nvidia driver

> asus-nb-ctrl dkms-hid-asus-rog dkms-asus-rog-nb-wmi installs the currently necesary Kernel modules from asus-linux.org to get the function keys and custom fan control working

> kernel-devel is necesarry for the dynamic kernel modules to compile

> acpi_call modules from the tlp repo is needed to make the custom fan control working

**6. Enable the custom services**

```bash
systemctl enable asusboot.service
```

> asusboot.service removes and adds again the i2c_hid modules because on Fedora 33 the touchpad sometimes is not initialized correctly on boot. This fixes this.

**5. Reboot**

**6. You can switch your prefered graphics mode via the GNOME Shell extension "asus-nb-gex" or with "asusctl graphics -m (graphics mode)"**

---

## What's in here...

### Asus-nb-gex GNOME Shell extension (modified)

![](https://gitlab.com/asus-linux/asus-nb-gex/uploads/e24a7ac93307540c1e34bec335e17a8c/image.png)

**Graphics Mode**

- _integrated_ - only use integrated AMD GPU while the NVIDIA is completely turned off
- _hybrid_ - use the integrated AMD GPU as the main GPU. The NVIDIA can be used for offloading *1
- _compute_ - use the integrated AMD GPU as the main GPU. The NVIDIA can be used for CUDA / OpenCL but not for offloading graphics.
- _nvidia_ - use the dedicated NVIDIA GPU as the main GPU.

*1 to offload a graphics application to your NVIDIA you can use GNOME Shells feature via right click on an application icon and use **run with dedicated graphics adapter**

**Profile**
- _Boost_ - high fan RPM, Ryzen Boost enabled
- _Normal_ - silent fan until 49°C CPU temperature, spins up at higher temps, Ryzen Boost enabled
- _Silent_ - silent fan until 69°C CPU temperature, spins up at higher temps, Ryzen Boost disabled

**usually a reboot or a restart of Xorg is required to apply the changes. There will be a notification with a call to action to give you a hint what action is required.**
![](https://user-images.githubusercontent.com/6410852/106669281-b8d96500-65ab-11eb-9e1e-adbd0126587d.png)
_**please note** that the message sometimes is not correct when you switch multiple times without doing the appropriate action. So save your work and do as the asusctl and this extension tells you :)_

> **silent** is good for the **integrated** graphics mode. for **every other** graphics mode I recommend **normal** as the case would heat up too much on silent.

> This extension uses asusctl to switch modes via asusctl's DBUS interface. You can either use the extension or asusctl directly if you don't use GNOME Shell.

> If you don't have GNOME Shell but a desktop environment with a system tray I suggest you use this very handy application: ![asusctltray](https://github.com/Baldomo/asusctltray/)

### asusctl

![asusctl](https://gitlab.com/asus-linux/asus-nb-ctrl) by Luke Jones (and his Kernel modules) are the key to this all. Without the efford of the community we wouldn't have such handy tools to control this machine. asusctl is used here to do most of the things, like graphics switching via the GNOME Shell extension or setting the ROG profiles.

You can use asusctl to switch your profile like so (use _integrated_, _hybrid_, _compute_ or _nvidia_ instead of {profile}):
```
asusctl graphics -m {profile}
```

You can also change the ROG profile via asusctl (use _silent_, _normal_ or _boost_ instead of {profile}):
```
asusctl profile {profile}
```

for more options have a look at this command:
```
asusctl --help
```

***

```
etc/asusd/asusd.conf
```
These are my custom fan curves for the asusd service from asus-linux.org.
When on AC I usually use "normal" because of turbo is enabled with the default silent fan profile of the laptop.
On "silent" I disabled turbo and I usually use this while on battery. This has a custom fan curve to make it silent.

```
etc/modprobe.d/asus.conf
```
Enables Nvidia power management and blacklists conflicting modules


```
etc/systemd/system/asusboot.service
```
removes and adds again the i2c_hid modules because on Fedora 32 the touchpad sometimes is not initialized correctly on boot. This fixes this.

```
etc/tlp.conf
```
marginal adjusted tlp configuration with the CPU gonvenor set to "ondemand".
I haven't set it to "powersave" as the CPU then does not clock higher than the base clock for me (Kernel 5.10). ondemand also seems pretty battery friendly, especially with the **silent** profile when the CPU Boost is disabled.

```
usr/sbin/asusboot
```
called by asusboot.service, gets called on boot and resets the i2c_hid modules because on Fedora 33 the touchpad sometimes is not initialized correctly on boot. This fixes this.
