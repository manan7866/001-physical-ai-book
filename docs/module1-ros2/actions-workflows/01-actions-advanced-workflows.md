---
title: Actions and Advanced Workflows
sidebar_position: 1
---

# Actions and Advanced Workflows

## Introduction

Actions in ROS 2 represent a sophisticated communication pattern that extends beyond simple topics and services. They are designed for long-running tasks that require feedback, goal preemption, and result reporting. This chapter explores the advanced workflow patterns in ROS 2, focusing on actions, complex state management, and coordination between multiple nodes.

## Understanding Actions

### When to Use Actions

Actions are ideal for tasks that:
- Take a significant amount of time to complete
- Require feedback during execution
- May need to be preempted or canceled
- Return complex results

### Action vs Service vs Topic Comparison

| Pattern | Duration | Feedback | Preemption | Use Case |
|---------|----------|----------|------------|----------|
| Topic | Continuous | No | No | Sensor streams, status updates |
| Service | Short | No | No | Query/response, immediate tasks |
| Action | Long | Yes | Yes | Navigation, manipulation, calibration |

## Action Architecture

### Action Structure

An action consists of three message types:
- **Goal**: Defines what the action should accomplish
- **Feedback**: Provides status during execution
- **Result**: Contains the final outcome

Example action definition file (`Fibonacci.action`):
```
# Goal: order of the Fibonacci sequence to generate
int32 order
---
# Result: the generated sequence
int32[] sequence
---
# Feedback: current progress in the sequence
int32[] sequence
```

### Action Server Implementation

```python
import rclpy
from rclpy.action import ActionServer, CancelResponse, GoalResponse
from rclpy.node import Node
from example_interfaces.action import Fibonacci
import time

class FibonacciActionServer(Node):
    def __init__(self):
        super().__init__('fibonacci_action_server')

        # Create action server with callbacks
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            execute_callback=self.execute_callback,
            goal_callback=self.goal_callback,
            handle_accepted_callback=self.handle_accepted_callback,
            cancel_callback=self.cancel_callback)

    def goal_callback(self, goal_request):
        """Called when a new goal is received"""
        self.get_logger().info('Received goal request')

        # Accept all goals (in a real application, you might reject based on criteria)
        return GoalResponse.ACCEPT

    def handle_accepted_callback(self, goal_handle):
        """Called when a goal is accepted"""
        self.get_logger().info('Goal accepted, starting execution')

        # Execute the goal in a separate thread to avoid blocking
        import threading
        thread = threading.Thread(target=self.execute_goal, args=(goal_handle,))
        thread.start()

    def cancel_callback(self, goal_handle):
        """Called when a goal cancellation is requested"""
        self.get_logger().info('Received cancel request')
        return CancelResponse.ACCEPT

    def execute_callback(self, goal_handle):
        """Execute callback - this is called in a separate thread"""
        self.get_logger().info('Executing goal...')

        # Initialize result
        result = Fibonacci.Result()
        feedback_msg = Fibonacci.Feedback()
        feedback_msg.sequence = [0, 1]

        # Generate Fibonacci sequence
        for i in range(1, goal_handle.request.order):
            # Check if the goal has been canceled
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                self.get_logger().info('Goal canceled')
                result.sequence = feedback_msg.sequence
                return result

            # Update feedback
            feedback_msg.sequence.append(
                feedback_msg.sequence[i] + feedback_msg.sequence[i-1])

            # Publish feedback
            goal_handle.publish_feedback(feedback_msg)

            # Sleep to simulate work
            time.sleep(0.5)

        # Check if goal was canceled during execution
        if goal_handle.is_cancel_requested:
            goal_handle.canceled()
            self.get_logger().info('Goal canceled during execution')
            result.sequence = feedback_msg.sequence
            return result

        # Complete successfully
        goal_handle.succeed()
        result.sequence = feedback_msg.sequence
        self.get_logger().info(f'Goal succeeded with result: {result.sequence}')
        return result

def main(args=None):
    rclpy.init(args=args)
    fibonacci_action_server = FibonacciActionServer()
    rclpy.spin(fibonacci_action_server)
    fibonacci_action_server.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Action Client Implementation

```python
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from example_interfaces.action import Fibonacci

