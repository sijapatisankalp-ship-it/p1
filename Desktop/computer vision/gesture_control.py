import cv2
import numpy as np
import pydirectinput
import time

# Constants
WIDTH, HEIGHT = 640, 480
NEUTRAL_ZONE_RATIO = 0.3
COOLDOWN_TIME = 0.5

# Zone calculations
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
is_calibrated = False
lower_bound = None
upper_bound = None

def get_hand_hist(frame, roi_rect):
    """
    Calculate the histogram of the region of interest (hand) to lock onto its color.
    """
    x, y, w, h = roi_rect
    roi = frame[y:y+h, x:x+w]
    hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    # Calculate histogram for Hue and Saturation channel
    hist = cv2.calcHist([hsv_roi], [0, 1], None, [180, 256], [0, 180, 0, 256])
    cv2.normalize(hist, hist, 0, 255, cv2.NORM_MINMAX)
    return hist

def basic_threshold_tracking(frame, lower_color, upper_color):
    """
    Alternative simple tracking using fixed color bounds if histogram fails
    """
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, lower_color, upper_color)
    return mask

def main():
    global last_action_time, current_action, is_calibrated, lower_bound, upper_bound

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    
    # Check if camera opened successfully
    if not cap.isOpened():
        print("Error: Could not open video device.")
        return

    cap.set(3, WIDTH)
    cap.set(4, HEIGHT)

    print("--- Gesture Control (Color Version) ---")
    print("1. Place your hand in the GREEN BOX.")
    print("2. Press 'c' to CALIBRATE (lock color).")
    print("3. Move hand to play!")
    print("Press 'q' to quit.")

    # Calibration box coordinates (center of screen)
    cal_rect_size = 50
    cal_x, cal_y = center_x - cal_rect_size, center_y - cal_rect_size

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        
        # UI overlays
        cv2.rectangle(frame, 
                     (int(left_boundary), int(top_boundary)), 
                     (int(right_boundary), int(bottom_boundary)), 
                     (255, 255, 255), 2)
        
        cv2.putText(frame, "UP", (center_x - 20, int(top_boundary) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        cv2.putText(frame, "DOWN", (center_x - 30, int(bottom_boundary) + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        cv2.putText(frame, "LEFT", (int(left_boundary) - 50, center_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        cv2.putText(frame, "RIGHT", (int(right_boundary) + 10, center_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        if not is_calibrated:
            # Draw calibration box
            cv2.rectangle(frame, (cal_x, cal_y), (cal_x + 2*cal_rect_size, cal_y + 2*cal_rect_size), (0, 255, 0), 2)
            cv2.putText(frame, "Cover the box with your hand", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, "Press 'c' to Lock Color", (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            key = cv2.waitKey(1)
            if key & 0xFF == ord('c'):
                # Get average color in the box
                roi = frame[cal_y:cal_y+2*cal_rect_size, cal_x:cal_x+2*cal_rect_size]
                hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
                mean_hsv = np.mean(hsv_roi, axis=(0,1))
                
                # Create a range (sensitivity)
                sensitivity = 30
                lower_bound = np.array([max(0, mean_hsv[0] - sensitivity), 30, 30], dtype=np.uint8)
                upper_bound = np.array([min(180, mean_hsv[0] + sensitivity), 255, 255], dtype=np.uint8)
                
                is_calibrated = True
                print(f"Calibrated! Tracking Hue: {int(mean_hsv[0])}")
            elif key & 0xFF == ord('q'):
                break
                
        else:
            # Tracking Logic (HSV Range)
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            mask = cv2.inRange(hsv, lower_bound, upper_bound)
            
            # Clean up noise
            kernel = np.ones((5,5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            
            # Show the mask to the user
            cv2.imshow('Mask', mask)
            
            contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

            if len(contours) > 0:
                # Find largest contour (assumed to be the hand)
                max_contour = max(contours, key=cv2.contourArea)
                
                # Filter small noise
                if cv2.contourArea(max_contour) > 1000:
                    x, y, w, h = cv2.boundingRect(max_contour)
                    cx, cy = x + w // 2, y + h // 2
                    
                    # Draw center of hand
                    cv2.circle(frame, (cx, cy), 10, (0, 255, 255), -1)
                    
                    # Debug: show what is being tracked
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
            
            # Show "Tracking" or "Mask" window for debugging (optional)
            cv2.imshow('Mask', mask)

            key = cv2.waitKey(1)
            if key & 0xFF == ord('q'):
                break
            elif key & 0xFF == ord('r'): # Reset calibration
                is_calibrated = False
                print("Recalibrating...")

        # Display Action
        cv2.putText(frame, f"Action: {current_action}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
        cv2.imshow('Gesture Control', frame)

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
