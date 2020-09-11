# Fedora 32 Setup with an ASUS Zephyrus G14

```bash
dnf update
```

reboot

copy all the files after the first updates and the reboot to the appropriate directories

```bash
dnf install akmod-nvidia xorg-x11-drv-nvidia-cuda asus-nb-ctrl dkms-hid-asus-rog dkms-asus-rog-nb-wmi tlp tlp-rdw
dkms build acpi_call -v 1.1.0
dkms install acpi_call -v 1.1.0
```

reboot

```bash
asusctl profile -p silent -C 30c:0%,40c:0%,50c:0%,60c:0%,70c:35%,80c:55%,90c:65%,100c:85%
asusctl profile -p normal -C 30c:0%,40c:0%,50c:0%,60c:10%,70c:35%,80c:55%,90c:65%,100c:85%
```

all nice now
