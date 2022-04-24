# ASUS X13 dGPU suspend draft

This is a draft on what works for the ASUS X13 to turn off the dGPU completely (even though hybrid graphics with an auto suspending dGPU works, this is an experiement).

## First things first

### `supergfxctl -m integrated` does not work

- dGPU not in device tree (do be expected)
- dGPU **still consuming power** (> 20W)

### `\_SB.PCI0.GPP0.PG00._OFF > /proc/acpi/call` does not work

- dGPU is off (yay)
- dGPU still in device tree (not removed)
- **system crashes** (after lspci or the system requests the GPUs, like when launching apps)

### `echo 1 > /sys/bus/pci/devices/0000\:01\:00.0/remove` manually works

- dGPU is off (yay)
- dGPU not in device tree (do be expected)
- system is stable

## Thoughts

`supergfxctl` does not turn off the dGPU even though it is not in the PCI device tree after setting the mode to `integrated`

It made me curious if this machine uses the old GPU off methods like in the 2020 G14 (before BIOS 216) where we had to unbind the dGPU from the nvidia driver and use acpi_call to power off the dGPU.

This though (just using acpi_call to power device off and leaving it in the device tree) resulted in hard resets of the whole device when the PCI bus got rescanned or a graphical application wanted to have a look at the available GPUs.

By just removing the device from the tree succeeded though in a stable environment with the dPGU off.

I'm not sure why supergfxctl doesn't do the trick at the moment as I thought the behaviour would be the same as the device is also not available in the device tree after selecting `integrated`.