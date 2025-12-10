# Installation and Setup Guide

## Setting Up Your Development Environment

This guide will walk you through setting up your development environment for the Physical AI & Humanoid Robotics projects covered in this book.

### System Requirements

#### Minimum Requirements
- **CPU**: Intel i7 or AMD Ryzen 7 (8+ cores recommended)
- **RAM**: 16 GB (32 GB recommended for simulation)
- **Storage**: 100 GB free space (SSD recommended)
- **GPU**: NVIDIA GPU with CUDA support (for Isaac Sim and advanced simulations)
- **OS**: Ubuntu 20.04 LTS or Ubuntu 22.04 LTS

#### Recommended Configuration
- **CPU**: Intel i9 or AMD Ryzen 9 (16+ cores)
- **RAM**: 32-64 GB
- **Storage**: 500 GB NVMe SSD
- **GPU**: NVIDIA RTX 3080/4080 or better
- **Network**: Stable internet connection for package downloads

### Operating System Setup

#### Option 1: Native Ubuntu Installation (Recommended)
1. Download Ubuntu 20.04 LTS or 22.04 LTS from ubuntu.com
2. Create a bootable USB drive using Rufus (Windows) or Etcher (cross-platform)
3. Boot from USB and install Ubuntu alongside or instead of your current OS

#### Option 2: Virtual Machine (Less Recommended)
- VMware Workstation/Player Pro
- VirtualBox
- Minimum 8GB RAM allocated to VM
- Nested virtualization enabled in BIOS

#### Option 3: Windows Subsystem for Linux (WSL2)
1. Enable WSL2 on Windows 10/11
2. Install Ubuntu 20.04/22.04 from Microsoft Store
3. Install WSL-GPU-Passthrough for graphics acceleration

### Core Development Tools

#### 1. Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Essential Build Tools
```bash
sudo apt install build-essential cmake pkg-config git curl wget gnupg lsb-release
```

#### 3. Install Python and Pip
```bash
sudo apt install python3 python3-pip python3-dev python3-venv
```

#### 4. Install Docker (Optional but Recommended)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### ROS 2 Installation

#### 1. Add ROS 2 Repository
```bash
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(source /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

#### 2. Install ROS 2 Humble Hawksbill
```bash
sudo apt update
sudo apt install ros-humble-desktop-full
sudo apt install python3-colcon-common-extensions
sudo apt install python3-rosdep python3-vcstool # install rosdep and vcs
```

#### 3. Initialize rosdep
```bash
sudo rosdep init
rosdep update
```

#### 4. Source ROS 2 Environment
Add to your `~/.bashrc`:
```bash
source /opt/ros/humble/setup.bash
```

Then run:
```bash
source ~/.bashrc
```

### Workspace Setup

#### 1. Create ROS 2 Workspace
```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
colcon build --symlink-install
```

#### 2. Source Workspace
Add to your `~/.bashrc`:
```bash
source ~/ros2_ws/install/setup.bash
```

### Simulation Environments

#### Gazebo Installation
```bash
sudo apt install ros-humble-gazebo-* ros-humble-ign-*
```

#### Isaac Sim Setup (NVIDIA GPUs)
1. Install NVIDIA drivers (version 495 or newer)
2. Install CUDA toolkit
3. Download Isaac Sim from NVIDIA Developer website
4. Follow NVIDIA's installation guide for Isaac Sim

### Development Tools

#### 1. Visual Studio Code
```bash
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64 signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install apt-transport-https
sudo apt install code
```

#### 2. VS Code Extensions for ROS 2
Install these extensions in VS Code:
- ROS
- Python
- C/C++
- GitLens
- Docker

#### 3. Additional Tools
```bash
sudo apt install terminator htop iotop glances
pip3 install numpy scipy matplotlib pandas jupyterlab
```

### Testing Your Setup

#### 1. Verify ROS 2 Installation
```bash
ros2 --version
```

#### 2. Test Basic ROS 2 Communication
```bash
# Terminal 1
ros2 run demo_nodes_cpp talker

# Terminal 2 (after sourcing ROS 2)
ros2 run demo_nodes_py listener
```

#### 3. Verify Gazebo Installation
```bash
gazebo --version
```

### Troubleshooting Common Issues

#### Issue: Permission denied for Docker
- Solution: Log out and log back in after adding user to docker group

#### Issue: ROS 2 commands not found
- Solution: Ensure you've sourced the ROS 2 environment (`source /opt/ros/humble/setup.bash`)

#### Issue: Gazebo crashes or doesn't launch
- Solution: Check graphics drivers and X11 forwarding if using SSH

#### Issue: Isaac Sim fails to start
- Solution: Verify NVIDIA GPU and driver compatibility, check CUDA installation

### Next Steps

Once your environment is set up, you can:
1. Navigate to the Module 1 documentation to begin with ROS 2 basics
2. Clone the book's example repositories
3. Start with the basic ROS 2 tutorials

### Additional Resources

- [ROS 2 Documentation](https://docs.ros.org/en/humble/)
- [Ubuntu Installation Guide](https://ubuntu.com/tutorials/install-ubuntu-desktop)
- [NVIDIA Isaac Sim Documentation](https://docs.nvidia.com/isaac/)

---

Remember to restart your terminal or run `source ~/.bashrc` after making changes to your bashrc file to ensure all environment variables are loaded correctly.