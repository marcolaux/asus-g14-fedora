# Fedora 32 Setup with an ASUS Zephyrus G14

This Git repo describes how I setup the ASUS Zephyrus G14 (GA401IV) with Fedora 32.

After this setup nearly everything seems to work really great.
In addition to the Kernel modules from asus-linux.org I made some scripts to enable and disable the Nvidia GPU. By default after this setup the AMD GPU will be primary and the Nvidia will be used as a dedicated GPU that can be activated in GNOME Shell (right click on an app > launch app with dedicated graphics card).
In this Repo also is a GNOME Shell extension that helps with switching between Nvidia Power on and off. Just enable "Amd Nvidia switcher" in Extensions or GNOME Tweaks and you will see a new icon in the top bar. Just click on it and you will switch the power state of the Nvidia GPU (warning: this will log you out).
With the NVIDIA powered off power drain in idle is just between 5 - 6,5 watts. With the Nvidia on standby it's usually 10-12 watts while idle.

So let's go through this...

## Installation process

1. Install Fedora 32

2. Boot to your installation and update everything

```bash
dnf update
dnf install tlp tlp-rdw
```

> tlp is used for automatic power management for some hardware components (so you don't have to powertop --auto-tune)

3. Reboot

4. Install the following packages

```bash
dnf update
dnf install kernel-devel akmod-nvidia xorg-x11-drv-nvidia-cuda asus-nb-ctrl dkms-hid-asus-rog dkms-asus-rog-nb-wmi
dkms build acpi_call -v 1.1.0
dkms install acpi_call -v 1.1.0
```

> akmod-nvidia and xorg-x11-drv-nvidia-cuda installs the Nvidia driver

> asus-nb-ctrl dkms-hid-asus-rog dkms-asus-rog-nb-wmi installs the currently necesary Kernel modules from asus-linux.org to get the function keys and custom fan control working

> kernel-devel is necesarry for the dynamic kernel modules to compile

> building and installing the acpi_call modules from this repo is needed to make the custom fan control working

>    it's also used by custom scripts to disable the Nvidia GPU (more on that later)

5. copy all the files to the appropriate directories

```bash
git clone https://github.com/hyphone/asus-g14-fedora.git
cd asus-g14-fedora
cp -R etc/* /etc/
cp -R usr/* /usr/
chmod +x /usr/sbin/asus_boot
chmod +x /usr/sbin/asus_gpu_boot
chmod +x /usr/sbin/asus_gpu_switch
```
> we clone this repo

> we go to the repo directory

> we copy everything in this repo of etc to /etc/

> we copy everything in this repo of usr to /usr/

> we make the scripts in /usr/sbin/asus... executable

6. Enable the custom services

```bash
systemctl enable asusboot.service
systemctl enable asusgpuboot.service
```

> asusboot.service removes and adds again the i2c_hid modules because on Fedora 32 the touchpad sometimes is not initialized correctly on boot. This fixes this.

> asusgpuboot.services sets the power state that was previously selected (AMD only or AMD+Nvidia on demand)

5. Reboot

6. You can switch AMD / Nvidia on demand via the gnome extension or with "systemctl start asusgpuswitch.service"

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
This disables the folowing modules:
nouveau, nvidiafb, rivafb, i2c_nvidia_gpu, nvidia_uvm, nvidia_drm, nvidia_modeset, nvidia

nvidia is blacklisted because we enable it on boot time with the service "asusbootboot.service" depending on what Power mode is used.

```
etc/modprobe.d/nvidia.conf
```
This sets the power optimizations of the later Nvidia drivers so when the Nvidia is enabled it consumes less power in idle mode (~ 5 watts on an 2060 RTX).


```
etc/modules-load.d/acpi_call.conf
```
This loads the acpi_call kernel module (it didn't load automatically earlier so I put this in place just in case).

```
etc/systemd/system/asusboot.service
```
removes and adds again the i2c_hid modules because on Fedora 32 the touchpad sometimes is not initialized correctly on boot. This fixes this.

```
etc/systemd/system/asusgpuboot.service
```
calls /usr/sbin/asus_gpu_boot on boot

```
etc/systemd/system/asusgpuswitch.service
```
calls /usr/sbin/asus_gpu_switch

