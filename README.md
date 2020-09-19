# Fedora 32 Setup with an ASUS Zephyrus G14 GA401IV

**updated for BIOS 216**
In 216 some things about how the dGPU works changed. Now no acpi_call or bbswitch is needed to power the Nvidia down.
We can now just unbind it and set the power control for the Nvidia to "auto".
GPU switching without restarting is still possible. With the service here it get's unbinded to have AMD only mode with power saving or for hybrid mode it get's binded.
---

This Git repo describes how I setup the ASUS Zephyrus G14 (GA401IV) with Fedora 32.

After this setup nearly everything seems to work really great.
In addition to the Kernel modules from asus-linux.org I made some scripts to enable and disable the Nvidia GPU. By default after this setup the AMD GPU will be primary and the Nvidia will be used as a dedicated GPU that can be activated in GNOME Shell (right click on an app > launch app with dedicated graphics card).
In this Repo also is a GNOME Shell extension that helps with switching between Nvidia Power on and off. Just enable "Amd Nvidia switcher" in Extensions or GNOME Tweaks and you will see a new icon in the top bar. Just click on it and you will switch the power state of the Nvidia GPU (warning: this will log you out).
With the NVIDIA powered off power drain in idle is just between 5 - 6,5 watts. With the Nvidia on standby it's usually 10-12 watts while idle.

So let's go through this (I it works seemless in this order as I haven't done a complete new install, yet)...

## Installation process

**1. Install Fedora 32**

**2. Boot to your installation and update everything**

```bash
dnf update
dnf install tlp tlp-rdw
```

> tlp is used for automatic power management for some hardware components (so you don't have to powertop --auto-tune)

**3. Reboot**

**4. Add asus-linux.org repo and install some packages**

4.1 Add the asus-linux.org repo ([Instructions from asus-linux.org](https://asus-linux.org/wiki/keyboard-leds-anime/))

Create the file

| /etc/yum.repos.d/asus.repo

with the following content

```bash
[asus]
name=asus
failovermethod=priority
baseurl=https://download.opensuse.org/repositories/home:/luke_nukem:/asus/Fedora_32/
enabled=1
gpgcheck=0
```

4.2 Update the repos and install some packages
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

>    ~~it's also used by custom scripts to disable the Nvidia GPU (more on that later)~~

**5. copy all the files to the appropriate directories**

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

**6. Enable the custom services**

```bash
systemctl enable asusboot.service
systemctl enable asusgpuboot.service
```

> asusboot.service removes and adds again the i2c_hid modules because on Fedora 32 the touchpad sometimes is not initialized correctly on boot. This fixes this.

> asusgpuboot.services sets the power state that was previously selected (AMD only or AMD+Nvidia on demand). This service gets called on boot and resume.

**5. Reboot**

**6. You can switch AMD / Nvidia on demand via the gnome extension or with "sudo asus_gpu_switch"**

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
calls /usr/sbin/asus_gpu_boot on boot and resume (from suspend)

```
etc/systemd/system/asusgpuswitch.service
```
calls /usr/sbin/asus_gpu_switch

```
etc/tlp.conf
```
marginal adjusted tlp configuration with the CPU gonvenor set to "ondemand" as I've read that this is the only mode supported by Ryzen CPUs

```
usr/sbin/asus_boot
```
called by asusboot.service, gets called on boot / resume and removes / adds the i2c_hid modules because on Fedora 32 the touchpad sometimes is not initialized correctly on boot. This fixes this.

```
usr/sbin/asus_gpu_boot
```
called by asusgpuboot.service and powers the GPU down when not set or loads the Nvidia driver when set

```
usr/sbin/asus_gpu_switch
```
sets or removes the file /etc/asus_nvidia
> this file will be used to check what mode the user selected. If this file is present AMD+Nvidia on-demand is used. If the file is not present AMD-only with the Nvidia powered down is used.

If the /etc/asus_nvidia is currently present this file will get deleted and the Nvidia driver gets unloaded. The Nvidia GPU also gets powered down.
If the /etc/asus_nvidia is currently NOT present this file will get created, the Nvidia GPU gets powered up and the Nvidia drivers get loaded.

In both cases GDM gets restarted. This will log you out so be sure you save your stuff before doing this.

```
usr/share/gnome-shell/amd-nvidia-switcher@marcaux.de
```
This is a GNOME-Shell extension I quickly wrote for switching between AMD-only and Nvidia on-demand via GNOME-Shell so no command line or terminal is necesarry.
Just click the AMD or Nvidia icon in the top bar of GNOME-Shell, type your password, you will get logged out and the Nvidia is powered on or off.

```
usr/share/pulseaudio/alsa-mixer/paths
```
The currently needed adjustments for pulseaudio so volume control for the speakers works [see more at asus-linux.org](https://asus-linux.org/wiki/g14-and-g15/hardware/audio/)

```
usr/share/acpi_call-1.10
```
This is the Kernel module acpi_call needed to power down the Nvidia and to control the fans manually via asusctl.
I prepared this folder and adjusted the dkms.conf in it so the compilation works (didn't work for me from the original repo).

--
