---
title: URDF Modeling and Robot Description
sidebar_position: 1
---

# URDF Modeling and Robot Description

## Introduction

Unified Robot Description Format (URDF) is the standard XML-based format for representing robot models in ROS. It describes a robot's physical and visual properties, including links, joints, inertial properties, and geometric shapes. Understanding URDF is essential for creating accurate robot models that can be used for simulation, visualization, and control in robotic applications.

## URDF Fundamentals

### What is URDF?

URDF (Unified Robot Description Format) is an XML-based format that describes a robot's physical structure, including:
- **Links**: Rigid bodies of the robot
- **Joints**: Connections between links with defined motion
- **Visual properties**: How the robot appears in simulation
- **Collision properties**: How the robot interacts with the environment
- **Inertial properties**: Mass, center of mass, and inertia for physics simulation

### Basic URDF Structure

```xml
<?xml version="1.0"?>
<robot name="my_robot" xmlns:xacro="http://www.ros.org/wiki/xacro">
  <!-- Links define rigid bodies -->
  <link name="base_link">
    <visual>
      <geometry>
        <cylinder length="0.6" radius="0.2"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.6" radius="0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10"/>
      <inertia ixx="1.0" ixy="0.0" ixz="0.0" iyy="1.0" iyz="0.0" izz="1.0"/>
    </inertial>
  </link>

  <!-- Joints define connections between links -->
  <joint name="base_to_wheel" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_link"/>
    <origin xyz="0 0.2 -0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
  </joint>

  <link name="wheel_link">
    <visual>
      <geometry>
        <cylinder length="0.1" radius="0.1"/>
      </geometry>
    </visual>
  </link>
</robot>
```

## Links

Links represent rigid bodies in the robot model. Each link can have multiple properties:

### Visual Properties
```xml
<link name="visual_example">
  <visual>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <!-- Options: box, cylinder, sphere, mesh -->
      <box size="0.1 0.2 0.3"/>
    </geometry>
    <material name="blue">
      <color rgba="0 0 1 1"/>
    </material>
  </visual>
</link>
```

### Collision Properties
```xml
<link name="collision_example">
  <collision>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <box size="0.1 0.2 0.3"/>
    </geometry>
  </collision>
</link>
```

### Inertial Properties
```xml
<link name="inertial_example">
  <inertial>
    <mass value="1.0"/>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.1"/>
  </inertial>
</link>
```

## Joints

Joints define the connection between links and specify how they can move relative to each other.

### Joint Types

| Joint Type | Description | Degrees of Freedom |
|------------|-------------|-------------------|
| `revolute` | Rotational joint with limits | 1 (rotation) |
| `continuous` | Rotational joint without limits | 1 (rotation) |
| `prismatic` | Linear sliding joint with limits | 1 (translation) |
| `fixed` | No movement allowed | 0 |
| `floating` | 6 DOF movement | 6 |
| `planar` | Movement in a plane | 3 |

### Joint Definition Example
```xml
<joint name="joint_example" type="revolute">
  <parent link="parent_link"/>
  <child link="child_link"/>
  <origin xyz="0 0 0.1" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <limit lower="-1.57" upper="1.57" effort="10.0" velocity="1.0"/>
  <dynamics damping="0.1" friction="0.0"/>
</joint>
```

## Complete Robot Model Example

Here's a more complex example of a simple wheeled robot:

