// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY, circleSize = 100;
let isDrawing = false;
let prevX, prevY;
let trajectory = []; // 新增：儲存所有軌跡點

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);

  // Initialize circle position
  circleX = width / 2;
  circleY = height / 2;

  // Set background once to avoid clearing it in draw()
  background(255);
}

function draw() {
  // Draw the video feed
  image(video, 0, 0);

  // 畫出所有軌跡
  stroke(255, 0, 0);
  strokeWeight(2);
  noFill();
  for (let i = 1; i < trajectory.length; i++) {
    line(trajectory[i - 1].x, trajectory[i - 1].y, trajectory[i].x, trajectory[i].y);
  }

  // Draw the circle
  fill(0, 255, 0);
  noStroke();
  circle(circleX, circleY, circleSize);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Draw keypoints
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // Check if keypoint[8] (index finger tip) is touching the circle
        let indexFinger = hand.keypoints[8];
        let d = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        if (d < circleSize / 2) {
          // Move the circle to the index finger's position
          circleX = indexFinger.x;
          circleY = indexFinger.y;

          // Start drawing the trajectory
          if (!isDrawing) {
            isDrawing = true;
            prevX = indexFinger.x;
            prevY = indexFinger.y;
            trajectory.push({ x: prevX, y: prevY }); // 新增起點
          } else {
            // Draw the trajectory line
            trajectory.push({ x: indexFinger.x, y: indexFinger.y }); // 持續記錄
            prevX = indexFinger.x;
            prevY = indexFinger.y;
          }
        } else {
          // Stop drawing when the finger leaves the circle
          isDrawing = false;
        }
      }
    }
  }
}
