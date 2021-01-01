# Fedora 33 Setup with an ASUS Zephyrus G14 GA401IV

**DISCLAIMER: turn off Secure Boot - otherwise unsigned dkms modules will not work aka Keyboard binds and nvidia drivers will not work**

This Git repo describes how I setup the ASUS Zephyrus G14 (GA401IV) with Fedora 33.

After this setup nearly everything seems to work really great.

## Installation process

**1. Install Fedora 33**

**2. Boot to your installation and update everything (kernel) and install tlp for some powersavings**

```bash
dnf update && dnf install tlp tlp-rdw
```

> tlp is used for automatic power management for some hardware components (so you don't have to powertop --auto-tune)

**3. Reboot**

**4. copy all the files to the appropriate directories**

```bash
git clone https://github.com/russiansmack/asus-g14-fedora.git && cd asus-g14-fedora
sudo su
/bin/cp -fR etc/* /etc/ && /bin/cp -fR usr/* /usr/ && chmod +x /usr/sbin/asus_boot
```
> we clone this repo

> we go to the repo directory

> we copy everything in this repo of etc to /etc/

> we copy everything in this repo of usr to /usr/

> we make the scripts in /usr/sbin/asus... executable

**5. Update the repos and install some packages**
```bash
dnf update && dnf install kernel-devel akmod-nvidia xorg-x11-drv-nvidia-cuda asus-nb-ctrl dkms-hid-asus-rog dkms-asus-rog-nb-wmi akmod-acpi_call
```

> akmod-nvidia and xorg-x11-drv-nvidia-cuda installs the Nvidia driver

> asus-nb-ctrl dkms-hid-asus-rog dkms-asus-rog-nb-wmi installs the currently necesary Kernel modules from asus-linux.org to get the function keys and custom fan control working

> kernel-devel is necesarry for the dynamic kernel modules to compile

> acpi_call modules from the tlp repo is needed to make the custom fan control working

**6. Enable the custom services**
```bash
systemctl enable asusboot.service && systemctl --user enable asus-notify.service
```

> asusboot.service removes and adds again the i2c_hid modules because on Fedora 32 the touchpad sometimes is not initialized correctly on boot. This fixes this.

> asus-notify.service notifies you of changes to fan speeds, turbo, gfx etc

**7. Reboot**

**8. You can switch AMD / Nvidia on demand with asusctl look at "asusctl --help"**

**9. Add missing Page UP/DOWN/HOME/END buttons into Gnome**
```
dconf load / < custom-shortcuts.conf
```
---

## What's in here...

```
etc/asusd/asusd.conf
```
These are my custom fan curves for the asusd service from asus-linux.org.
When on AC I usually use "normal" because of turbo is enabled in this profile in asusd.conf.
On "silent" I disabled turbo and I usually use this while on battery.

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
marginal adjusted tlp configuration with the CPU gonvenor set to "ondemand" on AC and "powersave" on BAT.
Also max CPU frequency on BAT is limited to 1,7GHz.

```
usr/sbin/asus_boot
```
called by asusboot.service, gets called on boot / resume and removes / adds the i2c_hid modules because on Fedora 32 the touchpad sometimes is not initialized correctly on boot. This fixes this.

```
usr/share/pulseaudio/alsa-mixer/paths
```
The currently needed adjustments for pulseaudio so volume control for the speakers works [see more at asus-linux.org](https://asus-linux.org/wiki/g14-and-g15/hardware/audio/)