```xml
<?xml version="1.0"?>
<robot name="simple_robot">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <origin xyz="0 0 0.1" rpy="0 0 0"/>
      <geometry>
        <box size="0.5 0.3 0.2"/>
      </geometry>
      <material name="light_grey">
        <color rgba="0.7 0.7 0.7 1.0"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0.1" rpy="0 0 0"/>
      <geometry>
        <box size="0.5 0.3 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10.0"/>
      <origin xyz="0 0 0.1" rpy="0 0 0"/>
      <inertia ixx="0.416" ixy="0.0" ixz="0.0" iyy="0.708" iyz="0.0" izz="0.708"/>
    </inertial>
  </link>

  <!-- Left wheel -->
  <link name="left_wheel">
    <visual>
      <origin xyz="0 0 0" rpy="1.570796 0 0"/>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="1.570796 0 0"/>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.005" iyz="0.0" izz="0.01"/>
    </inertial>
  </link>

  <!-- Right wheel -->
  <link name="right_wheel">
    <visual>
      <origin xyz="0 0 0" rpy="1.570796 0 0"/>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="1.570796 0 0"/>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.005" iyz="0.0" izz="0.01"/>
    </inertial>
  </link>

  <!-- Joints connecting wheels to base -->
  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel"/>
    <origin xyz="0.15 0.175 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>

  <joint name="right_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="right_wheel"/>
    <origin xyz="0.15 -0.175 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>

  <!-- Castor wheel -->
  <link name="caster_wheel">
    <visual>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.1"/>
      <inertia ixx="0.0001" ixy="0.0" ixz="0.0" iyy="0.0001" iyz="0.0" izz="0.0001"/>
    </inertial>
  </link>

  <joint name="caster_joint" type="fixed">
    <parent link="base_link"/>
    <child link="caster_wheel"/>
    <origin xyz="-0.2 0 -0.05" rpy="0 0 0"/>
  </joint>
</robot>
```

## Xacro for Complex Models

Xacro (XML Macros) extends URDF with macros, properties, and mathematical expressions, making complex models more manageable:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="xacro_robot">
  <!-- Properties -->
  <xacro:property name="M_PI" value="3.1415926535897931" />
  <xacro:property name="wheel_radius" value="0.1" />
  <xacro:property name="wheel_width" value="0.05" />
  <xacro:property name="base_length" value="0.5" />
  <xacro:property name="base_width" value="0.3" />
  <xacro:property name="base_height" value="0.2" />

  <!-- Macro for creating wheels -->
  <xacro:macro name="wheel" params="prefix parent x y z">
    <link name="${prefix}_wheel">
      <visual>
        <origin xyz="0 0 0" rpy="${M_PI/2} 0 0"/>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
        <material name="black">
          <color rgba="0 0 0 1"/>
        </material>
      </visual>
      <collision>
        <origin xyz="0 0 0" rpy="${M_PI/2} 0 0"/>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="1.0"/>
        <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.005" iyz="0.0" izz="0.01"/>
      </inertial>
    </link>

    <joint name="${prefix}_wheel_joint" type="continuous">
      <parent link="${parent}"/>
      <child link="${prefix}_wheel"/>
      <origin xyz="${x} ${y} ${z}" rpy="0 0 0"/>
      <axis xyz="0 0 1"/>
    </joint>
  </xacro:macro>

  <!-- Base link -->
  <link name="base_link">
    <visual>
      <origin xyz="0 0 ${base_height/2}" rpy="0 0 0"/>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
      <material name="light_grey">
        <color rgba="0.7 0.7 0.7 1.0"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 ${base_height/2}" rpy="0 0 0"/>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10.0"/>
      <origin xyz="0 0 ${base_height/2}" rpy="0 0 0"/>
      <inertia ixx="0.416" ixy="0.0" ixz="0.0" iyy="0.708" iyz="0.0" izz="0.708"/>
    </inertial>
  </link>

  <!-- Create wheels using macro -->
  <xacro:wheel prefix="left" parent="base_link" x="0.15" y="0.175" z="0"/>
  <xacro:wheel prefix="right" parent="base_link" x="0.15" y="-0.175" z="0"/>
</robot>
```

## Advanced URDF Features

### Transmissions
```xml
<transmission name="left_wheel_trans">
  <type>transmission_interface/SimpleTransmission</type>
  <joint name="left_wheel_joint">
    <hardwareInterface>hardware_interface/VelocityJointInterface</hardwareInterface>
  </joint>
  <actuator name="left_wheel_motor">
    <hardwareInterface>hardware_interface/VelocityJointInterface</hardwareInterface>
    <mechanicalReduction>1</mechanicalReduction>
  </actuator>
</transmission>
```

### Gazebo-Specific Elements
```xml
<gazebo reference="base_link">
  <material>Gazebo/Orange</material>
  <mu1>0.2</mu1>
  <mu2>0.2</mu2>
</gazebo>

<gazebo>
  <plugin name="diff_drive" filename="libgazebo_ros_diff_drive.so">
    <left_joint>left_wheel_joint</left_joint>
    <right_joint>right_wheel_joint</right_joint>
    <wheel_separation>0.35</wheel_separation>
    <wheel_diameter>0.2</wheel_diameter>
  </plugin>