class FibonacciActionClient(Node):
    def __init__(self):
        super().__init__('fibonacci_action_client')

        # Create action client
        self._action_client = ActionClient(
            self,
            Fibonacci,
            'fibonacci')

    def send_goal(self, order):
        """Send a goal to the action server"""
        # Wait for the action server to be available
        self._action_client.wait_for_server()

        # Create and send the goal
        goal_msg = Fibonacci.Goal()
        goal_msg.order = order

        self.get_logger().info(f'Sending goal with order: {order}')

        # Send goal asynchronously with callbacks
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback)

        # Add callbacks for goal response and result
        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        """Called when the goal response is received"""
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected')
            return

        self.get_logger().info('Goal accepted')

        # Request the result
        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def feedback_callback(self, feedback_msg):
        """Called during action execution with feedback"""
        feedback = feedback_msg.feedback
        self.get_logger().info(f'Received feedback: {feedback.sequence}')

    def get_result_callback(self, future):
        """Called when the result is received"""
        result = future.result().result
        self.get_logger().info(f'Final result: {result.sequence}')

        # Shutdown after receiving result
        rclpy.shutdown()

def main(args=None):
    rclpy.init(args=args)
    action_client = FibonacciActionClient()

    # Send a goal
    action_client.send_goal(10)

    # Keep the client running to receive feedback and results
    rclpy.spin(action_client)

if __name__ == '__main__':
    main()
```

## Advanced Action Patterns

### Conditional Goal Execution

```python
class ConditionalActionServer(Node):
    def __init__(self):
        super().__init__('conditional_action_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'conditional_fibonacci',
            execute_callback=self.execute_callback,
            goal_callback=self.goal_callback)

    def goal_callback(self, goal_request):
        """Evaluate whether to accept the goal based on conditions"""
        # Example: Reject goals that are too large
        if goal_request.order > 20:
            self.get_logger().warn(f'Rejecting large goal: {goal_request.order}')
            return GoalResponse.REJECT

        # Example: Accept only if resource is available
        if self.is_resource_available():
            self.get_logger().info('Accepting goal')
            return GoalResponse.ACCEPT
        else:
            self.get_logger().warn('Resource not available, rejecting goal')
            return GoalResponse.REJECT

    def is_resource_available(self):
        """Check if required resources are available"""
        # Implementation would check for available resources
        return True  # Simplified for example

    def execute_callback(self, goal_handle):
        """Execute the goal with conditional logic"""
        result = Fibonacci.Result()

        # Check preconditions
        if not self.preconditions_met(goal_handle.request):
            goal_handle.abort()
            result.sequence = []
            return result

        # Execute the action
        # ... implementation details ...

        goal_handle.succeed()
        result.sequence = [1, 1, 2, 3, 5, 8]  # Simplified result
        return result

    def preconditions_met(self, request):
        """Check if preconditions for the goal are met"""
        # Implementation would check specific preconditions
        return True
```

### Chained Actions

```python
class ChainedActionClient(Node):
    def __init__(self):
        super().__init__('chained_action_client')
        self.navigation_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')
        self.manipulation_client = ActionClient(self, FollowJointTrajectory, 'manipulator_controller/follow_joint_trajectory')

        # Track which action is currently running
        self.current_action = None

    def execute_task_sequence(self, waypoints, trajectory):
        """Execute a sequence of navigation and manipulation actions"""
        self.waypoints = waypoints
        self.trajectory = trajectory
        self.step = 0

        self.execute_next_step()

    def execute_next_step(self):
        """Execute the next step in the sequence"""
        if self.step == 0:
            # Navigate to first waypoint
            self.navigate_to_waypoint(self.waypoints[0])
            self.current_action = 'navigation'
        elif self.step == 1:
            # Execute manipulation
            self.execute_manipulation(self.trajectory)
            self.current_action = 'manipulation'
        elif self.step == 2:
            # Navigate to next waypoint
            self.navigate_to_waypoint(self.waypoints[1])
            self.current_action = 'navigation'
        else:
            # Task sequence complete
            self.get_logger().info('All tasks completed')
            return

    def navigate_to_waypoint(self, waypoint):
        """Send navigation goal to the robot"""
        # Wait for navigation server
        self.navigation_client.wait_for_server()

        # Create and send goal
        goal_msg = NavigateToPose.Goal()
        goal_msg.pose = waypoint

        future = self.navigation_client.send_goal_async(goal_msg)
        future.add_done_callback(self.navigation_done_callback)

    def execute_manipulation(self, trajectory):
        """Send manipulation goal to the robot"""
        # Wait for manipulation server
        self.manipulation_client.wait_for_server()

        # Create and send goal
        goal_msg = FollowJointTrajectory.Goal()
        goal_msg.trajectory = trajectory

        future = self.manipulation_client.send_goal_async(goal_msg)
        future.add_done_callback(self.manipulation_done_callback)

    def navigation_done_callback(self, future):
        """Handle completion of navigation"""
        goal_handle = future.result()
        result = goal_handle.result()

        self.get_logger().info(f'Navigation completed: {result}')

        # Move to next step
        self.step += 1
        self.execute_next_step()

    def manipulation_done_callback(self, future):
        """Handle completion of manipulation"""
        goal_handle = future.result()
        result = goal_handle.result()

        self.get_logger().info(f'Manipulation completed: {result}')

        # Move to next step
        self.step += 1
        self.execute_next_step()
