# Troubleshooting Guide

This guide provides solutions to common issues you may encounter while working with the Physical AI & Humanoid Robotics book examples and projects.

## Installation and Setup Issues

### ROS 2 Installation Problems

**Problem**: `ros2` command not found after installation
- **Solution**: Ensure you've sourced ROS 2 properly:
  ```bash
  source /opt/ros/humble/setup.bash
  ```
  Add this to your `~/.bashrc` to make it permanent:
  ```bash
  echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
  ```

**Problem**: Missing ROS 2 packages
- **Solution**: Install desktop-full installation:
  ```bash
  sudo apt update
  sudo apt install ros-humble-desktop-full
  sudo apt install python3-colcon-common-extensions
  ```

**Problem**: Permission denied when using ROS 2
- **Solution**: Check if you're in the correct ROS domain:
  ```bash
  echo $ROS_DOMAIN_ID
  # If needed, set it to default: export ROS_DOMAIN_ID=0
  ```

### Python Environment Issues

**Problem**: Python package import errors
- **Solution**: Ensure you're using the correct Python environment:
  ```bash
  python3 -c "import rclpy"  # Test ROS 2 Python bindings
  python3 -c "import torch"  # Test PyTorch
  python3 -c "import cv2"    # Test OpenCV
  ```

**Problem**: Virtual environment conflicts
- **Solution**: Create a dedicated environment for robotics:
  ```bash
  python3 -m venv robotics_env
  source robotics_env/bin/activate
  pip install -r requirements.txt  # If you have a requirements file
  ```

## Simulation Environment Issues

### Gazebo Problems

**Problem**: Gazebo crashes or fails to start
- **Solution**: Check graphics drivers and X11 forwarding:
  ```bash
  # Test if OpenGL works
  glxinfo | grep "OpenGL renderer"

  # If using WSL2, ensure WSL-GPU-Passthrough is configured
  # If using SSH, ensure X11 forwarding is enabled
  ```

**Problem**: Robot model falls through the ground
- **Solution**: Check physics parameters in your URDF:
  ```xml
  <link name="base_link">
    <inertial>
      <mass value="10.0"/>
      <inertia ixx="1.0" ixy="0.0" ixz="0.0" iyy="1.0" iyz="0.0" izz="1.0"/>
    </inertial>
    <collision>
      <geometry>
        <box size="1 1 1"/>
      </geometry>
    </collision>
  </link>
  ```

**Problem**: Joints are not responding to commands
- **Solution**: Verify joint state and effort publishers are running:
  ```bash
  ros2 run joint_state_publisher joint_state_publisher
  ros2 run robot_state_publisher robot_state_publisher
  ```

### Isaac Sim Issues

**Problem**: Isaac Sim fails to start or crashes
- **Solution**:
  1. Verify NVIDIA GPU and driver compatibility
  2. Ensure CUDA is properly installed
  3. Check that Isaac Sim requirements are met
  4. Run Isaac Sim from its dedicated Python environment

**Problem**: USD files not loading
- **Solution**: Check file paths and permissions:
  ```bash
  # Verify file exists and is readable
  ls -la /path/to/your/model.usd
  # Ensure Isaac Sim can access the file
  ```

## ROS 2 Communication Issues

### Topic and Service Problems

**Problem**: Nodes can't communicate across machines
- **Solution**: Check network configuration and ROS domain:
  ```bash
  # Ensure same domain ID
  export ROS_DOMAIN_ID=0

  # Check network settings
  echo $ROS_LOCALHOST_ONLY  # Should be 0 for multi-machine
  ```

**Problem**: Topic echo shows no data
- **Solution**: Verify topic existence and node status:
  ```bash
  # List all topics
  ros2 topic list

  # Check topic info
  ros2 topic info /your_topic_name

  # Verify node is running
  ros2 node list
  ```

### Action Server Issues

**Problem**: Action client times out waiting for server
- **Solution**: Ensure action server is running and check names:
  ```bash
  # Check if action server is available
  ros2 action list

  # Verify action type matches
  ros2 action info /action_name
  ```

## Vision and Perception Issues

### Camera and Sensor Problems

**Problem**: Camera not publishing images
- **Solution**: Check camera driver and configuration:
  ```bash
  # Verify camera topic exists
  ros2 topic list | grep image

  # Check if camera node is running
  ros2 run camera_driver camera_node
  ```

**Problem**: OpenCV import errors
- **Solution**: Install OpenCV properly:
  ```bash
  pip3 install opencv-python
  # For additional functionality:
  pip3 install opencv-contrib-python
  ```

### Point Cloud Issues

**Problem**: Point cloud data not displaying properly
- **Solution**: Check PCL installation and message formats:
  ```bash
  # Verify PCL is installed
  sudo apt install ros-humble-pcl-ros

  # Check message type compatibility
  ros2 msg show sensor_msgs/msg/PointCloud2
  ```

## Control System Issues

### PID Controller Problems

