#root_path="/mnt/mmcblk0p1/eta-regulator-board/web-api"
root_path="."
read -r pid < "$root_path/src/PID_FILE"

if [ -n "$pid" ]; then
    echo "$(date -u "+%Y-%m-%d %H:%M:%S"): Try to terminate process of eta-regulator-board-web-api with PID $pid" >> "$root_path/startup.log"
    kill -TERM $pid
    wait $pid
    echo "$(date -u "+%Y-%m-%d %H:%M:%S"): The process of eta-regulator-board-web-api with PID $pid was terminated" >> "$root_path/startup.log"
else
    echo "$(date -u "+%Y-%m-%d %H:%M:%S"): The process of eta-regulator-board-web-api not found" >> "$root_path/startup.log"
fi

error="$( ( "$root_path/startup.sh" & ) 2>&1 1>/dev/null )"
if [ -n "$error" ]; then
    echo "$(date -u "+%Y-%m-%d %H:%M:%S"): $error" >> "$root_path/startup.log"
fi

echo "$(date -u "+%Y-%m-%d %H:%M:%S"): Process is launching!" >> "$root_path/startup.log"