```

## State Machines for Complex Workflows

### Simple State Machine Implementation

```python
from enum import Enum
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class RobotState(Enum):
    IDLE = 1
    NAVIGATING = 2
    MANIPULATING = 3
    ERROR = 4
    CHARGING = 5

class StateMachineNode(Node):
    def __init__(self):
        super().__init__('state_machine_node')

        # Initialize state
        self.current_state = RobotState.IDLE

        # Publishers and subscribers
        self.state_publisher = self.create_publisher(String, 'robot_state', 10)
        self.command_subscriber = self.create_subscription(
            String, 'robot_command', self.command_callback, 10)

        # Timer for state updates
        self.timer = self.create_timer(0.1, self.state_machine_update)

    def command_callback(self, msg):
        """Handle incoming commands"""
        command = msg.data

        # State transitions based on commands
        if command == 'start_navigation' and self.current_state == RobotState.IDLE:
            self.current_state = RobotState.NAVIGATING
        elif command == 'start_manipulation' and self.current_state == RobotState.IDLE:
            self.current_state = RobotState.MANIPULATING
        elif command == 'stop' and self.current_state in [RobotState.NAVIGATING, RobotState.MANIPULATING]:
            self.current_state = RobotState.IDLE
        elif command == 'charge' and self.current_state != RobotState.CHARGING:
            self.current_state = RobotState.CHARGING

    def state_machine_update(self):
        """Update state machine logic"""
        # Execute behavior based on current state
        if self.current_state == RobotState.NAVIGATING:
            self.execute_navigation()
        elif self.current_state == RobotState.MANIPULATING:
            self.execute_manipulation()
        elif self.current_state == RobotState.CHARGING:
            self.execute_charging()
        elif self.current_state == RobotState.ERROR:
            self.handle_error()

        # Publish current state
        state_msg = String()
        state_msg.data = self.current_state.name
        self.state_publisher.publish(state_msg)

    def execute_navigation(self):
        """Execute navigation behavior"""
        self.get_logger().info('Executing navigation...')
        # Navigation logic here
        # Check if navigation is complete
        # self.current_state = RobotState.IDLE if completed

    def execute_manipulation(self):
        """Execute manipulation behavior"""
        self.get_logger().info('Executing manipulation...')
        # Manipulation logic here
        # Check if manipulation is complete
        # self.current_state = RobotState.IDLE if completed

    def execute_charging(self):
        """Execute charging behavior"""
        self.get_logger().info('Charging...')
        # Charging logic here
        # Check if battery is charged
        # self.current_state = RobotState.IDLE if charged

    def handle_error(self):
        """Handle error state"""
        self.get_logger().error('Robot in error state!')
        # Error handling logic here
        # self.current_state = RobotState.IDLE if resolved
```

### Complex State Machine with Actions

```python
from enum import Enum
import rclpy
from rclpy.node import Node
from rclpy.action import ActionClient
from example_interfaces.action import Fibonacci
from std_msgs.msg import String

class ComplexRobotState(Enum):
    IDLE = 1
    PLANNING = 2
    NAVIGATING = 3
    MANIPULATING = 4
    WAITING_FOR_HUMAN = 5
    ERROR = 6