**Problem**: Robot oscillates or is unstable
- **Solution**: Tune PID parameters:
  ```python
  # Start with conservative values
  kp = 1.0   # Proportional gain
  ki = 0.1   # Integral gain
  kd = 0.05  # Derivative gain

  # Use Ziegler-Nichols method or iterative tuning
  ```

**Problem**: Robot doesn't reach target position
- **Solution**: Check joint limits and controller configuration:
  ```xml
  <joint name="joint_name" type="revolute">
    <limit lower="-3.14" upper="3.14" effort="100" velocity="1.0"/>
  </joint>
  ```

## Deep Learning and AI Issues

### PyTorch/CUDA Problems

**Problem**: PyTorch not using GPU
- **Solution**: Verify CUDA installation:
  ```python
  import torch
  print(torch.cuda.is_available())  # Should return True
  print(torch.cuda.device_count())  # Should return number of GPUs
  ```

**Problem**: Out of memory errors
- **Solution**: Reduce batch size or use model quantization:
  ```python
  # Reduce batch size
  batch_size = 1  # Instead of larger values

  # Use half precision
  model = model.half()
  input_tensor = input_tensor.half()
  ```

### Model Loading Issues

**Problem**: Vision model not loading or producing wrong outputs
- **Solution**: Verify input format and preprocessing:
  ```python
  # Check input dimensions
  print(f"Input shape: {input_tensor.shape}")

  # Verify preprocessing pipeline
  # Ensure normalization matches training
  ```

## Hardware Integration Issues

### Real Robot Safety

**Problem**: Robot moves unexpectedly during testing
- **Solution**: Implement safety checks:
  ```python
  # Always implement emergency stop
  def emergency_stop():
      # Send zero velocity commands
      # Disable actuators if possible
      pass

  # Check joint limits before sending commands
  def check_limits(joint_positions):
      return all(min_limit <= pos <= max_limit
                for pos, min_limit, max_limit in zip(joint_positions, min_limits, max_limits))
  ```

### Communication Problems

**Problem**: Robot not responding to commands
- **Solution**: Check communication interfaces:
  ```bash
  # Verify serial connection
  ls /dev/ttyUSB*  # or /dev/ttyACM*

  # Check network connection for remote robots
  ping robot_ip_address
  ```

## Performance Optimization

### Simulation Performance

**Problem**: Simulation running too slowly
- **Solution**: Optimize physics and rendering:
  ```xml
  <!-- In your world file -->
  <physics type="ode">
    <max_step_size>0.01</max_step_size>  <!-- Increase for performance -->
    <real_time_factor>0.5</real_time_factor>  <!-- Allow slower than real-time -->
  </physics>
  ```

### ROS 2 Performance

**Problem**: High latency in ROS 2 communication
- **Solution**: Optimize Quality of Service (QoS):
  ```python
  from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy

  qos_profile = QoSProfile(
      depth=1,
      reliability=ReliabilityPolicy.RELIABLE,  # or BEST_EFFORT
      durability=DurabilityPolicy.VOLATILE
  )
  ```

## Debugging Strategies

### Using ROS 2 Tools

**Problem**: Need to debug communication issues
- **Solution**: Use ROS 2 introspection tools:
  ```bash
  # Monitor all topics
  ros2 topic list -v

  # Echo messages with timestamps
  ros2 topic echo /topic_name --field field_name

  # Monitor system performance
  ros2 doctor
  ```

### Logging and Monitoring

**Problem**: Need to track robot behavior
- **Solution**: Implement comprehensive logging:
  ```python
  import rclpy.logging

  logger = rclpy.logging.get_logger('robot_controller')
  logger.info('Starting controller')
  logger.warn('Potential issue detected')
  logger.error('Critical error occurred')
  ```

## Common Error Messages

### "command not found"
- **Cause**: Command not in PATH or not installed
- **Solution**: Check installation and PATH environment variable

### "Permission denied"
- **Cause**: Insufficient permissions or file ownership
- **Solution**: Use `chmod` to change permissions or `sudo` if appropriate

### "Connection refused"
- **Cause**: Service not running or network issue
- **Solution**: Check if service is running and network configuration

### "Segmentation fault"
- **Cause**: Memory access violation in C++ code
- **Solution**: Use debug builds and memory checkers like Valgrind

### "ImportError: No module named"
- **Cause**: Python package not installed or environment not activated
- **Solution**: Install package with pip or activate correct environment

## Getting Help

### When to Seek Help
- Issues persist after consulting this guide
- Error messages are unclear
- Need clarification on concepts
- Found potential bugs in examples

### Where to Get Help
1. Check the FAQ for common questions
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Include:
   - Complete error message
   - Environment details (OS, ROS version, hardware)
   - Steps to reproduce
   - What you've tried already

### Creating Good Bug Reports
- Use clear, descriptive titles
- Include minimal reproducible example
- Specify expected vs. actual behavior
- Provide system information

## Prevention Tips

### Best Practices
- Always test in simulation before real hardware
- Use version control for your code
- Keep regular backups
- Document your changes
- Test incrementally
- Use safety limits and checks
- Verify configurations before deployment

This troubleshooting guide will be updated regularly. If you encounter an issue not covered here, please report it through the project's issue tracker.