</gazebo>
```

## URDF Best Practices

### 1. Proper Inertial Properties
- Calculate inertial properties accurately
- Use consistent units (SI units)
- Consider mass distribution in links

### 2. Appropriate Collision Geometry
- Use simplified geometry for collision detection
- Balance accuracy with performance
- Consider convex hulls for complex shapes

### 3. Hierarchical Organization
- Create a clear kinematic chain
- Use meaningful names for links and joints
- Maintain a single root link

### 4. Parameterization
- Use xacro properties for easy modification
- Parameterize dimensions for different robot variants
- Use mathematical expressions where appropriate

## Validation and Debugging

### Checking URDF Files
```bash
# Validate URDF syntax
check_urdf my_robot.urdf

# Show robot information
urdf_to_graphiz my_robot.urdf
```

### Visualizing in RViz
```bash
# Launch robot state publisher
ros2 run robot_state_publisher robot_state_publisher --ros-args -p robot_description:='$(cat my_robot.urdf)'
```

### Common Issues and Solutions

1. **Self-Collision**: Ensure appropriate collision properties to prevent parts from colliding with themselves
2. **Kinematic Loops**: URDF doesn't support closed kinematic chains; use transmissions for complex mechanisms
3. **Inertial Issues**: Incorrect inertial properties can cause simulation instability
4. **Joint Limits**: Always specify appropriate limits for revolute joints

## Integration with ROS 2

### Robot State Publisher
```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from geometry_msgs.msg import TransformStamped
import tf2_ros

class RobotStatePublisher(Node):
    def __init__(self):
        super().__init__('robot_state_publisher')
        self.joint_state_sub = self.create_subscription(
            JointState, 'joint_states', self.joint_state_callback, 10)
        self.tf_broadcaster = tf2_ros.TransformBroadcaster(self)

    def joint_state_callback(self, msg):
        # Process joint states and broadcast transforms
        for i, name in enumerate(msg.name):
            t = TransformStamped()
            t.header.stamp = self.get_clock().now().to_msg()
            t.header.frame_id = 'base_link'
            t.child_frame_id = name
            # Set transform based on joint position
            self.tf_broadcaster.sendTransform(t)
```

## URDF for Humanoid Robots

For humanoid robots, special considerations apply:

```xml
<!-- Example humanoid torso -->
<link name="torso">
  <visual>
    <geometry>
      <capsule radius="0.1" length="0.4"/>
    </geometry>
  </visual>
  <collision>
    <geometry>
      <capsule radius="0.1" length="0.4"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="10.0"/>
    <inertia ixx="0.5" ixy="0.0" ixz="0.0" iyy="0.5" iyz="0.0" izz="0.2"/>
  </inertial>
</link>

<!-- Example humanoid joint with safety limits -->
<joint name="hip_joint" type="revolute">
  <parent link="torso"/>
  <child link="thigh"/>
  <origin xyz="0 0 -0.2" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-1.57" upper="1.57" effort="100.0" velocity="2.0"/>
  <safety_controller k_position="10" k_velocity="10"
                    soft_lower_limit="-1.5" soft_upper_limit="1.5"/>
</joint>
```

## Tools for URDF Development

### 1. URDF Editor
- Visual tools for creating and modifying URDF files
- Real-time visualization of robot models

### 2. Inertial Calculators
- Tools for calculating inertial properties
- Integration with CAD software

### 3. Validation Tools
- URDF checkers and validators
- Simulation compatibility checkers

## Summary

URDF is fundamental to robot modeling in ROS, providing a standardized way to describe robot geometry, kinematics, and dynamics. Proper URDF models are essential for simulation, visualization, and control. Understanding the structure of links, joints, and their properties enables the creation of accurate robot models suitable for various applications, from simple wheeled robots to complex humanoid systems.

## Further Reading

- URDF Tutorials: http://wiki.ros.org/urdf/Tutorials
- Xacro Documentation: http://wiki.ros.org/xacro
- "Robotics, Vision and Control" by Corke for kinematic modeling
- ROS 2 Robot State Publisher documentation