class ComplexStateMachineNode(Node):
    def __init__(self):
        super().__init__('complex_state_machine_node')

        self.current_state = ComplexRobotState.IDLE
        self.previous_state = None

        # Action clients
        self.navigation_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')
        self.manipulation_client = ActionClient(self, FollowJointTrajectory, 'manipulator_controller/follow_joint_trajectory')

        # Publishers and subscribers
        self.state_publisher = self.create_publisher(String, 'complex_robot_state', 10)
        self.command_subscriber = self.create_subscription(
            String, 'complex_command', self.command_callback, 10)

        # State timers and data
        self.state_timer = self.create_timer(0.1, self.state_machine_update)
        self.state_start_time = self.get_clock().now()

        # Task queue
        self.task_queue = []
        self.current_task = None

    def command_callback(self, msg):
        """Handle incoming commands based on current state"""
        command = msg.data

        # State-specific command handling
        if self.current_state == ComplexRobotState.IDLE:
            if command == 'start_task':
                self.enqueue_task('navigation', {'target': 'kitchen'})
            elif command == 'charge':
                self.current_state = ComplexRobotState.WAITING_FOR_HUMAN
        elif self.current_state == ComplexRobotState.WAITING_FOR_HUMAN:
            if command == 'permission_granted':
                self.current_state = ComplexRobotState.NAVIGATING

    def enqueue_task(self, task_type, task_data):
        """Add a task to the queue"""
        task = {'type': task_type, 'data': task_data, 'status': 'pending'}
        self.task_queue.append(task)

        if self.current_state == ComplexRobotState.IDLE:
            self.process_next_task()

    def process_next_task(self):
        """Process the next task in the queue"""
        if self.task_queue:
            self.current_task = self.task_queue.pop(0)
            self.current_task['status'] = 'in_progress'

            if self.current_task['type'] == 'navigation':
                self.start_navigation_task(self.current_task['data'])
            elif self.current_task['type'] == 'manipulation':
                self.start_manipulation_task(self.current_task['data'])

    def start_navigation_task(self, data):
        """Start navigation task"""
        self.get_logger().info(f'Starting navigation to {data["target"]}')
        self.current_state = ComplexRobotState.NAVIGATING

        # Send navigation goal
        # Implementation details...

    def start_manipulation_task(self, data):
        """Start manipulation task"""
        self.get_logger().info(f'Starting manipulation: {data["action"]}')
        self.current_state = ComplexRobotState.MANIPULATING

        # Send manipulation goal
        # Implementation details...

    def state_machine_update(self):
        """Main state machine update loop"""
        # Update state-specific behaviors
        if self.current_state == ComplexRobotState.NAVIGATING:
            self.update_navigation()
        elif self.current_state == ComplexRobotState.MANIPULATING:
            self.update_manipulation()
        elif self.current_state == ComplexRobotState.WAITING_FOR_HUMAN:
            self.update_waiting()
        elif self.current_state == ComplexRobotState.ERROR:
            self.update_error()

        # Check for state transitions
        self.check_state_transitions()

        # Publish current state
        state_msg = String()
        state_msg.data = self.current_state.name
        self.state_publisher.publish(state_msg)

    def update_navigation(self):
        """Update navigation behavior"""
        # Check navigation progress
        # If complete, transition to next state
        pass

    def update_manipulation(self):
        """Update manipulation behavior"""
        # Check manipulation progress
        # If complete, transition to next state
        pass

    def update_waiting(self):
        """Update waiting behavior"""
        # Check if human interaction is complete
        pass

    def update_error(self):
        """Update error handling behavior"""
        # Attempt recovery or wait for manual intervention
        pass

    def check_state_transitions(self):
        """Check conditions for state transitions"""
        # Implementation would check various conditions
        # and transition between states as needed
        pass
```

## Advanced Workflow Patterns

### Task Scheduling and Prioritization

```python
import heapq
from dataclasses import dataclass
from typing import Any

@dataclass
class Task:
    priority: int
    timestamp: float
    task_id: str
    task_type: str
    data: Any
    callback: Any = None

