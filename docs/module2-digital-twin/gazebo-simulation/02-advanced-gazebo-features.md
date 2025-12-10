# Advanced Gazebo Features

## Overview

This chapter covers advanced features of Gazebo simulation environment that are essential for realistic humanoid robotics development. Building upon the fundamentals covered in the previous chapter, we'll explore more sophisticated simulation capabilities.

## Advanced Physics Simulation

### Contact Sensors

Contact sensors allow your robot to detect when parts of its body come into contact with other objects in the environment:

```xml
<gazebo reference="link_name">
  <sensor name="contact_sensor" type="contact">
    <always_on>true</always_on>
    <update_rate>30</update_rate>
    <contact>
      <collision>link_name_collision</collision>
    </contact>
    <plugin name="contact_plugin" filename="libgazebo_ros_bumper.so">
      <alwaysOn>true</alwaysOn>
      <updateRate>30</updateRate>
      <bumperTopicName>bumper_vals</bumperTopicName>
      <frameName>world</frameName>
    </plugin>
  </sensor>
</gazebo>
```

### Force/Torque Sensors

Force and torque sensors are crucial for simulating realistic joint interactions:

```xml
<gazebo>
  <plugin name="ft_sensor" filename="libgazebo_ros_ft_sensor.so">
    <updateRate>100</updateRate>
    <topicName>ft_sensor_topic</topicName>
    <jointName>joint_name</jointName>
  </plugin>
</gazebo>
```

## Advanced Model Composition

### Multi-Body Dynamics

Complex humanoid robots require sophisticated multi-body dynamics to simulate realistic movement:

```xml
<robot name="advanced_humanoid">
  <!-- Include multiple URDF files -->
  <xacro:include filename="$(find package_name)/urdf/upper_body.urdf.xacro"/>
  <xacro:include filename="$(find package_name)/urdf/lower_body.urdf.xacro"/>
  <xacro:include filename="$(find package_name)/urdf/sensors.urdf.xacro"/>

  <!-- Macro for repeated components -->
  <xacro:macro name="humanoid_arm" params="side">
    <link name="${side}_upper_arm">
      <visual>
        <geometry>
          <cylinder length="0.3" radius="0.05"/>
        </geometry>
      </visual>
      <collision>
        <geometry>
          <cylinder length="0.3" radius="0.05"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="2.0"/>
        <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.001"/>
      </inertial>
    </link>
  </xacro:macro>
</robot>
```

## Advanced Controllers

### Whole-Body Controllers

For humanoid robots, whole-body controllers coordinate multiple joints simultaneously:

```python
import rospy
import numpy as np
from sensor_msgs.msg import JointState
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint

class WholeBodyController:
    def __init__(self):
        self.joint_pub = rospy.Publisher('/joint_trajectory_controller/command',
                                        JointTrajectory, queue_size=10)
        self.joint_sub = rospy.Subscriber('/joint_states', JointState, self.joint_callback)
        self.joint_names = []  # Initialize with actual joint names

    def move_to_pose(self, joint_positions, duration=1.0):
        trajectory = JointTrajectory()
        trajectory.joint_names = self.joint_names

        point = JointTrajectoryPoint()
        point.positions = joint_positions
        point.time_from_start = rospy.Duration(duration)

        trajectory.points.append(point)
        self.joint_pub.publish(trajectory)

    def joint_callback(self, msg):
        # Process joint states for feedback control
        pass
```

## Advanced Environment Simulation

### Terrain Generation

Creating realistic terrain for humanoid locomotion:

```xml
<sdf version="1.6">
  <world name="humanoid_world">
    <!-- Custom terrain -->
    <model name="terrain">
      <static>true</static>
      <link name="terrain_link">
        <collision name="terrain_collision">
          <surface>
            <friction>
              <ode>
                <mu>1.0</mu>
                <mu2>1.0</mu2>
              </ode>
            </friction>
          </surface>
        </collision>
        <visual name="terrain_visual">
          <geometry>
            <heightmap>
              <uri>model://terrain_heightmap.png</uri>
              <size>100 100 20</size>
              <pos>0 0 0</pos>
            </heightmap>
          </geometry>
        </visual>
      </link>
    </model>
  </world>
</sdf>
```

## Simulation Optimization

### Performance Tuning

Optimize simulation performance for real-time humanoid control:

```xml
<world name="optimized_world">
  <physics type="ode">
    <max_step_size>0.001</max_step_size>
    <real_time_factor>1.0</real_time_factor>
    <real_time_update_rate>1000</real_time_update_rate>
    <ode>
      <solver>
        <type>quick</type>
        <iters>10</iters>
        <sor>1.3</sor>
      </solver>
      <constraints>
        <cfm>0.000001</cfm>
        <erp>0.2</erp>
        <contact_max_correcting_vel>100</contact_max_correcting_vel>
        <contact_surface_layer>0.001</contact_surface_layer>
      </constraints>
    </ode>
  </physics>
</world>
```

## Integration with ROS Control

### Gazebo-ROS Control Interface

Setting up the interface between Gazebo and ROS controllers:

```xml
<!-- In your robot's URDF -->
<gazebo>
  <plugin name="gazebo_ros_control" filename="libgazebo_ros_control.so">
    <robotNamespace>/robot_name</robotNamespace>
    <robotSimType>gazebo_ros_control/DefaultRobotHWSim</robotSimType>
    <legacyModeNS>true</legacyModeNS>
  </plugin>
</gazebo>
```

And the corresponding controller configuration:

```yaml
# config/controllers.yaml
joint_state_controller:
  type: joint_state_controller/JointStateController
  publish_rate: 50

position_trajectory_controller:
  type: position_controllers/JointTrajectoryController
  joints:
    - joint1
    - joint2
    - joint3
  constraints:
    goal_time: 0.6
    stopped_velocity_tolerance: 0.05
  stop_trajectory_duration: 0.5
  state_publish_rate:  25
  action_monitor_rate: 10
```

## Best Practices

### Simulation Accuracy vs. Performance

Balancing accuracy and performance for humanoid robotics:

1. **Use appropriate physics parameters**: Higher accuracy requires smaller time steps but reduces performance
2. **Optimize collision geometry**: Use simplified collision meshes for better performance
3. **Adjust update rates**: Match controller update rates to your requirements
4. **Use fixed joints when possible**: Reduces computational overhead

### Validation Strategies

Validating simulation results against real-world behavior:

1. **Compare kinematic solutions**: Verify forward and inverse kinematics match
2. **Validate dynamic behavior**: Check that forces and torques are realistic
3. **Test control stability**: Ensure controllers work in both simulation and reality
4. **Document discrepancies**: Keep track of sim-to-real differences

## Summary

This chapter covered advanced Gazebo features essential for realistic humanoid robotics simulation. We explored contact sensors, force/torque sensors, advanced model composition, whole-body controllers, and performance optimization techniques.

The next chapter will focus on integrating these simulation capabilities with Isaac Sim for even more realistic humanoid robotics development.