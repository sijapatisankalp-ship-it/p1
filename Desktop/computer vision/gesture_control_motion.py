import cv2
import numpy as np
import pydirectinput
import time

# Constants
WIDTH, HEIGHT = 640, 480
NEUTRAL_ZONE_RATIO = 0.3
COOLDOWN_TIME = 0.5

center_x, center_y = WIDTH // 2, HEIGHT // 2
neutral_half_w = (WIDTH * NEUTRAL_ZONE_RATIO) / 2
neutral_half_h = (HEIGHT * NEUTRAL_ZONE_RATIO) / 2

left_boundary = center_x - neutral_half_w
right_boundary = center_x + neutral_half_w
top_boundary = center_y - neutral_half_h
bottom_boundary = center_y + neutral_half_h

# State
last_action_time = 0
current_action = "NEUTRAL"
background = None

def main():
    global last_action_time, current_action, background

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    
    if not cap.isOpened():
        print("Error: Could not open video device.")
        return

    cap.set(3, WIDTH)
    cap.set(4, HEIGHT)

    print("--- Gesture Control (Motion Version) ---")
    print("1. Stand still and Press 'b' to capture background.")
    print("2. Move your hand to play!")
    print("Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        # UI
        cv2.rectangle(frame, 
                     (int(left_boundary), int(top_boundary)), 
                     (int(right_boundary), int(bottom_boundary)), 
                     (255, 255, 255), 2)
        
        cv2.putText(frame, "UP", (center_x - 20, int(top_boundary) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        cv2.putText(frame, "DOWN", (center_x - 30, int(bottom_boundary) + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        cv2.putText(frame, "LEFT", (int(left_boundary) - 50, center_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        cv2.putText(frame, "RIGHT", (int(right_boundary) + 10, center_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        if background is None:
            cv2.putText(frame, "Press 'b' to reset background", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        else:
            # Motion Logic
            # Calculate difference
            diff = cv2.absdiff(background, gray)
            # Increase threshold from 25 to 50 to ignore small lighting changes
            _, thresh = cv2.threshold(diff, 50, 255, cv2.THRESH_BINARY)
            thresh = cv2.dilate(thresh, None, iterations=2)

            # Show what is moving
            cv2.imshow("Mask (Motion)", thresh)

            contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            if len(contours) > 0:
                # Find largest moving object (Hand/Body)
                max_contour = max(contours, key=cv2.contourArea)
                
                # Increase min area from 1000 to 3000 to ignore small flickers
                if cv2.contourArea(max_contour) > 3000:
                    x, y, w, h = cv2.boundingRect(max_contour)
                    cx, cy = x + w // 2, y + h // 2
                    
                    cv2.circle(frame, (cx, cy), 10, (0, 255, 255), -1)
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    
                    # Movement Logic
                    current_time = time.time()
                    if current_time - last_action_time > COOLDOWN_TIME:
                        if cy < top_boundary:
                            pydirectinput.press('up')
                            current_action = "JUMP!"
                            last_action_time = current_time
                        elif cy > bottom_boundary:
                            pydirectinput.press('down')
                            current_action = "SLIDE!"
                            last_action_time = current_time
                        elif cx < left_boundary:
                            pydirectinput.press('left')
                            current_action = "LEFT!"
                            last_action_time = current_time
                        elif cx > right_boundary:
                            pydirectinput.press('right')
                            current_action = "RIGHT!"
                            last_action_time = current_time
                        else:
                            current_action = "NEUTRAL"
        
        # Display Action
        cv2.putText(frame, f"Action: {current_action}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
        cv2.imshow('Gesture Control (Motion)', frame)

        key = cv2.waitKey(1)
        if key & 0xFF == ord('q'):
            break
        elif key & 0xFF == ord('b'):
            background = gray
            print("Background captured!")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\nCRITICAL ERROR: {e}")
        input("Press Enter to close...")