class TaskSchedulerNode(Node):
    def __init__(self):
        super().__init__('task_scheduler_node')

        self.task_queue = []  # Priority queue
        self.active_tasks = {}  # Currently executing tasks
        self.task_counter = 0

        # Timer to check for new tasks
        self.scheduler_timer = self.create_timer(0.1, self.scheduler_update)

    def add_task(self, priority, task_type, data, callback=None):
        """Add a task to the scheduler with priority"""
        import time
        task = Task(
            priority=priority,
            timestamp=time.time(),
            task_id=f'task_{self.task_counter}',
            task_type=task_type,
            data=data,
            callback=callback
        )
        self.task_counter += 1

        # Add to priority queue (heapq is a min-heap, so use negative priority for max-heap behavior)
        heapq.heappush(self.task_queue, (priority, task.timestamp, task))
        self.get_logger().info(f'Added task {task.task_id} with priority {priority}')

    def scheduler_update(self):
        """Main scheduler update loop"""
        # Check if we can start a new task
        if len(self.active_tasks) < 3:  # Max 3 concurrent tasks
            if self.task_queue:
                priority, timestamp, task = heapq.heappop(self.task_queue)

                # Start the task
                self.start_task(task)

        # Check for completed tasks
        completed_tasks = []
        for task_id, task_info in self.active_tasks.items():
            if self.is_task_complete(task_id):
                completed_tasks.append(task_id)

        # Remove completed tasks
        for task_id in completed_tasks:
            self.complete_task(task_id)

    def start_task(self, task):
        """Start executing a task"""
        self.active_tasks[task.task_id] = task
        self.get_logger().info(f'Starting task {task.task_id}')

        # Execute task based on type
        if task.task_type == 'navigation':
            self.execute_navigation_task(task)
        elif task.task_type == 'manipulation':
            self.execute_manipulation_task(task)
        elif task.task_type == 'inspection':
            self.execute_inspection_task(task)

    def is_task_complete(self, task_id):
        """Check if a task is complete"""
        # Implementation would check task status
        return False

    def complete_task(self, task_id):
        """Complete a task and call its callback"""
        task = self.active_tasks.pop(task_id)
        self.get_logger().info(f'Completed task {task_id}')

        if task.callback:
            task.callback(task)

    def execute_navigation_task(self, task):
        """Execute navigation task"""
        # Implementation for navigation
        pass

    def execute_manipulation_task(self, task):
        """Execute manipulation task"""
        # Implementation for manipulation
        pass

    def execute_inspection_task(self, task):
        """Execute inspection task"""
        # Implementation for inspection
        pass
```

### Multi-Robot Coordination

```python
class MultiRobotCoordinator(Node):
    def __init__(self):
        super().__init__('multi_robot_coordinator')

        # Robot status tracking
        self.robot_status = {}  # robot_id -> status
        self.task_assignments = {}  # task_id -> robot_id
        self.robot_capabilities = {}  # robot_id -> capabilities

        # Publishers and subscribers for coordination
        self.status_publisher = self.create_publisher(String, 'coordination_status', 10)
        self.status_subscriber = self.create_subscription(
            String, 'robot_status', self.robot_status_callback, 10)

        # Task assignment timer
        self.assignment_timer = self.create_timer(1.0, self.assign_tasks)

    def robot_status_callback(self, msg):
        """Handle robot status updates"""
        import json
        try:
            status_data = json.loads(msg.data)
            robot_id = status_data['robot_id']
            status = status_data['status']
            capabilities = status_data.get('capabilities', [])

            self.robot_status[robot_id] = status
            self.robot_capabilities[robot_id] = capabilities

        except json.JSONDecodeError:
            self.get_logger().error('Invalid status message format')

    def assign_tasks(self):
        """Assign tasks to available robots based on capabilities"""
        # Get available robots
        available_robots = [
            robot_id for robot_id, status in self.robot_status.items()
            if status == 'available'
        ]

        # Get pending tasks
        pending_tasks = self.get_pending_tasks()

        # Assign tasks based on robot capabilities
        for task in pending_tasks:
            suitable_robot = self.find_suitable_robot(task, available_robots)
            if suitable_robot:
                self.assign_task_to_robot(task, suitable_robot)
                available_robots.remove(suitable_robot)

    def find_suitable_robot(self, task, available_robots):
        """Find the most suitable robot for a task"""
        for robot_id in available_robots:
            if self.is_robot_suitable_for_task(robot_id, task):
                return robot_id
        return None

    def is_robot_suitable_for_task(self, robot_id, task):
        """Check if a robot is suitable for a specific task"""
        capabilities = self.robot_capabilities.get(robot_id, [])
        required_capabilities = task.get('required_capabilities', [])

        return all(cap in capabilities for cap in required_capabilities)

    def assign_task_to_robot(self, task, robot_id):
        """Assign a task to a specific robot"""
        task_id = task['id']
        self.task_assignments[task_id] = robot_id

        # Send task assignment to robot
        assignment_msg = String()
        assignment_msg.data = f'{{"task_id": "{task_id}", "task_data": {task["data"]}}}'

        # Publish to specific robot topic
        # This would require a publisher per robot or a more sophisticated routing system
        pass

    def get_pending_tasks(self):
        """Get list of pending tasks"""
        # Implementation would return pending tasks
        return []
```

## Error Handling and Recovery

### Comprehensive Error Handling

```python
class RobustActionServer(Node):
    def __init__(self):
        super().__init__('robust_action_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'robust_fibonacci',
            execute_callback=self.execute_callback,
            goal_callback=self.goal_callback,
            cancel_callback=self.cancel_callback)

    def goal_callback(self, goal_request):
        """Robust goal validation"""
        try:
            # Validate goal parameters
            if goal_request.order < 0:
                self.get_logger().error('Invalid goal: order cannot be negative')
                return GoalResponse.REJECT

            if goal_request.order > 100:  # Reasonable limit
                self.get_logger().warn('Large goal requested, may take long time')

            return GoalResponse.ACCEPT

        except Exception as e:
            self.get_logger().error(f'Error in goal callback: {e}')
            return GoalResponse.REJECT

    def execute_callback(self, goal_handle):
        """Robust goal execution with error handling"""
        result = Fibonacci.Result()

        try:
            # Initialize result
            result.sequence = [0, 1] if goal_handle.request.order > 0 else [0]

            # Execute with error handling
            for i in range(1, goal_handle.request.order):
                # Check for cancellation
                if goal_handle.is_cancel_requested:
                    goal_handle.canceled()
                    return result

                # Perform calculation with error handling
                try:
                    next_value = result.sequence[i] + result.sequence[i-1]
                    result.sequence.append(next_value)

                    # Publish feedback
                    feedback_msg = Fibonacci.Feedback()
                    feedback_msg.sequence = result.sequence.copy()
                    goal_handle.publish_feedback(feedback_msg)

                except IndexError as e:
                    self.get_logger().error(f'Index error during calculation: {e}')
                    goal_handle.abort()
                    return result

                except OverflowError:
                    self.get_logger().error('Number too large, aborting')
                    goal_handle.abort()
                    return result

                # Simulate work
                time.sleep(0.1)

            # Check for cancellation one more time
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                return result

            # Success
            goal_handle.succeed()
            return result

        except Exception as e:
            self.get_logger().error(f'Unexpected error during execution: {e}')
            goal_handle.abort()
            return result

    def cancel_callback(self, goal_handle):
        """Robust cancellation handling"""
        try:
            self.get_logger().info('Processing cancellation request')
            return CancelResponse.ACCEPT
        except Exception as e:
            self.get_logger().error(f'Error during cancellation: {e}')
            return CancelResponse.REJECT
```

## Testing and Validation

### Action Testing

```python
import unittest
import rclpy
from rclpy.action import ActionClient
from rclpy.executors import SingleThreadedExecutor
from example_interfaces.action import Fibonacci

class TestFibonacciAction(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        rclpy.init()

    @classmethod
    def tearDownClass(cls):
        rclpy.shutdown()

    def setUp(self):
        self.node = rclpy.create_node('test_fibonacci_action_client')
        self.action_client = ActionClient(
            self.node,
            Fibonacci,
            'fibonacci'
        )

    def tearDown(self):
        self.node.destroy_node()

    def test_fibonacci_action(self):
        """Test the Fibonacci action with a simple case"""
        # Wait for action server
        self.action_client.wait_for_server(timeout_sec=5.0)

        # Create goal
        goal_msg = Fibonacci.Goal()
        goal_msg.order = 5

        # Send goal
        future = self.action_client.send_goal_async(goal_msg)

        # Wait for result
        rclpy.spin_until_future_complete(self.node, future)

        goal_handle = future.result()
        self.assertTrue(goal_handle.accepted)

        # Get result
        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self.node, result_future)

        result = result_future.result().result
        expected = [0, 1, 1, 2, 3, 5]

        self.assertEqual(result.sequence, expected)

if __name__ == '__main__':
    unittest.main()
```

## Summary

Actions provide a powerful communication pattern for long-running tasks in ROS 2, offering feedback, cancellation, and result reporting. Combined with advanced workflow patterns like state machines, task scheduling, and multi-robot coordination, actions enable the development of sophisticated robotic applications. Proper error handling and testing ensure robust operation in real-world scenarios.

## Further Reading

- ROS 2 Actions Documentation: https://docs.ros.org/en/rolling/Tutorials/Beginner-Client-Libraries/Using-Actions-In-ROS2.html
- "Programming Robots with ROS" by Quigley, Gerkey, and Smart
- Design patterns for robotics: State machines, behavior trees, and task planning
